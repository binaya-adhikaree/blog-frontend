import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

  const currentUserId = localStorage.getItem("userId") || "";
  const token = localStorage.getItem("token");

  const handleLove = async () => {
    if (!token || !blog?._id || isLoveLoading) return;

    setIsLoveLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/blog/react/${blog._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
      const res = await fetch(
        `http://localhost:3001/blog/favourite/${blogId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
      const res = await fetch(`http://localhost:3001/blog/${id}`, {
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
      const response = await fetch(
        `http://localhost:3001/blog/update/${blogId}`,
        {
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
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Something went wrong");

      setBlog(data.blog);
      setEditingBlog(null);
    } catch (error: any) {
      console.error("Update error:", error.message);
    }
  };

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) return;

      try {
        const res = await fetch(`http://localhost:3001/blog/${id}`);
        if (!res.ok) throw new Error("Blog not found");

        const data = await res.json();
        setBlog(data.blog);

        const favoritesArray = data.blog.favourites || data.blog.favouritedBy || [];
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
  if (error) return <div className="text-center text-red-600 py-20">{error}</div>;

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
              src={`http://localhost:3001/uploads/${blog.image}`}
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
                <span>
                  {blog?.author.firstName} {blog?.author.lastName}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={18} />
                <span>
                  {new Date(blog?.createdAt || "").toLocaleDateString("en-US")}
                </span>
              </div>
            </div>

            {/* INTERACTION BUTTONS BELOW TITLE */}
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
                <Star
                  size={20}
                  fill={isFavorite ? "currentColor" : "none"}
                />
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

            {/* READ MORE FEATURE */}
            <div className="text-lg text-gray-700 whitespace-pre-line">
              {blog?.content.length > 500 && !showFullContent
                ? `${blog.content.slice(0, 500)}...`
                : blog?.content}
              {blog?.content.length > 500 && (
                <button
                  onClick={() => setShowFullContent(!showFullContent)}
                  className="ml-2 text-blue-600 hover:underline text-sm"
                >
                  {showFullContent ? "Read Less" : "Read More"}
                </button>
              )}
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
