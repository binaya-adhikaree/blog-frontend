import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  Calendar,
  User,
  BookOpen,
  Star,
  Search,
  ArrowLeft,
  Clock,
  Eye,
  X,
  Plus,
} from "lucide-react";

interface Author {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
}

interface BlogReactions {
  love?: number;
  likes?: number;
}

interface Blog {
  _id: string;
  title: string;
  content: string;
  image?: string;
  author: Author;
  createdAt: string;
  updatedAt?: string;
  reactions?: BlogReactions;
}

interface FavouritesResponse {
  blogs: Blog[];
  total: number;
}

const FavouriteBlogs: React.FC = () => {
  const [favBlogs, setFavBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchFavourites = async (): Promise<void> => {
      if (!token) {
        setError("Please login to view your favourite blogs");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch("http://localhost:3001/blog/favourites", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Session expired. Please login again.");
          }
          throw new Error(`Failed to fetch favourites (${response.status})`);
        }

        const data: FavouritesResponse = await response.json();
        setFavBlogs(data.blogs || []);
      } catch (err: unknown) {
        console.error("Error fetching favourites:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load favourite blogs"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFavourites();
  }, [token]);

  const truncateContent = (
    content: string,
    maxLength: number = 150
  ): string => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getAuthorName = (author: Author): string => {
    if (author.firstName && author.lastName) {
      return `${author.firstName} ${author.lastName}`;
    }
    return author.firstName || author.email;
  };

  const getReadingTime = (content: string): string => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  const clearSearch = (): void => {
    setSearchTerm("");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const filteredBlogs = favBlogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getAuthorName(blog.author)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back</span>
              </button>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your favourite articles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back</span>
              </button>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center py-20 px-4">
          <div className="bg-white border border-red-200 rounded-xl p-8 max-w-md w-full text-center shadow-sm">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Unable to load favourites
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
              {error.includes("login") && (
                <Link
                  to="/login"
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back</span>
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />
                <h1 className="text-lg font-semibold text-gray-900">
                  Favourite Articles
                </h1>
              </div>
            </div>

            <Link
              to="/blog"
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Browse Articles</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search your favourites..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <BookOpen className="w-4 h-4" />
              <span>
                {filteredBlogs.length} of {favBlogs.length} article
                {favBlogs.length !== 1 ? "s" : ""}
                {searchTerm && " found"}
              </span>
            </div>
          </div>
        </div>

        {favBlogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No favourite articles yet
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start exploring amazing articles and save your favorites by
              clicking the heart icon.
            </p>
            <Link
              to="/blog"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore Articles</span>
            </Link>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No results found
            </h2>
            <p className="text-gray-600 mb-6">
              No articles match your search for "{searchTerm}"
            </p>
            <button
              onClick={clearSearch}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBlogs.map((blog) => (
              <article
                key={blog._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 overflow-hidden group transition-shadow"
              >
                {/* Featured Image */}
                {blog.image && (
                  <div className="aspect-video overflow-hidden relative">
                    <img
                      src={`http://localhost:3001/uploads/${blog.image}`}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                        <Star
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  {/* Article Meta */}
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{getAuthorName(blog.author)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(blog.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{getReadingTime(blog.content)}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    <Link to={`/blog/${blog._id}`}>{blog.title}</Link>
                  </h2>

                  {/* Content Preview */}
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                    {truncateContent(blog.content)}
                  </p>

                  {/* Reactions */}
                  {blog.reactions?.love && (
                    <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Heart
                          className="w-4 h-4 text-red-500"
                          fill="currentColor"
                        />
                        <span>{blog.reactions.love}</span>
                      </div>
                    </div>
                  )}

                  {/* Read More Link */}
                  <Link
                    to={`/blog/${blog._id}`}
                    className="inline-flex items-center space-x-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Read article</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {favBlogs.length > 0 && (
          <div className="text-center mt-12 pt-8 border-t border-gray-200">
            <Link
              to="/blog"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Discover more articles</span>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default FavouriteBlogs;
