import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Planner from "./pages/Planner";
import Logs from "./pages/Logs";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import Social from "./pages/Social";
import Videos from "./pages/Videos";
import WorkScheduleManager from "./pages/WorkScheduleManager";
import Settings from "./pages/Settings";
import AdminLayout from "./admin/pages/AdminLayout";
import { AdminRoute } from "./admin/components/ProtectedRoute";


export default function App() {
  const location = useLocation();
  
  // Ẩn Navbar ở trang Login VÀ tất cả trang Admin
  const hideNavbar = location.pathname === "/" || location.pathname.startsWith("/admin");

  return (
    <div className="app-container">
      {!hideNavbar && <Navbar />}
      <div className="main-content">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Login />} />
          
          {/* User Pages */}
          <Route path="/home" element={<Home />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/schedule-manager" element={<WorkScheduleManager />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/social" element={<Social />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/settings" element={<Settings />} />
          
          {/* Admin Pages - Protected */}
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
  );
}