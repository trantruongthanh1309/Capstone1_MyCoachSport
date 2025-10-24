import { Routes, Route, useLocation } from "react-router-dom";
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

export default function App() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/"; // Kiểm tra nếu đang ở trang Login thì ẩn Navbar

  return (
    <div className="app-container">
      {!hideNavbar && <Navbar />}
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Login />} /> {/* Trang đăng nhập */}
          <Route path="/home" element={<Home />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/schedule-manager" element={<WorkScheduleManager />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/social" element={<Social />} />
          <Route path="/videos" element={<Videos />} />
        </Routes>
      </div>
      
    </div>
  );
}
