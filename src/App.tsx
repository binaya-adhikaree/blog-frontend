import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./pages/Layout";
import Blog from "./pages/protected/Blog";
import Home from "./pages/protected/Home";
import BlogDetails from "./pages/protected/BlogDetails";
import FavouriteBlogs from "./pages/protected/FavouriteBlogs";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
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
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
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
        <Route path="/blog/:id" element={<BlogDetails />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
