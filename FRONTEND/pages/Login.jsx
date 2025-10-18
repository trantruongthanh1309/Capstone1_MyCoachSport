import { useState } from "react";
import styles from "./Login.module.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [message, setMessage] = useState(""); // Lưu thông báo từ backend (đăng nhập thành công hay thất bại)
  const [loading, setLoading] = useState(false); // Trạng thái đang tải

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!email || !pw) {
    setMessage("Vui lòng điền đầy đủ thông tin!");
    return;
  }

  setLoading(true);
  setMessage("");

  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",                      // 🔑 bắt buộc để nhận cookie
      body: JSON.stringify({ email, password: pw })// 🔧 dùng đúng biến pw
    });

    const result = await response.json();
    setLoading(false);

    if (response.ok && result.user_id) {
      setMessage("Đăng nhập thành công!");
      window.location.href = "/home";              // hoặc /profile nếu muốn
    } else {
      setMessage(result.error || result.message || "Đăng nhập thất bại!");
    }
  } catch (err) {
    setLoading(false);
    setMessage("Lỗi kết nối server");
  }
};


  return (
    <div className={styles.bg}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          MySportCoach<span>AI</span>
        </div>

        <h2 className={styles.title}>Đăng nhập</h2>
        <p className={styles.subtitle}>
          Chào mừng trở lại! Hãy đăng nhập để tiếp tục
        </p>

        {/* Thông báo */}
        {message && <p className={styles.message}>{message}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Email */}
          <div className={styles.inputGroup}>
            <span className={styles.icon}>📧</span>
            <input
              type="email"
              placeholder="Email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className={styles.inputGroup}>
            <span className={styles.icon}>🔒</span>
            <input
              type={showPw ? "text" : "password"}
              placeholder="Mật khẩu"
              className={styles.input}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              required
            />
            <span
              className={styles.togglePw}
              onClick={() => setShowPw(!showPw)}
            >
              {showPw ? "🙈" : "👁️"}
            </span>
          </div>

          {/* Remember + Forgot */}
          <div className={styles.row}>
            <label className={styles.remember}>
              <input type="checkbox" /> Ghi nhớ đăng nhập
            </label>
            <a href="/forgot" className={styles.link}>
              Quên mật khẩu?
            </a>
          </div>

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        {/* Social Login */}
        <div className={styles.socialWrap}>
          <p className={styles.or}>Hoặc đăng nhập với</p>
          <div className={styles.socials}>
            <button className={`${styles.social} ${styles.gg}`}>Google</button>
            <button className={`${styles.social} ${styles.fb}`}>
              Facebook
            </button>
            <button className={`${styles.social} ${styles.git}`}>Github</button>
          </div>
        </div>

        {/* Extra */}
        <p className={styles.extra}>
          Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
        </p>
      </div>
    </div>
  );
}
