import React, { useState, useEffect } from 'react';
import './AdminSettings.css';
import Toast from '../../components/Toast';

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

  // State for Toast notifications
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  useEffect(() => {
    fetchStats();
    loadSettings();
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
  };

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setSettings(prev => ({
            ...prev,
            ...data.data
          }));
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showToast('Không thể tải cài đặt', 'error');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/stats', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setStats({
            totalUsers: data.data.total_users || 0,
            totalMeals: data.data.total_meals || 0,
            totalWorkouts: data.data.total_workouts || 0,
            storageUsed: 0 // Will be calculated if needed
          });
        }
      } else {
        // If API fails, show default stats
        setStats(prev => ({ ...prev, totalUsers: 0, totalMeals: 0, totalWorkouts: 0 }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats on error
      setStats(prev => ({ ...prev, totalUsers: 0, totalMeals: 0, totalWorkouts: 0 }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Không thể lưu settings');
      }

      const data = await response.json();
      if (data.success) {
        showToast('✅ Đã lưu cài đặt thành công!', 'success');
      } else {
        showToast('Lỗi: ' + (data.error || 'Không thể lưu settings'), 'error');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Không thể lưu settings. Vui lòng thử lại.', 'error');
    }
  };

  const handleReset = async () => {
    if (confirm('Bạn có chắc muốn reset về mặc định?')) {
      const defaultSettings = {
        siteName: 'MySportCoach',
        siteDescription: 'Ứng dụng huấn luyện thể thao AI',
        maintenanceMode: false,
        allowRegistration: true,
        maxUsersPerDay: 100,
        sessionTimeout: 30,
        emailNotifications: true,
        smsNotifications: false,
        apiRateLimit: 1000,
      };

      try {
        const response = await fetch('/api/admin/settings', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(defaultSettings),
        });

        if (response.ok) {
          setSettings(defaultSettings);
          showToast('✅ Đã reset về mặc định!', 'success');
        }
      } catch (error) {
        console.error('Error resetting settings:', error);
        showToast('Không thể reset settings', 'error');
      }
    }
  };

  const handleClearCache = async () => {
    if (confirm('Xóa cache hệ thống?')) {
      try {
        const response = await fetch('/api/admin/settings/clear-cache', {
          method: 'POST',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const message = data.cleared_sessions 
              ? `✅ Cache đã được xóa! (Đã xóa ${data.cleared_sessions} session files cũ)`
              : '✅ Cache đã được xóa!';
            showToast(message, 'success');
          } else {
            showToast('❌ Lỗi: ' + (data.error || 'Không thể xóa cache'), 'error');
          }
        } else {
          const data = await response.json().catch(() => ({}));
          showToast('❌ Lỗi: ' + (data.error || 'Không thể xóa cache'), 'error');
        }
      } catch (error) {
        console.error('Error clearing cache:', error);
        showToast('Không thể xóa cache', 'error');
      }
    }
  };

  const handleBackup = async () => {
    if (confirm('Bắt đầu backup database?')) {
      try {
        showToast('💾 Đang tạo backup database...', 'info');
        const response = await fetch('/api/admin/settings/backup', {
          method: 'POST',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            showToast(data.message || '✅ Backup đã được khởi động!', 'success');
            if (data.note) {
              setTimeout(() => {
                showToast(data.note, 'info');
              }, 3000);
            }
          } else {
            showToast('❌ Lỗi: ' + (data.error || 'Không thể tạo backup'), 'error');
          }
        } else {
          const data = await response.json().catch(() => ({}));
          showToast('❌ Lỗi: ' + (data.error || 'Không thể tạo backup'), 'error');
        }
      } catch (error) {
        console.error('Error backing up:', error);
        showToast('Không thể tạo backup', 'error');
      }
    }
  };

  const handleCancel = () => {
    if (confirm('Bạn có chắc muốn hủy các thay đổi chưa lưu?')) {
      loadSettings();
      showToast('Đã hủy thay đổi', 'info');
    }
  };

  return (
    <div className="admin-settings">
      <div className="settings-header">
        <div className="header-icon">⚙️</div>
        <h1>Cài Đặt Hệ Thống</h1>
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <div className="settings-container">
        <div className="settings-layout">
          { }
          <div className="settings-left">
            <section className="settings-section">
              <h2>📊 Thống Kê Hệ Thống</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-info">
                    <div className="stat-value">{stats.totalUsers}</div>
                    <div className="stat-label">NGƯỜI DÙNG</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🍽️</div>
                  <div className="stat-info">
                    <div className="stat-value">{stats.totalMeals}</div>
                    <div className="stat-label">BỮA ĂN</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💪</div>
                  <div className="stat-info">
                    <div className="stat-value">{stats.totalWorkouts}</div>
                    <div className="stat-label">BÀI TẬP</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💾</div>
                  <div className="stat-info">
                    <div className="stat-value">{stats.storageUsed > 0 ? stats.storageUsed.toFixed(1) : '0.0'} MB</div>
                    <div className="stat-label">DUNG LƯỢNG</div>
                  </div>
                </div>
              </div>
            </section>

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
          </div>

          { }
          <div className="settings-right">
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
                    placeholder="Nhập tên website"
                  />
                </div>

                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea
                    name="siteDescription"
                    value={settings.siteDescription}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Nhập mô tả website"
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
                    <span>Chế độ bảo trì website và tạm ngưng hoạt động với user thường</span>
                  </label>
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
          </div>
        </div>

        { }
        <div className="settings-footer">
          <button onClick={handleCancel} className="btn-secondary">
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