import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [userGrowth, setUserGrowth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const statsRes = await fetch('/api/admin/dashboard/stats', {
        credentials: 'include'
      });
      const statsData = await statsRes.json();
      
      if (statsData.success) {
        setStats(statsData.data);
      }
      
      const growthRes = await fetch(`/api/admin/dashboard/user-growth?days=${timeRange}`, {
        credentials: 'include'
      });
      const growthData = await growthRes.json();
      
      if (growthData.success) {
        setUserGrowth(growthData.data);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="admin-dashboard">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const userGrowthChartData = {
    labels: userGrowth.map(item => {
      const date = new Date(item.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }),
    datasets: [
      {
        label: 'Người dùng mới',
        data: userGrowth.map(item => item.count),
        borderColor: 'rgb(102, 126, 234)',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const sportChartData = {
    labels: stats.sport_distribution.map(item => item.sport),
    datasets: [
      {
        label: 'Số người dùng',
        data: stats.sport_distribution.map(item => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
        ],
        borderWidth: 0
      }
    ]
  };

  const goalChartData = {
    labels: stats.goal_distribution.map(item => item.goal),
    datasets: [
      {
        data: stats.goal_distribution.map(item => item.count),
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',
          'rgba(118, 75, 162, 0.8)',
          'rgba(237, 100, 166, 0.8)',
          'rgba(255, 154, 158, 0.8)',
        ],
        borderWidth: 0
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
            size: 12
          }
        }
      }
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>📊 Dashboard Quản Trị</h1>
        <p className="dashboard-subtitle">Tổng quan hệ thống MySportCoach</p>
      </div>

      {}
      <div className="stats-grid">
        <div className="stat-card gradient-blue">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Tổng Người Dùng</h3>
            <p className="stat-number">{stats.total_users.toLocaleString()}</p>
            <span className="stat-badge">+{stats.new_users_week} tuần này</span>
          </div>
        </div>

        <div className="stat-card gradient-green">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Hoạt Động Hôm Nay</h3>
            <p className="stat-number">{stats.active_users_today}</p>
            <span className="stat-badge">users online</span>
          </div>
        </div>

        <div className="stat-card gradient-purple">
          <div className="stat-icon">🍽️</div>
          <div className="stat-content">
            <h3>Tổng Món Ăn</h3>
            <p className="stat-number">{stats.total_meals}</p>
            <span className="stat-badge">⭐ {stats.avg_meal_rating}/5</span>
          </div>
        </div>

        <div className="stat-card gradient-orange">
          <div className="stat-icon">💪</div>
          <div className="stat-content">
            <h3>Tổng Bài Tập</h3>
            <p className="stat-number">{stats.total_workouts}</p>
            <span className="stat-badge">⭐ {stats.avg_workout_rating}/5</span>
          </div>
        </div>

        <div className="stat-card gradient-pink">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>Feedback</h3>
            <p className="stat-number">{stats.total_logs.toLocaleString()}</p>
            <span className="stat-badge">{stats.logs_today} hôm nay</span>
          </div>
        </div>

        <div className="stat-card gradient-teal">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <h3>Tỷ Lệ Hoạt Động</h3>
            <p className="stat-number">
              {stats.total_users > 0 
                ? Math.round((stats.active_users_today / stats.total_users) * 100)
                : 0}%
            </p>
            <span className="stat-badge">daily active</span>
          </div>
        </div>
      </div>

      {}
      <div className="charts-section">
        {}
        <div className="chart-card full-width">
          <div className="chart-header">
            <h2>📈 Tăng Trưởng Người Dùng</h2>
            <div className="time-range-selector">
              <button 
                className={timeRange === 7 ? 'active' : ''}
                onClick={() => setTimeRange(7)}
              >
                7 ngày
              </button>
              <button 
                className={timeRange === 30 ? 'active' : ''}
                onClick={() => setTimeRange(30)}
              >
                30 ngày
              </button>
              <button 
                className={timeRange === 90 ? 'active' : ''}
                onClick={() => setTimeRange(90)}
              >
                90 ngày
              </button>
            </div>
          </div>
          <div className="chart-container">
            <Line data={userGrowthChartData} options={chartOptions} />
          </div>
        </div>

        {}
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
              }} 
            />
          </div>
        </div>

        {}
        <div className="chart-card">
          <div className="chart-header">
            <h2>🎯 Mục Tiêu Người Dùng</h2>
          </div>
          <div className="chart-container">
            <Doughnut data={goalChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {}
      <div className="quick-actions">
        <h2>⚡ Thao Tác Nhanh</h2>
        <div className="action-buttons">
          <button className="action-btn btn-primary">
            <span className="btn-icon">👥</span>
            <span>Quản Lý Users</span>
          </button>
          <button className="action-btn btn-success">
            <span className="btn-icon">📝</span>
            <span>Duyệt Bài Đăng</span>
          </button>
          <button className="action-btn btn-info">
            <span className="btn-icon">🍽️</span>
            <span>Quản Lý Meals</span>
          </button>
          <button className="action-btn btn-warning">
            <span className="btn-icon">💪</span>
            <span>Quản Lý Workouts</span>
          </button>
        </div>
      </div>
    </div>
  );
}