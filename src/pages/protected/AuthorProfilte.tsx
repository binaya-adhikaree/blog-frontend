import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  BookOpen,
  Mail,
  MapPin,
  Link as LinkIcon,
  Twitter,
  Github,
  Clock,
  Eye,
  User,
} from "lucide-react";

interface BlogType {
  _id: string;
  title: string;
  content: string;
  image?: string;
  createdAt: string;
  updatedAt?: string;
}

interface UserType {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  twitter?: string;
  github?: string;
}

interface AuthorProfileResponse {
  user: UserType;
  blogs: BlogType[];
  isOwnProfile?: boolean;
}

const AuthorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [blogs, setBlogs] = useState<BlogType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL =
    import.meta.env?.VITE_API_URL ||
    (typeof process !== "undefined" ? process.env?.REACT_APP_API_URL : null) ||
    "https://blog-backend-ae8e.onrender.com";

  useEffect(() => {
    const fetchAuthorProfile = async (): Promise<void> => {
      if (!id) {
        setError("No user ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const cleanId = id.replace(/}$/, "");
        const res = await fetch(`${API_URL}/api/user/${cleanId}`);

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Author not found");
          }
          throw new Error(`Failed to fetch author (${res.status})`);
        }

        const data: AuthorProfileResponse = await res.json();
        console.log("Full API Response:", data);
        console.log("Blogs array:", data.blogs);
        console.log("Blogs length:", data.blogs?.length);

        if (!data.user) {
          throw new Error("Author not found");
        }

        if (!Array.isArray(data.blogs)) {
          throw new Error("Invalid response format");
        }

        setUser(data.user);
        setBlogs(data.blogs);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(
          err instanceof Error ? err.message : "Error loading author profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorProfile();
  }, [id, API_URL]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getReadingTime = (content: string): string => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getFullName = (user: UserType): string => {
    return `${user.firstName} ${user.lastName}`;
  };

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
            <p className="text-gray-600">Loading author profile...</p>
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
              <User className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Author not found
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </button>

            <Link
              to="/blog"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Browse Articles
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
              <div className="flex-shrink-0 mb-6 md:mb-0">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={getFullName(user)}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(user.firstName, user.lastName)
                  )}
                </div>
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {getFullName(user)}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      Joined {formatDate(user.createdAt)}
                    </span>
                  </div>
                  {user.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{user.location}</span>
                    </div>
                  )}
                </div>

                {user.bio && (
                  <p className="text-gray-700 mb-4 max-w-2xl leading-relaxed">
                    {user.bio}
                  </p>
                )}

                {/* Social Links */}
                {(user.website || user.twitter || user.github) && (
                  <div className="flex items-center space-x-4">
                    {user.website && (
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <LinkIcon className="w-4 h-4" />
                        <span className="text-sm">Website</span>
                      </a>
                    )}
                    {user.twitter && (
                      <a
                        href={`https://twitter.com/${user.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Twitter className="w-4 h-4" />
                        <span className="text-sm">Twitter</span>
                      </a>
                    )}
                    {user.github && (
                      <a
                        href={`https://github.com/${user.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Github className="w-4 h-4" />
                        <span className="text-sm">GitHub</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 px-8 py-6">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span className="text-2xl font-bold text-gray-900">
                    {blogs.length}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {blogs.length === 1 ? "Article" : "Articles"} Published
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 px-8 py-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Articles by {user.firstName}
            </h2>
          </div>

          <div className="p-8">
            {blogs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No articles yet
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  {user.firstName} hasn't published any articles yet. Check back
                  later for new content!
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {blogs.map((blog) => (
                  <article
                    key={blog._id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow group"
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

                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        <Link to={`/blog/${blog._id}`}>{blog.title}</Link>
                      </h3>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {blog.content}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(blog.createdAt)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{getReadingTime(blog.content)}</span>
                          </div>
                        </div>
                      </div>

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
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthorProfile;
