import { useEffect, useState } from "react";
import styles from "./Home.module.css";

const API_BASE = "http://localhost:5000";
const WEATHER_API_KEY = "40dfa2d8e73afabb299edc21486cb2c3"; // Thay bằng API key của bạn
const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";

export default function Home() {
  const [now, setNow] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const [msg, setMsg] = useState("");
  const [log, setLog] = useState([]);
  const [openChat, setOpenChat] = useState(false);

  // Lấy vị trí người dùng
  const getWeather = (latitude, longitude) => {
    fetch(
      `${WEATHER_API_URL}?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric&lang=vi`
    )
      .then((response) => response.json())
      .then((data) => {
        setWeather({
          city: data.name,
          description: data.weather[0].description,
          temp: data.main.temp,
          feels_like: data.main.feels_like,
          humidity: data.main.humidity,
          wind: data.wind.speed,
          icon: data.weather[0].icon,
        });
      })
      .catch(() => setWeather({ error: "Không tải được thời tiết" }));
  };

  // Clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Lấy vị trí người dùng và gọi API thời tiết
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Latitude:", latitude, "Longitude:", longitude); // In ra tọa độ chính xác
        // Gọi API thời tiết với tọa độ chính xác
        getWeather(latitude, longitude);
      },
      (error) => {
        console.log("Không thể lấy vị trí của bạn:", error);
      }
    );
  }, []);

  // Chat
  const send = async () => {
    const content = msg.trim();
    if (!content) return;
    setLog((l) => [...l, { who: "you", text: content }]);
    setMsg("");
    try {
      const r = await fetch(`${API_BASE}/api/bot/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });
      const j = await r.json();
      setLog((l) => [...l, { who: "bot", text: j.response || "⚠️ Lỗi server" }]);
    } catch {
      setLog((l) => [...l, { who: "bot", text: "❌ Backend error" }]);
    }
  };

  return (
    <main className={styles.home}>
      {/* Chào mừng */}
      <div className={styles.greeting}>
        <h1>Chào mừng đến với MySportCoachAI</h1>
        <p>
          Trợ lý AI thông minh giúp bạn đạt được mục tiêu thể thao và sức khỏe.
        </p>
      </div>

      {/* Clock chính giữa */}
      <div className={styles.clockWrap}>
        <div className={styles.clock}>{now.toLocaleTimeString("vi-VN")}</div>
        <div className={styles.date}>
          {now.toLocaleDateString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Weather phía dưới (Hiển thị thời tiết dựa trên vị trí người dùng) */}
      <div className={styles.weatherWrap}>
        {!weather ? (
          <div className={styles.weather}>⏳ Đang tải...</div>
        ) : weather.error ? (
          <div className={styles.weather}>⚠️ {weather.error}</div>
        ) : (
          <div className={styles.weatherBox}>
            <img
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
              alt="weather"
            />
            <div>
              <h2>{weather.city}</h2>
              <p>{weather.description}</p>
              <p>
                🌡 {weather.temp}°C (cảm giác {weather.feels_like}°C)
              </p>
              <p>
                💧 {weather.humidity}% | 💨 {weather.wind} m/s
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3 Thẻ thông tin bổ sung */}
      <div className={styles.cardsContainer}>
        <div className={styles.card}>
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUX2xKo9dXPRAGJ4ceP-sJ_5hgZfcM9s0nqg&s"
            alt="Kế hoạch tập luyện"
            className={styles.cardIcon}
          />
          <h3>Lập kế hoạch tập luyện</h3>
          <p>Nhận lịch tập cá nhân hóa theo mục tiêu và trình độ của bạn.</p>
        </div>

        <div className={styles.card}>
          <img
            src="https://png.pngtree.com/png-clipart/20210903/ourmid/pngtree-nutritional-egg-baby-meal-png-image_3854560.png"
            alt="Kế hoạch dinh dưỡng"
            className={styles.cardIcon}
          />
          <h3>Kế hoạch dinh dưỡng</h3>
          <p>Thực đơn được tùy chỉnh để hỗ trợ mục tiêu thể hình của bạn.</p>
        </div>

        <div className={styles.card}>
          <img
            src="data:image/jpeg;base64,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"
            alt="Theo dõi tiến độ"
            className={styles.cardIcon}
          />
          <h3>Theo dõi tiến độ</h3>
          <p>Giúp kiểm tra và phân tích sự tiến bộ của bạn theo thời gian.</p>
        </div>
      </div>

      {/* Chatbox góc phải dưới */}
      <div className={styles.chatFloat}>
        {openChat ? (
          <div className={styles.chatBox}>
            <div className={styles.chatHeader}>
              <span>💬 Chatbot</span>
              <button onClick={() => setOpenChat(false)}>✖</button>
            </div>
            <div className={styles.chatBody}>
              {log.map((m, i) => (
                <div
                  key={i}
                  className={`${styles.msg} ${m.who === "you" ? styles.you : styles.bot
                    }`}
                >
                  {m.text}
                </div>
              ))}
            </div>
            <div className={styles.chatSend}>
              <input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Nhập tin nhắn..."
                onKeyDown={(e) => e.key === "Enter" && send()}
              />
              <button onClick={send}>Gửi</button>
            </div>
          </div>
        ) : (
          <button className={styles.openBtn} onClick={() => setOpenChat(true)}>
            💬
          </button>
        )}
      </div>
    </main>
  );
}
