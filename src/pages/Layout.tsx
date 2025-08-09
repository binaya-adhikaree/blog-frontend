import Navbar from "./protected/Navbar";
import { Link } from "react-router-dom";

const Layout = () => {


  return (
    <>
      <nav>
        <Navbar />
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center overflow-hidden">
        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-4000"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                  Stories
                </span>
                <br />
                <span className="text-gray-900">That Matter</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-xl mx-auto lg:mx-0">
                Discover amazing stories, insights, and experiences from writers
                around the world. Join our community of storytellers and readers.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/blog"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/40"
                >
                  Start Reading
                </Link>
                <Link
                  to="/blog"
                  className="border-2 border-gray-300 hover:border-purple-500 text-gray-700 hover:text-purple-600 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:bg-purple-50"
                >
                  Write Your Story
                </Link>
              </div>

              {/* Stats */}
              <div className="flex justify-center lg:justify-start gap-10 mt-12">
                {[
                  { value: "1K+", label: "Stories", color: "text-purple-600" },
                  { value: "5K+", label: "Readers", color: "text-pink-600" },
                  { value: "500+", label: "Writers", color: "text-indigo-600" },
                ].map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                {[["from-purple-400 to-pink-400", "h-24"], ["from-indigo-400 to-purple-400", "h-20"], ["from-pink-400 to-indigo-400", "h-28"], ["from-indigo-400 to-pink-400", "h-32"]].map((card, idx) => (
                  <div
                    key={idx}
                    className={`bg-white rounded-xl shadow-lg p-4 transform hover:scale-105 transition-transform duration-300 ${idx % 2 !== 0 ? "mt-8" : ""}`}
                  >
                    <div className={`w-full ${card[1]} bg-gradient-to-r ${card[0]} rounded-lg mb-3`}></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

    

     
    </>
  );
};

export default Layout;
