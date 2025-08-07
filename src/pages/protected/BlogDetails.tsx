import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Heart } from "lucide-react";

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
  lovedBy: string[];
}

const BlogDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [blog, setBlog] = useState<Blog | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const currentUserId = localStorage.getItem("userId") || "";
  const token = localStorage.getItem("token");

  const isLoved = blog?.lovedBy?.includes(currentUserId) || false;

  const handleLove = async () => {
    if (!token || !blog?._id) return;

    try {
      const res = await fetch(`http://localhost:3001/blog/react/${blog._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to toggle love");

      const data = await res.json();

      const updatedLovedBy = isLoved
        ? blog.lovedBy.filter((id) => id !== currentUserId)
        : [...blog.lovedBy, currentUserId];

      setBlog((prev) =>
        prev ? { ...prev, reactions: data.reactions, lovedBy: updatedLovedBy } : prev
      );
    } catch (err) {
      console.error("Love toggle failed:", err);
    }
  };

  const handleToggleFavorite = async () => {
    if (!token || !blog?._id) return;

    try {
      const res = await fetch(
        `http://localhost:3001/blog/favourite/${blog._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();

      const newFavs = data.favourites as string[] | undefined;
      if (newFavs) {
        setIsFavorite(newFavs.includes(currentUserId));
        setBlog((prev) => (prev ? { ...prev, favourites: newFavs } : prev));
      } else {
        setIsFavorite((prev) => !prev);
      }
    } catch (err) {
      console.error("Favorite toggle failed:", err);
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
        setIsFavorite(data.blog.favourites?.includes(currentUserId));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id, currentUserId]);

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

  if (loading)
    return <p className="text-center mt-10 text-gray-500">Loading...</p>;
  if (error)
    return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <button
        onClick={() => navigate("/blog")}
        className="flex items-center gap-2 mb-4 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md transition"
      >
        <ArrowLeft size={18} />
        Go to Blogs
      </button>

      <article className="bg-white shadow-lg rounded-lg overflow-hidden">
        {blog?.image && (
          <img
            src={`http://localhost:3001/uploads/${blog.image}`}
            alt={blog.title}
            className="w-full max-h-[500px] object-contain bg-gray-100"
          />
        )}

        <div className="p-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
            {blog?.title}
          </h1>
          <p className="text-gray-800 text-lg leading-7 mb-8 whitespace-pre-line">
            {blog?.content}
          </p>

          <div className="flex gap-4 mt-4">
            <button
              onClick={handleLove}
              className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition"
            >
              <Heart
                fill={isLoved ? "red" : "none"}
                color={isLoved ? "red" : "gray"}
              />
              <span className="ml-2">
                {blog.reactions?.love ?? 0}
              </span>
            </button>

            <button
              onClick={handleToggleFavorite}
              className={`px-4 py-2 rounded transition ${
                isFavorite
                  ? "bg-yellow-400 text-black"
                  : "bg-gray-300 text-black"
              }`}
            >
              {isFavorite ? "★ Remove Favorite" : "☆ Add to Favorite"}
            </button>
          </div>

          {blog && currentUserId && blog.author._id === currentUserId && (
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Delete Blog
              </button>
              <button
                onClick={() => handleEdit(blog)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Edit Blog
              </button>
            </div>
          )}

          {editingBlog && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateBlog(editingBlog._id);
              }}
              className="space-y-4 mt-6"
            >
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border rounded"
                placeholder="Blog Title"
                required
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-2 border rounded h-40"
                placeholder="Blog Content"
                required
              />
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-xl shadow"
                >
                  ✅ Update
                </button>
                <button
                  type="button"
                  onClick={() => setEditingBlog(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-xl shadow"
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          )}

          <div className="border-t pt-4 mt-8 flex justify-between text-sm text-gray-600">
            <span>
              Created by:{" "}
              <strong>
                {blog.author.firstName} {blog.author.lastName}
              </strong>
            </span>
            <span>{new Date(blog.createdAt).toLocaleString()}</span>
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogDetails;
