import { useState, useEffect } from "react";
import "./Settings.css";

export default function Settings() {
  // Profile Settings
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatar: "",
    bio: "",
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    theme: "light",
    language: "vi",
    notifications: true,
    emailNotifications: true,
    pushNotifications: false,
  });

  // Privacy
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showEmail: false,
    showProgress: true,
    allowMessages: true,
  });

  // Workout Settings
  const [workoutSettings, setWorkoutSettings] = useState({
    defaultDuration: 60,
    reminderTime: "07:00",
    autoLog: true,
    restDayReminder: true,
  });

  // Nutrition Settings
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

  useEffect(() => {
    // Load settings from localStorage
    const savedProfile = localStorage.getItem("user_profile");
    const savedPrefs = localStorage.getItem("user_preferences");
    const savedPrivacy = localStorage.getItem("user_privacy");
    const savedWorkout = localStorage.getItem("workout_settings");
    const savedNutrition = localStorage.getItem("nutrition_settings");

    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedPrefs) setPreferences(JSON.parse(savedPrefs));
    if (savedPrivacy) setPrivacy(JSON.parse(savedPrivacy));
    if (savedWorkout) setWorkoutSettings(JSON.parse(savedWorkout));
    if (savedNutrition) setNutritionSettings(JSON.parse(savedNutrition));
  }, []);

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

  const handleSaveAll = () => {
    localStorage.setItem("user_profile", JSON.stringify(profile));
    localStorage.setItem("user_preferences", JSON.stringify(preferences));
    localStorage.setItem("user_privacy", JSON.stringify(privacy));
    localStorage.setItem("workout_settings", JSON.stringify(workoutSettings));
    localStorage.setItem("nutrition_settings", JSON.stringify(nutritionSettings));

    setShowSaveAlert(true);
    setTimeout(() => setShowSaveAlert(false), 3000);
  };

  const handleResetSettings = () => {
    if (confirm("Bạn có chắc muốn đặt lại tất cả cài đặt về mặc định?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleExportData = () => {
    const allData = {
      profile,
      preferences,
      privacy,
      workoutSettings,
      nutritionSettings,
    };
    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mysportcoach-settings-${Date.now()}.json`;
    link.click();
  };

  return (
    <div className="settings-page">
      {/* Header */}
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

      {/* Success Alert */}
      {showSaveAlert && (
        <div className="save-alert">
          <span className="alert-icon">✅</span>
          Đã lưu thành công!
        </div>
      )}

      <div className="settings-container">
        {/* Sidebar Tabs */}
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
        </div>

        {/* Content Area */}
        <div className="settings-content">
          {/* Profile Tab */}
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
                    <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
                    📷 Đổi Ảnh
                  </label>
                  <button
                    className="btn-remove"
                    onClick={() => {
                      setAvatarPreview(null);
                      setProfile({ ...profile, avatar: "" });
                    }}
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tên hiển thị</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="form-input"
                  placeholder="Nhập tên của bạn"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="form-input"
                  placeholder="email@example.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Giới thiệu bản thân</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="form-textarea"
                  rows="4"
                  placeholder="Viết vài dòng về bạn..."
                />
              </div>
            </div>
          )}

          {/* Preferences Tab */}
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

          {/* Privacy Tab */}
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

          {/* Workout Tab */}
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

          {/* Nutrition Tab */}
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

          {/* Data Tab */}
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
                      onClick={() => alert("Tính năng này đang được phát triển")}
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