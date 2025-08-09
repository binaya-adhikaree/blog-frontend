import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../components/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;


interface User {
  firstName: string;
  lastName: string;
  email: string;
  id: string;
}

interface NavItem {
  name: string;
  path: string;
}

const Navbar: React.FC = () => {
  const [scrollY, setScrollY] = useState<number>(0);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { token, setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const navItems: NavItem[] = useMemo(
    () => [
      { name: "Blogs", path: "/blog" },
      { name: "Favourites", path: "/favourite" },
    ],
    []
  );

  const handleScroll = useCallback(() => {
    setScrollY(window.scrollY);
  }, []);

  useEffect(() => {
    let ticking = false;

    const throttledScrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledScrollHandler, {
      passive: true,
    });
    return () => window.removeEventListener("scroll", throttledScrollHandler);
  }, [handleScroll]);

  const fetchUser = useCallback(async () => {
    if (!token || isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        if (res.status === 401) {
          logout();
          return;
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setUser(data.user);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [token, isLoading]);

  useEffect(() => {
    if (token && !user && !isLoading) {
      fetchUser();
    } else if (!token) {
      setUser(null);
    }
  }, [token, user, isLoading, fetchUser]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsMenuOpen(false);
    navigate("/login");
  }, [setToken, navigate]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const handleNavClick = useCallback(
    (path: string) => {
      navigate(path);
      setIsMenuOpen(false);
    },
    [navigate]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && event.target instanceof Element) {
        const navbar = event.target.closest("nav");
        if (!navbar) {
          setIsMenuOpen(false);
        }
      }
    };

    if (isMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const navClasses = useMemo(
    () =>
      `fixed top-0 w-full z-50 transition-all duration-500 ${
        scrollY > 50
          ? "bg-white/80 backdrop-blur-lg shadow-lg border-b border-purple-100"
          : "bg-gradient-to-r from-purple-50/80 to-pink-50/80 backdrop-blur-sm"
      }`,
    [scrollY]
  );

  if (!token) {
    return null;
  }

  return (
    <nav className={navClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 lg:py-6">
          <Link
            to="/dashboard"
            className="text-2xl lg:text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg"
          >
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-700 bg-clip-text text-transparent">
              BlogHora
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8 lg:space-x-12">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.path)}
                className="relative text-gray-700 hover:text-purple-600 transition-all duration-300 font-medium text-sm lg:text-base tracking-wide group focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg px-2 py-1"
                aria-label={`Navigate to ${item.name}`}
              >
                {item.name}
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <Link
                to={`/profile/${user.id}`}
                className="flex items-center bg-purple-50 px-4 py-2 rounded-full shadow-sm border border-purple-100 space-x-3 hover:bg-purple-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label="View profile"
              >
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold text-gray-800">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-xs text-gray-500">{user.email}</span>
                </div>
              </Link>
            )}
            <button
              onClick={logout}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 rounded-full hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-label="Logout"
            >
              Logout
            </button>
          </div>

          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              <svg
                className={`w-6 h-6 transition-transform duration-300 ${
                  isMenuOpen ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMenuOpen
              ? "max-h-96 opacity-100 pb-6"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="space-y-4 pt-4 border-t border-purple-100">
            {navItems.map((item) => (
              <button
                key={item.name}
                className="block w-full text-left px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                onClick={() => handleNavClick(item.path)}
                aria-label={`Navigate to ${item.name}`}
              >
                {item.name}
              </button>
            ))}

            {user && (
              <Link
                to={`/profile/${user.id}`}
                className="block px-4 pt-2 pb-3 text-sm text-gray-700 bg-purple-50 rounded-lg shadow-sm border border-purple-100 hover:bg-purple-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                onClick={() => setIsMenuOpen(false)}
                aria-label="View profile"
              >
                <p className="font-semibold">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </Link>
            )}

            <div className="px-4 pt-4">
              <button
                onClick={logout}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                aria-label="Logout"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </nav>
  );
};

export default Navbar;
