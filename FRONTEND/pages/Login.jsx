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

    setLoading(true); // Bắt đầu tải
    setMessage(""); // Reset message

    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password: pw }),
    });

    const result = await response.json();

    setLoading(false); // Kết thúc trạng thái tải

    if (response.ok) {
      // Nếu đăng nhập thành công, bạn có thể điều hướng hoặc làm gì đó
      setMessage("Đăng nhập thành công!");
      // Redirect đến trang chủ sau khi đăng nhập thành công
      window.location.href = "/home"; // Thay đổi trang sau khi đăng nhập thành công
    } else {
      setMessage(result.message || "Đăng nhập thất bại!"); // Hiển thị thông báo lỗi từ backend
    }
    // Login.jsx
    fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // ✅ Gửi và nhận cookie session
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user_id) {
          alert("✅ Đăng nhập thành công!");
          window.location.href = "/profile";
        } else {
          alert("❌ " + (data.error || "Sai thông tin đăng nhập"));
        }
      });
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
