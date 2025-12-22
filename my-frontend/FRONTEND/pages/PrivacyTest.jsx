import { useState, useEffect } from "react";
import { useToast } from "../contexts/ToastContext";
import "./Settings.css";

/**
 * Component để test Privacy Settings
 * Giúp kiểm tra xem các privacy settings có hoạt động đúng không
 */
export default function PrivacyTest() {
  const toast = useToast();
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showEmail: false,
    showProgress: true,
    allowMessages: true,
  });
  const [profile, setProfile] = useState({ email: "" });
  const [testResult, setTestResult] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch(`/api/settings`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();
      if (data.privacy) {
        setPrivacy(data.privacy);
      }
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  };

  const testEmailVisibility = async () => {
    try {
      const response = await fetch(`/api/profile`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (privacy.showEmail) {
        if (data.Email) {
          setTestResult(`✅ Email hiển thị: ${data.Email}`);
        } else {
          setTestResult(`❌ Email KHÔNG hiển thị dù showEmail = true`);
        }
      } else {
        if (!data.Email || data.Email === null) {
          setTestResult(`✅ Email đã bị ẩn (showEmail = false)`);
        } else {
          setTestResult(`❌ Email vẫn hiển thị: ${data.Email} (nên bị ẩn)`);
        }
      }
    } catch (err) {
      setTestResult(`❌ Lỗi: ${err.message}`);
    }
  };

  const testMessageBlock = async () => {
    // Test này cần 2 tài khoản để test
    setTestResult("ℹ️ Để test chức năng này:\n1. Đăng nhập tài khoản A, tắt 'Cho phép nhắn tin'\n2. Đăng nhập tài khoản B, thử gửi tin nhắn cho A\n3. Sẽ thấy lỗi 'Người này đã chặn nhận tin nhắn'");
  };

  return (
    <div className="settings-page" style={{ padding: "2rem" }}>
      <div className="settings-header">
        <h1 className="page-title">
          <span className="title-icon">🧪</span>
          Privacy Settings Test
        </h1>
        <p className="page-subtitle">Kiểm tra xem Privacy Settings có hoạt động đúng không</p>
      </div>

      <div className="settings-section">
        <h2 className="section-title">📋 Trạng thái hiện tại</h2>
        <div className="toggle-group">
          <div className="toggle-item">
            <div className="toggle-info">
              <div className="toggle-label">🌐 Hồ sơ công khai</div>
              <div className="toggle-desc">{privacy.profilePublic ? "✅ Bật" : "❌ Tắt"}</div>
            </div>
          </div>
          <div className="toggle-item">
            <div className="toggle-info">
              <div className="toggle-label">📧 Hiển thị email</div>
              <div className="toggle-desc">{privacy.showEmail ? "✅ Bật" : "❌ Tắt"}</div>
            </div>
          </div>
          <div className="toggle-item">
            <div className="toggle-info">
              <div className="toggle-label">📊 Hiển thị tiến độ</div>
              <div className="toggle-desc">{privacy.showProgress ? "✅ Bật" : "❌ Tắt"}</div>
            </div>
          </div>
          <div className="toggle-item">
            <div className="toggle-info">
              <div className="toggle-label">💬 Cho phép nhắn tin</div>
              <div className="toggle-desc">{privacy.allowMessages ? "✅ Bật" : "❌ Tắt"}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2 className="section-title">🧪 Test Functions</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <button 
            className="btn-save-all" 
            onClick={testEmailVisibility}
            style={{ maxWidth: '300px' }}
          >
            Test Email Visibility
          </button>
          
          <button 
            className="btn-save-all" 
            onClick={testMessageBlock}
            style={{ maxWidth: '300px' }}
          >
            Test Message Block
          </button>
          
          <button 
            className="btn-save-all" 
            onClick={() => window.location.href = '/settings'}
            style={{ maxWidth: '300px', background: '#6366f1' }}
          >
            Vào Settings để thay đổi
          </button>
        </div>

        {testResult && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#f0f0f0',
            borderRadius: '8px',
            whiteSpace: 'pre-line',
            fontFamily: 'monospace'
          }}>
            {testResult}
          </div>
        )}
      </div>

      <div className="settings-section">
        <h2 className="section-title">📖 Hướng dẫn kiểm tra</h2>
        <div style={{ lineHeight: '1.8', color: '#666' }}>
          <h3>1. Test Email Visibility:</h3>
          <ol>
            <li>Vào Settings → Privacy → Tắt "Hiển thị email"</li>
            <li>Vào Profile page, kiểm tra xem email có còn hiển thị không</li>
            <li>Bấm nút "Test Email Visibility" ở trên để kiểm tra API</li>
          </ol>

          <h3>2. Test Message Block:</h3>
          <ol>
            <li>Đăng nhập tài khoản A, vào Settings → Privacy → Tắt "Cho phép nhắn tin"</li>
            <li>Đăng nhập tài khoản B, vào Messenger/NewsFeed</li>
            <li>Thử gửi tin nhắn cho tài khoản A</li>
            <li>Sẽ thấy lỗi: "Người này đã chặn nhận tin nhắn"</li>
          </ol>

          <h3>3. Test Profile Public:</h3>
          <ol>
            <li>Hiện tại chức năng này chỉ lưu vào DB, chưa được sử dụng ở các trang khác</li>
            <li>Có thể mở rộng để ẩn profile khỏi public search</li>
          </ol>

          <h3>4. Test Show Progress:</h3>
          <ol>
            <li>Hiện tại chức năng này chỉ lưu vào DB, chưa được sử dụng ở các trang khác</li>
            <li>Có thể mở rộng để ẩn tiến độ tập luyện khỏi leaderboard/public view</li>
          </ol>
        </div>
      </div>
    </div>
  );
}





