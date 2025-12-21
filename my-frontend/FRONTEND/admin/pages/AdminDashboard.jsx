import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AdminDashboard({ setCurrentPage }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const statsRes = await fetch('/api/admin/dashboard/stats', {
        credentials: 'include'
      });
      const statsData = await statsRes.json();

      if (statsData.success) {
        setStats(statsData.data);
      } else {
        throw new Error(statsData.error || "Failed to fetch stats");
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-spinner">
          <div className="admin-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-container" style={{ textAlign: 'center', padding: '50px' }}>
          <h3>⚠️ Đã xảy ra lỗi</h3>
          <p style={{ color: 'red', margin: '20px 0' }}>{error}</p>
          <button className="action-btn btn-primary" onClick={fetchDashboardData}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const sportChartData = {
    labels: (stats.sport_distribution || []).length > 0 
      ? stats.sport_distribution.map(item => item.sport) 
      : ['Chưa có dữ liệu'],
    datasets: [
      {
        label: 'Số người dùng',
        data: (stats.sport_distribution || []).length > 0
          ? stats.sport_distribution.map(item => item.count)
          : [0],
        backgroundColor: [
          'rgba(244, 114, 182, 0.9)',
          'rgba(59, 130, 246, 0.9)',
          'rgba(16, 185, 129, 0.9)',
          'rgba(245, 158, 11, 0.9)',
          'rgba(167, 139, 250, 0.9)',
          'rgba(236, 72, 153, 0.9)',
        ],
        borderColor: [
          'rgba(244, 114, 182, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(167, 139, 250, 1)',
          'rgba(236, 72, 153, 1)',
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      }
    ]
  };

  const goalChartData = {
    labels: (stats.goal_distribution || []).length > 0
      ? stats.goal_distribution.map(item => item.goal)
      : ['Chưa có dữ liệu'],
    datasets: [
      {
        data: (stats.goal_distribution || []).length > 0
          ? stats.goal_distribution.map(item => item.count)
          : [0],
        backgroundColor: [
          'rgba(59, 130, 246, 0.9)',
          'rgba(167, 139, 250, 0.9)',
          'rgba(244, 114, 182, 0.9)',
          'rgba(255, 154, 158, 0.9)',
          'rgba(16, 185, 129, 0.9)',
          'rgba(59, 130, 246, 0.7)',
        ],
        borderColor: '#fff',
        borderWidth: 3,
        hoverOffset: 8
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 12,
            weight: '600'
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: '600'
        },
        bodyFont: {
          size: 13
        },
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11
          }
        },
        beginAtZero: true
      }
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>📊 Dashboard Quản Trị</h1>
        <p className="dashboard-subtitle">Tổng quan hệ thống MySportCoach</p>
      </div>

      { }
      <div className="stats-grid">
        <div className="stat-card gradient-blue">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>TỔNG NGƯỜI DÙNG</h3>
            <p className="stat-number">{(stats.total_users || 0).toLocaleString()}</p>
            <span className="stat-badge">+{stats.new_users_week || 0} tuần này</span>
          </div>
        </div>

        <div className="stat-card gradient-green">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>HOẠT ĐỘNG HÔM NAY</h3>
            <p className="stat-number">{(stats.active_users_today || 0).toLocaleString()}</p>
            <span className="stat-badge">users online</span>
          </div>
        </div>

        <div className="stat-card gradient-purple">
          <div className="stat-icon">🍽️</div>
          <div className="stat-content">
            <h3>TỔNG MÓN ĂN</h3>
            <p className="stat-number">{(stats.total_meals || 0).toLocaleString()}</p>
            <span className="stat-badge">⭐ {stats.avg_meal_rating || 0}/5</span>
          </div>
        </div>

        <div className="stat-card gradient-orange">
          <div className="stat-icon">💪</div>
          <div className="stat-content">
            <h3>TỔNG BÀI TẬP</h3>
            <p className="stat-number">{(stats.total_workouts || 0).toLocaleString()}</p>
            <span className="stat-badge">⭐ {stats.avg_workout_rating || 0}/5</span>
          </div>
        </div>

        <div className="stat-card gradient-pink">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>FEEDBACK</h3>
            <p className="stat-number">{(stats.total_feedback || 0).toLocaleString()}</p>
            <span className="stat-badge">{stats.feedback_today || 0} hôm nay</span>
          </div>
        </div>

        <div className="stat-card gradient-teal">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <h3>TỶ LỆ HOẠT ĐỘNG</h3>
            <p className="stat-number">
              {stats.total_users > 0
                ? Math.round((stats.active_users_today / stats.total_users) * 100)
                : 0}%
            </p>
            <span className="stat-badge">daily active</span>
          </div>
        </div>
      </div>

      { }
      <div className="bottom-section">
        <div className="charts-section">
          <div className="chart-card">
            <div className="chart-header">
              <h2>🏃 Phân Bố Môn Thể Thao</h2>
            </div>
            <div className="chart-container">
              <Bar
                data={sportChartData}
                options={{
                  ...chartOptions,
                  indexAxis: 'y',
                  scales: {
                    ...chartOptions.scales,
                    x: {
                      ...chartOptions.scales.x,
                      ticks: {
                        stepSize: 0.5,
                        font: {
                          size: 11
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h2>🎯 Mục Tiêu Người Dùng</h2>
            </div>
            <div className="chart-container">
              <Doughnut data={goalChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h2>⚡ Thao Tác Nhanh</h2>
          <div className="action-buttons">
            <button 
              className="action-btn btn-primary"
              onClick={() => setCurrentPage && setCurrentPage('users')}
            >
              <span className="btn-icon">👥</span>
              <span>Quản Lý Users</span>
            </button>
            <button 
              className="action-btn btn-success"
              onClick={() => setCurrentPage && setCurrentPage('posts')}
            >
              <span className="btn-icon">📝</span>
              <span>Duyệt Bài Đăng</span>
            </button>
            <button 
              className="action-btn btn-info"
              onClick={() => setCurrentPage && setCurrentPage('meals')}
            >
              <span className="btn-icon">🍽️</span>
              <span>Quản Lý Meals</span>
            </button>
            <button 
              className="action-btn btn-warning"
              onClick={() => setCurrentPage && setCurrentPage('workouts')}
            >
              <span className="btn-icon">💪</span>
              <span>Quản Lý Workouts</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}