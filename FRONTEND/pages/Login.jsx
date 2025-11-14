import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
      credentials: "include",
      body: JSON.stringify({ email, password: pw }),
    });

    const result = await response.json();
    setLoading(false);

    if (response.ok && result.success) {
      // ✅ LƯU VÀO SESSIONSTORAGE
      sessionStorage.setItem('user_id', result.user_id);
      sessionStorage.setItem('role', result.role);
      sessionStorage.setItem('isLoggedIn', 'true');

      console.log('✅ Login success - Role:', result.role);

      // ✅ REDIRECT DỰA VÀO ROLE
      if (result.role === 'admin' || result.role === 'manager') {
        window.location.href = "/admin";
      } else {
        window.location.href = "/home";
      }
    } else {
      setMessage(result.error || result.message || "Đăng nhập thất bại!");
    }
  } catch (err) {
    setLoading(false);
    setMessage("Lỗi kết nối server");
  }
};

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Poppins', sans-serif;
        }

        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 186, 8, 0.5); }
          50% { box-shadow: 0 0 40px rgba(255, 186, 8, 0.8); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes particles {
          0% { transform: translateY(0) translateX(0); opacity: 1; }
          100% { transform: translateY(-100vh) translateX(100px); opacity: 0; }
        }

        .bg {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(-45deg, #00b4d8, #0096c7, #023e8a, #03045e, #001d3d, #0077b6);
          background-size: 400% 400%;
          animation: gradientMove 15s ease infinite;
          position: relative;
          overflow: hidden;
          padding: 20px;
        }

        /* Particules flottantes */
        .bg::before,
        .bg::after {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.3;
          animation: float 8s ease-in-out infinite;
        }

        .bg::before {
          top: -100px;
          left: -100px;
          background: #ffba08;
          animation-delay: 0s;
        }

        .bg::after {
          bottom: -100px;
          right: -100px;
          background: #00b4d8;
          animation-delay: 2s;
        }

        /* Particules animées */
        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          animation: particles 15s linear infinite;
        }

        .particle:nth-child(1) { left: 10%; animation-delay: 0s; }
        .particle:nth-child(2) { left: 20%; animation-delay: 2s; }
        .particle:nth-child(3) { left: 30%; animation-delay: 4s; }
        .particle:nth-child(4) { left: 40%; animation-delay: 1s; }
        .particle:nth-child(5) { left: 50%; animation-delay: 3s; }
        .particle:nth-child(6) { left: 60%; animation-delay: 5s; }
        .particle:nth-child(7) { left: 70%; animation-delay: 2.5s; }
        .particle:nth-child(8) { left: 80%; animation-delay: 4.5s; }
        .particle:nth-child(9) { left: 90%; animation-delay: 1.5s; }

        .card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border-radius: 30px;
          padding: 50px 45px;
          width: 100%;
          max-width: 460px;
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          animation: fadeInUp 0.8s ease;
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 10;
        }

        .card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 30px;
          padding: 2px;
          background: linear-gradient(45deg, #ffba08, #00b4d8, #ffba08);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0.6;
          animation: rotate 4s linear infinite;
        }

        .logo {
          text-align: center;
          font-size: 2rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 20px;
          animation: slideInLeft 1s ease;
          text-shadow: 0 4px 20px rgba(255, 186, 8, 0.5);
        }

        .logo span {
          background: linear-gradient(135deg, #ffba08, #ffd60a);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: glow 2s ease-in-out infinite;
        }

        .title {
          font-size: 2rem;
          font-weight: 700;
          color: #fff;
          text-align: center;
          margin-bottom: 10px;
          animation: fadeInUp 1s ease 0.2s both;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .subtitle {
          color: rgba(255, 255, 255, 0.8);
          text-align: center;
          margin-bottom: 30px;
          font-size: 0.95rem;
          animation: fadeInUp 1s ease 0.3s both;
        }

        .message {
          background: rgba(255, 186, 8, 0.15);
          border: 1px solid rgba(255, 186, 8, 0.5);
          color: #ffba08;
          padding: 12px;
          border-radius: 12px;
          text-align: center;
          margin-bottom: 20px;
          font-size: 0.9rem;
          animation: fadeInUp 0.5s ease;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .inputGroup {
          position: relative;
          width: 100%;
          animation: fadeInUp 1s ease 0.4s both;
        }

        .icon {
          position: absolute;
          top: 50%;
          left: 18px;
          transform: translateY(-50%);
          font-size: 1.3rem;
          z-index: 2;
          transition: all 0.3s ease;
        }

        .togglePw {
          position: absolute;
          right: 18px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          font-size: 1.2rem;
          z-index: 2;
          transition: all 0.3s ease;
        }

        .togglePw:hover {
          transform: translateY(-50%) scale(1.2);
        }

        .input {
          width: 100%;
          padding: 16px 55px;
          border-radius: 15px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          outline: none;
          font-size: 1rem;
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          transition: all 0.4s ease;
          backdrop-filter: blur(10px);
        }

        .input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .input:focus {
          border-color: #ffba08;
          background: rgba(255, 255, 255, 0.12);
          box-shadow: 
            0 0 0 4px rgba(255, 186, 8, 0.1),
            0 8px 30px rgba(255, 186, 8, 0.2);
          transform: translateY(-2px);
        }

        .input:focus + .icon {
          color: #ffba08;
          transform: translateY(-50%) scale(1.1);
        }

        .row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
          animation: fadeInUp 1s ease 0.5s both;
        }

        .remember {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .remember:hover {
          color: #ffba08;
        }

        .remember input {
          cursor: pointer;
          width: 18px;
          height: 18px;
        }

        .link {
          color: #ffba08;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
          position: relative;
        }

        .link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: #ffba08;
          transition: width 0.3s ease;
        }

        .link:hover::after {
          width: 100%;
        }

        .btn {
          background: linear-gradient(135deg, #00b4d8, #0096c7);
          color: white;
          font-weight: 600;
          font-size: 1.05rem;
          border: none;
          padding: 16px;
          border-radius: 15px;
          cursor: pointer;
          transition: all 0.4s ease;
          box-shadow: 0 8px 25px rgba(0, 150, 199, 0.4);
          animation: fadeInUp 1s ease 0.6s both;
          position: relative;
          overflow: hidden;
        }

        .btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s ease;
        }

        .btn:hover::before {
          left: 100%;
        }

        .btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(0, 150, 199, 0.6);
        }

        .btn:active {
          transform: translateY(-1px);
        }

        .btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .socialWrap {
          margin-top: 30px;
          text-align: center;
          animation: fadeInUp 1s ease 0.7s both;
        }

        .or {
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 15px;
          font-size: 0.9rem;
          position: relative;
        }

        .or::before,
        .or::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 40%;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3), transparent);
        }

        .or::before { left: 0; }
        .or::after { right: 0; }

        .socials {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .social {
          flex: 1;
          padding: 12px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.3s ease;
          font-size: 0.95rem;
          position: relative;
          overflow: hidden;
        }

        .social::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.5s, height 0.5s;
        }

        .social:hover::before {
          width: 300px;
          height: 300px;
        }

        .gg { 
          background: linear-gradient(135deg, #db4437, #c23321);
          color: #fff;
          box-shadow: 0 4px 15px rgba(219, 68, 55, 0.4);
        }
        
        .fb { 
          background: linear-gradient(135deg, #1877f2, #0d65d9);
          color: #fff;
          box-shadow: 0 4px 15px rgba(24, 119, 242, 0.4);
        }
        
        .git { 
          background: linear-gradient(135deg, #333, #000);
          color: #fff;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
        }

        .social:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .extra {
          text-align: center;
          margin-top: 25px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.95rem;
          animation: fadeInUp 1s ease 0.8s both;
        }

        .extra a {
          color: #ffba08;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          position: relative;
        }

        .extra a::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #ffba08, #ffd60a);
          transition: width 0.3s ease;
        }

        .extra a:hover {
          color: #ffd60a;
        }

        .extra a:hover::after {
          width: 100%;
        }

        @media (max-width: 480px) {
          .card {
            padding: 35px 30px;
          }
          
          .logo {
            font-size: 1.6rem;
          }
          
          .title {
            font-size: 1.6rem;
          }
          
          .socials {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="bg">
        {/* Particules */}
        {[...Array(9)].map((_, i) => (
          <div key={i} className="particle"></div>
        ))}

        <div className="card">
          {/* Logo */}
          <div className="logo">
            MySportCoach<span>AI</span>
          </div>

          <h2 className="title">Đăng nhập</h2>
          <p className="subtitle">
            Chào mừng trở lại! Hãy đăng nhập để tiếp tục
          </p>

          {/* Thông báo */}
          {message && <p className="message">{message}</p>}

          <div className="form">
            {/* Email */}
            <div className="inputGroup">
              <input
                type="email"
                placeholder="Email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <span className="icon">📧</span>
            </div>

            {/* Password */}
            <div className="inputGroup">
              <input
                type={showPw ? "text" : "password"}
                placeholder="Mật khẩu"
                className="input"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                required
              />
              <span className="icon">🔒</span>
              <span className="togglePw" onClick={() => setShowPw(!showPw)}>
                {showPw ? "🙈" : "👁️"}
              </span>
            </div>

            {/* Remember + Forgot */}
            <div className="row">
              <label className="remember">
                <input type="checkbox" /> Ghi nhớ đăng nhập
              </label>
              <a href="/forgot" className="link">
                Quên mật khẩu?
              </a>
            </div>

            <button
              type="button"
              className="btn"
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </div>

          {/* Social Login */}
          <div className="socialWrap">
            <p className="or">Hoặc đăng nhập với</p>
            <div className="socials">
              <button className="social gg">Google</button>
              <button className="social fb">Facebook</button>
              <button className="social git">Github</button>
            </div>
          </div>

          {/* Extra */}
          <p className="extra">
            Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
          </p>
        </div>
      </div>
    </>
  );
}
