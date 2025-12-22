import { useState, useEffect, useRef } from "react";
import "./Settings.css";
import { useToast } from "../contexts/ToastContext";
import ConfirmModal from "../components/ConfirmModal";

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

  const [activeTab, setActiveTab] = useState("preferences");
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
  const toast = useToast();
  const autoSaveTimerRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  // Validation functions
  const validateTitle = (title) => {
    if (!title || !title.trim()) {
      return { valid: false, message: 'Vui lòng nhập tiêu đề' };
    }
    if (title.trim().length < 3) {
      return { valid: false, message: 'Tiêu đề phải có ít nhất 3 ký tự' };
    }
    if (title.length > 200) {
      return { valid: false, message: 'Tiêu đề không được quá 200 ký tự' };
    }
    return { valid: true };
  };

  const validateMessage = (message) => {
    if (!message || !message.trim()) {
      return { valid: false, message: 'Vui lòng nhập nội dung phản hồi' };
    }
    if (message.trim().length < 10) {
      return { valid: false, message: 'Nội dung phải có ít nhất 10 ký tự' };
    }
    if (message.length > 2000) {
      return { valid: false, message: 'Nội dung không được quá 2000 ký tự' };
    }
    return { valid: true };
  };
  
  // Confirm modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning',
    requireText: null
  });

  useEffect(() => {
    loadSettings();
  }, []);

  // Apply theme when preferences change
  useEffect(() => {
    applyTheme(preferences.theme);
  }, [preferences.theme]);

  // Apply language when preferences change
  useEffect(() => {
    applyLanguage(preferences.language);
  }, [preferences.language]);

  // Auto-save preferences with debounce (skip on initial load)
  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      if (!loading) {
        autoSavePreferences(false); // Silent save
      }
    }, 2000); // Debounce 2 seconds

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [preferences, privacy]);

  const applyTheme = (theme) => {
    const root = document.documentElement;
    const body = document.body;
    
    // Remove existing theme classes
    body.classList.remove('theme-light', 'theme-dark', 'theme-auto');
    
    const applyDarkTheme = () => {
      body.classList.add('theme-dark');
      root.style.setProperty('--bg-primary', '#1a1a2e');
      root.style.setProperty('--bg-secondary', '#16213e');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#a0aec0');
      // Apply to entire app
      document.querySelector('.app-container')?.classList.add('theme-dark');
      document.querySelector('.settings-page')?.classList.add('theme-dark');
    };
    
    const applyLightTheme = () => {
      body.classList.add('theme-light');
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f8f9fa');
      root.style.setProperty('--text-primary', '#1f2937');
      root.style.setProperty('--text-secondary', '#6b7280');
      // Apply to entire app
      document.querySelector('.app-container')?.classList.remove('theme-dark');
      document.querySelector('.settings-page')?.classList.remove('theme-dark');
    };
    
    if (theme === 'dark') {
      applyDarkTheme();
    } else if (theme === 'auto') {
      body.classList.add('theme-auto');
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      const applySystemTheme = () => {
        if (prefersDark.matches) {
          applyDarkTheme();
        } else {
          applyLightTheme();
        }
      };
      
      applySystemTheme();
      
      // Listen for system theme changes
      if (window.themeMediaListener) {
        prefersDark.removeEventListener('change', window.themeMediaListener);
      }
      window.themeMediaListener = applySystemTheme;
      prefersDark.addEventListener('change', applySystemTheme);
    } else {
      applyLightTheme();
    }
    
    // Save to localStorage for persistence
    localStorage.setItem('user_theme', theme);
  };
  
  // Load theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('user_theme') || 'light';
    applyTheme(savedTheme);
    setPreferences(prev => ({ ...prev, theme: savedTheme }));
  }, []);

  const applyLanguage = (language) => {
    // Set language attribute
    document.documentElement.lang = language;
    
    // Save to localStorage
    localStorage.setItem('user_language', language);
    
    // Dispatch event for other components to listen
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language } }));
  };

  const autoSavePreferences = async (showToast = false) => {
    try {
      const response = await fetch(`/api/settings`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences,
          privacy,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Auto-saved preferences');
        if (showToast) {
          toast.success('Đã tự động lưu cài đặt');
        }
      } else {
        throw new Error(data.error || 'Lỗi khi lưu');
      }
    } catch (err) {
      console.error('❌ Error auto-saving preferences:', err);
      if (showToast) {
        toast.error('Không thể tự động lưu cài đặt');
      }
    }
  };

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
        const newPreferences = { ...preferences, ...data.preferences };
        setPreferences(newPreferences);
        // Apply theme and language immediately
        if (newPreferences.theme) {
          applyTheme(newPreferences.theme);
        }
        if (newPreferences.language) {
          applyLanguage(newPreferences.language);
        }
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
      setError(null);
      
      const response = await fetch(`/api/settings`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences,
          privacy,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Không thể lưu settings');
      }

      setShowSaveAlert(true);
      toast.success('✅ Đã lưu tất cả cài đặt thành công!');
      setTimeout(() => setShowSaveAlert(false), 3000);

      console.log('✅ Settings saved:', data);
    } catch (err) {
      console.error('Error saving settings:', err);
      const errorMsg = err.message || 'Không thể lưu cài đặt';
      toast.error(`❌ ${errorMsg}`);
      setError(errorMsg);
    }
  };

  const handleResetSettings = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Đặt lại cài đặt',
      message: 'Bạn có chắc muốn đặt lại tất cả cài đặt về mặc định?\n\nTất cả các tùy chọn của bạn sẽ được khôi phục về giá trị ban đầu.',
      onConfirm: async () => {
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

          isInitialLoadRef.current = true; // Prevent auto-save after reset
          await loadSettings();
          toast.success('✅ Đã đặt lại cài đặt về mặc định!');
        } catch (err) {
          console.error('Error resetting settings:', err);
          toast.error('❌ Không thể đặt lại cài đặt. Vui lòng thử lại.');
        }
      },
      type: 'warning'
    });
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
      toast.success('✅ Đã xuất dữ liệu thành công!');
    } catch (err) {
      console.error('Error exporting data:', err);
      toast.error('❌ Không thể xuất dữ liệu. Vui lòng thử lại.');
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
    // Validate title
    const titleValidation = validateTitle(feedbackForm.title);
    if (!titleValidation.valid) {
      toast.error(`❌ ${titleValidation.message}`);
      return;
    }
    
    // Validate message
    const messageValidation = validateMessage(feedbackForm.message);
    if (!messageValidation.valid) {
      toast.error(`❌ ${messageValidation.message}`);
      return;
    }

    try {
      setFeedbackLoading(true);
      console.log('📤 Sending feedback:', feedbackForm);
      
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json; charset=utf-8' 
        },
        credentials: 'include',
        body: JSON.stringify(feedbackForm)
      });
      
      console.log('📥 Response status:', res.status);
      
      const data = await res.json();
      console.log('📥 Response data:', data);
      
      if (res.ok && data.success) {
        toast.success('✅ Gửi feedback thành công! Cảm ơn bạn đã đóng góp.');
        setFeedbackForm({
          type: 'other',
          title: '',
          message: '',
          priority: 'low'
        });
        fetchMyFeedbacks();
      } else {
        const errorMsg = data.error || 'Không thể gửi feedback. Vui lòng thử lại.';
        console.error('❌ Error:', errorMsg);
        toast.error(`❌ ${errorMsg}`);
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      toast.error(`❌ Lỗi kết nối: ${error.message}`);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    setConfirmModal({
      isOpen: true,
      title: '⚠️ XÓA TÀI KHOẢN',
      message: 'Bạn có chắc chắn muốn xóa tài khoản?\n\nTất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn và không thể khôi phục.\n\nNhập "XÓA" để xác nhận:',
      onConfirm: async () => {
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

          toast.success('✅ Tài khoản đã được xóa thành công. Bạn sẽ được chuyển đến trang đăng nhập.');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } catch (err) {
          console.error('Error deleting account:', err);
          toast.error(`❌ Không thể xóa tài khoản: ${err.message}`);
        }
      },
      type: 'danger',
      requireText: 'XÓA',
      confirmText: 'Xóa tài khoản',
      cancelText: 'Hủy'
    });
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
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        requireText={confirmModal.requireText}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
      />
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
            Phản Hồi
          </button>
        </div>

        { }
        <div className="settings-content">
          {activeTab === "preferences" && (
            <div className="settings-section">
              <h2 className="section-title">Tùy Chỉnh Giao Diện</h2>

              <div className="form-group">
                <label className="form-label">Chủ đề</label>
                <div className="theme-selector">
                  <button
                    className={`theme-option ${preferences.theme === "light" ? "active" : ""}`}
                    onClick={() => {
                      const newPrefs = { ...preferences, theme: "light" };
                      setPreferences(newPrefs);
                      applyTheme("light");
                      toast.success('✅ Đã chuyển sang giao diện sáng');
                    }}
                  >
                    ☀️ Sáng
                  </button>
                  <button
                    className={`theme-option ${preferences.theme === "dark" ? "active" : ""}`}
                    onClick={() => {
                      const newPrefs = { ...preferences, theme: "dark" };
                      setPreferences(newPrefs);
                      applyTheme("dark");
                      toast.success('✅ Đã chuyển sang giao diện tối');
                    }}
                  >
                    🌙 Tối
                  </button>
                  <button
                    className={`theme-option ${preferences.theme === "auto" ? "active" : ""}`}
                    onClick={() => {
                      const newPrefs = { ...preferences, theme: "auto" };
                      setPreferences(newPrefs);
                      applyTheme("auto");
                      toast.success('✅ Đã bật chế độ tự động');
                    }}
                  >
                    🔄 Tự động
                  </button>
                </div>
                <small style={{ color: '#666', fontSize: '0.875rem', marginTop: '8px', display: 'block' }}>
                  {preferences.theme === 'auto' 
                    ? 'Tự động theo cài đặt hệ thống' 
                    : preferences.theme === 'dark' 
                    ? 'Giao diện tối đã được áp dụng' 
                    : 'Giao diện sáng đã được áp dụng'}
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Ngôn ngữ</label>
                <select
                  value={preferences.language}
                  onChange={(e) => {
                    const newLang = e.target.value;
                    const newPrefs = { ...preferences, language: newLang };
                    setPreferences(newPrefs);
                    applyLanguage(newLang);
                    const langNames = {
                      vi: 'Tiếng Việt',
                      en: 'English',
                      ja: '日本語',
                      ko: '한국어'
                    };
                    toast.success(`✅ Đã chuyển sang ${langNames[newLang]}`);
                  }}
                  className="form-select"
                >
                  <option value="vi">🇻🇳 Tiếng Việt</option>
                  <option value="en">🇬🇧 English</option>
                  <option value="ja">🇯🇵 日本語</option>
                  <option value="ko">🇰🇷 한국어</option>
                </select>
                <small style={{ color: '#666', fontSize: '0.875rem', marginTop: '8px', display: 'block' }}>
                  Ngôn ngữ đã được cập nhật
                </small>
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
                      onChange={(e) => {
                        const newValue = e.target.checked;
                        setPreferences({ ...preferences, notifications: newValue });
                        toast.info(newValue ? '🔔 Đã bật thông báo trong app' : '🔕 Đã tắt thông báo trong app');
                      }}
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
                      onChange={(e) => {
                        const newValue = e.target.checked;
                        setPreferences({ ...preferences, emailNotifications: newValue });
                        toast.info(newValue ? '📧 Đã bật thông báo email' : '📧 Đã tắt thông báo email');
                      }}
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
                      onChange={(e) => {
                        const newValue = e.target.checked;
                        setPreferences({ ...preferences, pushNotifications: newValue });
                        toast.info(newValue ? '📱 Đã bật thông báo đẩy' : '📱 Đã tắt thông báo đẩy');
                      }}
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
                      onChange={(e) => {
                        const newValue = e.target.checked;
                        setPrivacy({ ...privacy, profilePublic: newValue });
                        toast.info(newValue ? '🌐 Đã công khai hồ sơ' : '🔒 Đã ẩn hồ sơ');
                      }}
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
                      onChange={(e) => {
                        const newValue = e.target.checked;
                        setPrivacy({ ...privacy, showEmail: newValue });
                        toast.info(newValue ? '📧 Đã hiển thị email' : '🔒 Đã ẩn email');
                      }}
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
                      onChange={(e) => {
                        const newValue = e.target.checked;
                        setPrivacy({ ...privacy, showProgress: newValue });
                        toast.info(newValue ? '📊 Đã hiển thị tiến độ' : '🔒 Đã ẩn tiến độ');
                      }}
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
                      onChange={(e) => {
                        const newValue = e.target.checked;
                        setPrivacy({ ...privacy, allowMessages: newValue });
                        toast.info(newValue ? '💬 Đã cho phép nhắn tin' : '🔒 Đã chặn nhắn tin');
                      }}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
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

          { }
          {activeTab === "feedback" && (
            <div className="settings-section">
              <h2 className="section-title">Gửi Phản Hồi</h2>
              <p style={{ color: '#666', marginBottom: '24px', fontSize: '0.95rem' }}>
                Chia sẻ ý kiến, báo lỗi hoặc đề xuất tính năng mới. Chúng tôi rất trân trọng phản hồi của bạn!
              </p>

              <div className="feedback-form">
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📝</span>
                    Loại phản hồi
                  </label>
                  <select
                    value={feedbackForm.type}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, type: e.target.value })}
                    className="form-select"
                  >
                    <option value="bug">🐛 Báo lỗi</option>
                    <option value="feature">✨ Đề xuất tính năng</option>
                    <option value="improvement">🔧 Cải thiện</option>
                    <option value="question">❓ Câu hỏi</option>
                    <option value="other">💭 Khác</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">🏷️</span>
                    Tiêu đề
                  </label>
                  <input
                    type="text"
                    value={feedbackForm.title}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, title: e.target.value })}
                    placeholder="Nhập tiêu đề phản hồi"
                    className="form-input"
                    maxLength={200}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📄</span>
                    Nội dung
                  </label>
                  <textarea
                    value={feedbackForm.message}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                    placeholder="Mô tả chi tiết phản hồi của bạn..."
                    className="form-input"
                    rows={6}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">⚡</span>
                    Mức độ ưu tiên
                  </label>
                  <select
                    value={feedbackForm.priority}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, priority: e.target.value })}
                    className="form-select"
                  >
                    <option value="low">🟢 Thấp</option>
                    <option value="medium">🟡 Trung bình</option>
                    <option value="high">🔴 Cao</option>
                  </select>
                </div>

                <button
                  className="btn btn-save"
                  onClick={handleSubmitFeedback}
                  disabled={feedbackLoading || !feedbackForm.title || !feedbackForm.message}
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  {feedbackLoading ? (
                    <>
                      <span className="btn-icon">⏳</span>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">📤</span>
                      Gửi Phản Hồi
                    </>
                  )}
                </button>
              </div>

              <div style={{ marginTop: '40px', borderTop: '2px solid #e5e7eb', paddingTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 className="section-title" style={{ margin: 0, fontSize: '1.3rem' }}>Lịch Sử Phản Hồi</h3>
                  <select
                    value={feedbackStatusFilter}
                    onChange={(e) => {
                      setFeedbackStatusFilter(e.target.value);
                      fetchMyFeedbacks(e.target.value);
                    }}
                    className="form-select"
                    style={{ width: 'auto', minWidth: '150px' }}
                  >
                    <option value="all">Tất cả</option>
                    <option value="pending">⏳ Đang xử lý</option>
                    <option value="resolved">✅ Đã xử lý</option>
                  </select>
                </div>

                {feedbackLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    <div className="spinner" style={{
                      width: '40px',
                      height: '40px',
                      border: '4px solid #f3f3f3',
                      borderTop: '4px solid #6366f1',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 16px'
                    }}></div>
                    Đang tải...
                  </div>
                ) : myFeedbacks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>📭</p>
                    <p>Chưa có phản hồi nào</p>
                  </div>
                ) : (
                  <div className="feedback-list">
                    {myFeedbacks.map((fb) => (
                      <div key={fb.id} className="feedback-item">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#1f2937' }}>
                              {fb.title}
                            </h4>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '0.85rem', color: '#6b7280' }}>
                              <span>
                                {fb.type === 'bug' && '🐛 Báo lỗi'}
                                {fb.type === 'feature' && '✨ Đề xuất'}
                                {fb.type === 'improvement' && '🔧 Cải thiện'}
                                {fb.type === 'question' && '❓ Câu hỏi'}
                                {fb.type === 'other' && '💭 Khác'}
                              </span>
                              <span>
                                {fb.priority === 'low' && '🟢 Thấp'}
                                {fb.priority === 'medium' && '🟡 Trung bình'}
                                {fb.priority === 'high' && '🔴 Cao'}
                              </span>
                              <span>
                                {fb.status === 'pending' && '⏳ Đang xử lý'}
                                {fb.status === 'resolved' && '✅ Đã xử lý'}
                              </span>
                            </div>
                          </div>
                          <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                            {new Date(fb.created_at).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <p style={{ margin: '0 0 12px 0', color: '#4b5563', lineHeight: '1.6' }}>
                          {fb.message}
                        </p>
                        {fb.response && (
                          <div style={{
                            background: '#f0f9ff',
                            border: '1px solid #bae6fd',
                            borderRadius: '8px',
                            padding: '12px',
                            marginTop: '12px'
                          }}>
                            <div style={{ fontWeight: '600', color: '#0369a1', marginBottom: '4px' }}>
                              💬 Phản hồi từ admin:
                            </div>
                            <div style={{ color: '#0c4a6e', lineHeight: '1.6' }}>
                              {fb.response}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}