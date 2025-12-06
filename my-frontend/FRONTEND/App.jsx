import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Planner from "./pages/Planner";
import Logs from "./pages/Logs";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import Social from "./pages/Social";
import Videos from "./pages/Videos";
import WorkScheduleManager from "./pages/WorkScheduleManager";
import Settings from "./pages/Settings";
import NewsFeed from "./pages/NewsFeed";
import AdminLayout from "./admin/pages/AdminLayout";
import { AdminRoute } from "./admin/components/ProtectedRoute";
import { ToastProvider } from "./contexts/ToastContext";

export default function App() {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  const isAdminPage = path.startsWith("/admin");
  const hideNavbar =
    path === "/" ||
    path === "/login" ||
    path === "/register" ||
    path === "/forgot-password" ||
    isAdminPage;

  return (
    <ToastProvider>
      <div className="app-container">
        {!hideNavbar && <Navbar />}
        <div className={`main-content ${isAdminPage ? "admin-mode" : ""}`}>
          <Routes>
            { }
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            { }
            <Route path="/home" element={<Home />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/schedule-manager" element={<WorkScheduleManager />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/social" element={<Social />} />
            <Route path="/newsfeed" element={<NewsFeed />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/settings" element={<Settings />} />

            { }
            <Route
              path="/admin/*"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </ToastProvider>
  );
}