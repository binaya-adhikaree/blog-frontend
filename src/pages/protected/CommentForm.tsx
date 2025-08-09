import React, { useState } from "react";
import { Send, Loader } from "lucide-react";

interface CommentType {
  _id: string;
  blogId: string;
  userId: {
    _id: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  content: string;
  parentCommentId: string | null;
  likes: string[];
  createdAt: string;
  updatedAt: string;
  isEdited?: boolean;
  editedAt?: string;
}

interface CommentFormProps {
  blogId?: string;
  onCommentAdded: (comment: CommentType) => void;
  parentCommentId?: string | null;
  placeholder?: string;
  buttonText?: string;
  onCancel?: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({
  blogId,
  onCommentAdded,
  parentCommentId = null,
  placeholder = "Write your comment...",
  buttonText = "Post Comment",
  onCancel,
}) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const API_URL =
    import.meta.env?.VITE_API_URL ||
    (typeof process !== "undefined" ? process.env?.REACT_APP_API_URL : null) ||
    "http://localhost:3001";

  const token = localStorage.getItem("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    if (!token) {
      setError("Please login to comment");
      return;
    }

    if (!blogId) {
      setError("Blog ID is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/comments/${blogId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: content.trim(),
          parentCommentId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to post comment");
      }

      if (data.success) {
        onCommentAdded(data.data);

        setContent("");

        if (onCancel) {
          onCancel();
        }
      } else {
        throw new Error(data.message || "Failed to post comment");
      }
    } catch (err: any) {
      console.error("Comment submission error:", err);
      setError(err.message || "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={3}
          maxLength={1000}
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          disabled={isSubmitting}
        />
        <div className="text-right text-xs text-gray-500 mt-1">
          {content.length}/1000 characters
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader size={16} className="animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send size={16} />
                {buttonText}
              </>
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
        </div>

        {parentCommentId && (
          <span className="text-sm text-gray-500">Replying to comment</span>
        )}
      </div>
    </form>
  );
};

export default CommentForm;
