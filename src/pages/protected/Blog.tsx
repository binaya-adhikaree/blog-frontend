import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, X } from "lucide-react";

const Blog = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Filter blogs based on search query
  const filterBlogs = (query) => {
    if (!query.trim()) {
      setFilteredBlogs(blogs);
      return;
    }

    const filtered = blogs.filter((blog) => {
      const searchTerm = query.toLowerCase();
      return (
        blog.title.toLowerCase().includes(searchTerm) ||
        blog.content.toLowerCase().includes(searchTerm) ||
        `${blog.author?.firstName || ""} ${blog.author?.lastName || ""}`
          .toLowerCase()
          .includes(searchTerm)
      );
    });

    setFilteredBlogs(filtered);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    filterBlogs(query);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setFilteredBlogs(blogs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Please log in first");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (image) formData.append("image", image);

    try {
      const res = await fetch("http://localhost:3001/blog/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Blog created successfully");
        setTitle("");
        setContent("");
        setImage(null);
        setFormOpen(false);
        fetchBlogs();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.message || "❌ Failed to create blog");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBlogs = async () => {
    try {
      const res = await fetch("http://localhost:3001/blog/all");
      const data = await res.json();
      setBlogs(data);
      setFilteredBlogs(data);
    } catch (error) {
      console.error("Error fetching blogs");
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    filterBlogs(searchQuery);
  }, [blogs]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        setImage(file);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="bg-white/80 backdrop-blur-sm sticky top-0 z-40 border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 mb-4 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md transition"
              >
                <ArrowLeft size={18} />
                Go to Home
              </button>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Blog Stories
              </h1>
              <p className="text-gray-600 mt-2">
                Discover amazing stories and insights
              </p>
            </div>

            <div className="relative flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  className="w-full pl-12 pr-4 py-3 rounded-full shadow-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                  placeholder="Search blogs by title, content, or author..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />

                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={() => setFormOpen(!formOpen)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 flex items-center gap-2"
            >
              <span
                className={`transition-transform duration-300 ${formOpen ? "rotate-45" : ""}`}
              >
                +
              </span>
              {formOpen ? "Close" : "New Story"}
            </button>
          </div>

          {searchQuery && (
            <div className="mt-4 text-sm text-gray-600">
              {filteredBlogs.length === 0 ? (
                <span className="text-red-500">
                  No blogs found for "{searchQuery}"
                </span>
              ) : (
                <span>
                  Found {filteredBlogs.length} blog
                  {filteredBlogs.length !== 1 ? "s" : ""} for "{searchQuery}"
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {message && (
          <div
            className={`fixed top-24 right-4 z-50 p-4 rounded-xl shadow-lg animate-slideIn ${
              message.includes("✅")
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{message}</span>
              <button
                onClick={() => setMessage("")}
                className="ml-2 hover:opacity-70"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {formOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl transform transition-all duration-300 animate-slideUp relative overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>

              <button
                onClick={() => setFormOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200 z-10"
              >
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    Create New Story
                  </h2>
                  <p className="text-gray-600">
                    Share your thoughts with the world
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Story Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter an engaging title..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 placeholder-gray-400 bg-gray-50 focus:bg-white text-lg"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Content
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your story here..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 placeholder-gray-400 bg-gray-50 focus:bg-white resize-none"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Featured Image
                    </label>
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-6 transition-colors duration-200 ${
                        dragActive
                          ? "border-purple-500 bg-purple-50"
                          : image
                            ? "border-green-400 bg-green-50"
                            : "border-gray-300 bg-gray-50 hover:border-purple-400 hover:bg-purple-50"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="text-center">
                        {image ? (
                          <div className="space-y-2">
                            <svg
                              className="mx-auto h-12 w-12 text-green-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <p className="text-green-600 font-medium">
                              {image.name}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <p className="text-gray-600">
                              <span className="font-medium text-purple-600">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || !title.trim() || !content.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:transform-none shadow-lg hover:shadow-purple-500/25"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Publishing...
                      </div>
                    ) : (
                      "Publish Story"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6">
          {filteredBlogs.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-12 h-12 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H14"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {searchQuery ? "No matching stories found" : "No stories yet"}
              </h3>
              <p className="text-gray-500 text-center max-w-md">
                {searchQuery
                  ? `Try adjusting your search terms or clear the search to see all stories.`
                  : `Start sharing your thoughts and experiences with the world. Click "New Story" to get started!`}
              </p>
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            filteredBlogs.map((blog, idx) => (
              <div
                key={idx}
                className=" group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-[1.02] mb-6 break-inside-avoid"
              >
                <div className="relative overflow-hidden">
                  {blog.image && (
                    <img
                      src={`http://localhost:3001/uploads/${blog.image}`}
                      alt={blog.title}
                      className="w-full h-32 sm:h-40 object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors duration-300">
                      {blog.title}
                    </h2>
                    <div className="ml-2 flex-shrink-0">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-4 mb-4">
                    {blog.content}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <time className="text-xs text-gray-500 font-medium">
                      {new Date(blog.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                    <p className="text-sm text-gray-600">
                      Created by{" "}
                      {blog.author?.firstName ||
                        blog.author?.email ||
                        "unknown"}{" "}
                      {blog.author?.lastName}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-2.5 h-2.5 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-purple-600/90 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4">
                  <button className="bg-white text-purple-600 px-4 py-2 rounded-full font-semibold text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <Link to={`/blog/${blog._id}`}>Read More</Link>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="fixed top-10 left-10 w-20 h-20 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob pointer-events-none"></div>
      <div className="fixed top-16 right-10 w-20 h-20 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="fixed bottom-20 left-20 w-20 h-20 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 pointer-events-none"></div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Blog;
