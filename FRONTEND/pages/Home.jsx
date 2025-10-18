import { useEffect, useState } from "react";
import styles from "./Home.module.css";

const API_BASE = "http://localhost:5000";

export default function Home() {
  const [now, setNow] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const [msg, setMsg] = useState("");
  const [log, setLog] = useState([]);
  const [openChat, setOpenChat] = useState(false);

  // Clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Weather
  useEffect(() => {
    fetch(`${API_BASE}/api/weather`)
      .then(r => r.json())
      .then(setWeather)
      .catch(() => setWeather({ error: "Không tải được thời tiết" }));
  }, []);

  // Chat
  const send = async () => {
    const content = msg.trim();
    if (!content) return;
    setLog(l => [...l, { who: "you", text: content }]);
    setMsg("");
    try {
      const r = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });
      const j = await r.json();
      setLog(l => [...l, { who: "bot", text: j.reply || "⚠️ Lỗi server" }]);
    } catch {
      setLog(l => [...l, { who: "bot", text: "❌ Backend error" }]);
    }
  };

  return (
    <main className={styles.home}>
      {/* Clock chính giữa */}
      <div className={styles.clockWrap}>
        <div className={styles.clock}>{now.toLocaleTimeString("vi-VN")}</div>
        <div className={styles.date}>
          {now.toLocaleDateString("vi-VN", {
            weekday: "long", year: "numeric", month: "long", day: "numeric"
          })}
        </div>
      </div>

      {/* Weather phía dưới */}
      <div className={styles.weatherWrap}>
        {!weather ? (
          <div className={styles.weather}>⏳ Đang tải...</div>
        ) : weather.error ? (
          <div className={styles.weather}>⚠️ {weather.error}</div>
        ) : (
          <div className={styles.weatherBox}>
            <img src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} alt="weather"/>
            <div>
              <h2>{weather.city}</h2>
              <p>{weather.description}</p>
              <p>🌡 {weather.temp}°C (cảm giác {weather.feels_like}°C)</p>
              <p>💧 {weather.humidity}% | 💨 {weather.wind} m/s</p>
            </div>
          </div>
        )}
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
                <div key={i} className={`${styles.msg} ${m.who === "you" ? styles.you : styles.bot}`}>
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
