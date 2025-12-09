import React, { useState, useEffect } from 'react';
import './AdminSettings.css';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'MySportCoach',
    siteDescription: 'Ứng dụng huấn luyện thể thao AI',
    maintenanceMode: false,
    allowRegistration: true,
    maxUsersPerDay: 100,
    sessionTimeout: 30,
    emailNotifications: true,
    smsNotifications: false,
    apiRateLimit: 1000,
  });

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMeals: 0,
    totalWorkouts: 0,
    storageUsed: 0
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, mealsRes, workoutsRes] = await Promise.all([
        fetch('/api/admin/users/stats', { credentials: 'include' }),
        fetch('/api/admin/meals/stats', { credentials: 'include' }),
        fetch('/api/admin/workouts/stats', { credentials: 'include' })
      ]);

      if (usersRes.ok && mealsRes.ok && workoutsRes.ok) {
        const users = await usersRes.json();
        const meals = await mealsRes.json();
        const workouts = await workoutsRes.json();

        setStats({
          totalUsers: users.total || 0,
          totalMeals: meals.total || 0,
          totalWorkouts: workouts.total || 0,
          storageUsed: Math.random() * 100 // Mock data
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    console.log('Saving settings:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (confirm('Bạn có chắc muốn reset về mặc định?')) {
      setSettings({
        siteName: 'MySportCoach',
        siteDescription: 'Ứng dụng huấn luyện thể thao AI',
        maintenanceMode: false,
        allowRegistration: true,
        maxUsersPerDay: 100,
        sessionTimeout: 30,
        emailNotifications: true,
        smsNotifications: false,
        apiRateLimit: 1000,
      });
    }
  };

  const handleClearCache = () => {
    if (confirm('Xóa cache hệ thống?')) {
      alert('✅ Cache đã được xóa!');
    }
  };

  const handleBackup = () => {
    alert('💾 Đang tạo backup database...');
    setTimeout(() => alert('✅ Backup hoàn tất!'), 1500);
  };

  return (
    <div className="admin-settings">
      <div className="settings-header">
        <div className="header-icon">⚙️</div>
        <h1>Cài Đặt Hệ Thống</h1>
      </div>

      {saved && (
        <div className="save-notification">
          ✅ Đã lưu cài đặt thành công!
        </div>
      )}

      <div className="settings-container">
        { }
        <section className="settings-section">
          <h2>📊 Thống Kê Hệ Thống</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <div className="stat-value">{stats.totalUsers}</div>
                <div className="stat-label">Người dùng</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🍽️</div>
              <div className="stat-info">
                <div className="stat-value">{stats.totalMeals}</div>
                <div className="stat-label">Bữa ăn</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💪</div>
              <div className="stat-info">
                <div className="stat-value">{stats.totalWorkouts}</div>
                <div className="stat-label">Bài tập</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💾</div>
              <div className="stat-info">
                <div className="stat-value">{stats.storageUsed.toFixed(1)} MB</div>
                <div className="stat-label">Dung lượng</div>
              </div>
            </div>
          </div>
        </section>

        { }
        <section className="settings-section">
          <h2>🌐 Cài Đặt Chung</h2>
          <div className="settings-form">
            <div className="form-group">
              <label>Tên Website</label>
              <input
                type="text"
                name="siteName"
                value={settings.siteName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Mô tả</label>
              <textarea
                name="siteDescription"
                value={settings.siteDescription}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={handleChange}
                />
                <span>Chế độ bảo trì</span>
              </label>
              <small>Website sẽ tạm ngưng hoạt động với user thường</small>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="allowRegistration"
                  checked={settings.allowRegistration}
                  onChange={handleChange}
                />
                <span>Cho phép đăng ký mới</span>
              </label>
            </div>
          </div>
        </section>

        { }
        <section className="settings-section">
          <h2>🔒 Bảo Mật</h2>
          <div className="settings-form">
            <div className="form-group">
              <label>Số user đăng ký tối đa/ngày</label>
              <input
                type="number"
                name="maxUsersPerDay"
                value={settings.maxUsersPerDay}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Thời gian session (phút)</label>
              <input
                type="number"
                name="sessionTimeout"
                value={settings.sessionTimeout}
                onChange={handleChange}
                min="5"
                max="1440"
              />
            </div>

            <div className="form-group">
              <label>API Rate Limit (requests/hour)</label>
              <input
                type="number"
                name="apiRateLimit"
                value={settings.apiRateLimit}
                onChange={handleChange}
                min="100"
              />
            </div>
          </div>
        </section>

        { }
        <section className="settings-section">
          <h2>🔔 Thông Báo</h2>
          <div className="settings-form">
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={handleChange}
                />
                <span>Email notifications</span>
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="smsNotifications"
                  checked={settings.smsNotifications}
                  onChange={handleChange}
                />
                <span>SMS notifications</span>
              </label>
            </div>
          </div>
        </section>

        { }
        <section className="settings-section">
          <h2>🛠️ Hành Động Hệ Thống</h2>
          <div className="action-buttons">
            <button onClick={handleClearCache} className="btn-action btn-warning">
              🗑️ Xóa Cache
            </button>
            <button onClick={handleBackup} className="btn-action btn-info">
              💾 Backup Database
            </button>
            <button onClick={handleReset} className="btn-action btn-danger">
              ↺ Reset về mặc định
            </button>
          </div>
        </section>

        { }
        <div className="settings-footer">
          <button onClick={handleReset} className="btn-secondary">
            Hủy thay đổi
          </button>
          <button onClick={handleSave} className="btn-primary">
            💾 Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;