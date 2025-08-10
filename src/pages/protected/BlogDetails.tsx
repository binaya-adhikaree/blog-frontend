import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import CommentForm from "./CommentForm";
import {
  ArrowLeft,
  Heart,
  Star,
  Edit,
  Trash2,
  Calendar,
  User,
} from "lucide-react";

interface Author {
  _id: string;
  firstName: string;
  lastName: string;
}

interface Blog {
  _id: string;
  title: string;
  content: string;
  image?: string | null;
  author: Author;
  createdAt: string;
  reactions?: { love?: number };
  favourites?: string[];
  favouritedBy?: string[];
  lovedBy: string[];
}

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

const BlogDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [blog, setBlog] = useState<Blog | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoved, setIsLoved] = useState(false);
  const [loveCount, setLoveCount] = useState(0);
  const [isLoveLoading, setIsLoveLoading] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showFullContent, setShowFullContent] = useState(false);
  const [comments, setComments] = useState<CommentType[]>([]);

  const currentUserId = localStorage.getItem("userId") || "";
  const token = localStorage.getItem("token");
  const blogId = id;

  const API_URL = import.meta.env.VITE_API_URL;
 

  const handleLove = async () => {
    if (!token || !blog?._id || isLoveLoading) return;

    setIsLoveLoading(true);
    try {
      const response = await fetch(`${API_URL}/blog/react/${blog._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to toggle love");

      const data = await response.json();
      setIsLoved(data.lovedByUser);
      setLoveCount(data.totalLovers);
    } catch (err) {
      console.error("Toggle love error:", err);
    } finally {
      setIsLoveLoading(false);
    }
  };

  const toggleFavourite = async (blogId: string) => {
    if (!token || !blogId || isFavoriteLoading) return;

    setIsFavoriteLoading(true);

    try {
      const res = await fetch(`${API_URL}/blog/favourite/${blogId}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        if (data.success && Array.isArray(data.favouritedBy)) {
          setIsFavorite(data.isFavourited);
          setBlog((prev) =>
            prev
              ? {
                  ...prev,
                  favouritedBy: data.favouritedBy,
                  favourites: data.favouritedBy,
                }
              : prev
          );
        }
      } else {
        alert(data.error || "Failed to update favorite status");
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error. Please try again.");
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;

    try {
      const res = await fetch(`${API_URL}/blog/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete blog");
      }

      alert("Blog deleted successfully");
      navigate("/blog");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setTitle(blog.title);
    setContent(blog.content);
  };

  const updateBlog = async (blogId: string) => {
    try {
      const response = await fetch(`${API_URL}/blog/update/${blogId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          image: editingBlog?.image ?? null,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Something went wrong");

      setBlog(data.blog);
      setEditingBlog(null);
    } catch (error: any) {
      console.error("Update error:", error.message);
    }
  };

  useEffect(() => {
    if (!blogId) return;

    const fetchComments = async () => {
      try {
        const res = await fetch(`${API_URL}/api/comments/${blogId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || `Error ${res.status}`);
        }

        if (data.success) {
          setComments(data.data);
        } else {
          throw new Error(data.message || "Failed to fetch comments");
        }
      } catch (error) {
        console.error("Failed to load comments:", error);
      }
    };

    fetchComments();
  }, [blogId]);

  const handleCommentAdded = (newComment: CommentType) => {
    setComments((prev) => [newComment, ...prev]);
  };

  const handleCommentDelete = async (commentId: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setComments((prev) =>
          prev.filter((comment) => comment._id !== commentId)
        );
      } else {
        alert(data.message || "Failed to delete comment");
      }
    } catch (error) {
      console.error("Delete comment error:", error);
      alert("Failed to delete comment");
    }
  };

  const handleCommentLike = async (commentId: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/comments/like/${commentId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  likes: data.data.isLiked
                    ? [...comment.likes, currentUserId]
                    : comment.likes.filter((id) => id !== currentUserId),
                }
              : comment
          )
        );
      }
    } catch (error) {
      console.error("Like comment error:", error);
    }
  };

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) return;

      try {
        const res = await fetch(`${API_URL}/blog/${id}`);
        if (!res.ok) throw new Error("Blog not found");

        const data = await res.json();
        setBlog(data.blog);

        const favoritesArray =
          data.blog.favourites || data.blog.favouritedBy || [];
        setIsFavorite(favoritesArray.includes(currentUserId));
        setIsLoved(data.blog.lovedBy?.includes(currentUserId) || false);
        setLoveCount(data.blog.reactions?.love || 0);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id, currentUserId]);

  if (loading) return <div className="text-center py-20">Loading blog...</div>;
  if (error)
    return <div className="text-center text-red-600 py-20">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/blog")}
          className="group flex items-center gap-3 mb-8 bg-white/80 px-6 py-3 rounded-full shadow-md hover:shadow-lg"
        >
          <ArrowLeft size={20} />
          <span>Back to Blogs</span>
        </button>

        <article className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
          {blog?.image && (
            <img
               src={
                blog.image.startsWith("http")
                  ? blog.image 
                  : `${API_URL}/uploads/${blog.image}` 
              }
              alt={blog.title}
              className="w-full h-80 object-cover"
            />
          )}

          <div className="p-8 md:p-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {blog?.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-gray-600">
                <User size={18} />
                <Link to={`/author/${blog?.author._id}}`}>
                  <span>
                    {blog?.author.firstName} {blog?.author.lastName}
                  </span>
                </Link>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={18} />
                <span>
                  {new Date(blog?.createdAt || "").toLocaleDateString("en-US")}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-8 border-b pb-6">
              <button
                onClick={handleLove}
                disabled={isLoveLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-full shadow ${
                  isLoved
                    ? "bg-red-500 text-white"
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
              >
                <Heart
                  size={20}
                  fill={isLoved ? "currentColor" : "none"}
                  className={isLoved ? "animate-pulse" : ""}
                />
                {loveCount}
                <span>{isLoved ? "Loved" : "Love"}</span>
              </button>

              <button
                onClick={() => blog?._id && toggleFavourite(blog._id)}
                disabled={isFavoriteLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-full shadow ${
                  isFavorite
                    ? "bg-yellow-400 text-white"
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
              >
                <Star size={20} fill={isFavorite ? "currentColor" : "none"} />
                <span>{isFavorite ? "Favorited" : "Add Favorite"}</span>
              </button>

              {blog?.author._id === currentUserId && (
                <>
                  <button
                    onClick={() => handleEdit(blog)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full shadow bg-blue-600 text-white"
                  >
                    <Edit size={18} />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-4 py-2 rounded-full shadow bg-red-600 text-white"
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </>
              )}
            </div>

            <div className="text-lg text-gray-700 whitespace-pre-line mb-8">
              {blog?.content && blog.content.length > 500 && !showFullContent
                ? `${blog.content.slice(0, 500)}...`
                : blog?.content}
              {blog?.content && blog.content.length > 500 && (
                <button
                  onClick={() => setShowFullContent(!showFullContent)}
                  className="ml-2 text-blue-600 hover:underline text-sm"
                >
                  {showFullContent ? "Read Less" : "Read More"}
                </button>
              )}
            </div>

            <div className="mt-8 border-t pt-8">
              <h2 className="text-2xl font-bold mb-6">
                Comments ({comments.length})
              </h2>

              {token ? (
                <div className="mb-6">
                  <CommentForm
                    blogId={blogId}
                    onCommentAdded={handleCommentAdded}
                  />
                </div>
              ) : (
                <div className="mb-6 p-4 bg-gray-50 rounded-md text-center">
                  <p className="text-gray-600">Please login to add a comment</p>
                </div>
              )}

              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No comments yet. Be the first to comment!
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment._id}
                      className="bg-white border rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {(comment.userId?.username ||
                              comment.userId?.firstName ||
                              "U")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {comment.userId?.firstName &&
                              comment.userId?.lastName
                                ? `${comment.userId.firstName} ${comment.userId.lastName}`
                                : comment.userId?.username || "Anonymous"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                              {comment.isEdited && (
                                <span className="ml-2">(edited)</span>
                              )}
                            </p>
                          </div>
                        </div>

                        {comment.userId?._id === currentUserId && (
                          <button
                            onClick={() => handleCommentDelete(comment._id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Delete
                          </button>
                        )}
                      </div>

                      <p className="text-gray-800 mb-3 whitespace-pre-wrap">
                        {comment.content}
                      </p>

                      <div className="flex items-center gap-4 text-sm">
                        <button
                          onClick={() => handleCommentLike(comment._id)}
                          className={`flex items-center gap-1 ${
                            comment.likes?.includes(currentUserId)
                              ? "text-blue-600"
                              : "text-gray-500 hover:text-blue-600"
                          }`}
                          disabled={!token}
                        >
                          <Heart
                            size={16}
                            fill={
                              comment.likes?.includes(currentUserId)
                                ? "currentColor"
                                : "none"
                            }
                          />
                          {comment.likes?.length || 0}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {editingBlog && (
              <div className="mt-12 p-6 bg-gray-50 border rounded-xl shadow">
                <h3 className="text-xl font-bold mb-4">Edit Blog</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateBlog(editingBlog._id);
                  }}
                >
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full mb-4 px-4 py-2 border rounded"
                    placeholder="Title"
                    required
                  />
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full mb-4 px-4 py-2 border rounded h-40"
                    placeholder="Content"
                    required
                  />
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-green-600 text-white rounded"
                    >
                      Update
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingBlog(null)}
                      className="px-6 py-2 bg-gray-400 text-white rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogDetails;
