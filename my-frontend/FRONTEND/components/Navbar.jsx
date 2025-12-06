import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import "./Navbar.css";

export default function Navbar() {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userData, setUserData] = useState({
    name: "Người dùng",
    email: "user@example.com",
    avatar: "https://png.pngtree.com/png-vector/20191110/ourmid/pngtree-avatar-icon-profile-icon-member-login-vector-isolated-png-image_1978396.jpg"
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/auth/me', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUserData({
            name: data.name || "Người dùng",
            email: data.email || "user@example.com",
            avatar: data.avatar || "https://png.pngtree.com/png-vector/20191110/ourmid/pngtree-avatar-icon-profile-icon-member-login-vector-isolated-png-image_1978396.jpg"
          });
        }
      })
      .catch(err => console.error("Lỗi fetch user:", err));
  }, []);

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("user_id");
    localStorage.removeItem("isLoggedIn");
    navigate("/");
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-container">
          <div className="logo">
            <Link to="/" className="logo-text">
              <span className="logo-icon">⚡</span>
              MySportCoach<span className="logo-ai">AI</span>
            </Link>
          </div>

          <nav className="navbar-links">
            <Link to="/home" className="navbar-link">
              <span className="link-icon"></span>
              <span>Trang chủ</span>
            </Link>
            <Link to="/planner" className="navbar-link">
              <span className="link-icon"></span>
              <span>Planner</span>
            </Link>
            <Link to="/schedule-manager" className="navbar-link">
              <span className="link-icon"></span>
              <span>Lịch làm việc</span>
            </Link>
            <Link to="/logs" className="navbar-link">
              <span className="link-icon"></span>
              <span>Nhật ký</span>
            </Link>
            <Link to="/leaderboard" className="navbar-link">
              <span className="link-icon"></span>
              <span>BXH</span>
            </Link>
            <Link to="/newsfeed" className="navbar-link">
              <span className="link-icon"></span>
              <span>Bảng tin</span>
            </Link>
            <Link to="/videos" className="navbar-link">
              <span className="link-icon"></span>
              <span>Video</span>
            </Link>
          </nav>

          <div className="user-profile">
            {}
            <NotificationBell />

            {}
            <div className="profile-wrapper" onClick={toggleProfileDropdown}>
              <img
                src={userData.avatar}
                alt="Profile"
                className="profile-img"
              />
              <div className="status-indicator"></div>
            </div>

            {}
            {showProfileDropdown && (
              <div className="profile-dropdown">
                <div className="profile-header">
                  <img
                    src={userData.avatar}
                    alt="Profile"
                    className="profile-dropdown-img"
                  />
                  <div className="profile-info">
                    <h4>{userData.name}</h4>
                    <p>{userData.email}</p>
                  </div>
                </div>
                <ul className="profile-menu">
                  <li>
                    <Link to="/profile">
                      <span className="menu-icon">👤</span>
                      Hồ sơ cá nhân
                    </Link>
                  </li>
                  <li>
                    <Link to="/settings">
                      <span className="menu-icon">⚙️</span>
                      Cài đặt
                    </Link>
                  </li>
                  <li className="divider"></li>
                  <li>
                    <button onClick={handleLogout} className="logout-btn">
                      <span className="menu-icon">🚪</span>
                      Đăng xuất
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}