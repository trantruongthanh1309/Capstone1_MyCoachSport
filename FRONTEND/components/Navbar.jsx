import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css"; // Import CSS cho Navbar

export default function Navbar() {
  const [showNotification, setShowNotification] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate(); // Hook để điều hướng sau khi đăng xuất

  // Toggle thông báo
  const toggleNotification = () => {
    setShowNotification(!showNotification);
  };

  // Toggle menu hồ sơ
  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  // Hàm đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("user"); // Xóa thông tin người dùng khỏi localStorage
    navigate("/"); // Điều hướng về trang login
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-container">
          <div className="logo">
            <Link to="/" className="logo-text">
              MySportCoachAI
            </Link>
          </div>

          <nav className="navbar-links">
            <Link to="/home" className="navbar-link">
              Trang chủ
            </Link>
            <Link to="/planner" className="navbar-link">
              Planner
            </Link>
            <Link to="/schedule-manager" className="navbar-link">
              Lịch làm việc
            </Link>
            <Link to="/logs" className="navbar-link">
              Nhật ký
            </Link>
            <Link to="/leaderboard" className="navbar-link">
              BXH
            </Link>
            <Link to="/social" className="navbar-link">
              Bảng tin
            </Link>
            <Link to="/videos" className="navbar-link">
              Video
            </Link>
          </nav>

          <div className="user-profile">
            {/* Thông báo */}
            <div className="notification" onClick={toggleNotification}>
              <span className="badge">2</span>
              {showNotification && (
                <div className="notification-dropdown">
                  <ul>
                    <li>Đến giờ tập luyện buổi sáng.</li>
                    <li>Đừng quên ăn đúng bữa trưa.</li>
                  </ul>
                  <button className="mark-all-read">
                    Đánh dấu tất cả đã đọc
                  </button>
                </div>
              )}
            </div>

            {/* Hồ sơ người dùng */}
            <img
              src="https://png.pngtree.com/png-vector/20191110/ourmid/pngtree-avatar-icon-profile-icon-member-login-vector-isolated-png-image_1978396.jpg"
              alt="Profile"
              className="profile-img"
              onClick={toggleProfileDropdown}
            />

            {/* Menu dropdown hồ sơ */}
            {showProfileDropdown && (
              <div className="profile-dropdown">
                <ul>
                  <li>
                    <Link to="/profile">Hồ sơ cá nhân</Link>
                  </li>
                  <li>
                    <button onClick={handleLogout}>Đăng xuất</button>
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
