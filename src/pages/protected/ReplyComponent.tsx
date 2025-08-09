import React, { useState } from 'react';
import { Heart, Reply, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import CommentForm from './CommentForm';

interface CommentType {
  _id: string;
  blogId: string;
  userId: { _id: string; username: string; firstName?: string; lastName?: string };
  content: string;
  parentCommentId: string | null;
  likes: string[];
  createdAt: string;
  updatedAt: string;
  isEdited?: boolean;
  editedAt?: string;
  replies?: CommentType[];
}

interface ReplyProps {
  comment: CommentType;
  currentUserId: string;
  token: string | null;
  blogId: string;
  onCommentDelete: (commentId: string) => void;
  onCommentLike: (commentId: string) => void;
  onReplyAdded: (newReply: CommentType, parentId: string) => void;
  level?: number; // For nested reply depth
}

const ReplyComponent: React.FC<ReplyProps> = ({
  comment,
  currentUserId,
  token,
  blogId,
  onCommentDelete,
  onCommentLike,
  onReplyAdded,
  level = 0
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  const handleReplyAdded = (newReply: CommentType) => {
    onReplyAdded(newReply, comment._id);
    setShowReplyForm(false);
    setShowReplies(true); 
  };

  const getMarginLeft = () => {
    const maxLevel = 3;
    const currentLevel = Math.min(level, maxLevel);
    return currentLevel * 20;
  };

  return (
    <div 
      className="border-l-2 border-gray-200 pl-4"
      style={{ marginLeft: `${getMarginLeft()}px` }}
    >
      <div className="bg-gray-50 border rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {(comment.userId?.username || comment.userId?.firstName || 'U')[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                {comment.userId?.firstName && comment.userId?.lastName 
                  ? `${comment.userId.firstName} ${comment.userId.lastName}`
                  : comment.userId?.username || 'Anonymous'
                }
              </p>
              <p className="text-xs text-gray-500">
                {new Date(comment.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                {comment.isEdited && <span className="ml-2">(edited)</span>}
              </p>
            </div>
          </div>
          
          {comment.userId?._id === currentUserId && (
            <button
              onClick={() => onCommentDelete(comment._id)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
        
        <p className="text-gray-800 mb-3 whitespace-pre-wrap text-sm">{comment.content}</p>
        
        <div className="flex items-center gap-4 text-sm">
          <button
            onClick={() => onCommentLike(comment._id)}
            className={`flex items-center gap-1 ${
              comment.likes?.includes(currentUserId)
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-blue-600'
            }`}
            disabled={!token}
          >
            <Heart 
              size={14} 
              fill={comment.likes?.includes(currentUserId) ? 'currentColor' : 'none'}
            />
            {comment.likes?.length || 0}
          </button>

          {token && level < 3 && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 text-gray-500 hover:text-blue-600"
            >
              <Reply size={14} />
              Reply
            </button>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-1 text-gray-500 hover:text-blue-600"
            >
              {showReplies ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>

        {showReplyForm && (
          <div className="mt-4 border-t pt-4">
            <CommentForm
              blogId={blogId}
              parentCommentId={comment._id}
              onCommentAdded={handleReplyAdded}
              placeholder={`Reply to ${comment.userId?.firstName || comment.userId?.username || 'this comment'}...`}
              buttonText="Post Reply"
              onCancel={() => setShowReplyForm(false)}
            />
          </div>
        )}
      </div>

      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <ReplyComponent
              key={reply._id}
              comment={reply}
              currentUserId={currentUserId}
              token={token}
              blogId={blogId}
              onCommentDelete={onCommentDelete}
              onCommentLike={onCommentLike}
              onReplyAdded={onReplyAdded}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReplyComponent;