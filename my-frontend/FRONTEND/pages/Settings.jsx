import { useState, useEffect } from "react";
import "./Settings.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Settings() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatar: "",
    bio: "",
  });

  const [preferences, setPreferences] = useState({
    theme: "light",
    language: "vi",
    notifications: true,
    emailNotifications: true,
    pushNotifications: false,
  });

  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showEmail: false,
    showProgress: true,
    allowMessages: true,
  });

  const [workoutSettings, setWorkoutSettings] = useState({
    defaultDuration: 60,
    reminderTime: "07:00",
    autoLog: true,
    restDayReminder: true,
  });

  const [nutritionSettings, setNutritionSettings] = useState({
    calorieGoal: 2000,
    proteinGoal: 150,
    carbGoal: 200,
    fatGoal: 60,
    waterGoal: 8,
  });

  const [activeTab, setActiveTab] = useState("profile");
  const [showSaveAlert, setShowSaveAlert] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Feedback state
  const [feedbackForm, setFeedbackForm] = useState({
    type: 'other',
    title: '',
    message: '',
    priority: 'low'
  });
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState('all');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/settings`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Không thể tải settings');
      }

      // Update state với data từ server
      if (data.profile) {
        setProfile(prev => ({ ...prev, ...data.profile }));
      }
      if (data.preferences) {
        setPreferences(prev => ({ ...prev, ...data.preferences }));
      }
      if (data.privacy) {
        setPrivacy(prev => ({ ...prev, ...data.privacy }));
      }
      if (data.workoutSettings) {
        setWorkoutSettings(prev => ({ ...prev, ...data.workoutSettings }));
      }
      if (data.nutritionSettings) {
        setNutritionSettings(prev => ({ ...prev, ...data.nutritionSettings }));
      }

      if (data.profile?.avatar) {
        setAvatarPreview(data.profile.avatar);
      }

      setError(null);
      console.log('✅ Settings loaded successfully');
    } catch (err) {
      console.error('❌ Error loading settings:', err);
      setError(err.message || 'Không thể tải cài đặt. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setProfile({ ...profile, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAll = async () => {
    try {
      setShowSaveAlert(false);
      
      const response = await fetch(`/api/settings`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile,
          preferences,
          privacy,
          workoutSettings,
          nutritionSettings,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Không thể lưu settings');
      }

      setShowSaveAlert(true);
      setTimeout(() => setShowSaveAlert(false), 3000);

      console.log('✅ Settings saved:', data);
    } catch (err) {
      console.error('Error saving settings:', err);
      alert(`Không thể lưu cài đặt: ${err.message || err}`);
      setError(`Lỗi: ${err.message || err}`);
    }
  };

  const handleResetSettings = async () => {
    if (confirm("Bạn có chắc muốn đặt lại tất cả cài đặt về mặc định?")) {
      try {
        const response = await fetch(`/api/settings/reset`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Không thể reset settings');
        }

        await loadSettings();

        alert('Đã đặt lại cài đặt về mặc định!');
      } catch (err) {
        console.error('Error resetting settings:', err);
        alert('Không thể đặt lại cài đặt. Vui lòng thử lại.');
      }
    }
  };

  const handleExportData = async () => {
    try {
      const response = await fetch(`/api/settings/export`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Không thể xuất dữ liệu');
      }
      
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mysportcoach-settings-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('✅ Data exported successfully');
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Không thể xuất dữ liệu. Vui lòng thử lại.');
    }
  };

  const fetchMyFeedbacks = async (status = null) => {
    const filterStatus = status || feedbackStatusFilter;
    try {
      setFeedbackLoading(true);
      const params = new URLSearchParams();
      if (filterStatus && filterStatus !== 'all') {
        params.append('status', filterStatus);
      }
      
      const res = await fetch(`/api/feedback?${params}`, {
        credentials: 'include'
      });
      const data = await res.json();
      
      if (data.success) {
        setMyFeedbacks(data.data);
      } else {
        console.error('Error fetching feedbacks:', data.error);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackForm.title || !feedbackForm.message) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setFeedbackLoading(true);
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(feedbackForm)
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert('✅ Gửi feedback thành công! Cảm ơn bạn đã đóng góp.');
        setFeedbackForm({
          type: 'other',
          title: '',
          message: '',
          priority: 'low'
        });
        fetchMyFeedbacks();
      } else {
        alert('❌ Lỗi: ' + data.error);
      }
    } catch (error) {
      alert('❌ Lỗi: ' + error.message);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("⚠️ CẢNH BÁO: Bạn có chắc chắn muốn xóa tài khoản?\n\nTất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn và không thể khôi phục.\n\nNhập 'XÓA' để xác nhận:")) {
      return;
    }

    const confirmation = prompt("Nhập 'XÓA' để xác nhận xóa tài khoản:");
    if (confirmation !== "XÓA") {
      alert("Xác nhận không đúng. Đã hủy xóa tài khoản.");
      return;
    }

    try {
      const response = await fetch(`/api/settings/delete-account`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Không thể xóa tài khoản');
      }

      const data = await response.json();
      alert('Tài khoản đã được xóa thành công. Bạn sẽ được chuyển đến trang đăng nhập.');
      window.location.href = '/login';
    } catch (err) {
      console.error('Error deleting account:', err);
      alert(`Không thể xóa tài khoản: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="loading-container" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          gap: '1rem'
        }}>
          <div className="spinner" style={{
            width: '50px',
            height: '50px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #6366f1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p>Đang tải cài đặt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      { }
      <div className="settings-header">
        <div className="header-content">
          <h1 className="page-title">
            <span className="title-icon">⚙️</span>
            Cài Đặt
          </h1>
          <p className="page-subtitle">Tùy chỉnh trải nghiệm của bạn</p>
        </div>
        <button className="btn-save-all" onClick={handleSaveAll}>
          <span className="btn-icon">💾</span>
          Lưu Tất Cả
        </button>
      </div>

      { }
      {showSaveAlert && (
        <div className="save-alert">
          <span className="alert-icon">✅</span>
          Đã lưu thành công!
        </div>
      )}

      { }
      {error && (
        <div className="error-alert" style={{
          background: '#fee',
          color: '#c33',
          padding: '1rem',
          borderRadius: '8px',
          margin: '1rem 0'
        }}>
          <span>⚠️</span> {error}
        </div>
      )}

      <div className="settings-container">
        { }
        <div className="settings-sidebar">
          <button
            className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <span className="tab-icon">👤</span>
            Hồ Sơ
          </button>
          <button
            className={`tab-btn ${activeTab === "preferences" ? "active" : ""}`}
            onClick={() => setActiveTab("preferences")}
          >
            <span className="tab-icon">🎨</span>
            Giao Diện
          </button>
          <button
            className={`tab-btn ${activeTab === "privacy" ? "active" : ""}`}
            onClick={() => setActiveTab("privacy")}
          >
            <span className="tab-icon">🔒</span>
            Riêng Tư
          </button>
          <button
            className={`tab-btn ${activeTab === "workout" ? "active" : ""}`}
            onClick={() => setActiveTab("workout")}
          >
            <span className="tab-icon">💪</span>
            Tập Luyện
          </button>
          <button
            className={`tab-btn ${activeTab === "nutrition" ? "active" : ""}`}
            onClick={() => setActiveTab("nutrition")}
          >
            <span className="tab-icon">🥗</span>
            Dinh Dưỡng
          </button>
          <button
            className={`tab-btn ${activeTab === "data" ? "active" : ""}`}
            onClick={() => setActiveTab("data")}
          >
            <span className="tab-icon">📊</span>
            Dữ Liệu
          </button>
          <button
            className={`tab-btn ${activeTab === "feedback" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("feedback");
              fetchMyFeedbacks();
            }}
          >
            <span className="tab-icon">💬</span>
            Feedback
          </button>
        </div>

        { }
        <div className="settings-content">
          { }
          {activeTab === "profile" && (
            <div className="settings-section">
              <h2 className="section-title">Thông Tin Cá Nhân</h2>

              <div className="avatar-section">
                <div className="avatar-preview">
                  {avatarPreview || profile.avatar ? (
                    <img src={avatarPreview || profile.avatar} alt="Avatar" className="avatar-img" />
                  ) : (
                    <div className="avatar-placeholder">
                      {profile.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <div className="avatar-actions">
                  <label className="btn-upload">
                    <input type="file" accept="image/*" onChange={handleAvatarChange} />
                    Thay đổi
                  </label>
                  {profile.avatar && (
                    <button
                      className="btn-delete"
                      onClick={() => setProfile({ ...profile, avatar: "" })}
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Họ và Tên</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Nhập tên của bạn"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={profile.email || ""}
                  disabled
                  className="form-input disabled"
                  readOnly
                />
                <small style={{ color: '#666', fontSize: '0.875rem' }}>Email không thể thay đổi</small>
              </div>

              <div className="form-group">
                <label className="form-label">Giới thiệu bản thân</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Viết đôi dòng về bạn..."
                  className="form-textarea"
                />
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="settings-section">
              <h2 className="section-title">Tùy Chỉnh Giao Diện</h2>

              <div className="form-group">
                <label className="form-label">Chủ đề</label>
                <div className="theme-selector">
                  <button
                    className={`theme-option ${preferences.theme === "light" ? "active" : ""}`}
                    onClick={() => setPreferences({ ...preferences, theme: "light" })}
                  >
                    ☀️ Sáng
                  </button>
                  <button
                    className={`theme-option ${preferences.theme === "dark" ? "active" : ""}`}
                    onClick={() => setPreferences({ ...preferences, theme: "dark" })}
                  >
                    🌙 Tối
                  </button>
                  <button
                    className={`theme-option ${preferences.theme === "auto" ? "active" : ""}`}
                    onClick={() => setPreferences({ ...preferences, theme: "auto" })}
                  >
                    🔄 Tự động
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Ngôn ngữ</label>
                <select
                  value={preferences.language}
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                  className="form-select"
                >
                  <option value="vi">🇻🇳 Tiếng Việt</option>
                  <option value="en">🇬🇧 English</option>
                  <option value="ja">🇯🇵 日本語</option>
                  <option value="ko">🇰🇷 한국어</option>
                </select>
              </div>

              <div className="toggle-group">
                <div className="toggle-item">
                  <div className="toggle-info">
                    <div className="toggle-label">🔔 Thông báo trong app</div>
                    <div className="toggle-desc">Nhận thông báo khi có hoạt động mới</div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.notifications}
                      onChange={(e) => setPreferences({ ...preferences, notifications: e.target.checked })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <div className="toggle-label">📧 Thông báo email</div>
                    <div className="toggle-desc">Nhận email về các cập nhật quan trọng</div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications}
                      onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <div className="toggle-label">📱 Thông báo đẩy</div>
                    <div className="toggle-desc">Nhận thông báo trên thiết bị di động</div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.pushNotifications}
                      onChange={(e) => setPreferences({ ...preferences, pushNotifications: e.target.checked })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          { }
          {activeTab === "privacy" && (
            <div className="settings-section">
              <h2 className="section-title">Quyền Riêng Tư & Bảo Mật</h2>

              <div className="toggle-group">
                <div className="toggle-item">
                  <div className="toggle-info">
                    <div className="toggle-label">🌐 Hồ sơ công khai</div>
                    <div className="toggle-desc">Cho phép người khác xem hồ sơ của bạn</div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={privacy.profilePublic}
                      onChange={(e) => setPrivacy({ ...privacy, profilePublic: e.target.checked })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <div className="toggle-label">📧 Hiển thị email</div>
                    <div className="toggle-desc">Email của bạn sẽ hiển thị trên hồ sơ</div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={privacy.showEmail}
                      onChange={(e) => setPrivacy({ ...privacy, showEmail: e.target.checked })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <div className="toggle-label">📊 Hiển thị tiến độ</div>
                    <div className="toggle-desc">Cho phép người khác xem tiến độ tập luyện</div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={privacy.showProgress}
                      onChange={(e) => setPrivacy({ ...privacy, showProgress: e.target.checked })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <div className="toggle-label">💬 Cho phép nhắn tin</div>
                    <div className="toggle-desc">Người dùng khác có thể gửi tin nhắn cho bạn</div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={privacy.allowMessages}
                      onChange={(e) => setPrivacy({ ...privacy, allowMessages: e.target.checked })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          { }
          {activeTab === "workout" && (
            <div className="settings-section">
              <h2 className="section-title">Cài Đặt Tập Luyện</h2>

              <div className="form-group">
                <label className="form-label">⏱️ Thời gian tập mặc định (phút)</label>
                <input
                  type="number"
                  value={workoutSettings.defaultDuration}
                  onChange={(e) =>
                    setWorkoutSettings({ ...workoutSettings, defaultDuration: parseInt(e.target.value) })
                  }
                  className="form-input"
                  min="15"
                  max="180"
                />
              </div>

              <div className="form-group">
                <label className="form-label">⏰ Thời gian nhắc tập</label>
                <input
                  type="time"
                  value={workoutSettings.reminderTime}
                  onChange={(e) => setWorkoutSettings({ ...workoutSettings, reminderTime: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="toggle-group">
                <div className="toggle-item">
                  <div className="toggle-info">
                    <div className="toggle-label">📝 Tự động ghi log</div>
                    <div className="toggle-desc">Tự động lưu buổi tập khi hoàn thành</div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={workoutSettings.autoLog}
                      onChange={(e) => setWorkoutSettings({ ...workoutSettings, autoLog: e.target.checked })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <div className="toggle-label">🛌 Nhắc ngày nghỉ</div>
                    <div className="toggle-desc">Nhắc nhở khi đã tập liên tục nhiều ngày</div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={workoutSettings.restDayReminder}
                      onChange={(e) =>
                        setWorkoutSettings({ ...workoutSettings, restDayReminder: e.target.checked })
                      }
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          { }
          {activeTab === "nutrition" && (
            <div className="settings-section">
              <h2 className="section-title">Mục Tiêu Dinh Dưỡng</h2>

              <div className="nutrition-grid">
                <div className="nutrition-card">
                  <div className="nutrition-icon">🔥</div>
                  <div className="nutrition-info">
                    <label className="nutrition-label">Calories</label>
                    <div className="nutrition-input-group">
                      <input
                        type="number"
                        value={nutritionSettings.calorieGoal}
                        onChange={(e) =>
                          setNutritionSettings({ ...nutritionSettings, calorieGoal: parseInt(e.target.value) })
                        }
                        className="nutrition-input"
                      />
                      <span className="nutrition-unit">kcal/ngày</span>
                    </div>
                  </div>
                </div>

                <div className="nutrition-card">
                  <div className="nutrition-icon">🥩</div>
                  <div className="nutrition-info">
                    <label className="nutrition-label">Protein</label>
                    <div className="nutrition-input-group">
                      <input
                        type="number"
                        value={nutritionSettings.proteinGoal}
                        onChange={(e) =>
                          setNutritionSettings({ ...nutritionSettings, proteinGoal: parseInt(e.target.value) })
                        }
                        className="nutrition-input"
                      />
                      <span className="nutrition-unit">g/ngày</span>
                    </div>
                  </div>
                </div>

                <div className="nutrition-card">
                  <div className="nutrition-icon">🍞</div>
                  <div className="nutrition-info">
                    <label className="nutrition-label">Carbs</label>
                    <div className="nutrition-input-group">
                      <input
                        type="number"
                        value={nutritionSettings.carbGoal}
                        onChange={(e) =>
                          setNutritionSettings({ ...nutritionSettings, carbGoal: parseInt(e.target.value) })
                        }
                        className="nutrition-input"
                      />
                      <span className="nutrition-unit">g/ngày</span>
                    </div>
                  </div>
                </div>

                <div className="nutrition-card">
                  <div className="nutrition-icon">🥑</div>
                  <div className="nutrition-info">
                    <label className="nutrition-label">Fat</label>
                    <div className="nutrition-input-group">
                      <input
                        type="number"
                        value={nutritionSettings.fatGoal}
                        onChange={(e) =>
                          setNutritionSettings({ ...nutritionSettings, fatGoal: parseInt(e.target.value) })
                        }
                        className="nutrition-input"
                      />
                      <span className="nutrition-unit">g/ngày</span>
                    </div>
                  </div>
                </div>

                <div className="nutrition-card">
                  <div className="nutrition-icon">💧</div>
                  <div className="nutrition-info">
                    <label className="nutrition-label">Nước</label>
                    <div className="nutrition-input-group">
                      <input
                        type="number"
                        value={nutritionSettings.waterGoal}
                        onChange={(e) =>
                          setNutritionSettings({ ...nutritionSettings, waterGoal: parseInt(e.target.value) })
                        }
                        className="nutrition-input"
                      />
                      <span className="nutrition-unit">ly/ngày</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          { }
          {activeTab === "feedback" && (
            <div className="settings-section">
              <h2 className="section-title">💬 Gửi Feedback</h2>
              <p style={{ color: '#666', marginBottom: '20px' }}>
                Chia sẻ ý kiến, báo lỗi hoặc đề xuất tính năng mới cho chúng tôi
              </p>

              <div className="form-group">
                <label className="form-label">Loại feedback</label>
                <select
                  value={feedbackForm.type}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, type: e.target.value })}
                  className="form-input"
                >
                  <option value="bug">🐛 Báo lỗi</option>
                  <option value="feature">✨ Đề xuất tính năng</option>
                  <option value="improvement">🔧 Cải thiện</option>
                  <option value="question">❓ Câu hỏi</option>
                  <option value="other">💭 Khác</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tiêu đề <span style={{color: 'red'}}>*</span></label>
                <input
                  type="text"
                  value={feedbackForm.title}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, title: e.target.value })}
                  placeholder="Ví dụ: Ứng dụng bị lỗi khi đăng nhập"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nội dung <span style={{color: 'red'}}>*</span></label>
                <textarea
                  value={feedbackForm.message}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                  placeholder="Mô tả chi tiết feedback của bạn..."
                  className="form-textarea"
                  rows="5"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mức độ ưu tiên</label>
                <select
                  value={feedbackForm.priority}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, priority: e.target.value })}
                  className="form-input"
                >
                  <option value="low">🟢 Thấp</option>
                  <option value="medium">🟡 Trung bình</option>
                  <option value="high">🔴 Cao</option>
                </select>
              </div>

              <button
                className="btn-save"
                onClick={handleSubmitFeedback}
                disabled={feedbackLoading || !feedbackForm.title || !feedbackForm.message}
                style={{ marginTop: '10px' }}
              >
                {feedbackLoading ? '⏳ Đang gửi...' : '📤 Gửi Feedback'}
              </button>

              <div style={{ marginTop: '40px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '15px' }}>
                  📋 Lịch sử Feedback của tôi
                </h3>

                <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                  <button
                    className={`tab-btn ${feedbackStatusFilter === 'all' ? 'active' : ''}`}
                    onClick={() => {
                      setFeedbackStatusFilter('all');
                      fetchMyFeedbacks('all');
                    }}
                    style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                  >
                    Tất cả
                  </button>
                  <button
                    className={`tab-btn ${feedbackStatusFilter === 'pending' ? 'active' : ''}`}
                    onClick={() => {
                      setFeedbackStatusFilter('pending');
                      fetchMyFeedbacks('pending');
                    }}
                    style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                  >
                    Chờ xử lý
                  </button>
                  <button
                    className={`tab-btn ${feedbackStatusFilter === 'resolved' ? 'active' : ''}`}
                    onClick={() => {
                      setFeedbackStatusFilter('resolved');
                      fetchMyFeedbacks('resolved');
                    }}
                    style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                  >
                    Đã xử lý
                  </button>
                </div>

                {feedbackLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    ⏳ Đang tải...
                  </div>
                ) : myFeedbacks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#999', fontStyle: 'italic' }}>
                    Chưa có feedback nào
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {myFeedbacks.map((fb) => (
                      <div
                        key={fb.id}
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '20px',
                          background: '#fff'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                          <div>
                            <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{fb.title}</h4>
                            <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', color: '#666' }}>
                              <span>📌 {fb.type === 'bug' ? 'Báo lỗi' : fb.type === 'feature' ? 'Đề xuất' : fb.type === 'improvement' ? 'Cải thiện' : fb.type === 'question' ? 'Câu hỏi' : 'Khác'}</span>
                              <span>•</span>
                              <span>{new Date(fb.created_at).toLocaleDateString('vi-VN')}</span>
                            </div>
                          </div>
                          <span
                            style={{
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              background: fb.status === 'resolved' ? '#d1fae5' : '#fef3c7',
                              color: fb.status === 'resolved' ? '#065f46' : '#92400e'
                            }}
                          >
                            {fb.status === 'resolved' ? '✅ Đã xử lý' : '⏳ Chờ xử lý'}
                          </span>
                        </div>
                        <p style={{ margin: '10px 0', color: '#475569', lineHeight: '1.6' }}>{fb.message}</p>
                        {fb.response && (
                          <div style={{
                            marginTop: '15px',
                            padding: '15px',
                            background: '#f0f9ff',
                            borderRadius: '8px',
                            borderLeft: '3px solid #3b82f6'
                          }}>
                            <div style={{ fontWeight: '600', marginBottom: '5px', color: '#1e40af' }}>
                              💬 Phản hồi từ admin:
                            </div>
                            <div style={{ color: '#1e3a8a' }}>{fb.response}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          { }
          {activeTab === "data" && (
            <div className="settings-section">
              <h2 className="section-title">Quản Lý Dữ Liệu</h2>

              <div className="data-actions">
                <div className="data-card">
                  <div className="data-icon">📥</div>
                  <div className="data-info">
                    <h3 className="data-title">Xuất Dữ Liệu</h3>
                    <p className="data-desc">Tải xuống tất cả dữ liệu của bạn dưới dạng file JSON</p>
                    <button className="btn-data" onClick={handleExportData}>
                      📥 Xuất Dữ Liệu
                    </button>
                  </div>
                </div>

                <div className="data-card">
                  <div className="data-icon">🔄</div>
                  <div className="data-info">
                    <h3 className="data-title">Đặt Lại Cài Đặt</h3>
                    <p className="data-desc">Khôi phục tất cả cài đặt về giá trị mặc định</p>
                    <button className="btn-data btn-reset" onClick={handleResetSettings}>
                      🔄 Đặt Lại
                    </button>
                  </div>
                </div>

                <div className="data-card danger">
                  <div className="data-icon">🗑️</div>
                  <div className="data-info">
                    <h3 className="data-title">Xóa Tài Khoản</h3>
                    <p className="data-desc">Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu</p>
                    <button
                      className="btn-data btn-danger"
                      onClick={handleDeleteAccount}
                    >
                      🗑️ Xóa Tài Khoản
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}