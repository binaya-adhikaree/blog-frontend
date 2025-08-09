import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./pages/Layout";
import Blog from "./pages/protected/Blog";
import BlogDetails from "./pages/protected/BlogDetails";
import FavouriteBlogs from "./pages/protected/FavouriteBlogs";
import UserProfile from "./pages/protected/UserProfile";
import AuthorProfile from "./pages/protected/AuthorProfilte";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/author/:id"
          element={
            <ProtectedRoute>
              <AuthorProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/blog"
          element={
            <ProtectedRoute>
              <Blog />
            </ProtectedRoute>
          }
        />

        <Route
          path="/favourite"
          element={
            <ProtectedRoute>
              <FavouriteBlogs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/blog/:id"
          element={
            <ProtectedRoute>
              <BlogDetails />
            </ProtectedRoute>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
