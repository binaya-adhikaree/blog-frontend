import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit3,
  Calendar,
  Users,
  UserPlus,
  BookOpen,
  Plus,
  Eye,
  Clock,
  Settings,
  Mail,
  X,
  Check,
  Loader,
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
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  avatar?: string;
  bio?: string;
}

interface MyProfileResponse {
  user: UserType;
  blogs: BlogType[];
}

interface ProfileUpdateData {
  firstName: string;
  lastName: string;
  bio: string;
}

interface UpdateProfileResponse {
  success: boolean;
  user: UserType;
  message?: string;
}

const MyProfile: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [blogs, setBlogs] = useState<BlogType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editLoading, setEditLoading] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<boolean>(false);

  const [formData, setFormData] = useState<ProfileUpdateData>({
    firstName: "",
    lastName: "",
    bio: "",
  });

  const API_URL =
    import.meta.env?.VITE_API_URL ||
    (typeof process !== "undefined" ? process.env?.REACT_APP_API_URL : null) ||
    "http://localhost:3001";

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchMyProfile = async (): Promise<void> => {
      if (!token) {
        setError("You must be logged in to view your profile");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_URL}/api/user`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Session expired. Please login again.");
          }
          throw new Error(`Failed to fetch profile (${res.status})`);
        }

        const data: MyProfileResponse = await res.json();
        setUser(data.user);
        setBlogs(data.blogs || []);

        // Initialize form data with current user data
        setFormData({
          firstName: data.user.firstName || "",
          lastName: data.user.lastName || "",
          bio: data.user.bio || "",
        });
      } catch (err) {
        console.error("Error fetching my profile:", err);
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchMyProfile();
  }, [token]);

  const updateProfile = async (
    profileData: ProfileUpdateData
  ): Promise<UpdateProfileResponse> => {
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await fetch(`${API_URL}/api/user/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update profile");
    }

    const result = await response.json();
    return result;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    setEditSuccess(false);

    try {
      const result = await updateProfile(formData);

      if (result.success) {
        setUser(result.user);
        setEditSuccess(true);

        setTimeout(() => {
          setIsEditModalOpen(false);
          setEditSuccess(false);
        }, 1500);
      }
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : "Failed to update profile"
      );
    } finally {
      setEditLoading(false);
    }
  };

  const openEditModal = (): void => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        bio: user.bio || "",
      });
    }
    setIsEditModalOpen(true);
    setEditError(null);
    setEditSuccess(false);
  };

  const closeEditModal = (): void => {
    setIsEditModalOpen(false);
    setEditError(null);
    setEditSuccess(false);
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white border border-red-200 rounded-xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Unable to load profile
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Go to Home
          </button>
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/")}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Home</span>
              </button>
            </div>

            <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Settings</span>
            </button>
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
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(user.firstName, user.lastName)
                  )}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {user.firstName} {user.lastName}
                    </h1>
                    <div className="flex items-center space-x-4 text-gray-600 mb-3">
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
                    </div>
                    {user.bio && (
                      <p className="text-gray-600 max-w-2xl">{user.bio}</p>
                    )}
                  </div>

                  <button
                    onClick={openEditModal}
                    className="flex items-center space-x-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="border-t border-gray-200 px-8 py-6">
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span className="text-2xl font-bold text-gray-900">
                    {blogs.length}
                  </span>
                </div>
                <span className="text-sm text-gray-600">Articles</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-2xl font-bold text-gray-900">0</span>
                </div>
                <span className="text-sm text-gray-600">Followers</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  <span className="text-2xl font-bold text-gray-900">0</span>
                </div>
                <span className="text-sm text-gray-600">Following</span>
              </div>
            </div>
          </div>
        </div>

        {/* Articles Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 px-8 py-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                My Articles
              </h2>
              <Link
                to="/blog"
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Write Article</span>
              </Link>
            </div>
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
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  Start sharing your thoughts and ideas with the world. Your
                  first article is just a click away.
                </p>
                <Link
                  to="/blog"
                  className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Write your first article</span>
                </Link>
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

                      <div className="flex items-center justify-between">
                        <Link
                          to={`/blog/${blog._id}`}
                          className="inline-flex items-center space-x-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Read article</span>
                        </Link>

                        <div className="flex items-center space-x-2">
                          <button className="text-gray-400 hover:text-gray-600 transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Edit Profile
              </h2>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              {/* Success Message */}
              {editSuccess && (
                <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="w-5 h-5 text-green-600" />
                  <p className="text-green-800 font-medium">
                    Profile updated successfully!
                  </p>
                </div>
              )}

              {/* Error Message */}
              {editError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800">{editError}</p>
                </div>
              )}

              {/* First Name */}
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your first name"
                  disabled={editLoading}
                />
              </div>

              {/* Last Name */}
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your last name"
                  disabled={editLoading}
                />
              </div>

              {/* Bio */}
              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
                  placeholder="Tell us about yourself..."
                  disabled={editLoading}
                />
                <p className="mt-1 text-sm text-gray-500">
                  {formData.bio.length}/500 characters
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {editLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      Updating...
                    </div>
                  ) : (
                    "Update Profile"
                  )}
                </button>

                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={editLoading}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;