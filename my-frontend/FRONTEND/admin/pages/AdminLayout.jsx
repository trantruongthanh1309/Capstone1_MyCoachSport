// AdminLayout.jsx
import React, { useState } from "react";
import AdminDashboard from "./AdminDashboard";
import AdminUsers from "./AdminUsers";
import AdminPosts from "./AdminPosts";
import AdminMeals from './AdminMeals';
import AdminWorkouts from './AdminWorkouts';
import AdminFeedback from './AdminFeedback';
import AdminSettings from './AdminSettings';

import "./AdminLayout.css";
import "./AdminOverride.css";

export default function AdminLayout() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    {
      id: "dashboard",
      icon: "📊",
      label: "Dashboard",
      component: AdminDashboard,
    },
    {
      id: "users",
      icon: "👥",
      label: "Quản Lý Users",
      component: AdminUsers
    },
    {
      id: "posts",
      icon: "📝",
      label: "Duyệt Bài Đăng",
      component: AdminPosts
    },
    {
      id: "meals",
      icon: "🍽️",
      label: "Quản Lý Meals",
      component: AdminMeals,
    },
    {
      id: "workouts",
      icon: "💪",
      label: "Quản Lý Workouts",
      component: AdminWorkouts,
    },
    {
      id: "feedback",
      icon: "📨",
      label: "Feedback",
      component: AdminFeedback,
    },
    {
      id: "settings",
      icon: "⚙️",
      label: "Cài Đặt",
      component: AdminSettings,
    },
  ];

  const CurrentComponent =
    menuItems.find((item) => item.id === currentPage)?.component ||
    AdminDashboard;

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      sessionStorage.clear();
      window.location.href = "/";
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            {sidebarOpen && (
              <span className="logo-text">MySportCoach Admin</span>
            )}
          </div>
          <button
            className="toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Thu gọn" : "Mở rộng"}
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`menu-item ${currentPage === item.id ? "active" : ""}`}
              onClick={() => setCurrentPage(item.id)}
              title={item.label}
            >
              <span className="menu-icon">{item.icon}</span>
              {sidebarOpen && <span className="menu-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="logout-btn"
            onClick={handleLogout}
            title="Đăng xuất"
          >
            <span className="menu-icon">🚪</span>
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`admin-main ${sidebarOpen ? "" : "expanded"}`}>
        <CurrentComponent />
      </main>
    </div>
  );
}