import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const [showNotification, setShowNotification] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();

  const toggleNotification = () => {
    setShowNotification(!showNotification);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
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
            {/* Thông báo */}
            <div className="notification" onClick={toggleNotification}>
              <div className="notification-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="currentColor" />
                </svg>
                <span className="badge">2</span>
              </div>
              {showNotification && (
                <div className="notification-dropdown">
                  <div className="dropdown-header">
                    <h4>Thông báo</h4>
                    <button className="close-btn" onClick={(e) => { e.stopPropagation(); setShowNotification(false); }}>✕</button>
                  </div>
                  <ul className="notification-list">
                    <li className="notification-item">
                      <span className="notif-icon">🏋️</span>
                      <div className="notif-content">
                        <p className="notif-title">Đến giờ tập luyện</p>
                        <p className="notif-time">5 phút trước</p>
                      </div>
                    </li>
                    <li className="notification-item">
                      <span className="notif-icon">🍽️</span>
                      <div className="notif-content">
                        <p className="notif-title">Đừng quên ăn đúng bữa trưa</p>
                        <p className="notif-time">30 phút trước</p>
                      </div>
                    </li>
                  </ul>
                  <button className="mark-all-read">
                    Đánh dấu tất cả đã đọc
                  </button>
                </div>
              )}
            </div>

            {/* Hồ sơ người dùng */}
            <div className="profile-wrapper" onClick={toggleProfileDropdown}>
              <img
                src="https://png.pngtree.com/png-vector/20191110/ourmid/pngtree-avatar-icon-profile-icon-member-login-vector-isolated-png-image_1978396.jpg"
                alt="Profile"
                className="profile-img"
              />
              <div className="status-indicator"></div>
            </div>

            {/* Menu dropdown hồ sơ */}
            {showProfileDropdown && (
              <div className="profile-dropdown">
                <div className="profile-header">
                  <img
                    src="https://png.pngtree.com/png-vector/20191110/ourmid/pngtree-avatar-icon-profile-icon-member-login-vector-isolated-png-image_1978396.jpg"
                    alt="Profile"
                    className="profile-dropdown-img"
                  />
                  <div className="profile-info">
                    <h4>Người dùng</h4>
                    <p>user@example.com</p>
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