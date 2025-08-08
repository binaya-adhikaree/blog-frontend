import React, { useEffect, useState } from "react";
import { Heart, Calendar, User, BookOpen, Star, ArrowRight, Search } from "lucide-react";

interface Author {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
}

interface Blog {
  _id: string;
  title: string;
  content: string;
  image?: string;
  author: Author;
  createdAt: string;
  reactions?: { love?: number };
}

const FavouriteBlogs: React.FC = () => {
  const [favBlogs, setFavBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchFavourites = async () => {
      if (!token) {
        setError("Please login to view your favourite blogs");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/blog/favourites', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch favourites');
        }

        const data = await response.json();
        setFavBlogs(data.blogs || []);
      } catch (err: any) {
        console.error('Error fetching favourites:', err);
        setError(err.message || 'Failed to load favourite blogs');
      } finally {
        setLoading(false);
      }
    };

    fetchFavourites();
  }, [token]);

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getAuthorName = (author: Author) => {
    if (author.firstName && author.lastName) {
      return `${author.firstName} ${author.lastName}`;
    }
    return author.email;
  };

  const navigateToBlog = (blogId: string) => {
    window.location.href = `/blog/${blogId}`;
  };

  const navigateToAllBlogs = () => {
    window.location.href = '/blog';
  };

  const filteredBlogs = favBlogs.filter((blog) =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Your Favourites</h2>
          <p className="text-gray-600">Gathering your amazing collection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-pink-50 to-rose-100 p-4">
        <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20 max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-red-500 text-3xl">😔</span>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Oops!</h2>
          <p className="text-red-500 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = "/login"}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-full hover:from-red-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (favBlogs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-100 p-4">
        <div className="text-center bg-white/80 backdrop-blur-sm p-12 rounded-3xl shadow-xl border border-white/20 max-w-lg">
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Star className="w-12 h-12 text-yellow-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">No Favourites Yet</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Start exploring amazing blogs and save your favorites to see them here!
          </p>
          <button
            onClick={navigateToAllBlogs}
            className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-full hover:from-yellow-600 hover:to-amber-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium text-lg"
          >
            Explore Blogs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/20 mb-6">
            <Star className="w-6 h-6 text-purple-600" />
            <span className="font-semibold text-purple-800">Your Collection</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Favourite Blogs
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your carefully curated collection of amazing stories and insights
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search by title or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full shadow-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
              />
              <Search className="absolute top-3 left-4 text-gray-400" size={20} />
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">{filteredBlogs.length} result{filteredBlogs.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Blogs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredBlogs.map((blog, index) => (
            <div
              key={blog._id}
              className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl border border-white/20 overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {blog.image && (
                <div className="relative overflow-hidden h-48">
                  <img
                    src={`http://localhost:3001/uploads/${blog.image}`}
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-4 right-4">
                    <div className="w-10 h-10 bg-purple-500/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-white" fill="currentColor" />
                    </div>
                  </div>
                </div>
              )}
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-purple-600 transition-colors duration-300">
                  {blog.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed line-clamp-3">
                  {truncateContent(blog.content)}
                </p>
                <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <User size={14} className="text-white" />
                    </div>
                    <span className="font-medium">{getAuthorName(blog.author)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{formatDate(blog.createdAt)}</span>
                  </div>
                  {blog.reactions?.love && (
                    <div className="flex items-center gap-1">
                      <Heart size={16} className="text-red-500" fill="currentColor" />
                      <span>{blog.reactions.love}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => navigateToBlog(blog._id)}
                  className="group/btn w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                >
                  <span>Read Full Story</span>
                  <ArrowRight 
                    size={18} 
                    className="group-hover/btn:translate-x-1 transition-transform duration-300" 
                  />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <button
            onClick={navigateToAllBlogs}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-purple-600 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl border border-white/20 font-medium"
          >
            <BookOpen className="w-5 h-5" />
            <span>Explore More Blogs</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FavouriteBlogs;
