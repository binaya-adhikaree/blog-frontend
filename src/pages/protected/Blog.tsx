import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, X, Plus, Calendar, User, Eye } from "lucide-react";

interface Author {
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface Blog {
  _id: string;
  title: string;
  content: string;
  image?: string;
  author?: Author;
  createdAt: string;
}

const Blog: React.FC = () => {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchOpen, setSearchOpen] = useState<boolean>(false);

  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;
 
  const filterBlogs = (query: string): void => {
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const query = e.target.value;
    setSearchQuery(query);
    filterBlogs(query);
  };

  const clearSearch = (): void => {
    setSearchQuery("");
    setFilteredBlogs(blogs);
    setSearchOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
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
      const res = await fetch(`${API_URL}/blog/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Article published successfully");
        setTitle("");
        setContent("");
        setImage(null);
        setFormOpen(false);
        fetchBlogs();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.message || "❌ Failed to publish article");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBlogs = async (): Promise<void> => {
    try {
      const res = await fetch(`${API_URL}/blog/all`);
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

  const handleDrag = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent): void => {
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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getAuthorName = (author?: Author): string => {
    if (!author) return "Anonymous";
    if (author.firstName && author.lastName) {
      return `${author.firstName} ${author.lastName}`;
    }
    return author.firstName || author.email || "Anonymous";
  };

  const getReadingTime = (content: string): string => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main header row */}
          <div className="flex items-center justify-between h-16">
            {/* Left section - Back button and title */}
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <button
                onClick={() => navigate("/")}
                className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium hidden xs:inline">Home</span>
              </button>
              <div className="h-6 w-px bg-gray-300 hidden xs:block" />
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Blog</h1>
            </div>

            {/* Center section - Search (desktop) */}
            <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors text-sm"
                  placeholder="Search articles..."
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

            {/* Right section - Search button (mobile) and Write button */}
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              {/* Mobile search toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Write button */}
              <button
                onClick={() => setFormOpen(true)}
                className="flex items-center space-x-1 sm:space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-full transition-colors font-medium text-sm"
              >
                <Plus className="w-4 h-4 flex-shrink-0" />
                <span className="hidden xs:inline">Write</span>
              </button>
            </div>
          </div>

          {/* Mobile search row */}
          {searchOpen && (
            <div className="md:hidden pb-4 border-t border-gray-100">
              <div className="pt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors text-sm"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    autoFocus
                  />
                  {searchQuery ? (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setSearchOpen(false)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Search results info */}
      {searchQuery && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-sm text-gray-600">
            {filteredBlogs.length === 0 ? (
              <div className="flex flex-col xs:flex-row xs:items-center space-y-2 xs:space-y-0 xs:space-x-2">
                <span className="text-red-600">No results found for</span>
                <span className="font-medium break-all">"{searchQuery}"</span>
                <button
                  onClick={clearSearch}
                  className="text-blue-600 hover:underline self-start xs:ml-2"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="flex flex-col xs:flex-row xs:items-center space-y-1 xs:space-y-0 xs:space-x-2">
                <span>
                  {filteredBlogs.length} article
                  {filteredBlogs.length !== 1 ? "s" : ""} found for
                </span>
                <span className="font-medium break-all">"{searchQuery}"</span>
              </div>
            )}
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Message notification */}
        {message && (
          <div className="fixed top-20 right-4 z-50 max-w-sm">
            <div
              className={`p-4 rounded-lg shadow-lg border ${
                message.includes("✅")
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium pr-2">{message}</span>
                <button
                  onClick={() => setMessage("")}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create blog modal */}
        {formOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-xl">
                <h2 className="text-lg font-semibold text-gray-900">
                  Write a new article
                </h2>
                <button
                  onClick={() => setFormOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
                {/* Title Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Write a compelling title..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>

                {/* Content Textarea */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                    required
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image (Optional)
                  </label>
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors ${
                      dragActive
                        ? "border-blue-500 bg-blue-50"
                        : image
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300 hover:border-gray-400"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImage(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    {image ? (
                      <div className="space-y-2">
                        <div className="text-green-600">
                          <svg
                            className="mx-auto h-8 w-8"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-green-600 break-all">
                          {image.name}
                        </p>
                        <button
                          type="button"
                          onClick={() => setImage(null)}
                          className="text-xs text-red-600 hover:text-red-800 underline"
                        >
                          Remove image
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer block"
                      >
                        <div className="space-y-2">
                          <div className="text-gray-400">
                            <svg
                              className="mx-auto h-8 w-8"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium text-blue-600">
                              Click to upload
                            </span>{" "}
                            <span className="hidden xs:inline">or drag and drop</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            PNG, JPG, GIF up to 10MB
                          </div>
                        </div>
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setFormOpen(false)}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !title.trim() || !content.trim()}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isLoading && (
                      <svg
                        className="animate-spin h-4 w-4"
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
                    )}
                    <span>{isLoading ? "Publishing..." : "Publish"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Blog content */}
        <div className="space-y-6 sm:space-y-8">
          {filteredBlogs.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H14"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? "No articles found" : "No articles yet"}
              </h3>
              <p className="text-gray-500 mb-6 px-4">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Be the first to share your thoughts"}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setFormOpen(true)}
                  className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Write your first article</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBlogs.map((blog) => (
                <article
                  key={blog._id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden group"
                >
                  {blog.image && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={`${API_URL}/uploads/${blog.image}`}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <div className="p-4 sm:p-6">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{getAuthorName(blog.author)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span className="whitespace-nowrap">{formatDate(blog.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3 flex-shrink-0" />
                        <span className="whitespace-nowrap">{getReadingTime(blog.content)}</span>
                      </div>
                    </div>

                    <h2 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      <Link to={`/blog/${blog._id}`}>{blog.title}</Link>
                    </h2>

                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                      {blog.content}
                    </p>

                    <Link
                      to={`/blog/${blog._id}`}
                      className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Read more
                      <svg
                        className="ml-1 w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Blog;