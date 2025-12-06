import { useState, useEffect, useRef } from "react";
import "./ChatBox.css";

const API_BASE = "http://localhost:5000";

export default function ChatBox() {
  const [msg, setMsg] = useState("");
  const [log, setLog] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState(
    localStorage.getItem("user_id") || sessionStorage.getItem("user_id")
  );
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [log, isTyping]);

  useEffect(() => {
    if (!userId) {
      fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUserId(data.user_id);
            localStorage.setItem("user_id", data.user_id);
          }
        })
        .catch(err => console.error("Auth check failed", err));
    }
  }, []);

  useEffect(() => {
    if (userId && isOpen) {
      fetch(`${API_BASE}/api/bot/chat/history`, {
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.history) {
            const formattedHistory = data.history.flatMap(h => [
              { who: "you", text: h.message, timestamp: h.timestamp },
              { who: "bot", text: h.response, timestamp: h.timestamp }
            ]);
            setLog(formattedHistory);
          }
        })
        .catch(err => console.error("Failed to load history", err));
    }
  }, [userId, isOpen]);

  const send = async () => {
    const content = msg.trim();
    if (!content || isTyping) return;

    setLog(l => [...l, { who: "you", text: content, timestamp: new Date().toISOString() }]);
    setMsg("");
    setIsTyping(true);

    try {
      const currentUserId = userId || localStorage.getItem("user_id");
      const r = await fetch(`${API_BASE}/api/bot/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: content, user_id: currentUserId })
      });
      const j = await r.json();
      setIsTyping(false);
      setLog(l => [...l, {
        who: "bot",
        text: j.response || "⚠️ Lỗi server",
        timestamp: new Date().toISOString()
      }]);
    } catch {
      setIsTyping(false);
      setLog(l => [...l, { who: "bot", text: "❌ Backend error", timestamp: new Date().toISOString() }]);
    }
  };

  const clearHistory = async () => {
    if (!confirm("Bạn có chắc muốn xóa toàn bộ lịch sử chat?")) return;

    try {
      await fetch(`${API_BASE}/api/bot/chat/history/clear`, {
        method: "DELETE",
        credentials: "include"
      });
      setLog([]);
    } catch (err) {
      console.error("Failed to clear history", err);
    }
  };

  return (
    <>
      {}
      {!isOpen && (
        <button className="chat-float-btn" onClick={() => setIsOpen(true)}>
          <span className="chat-icon">💬</span>
          <span className="chat-badge">AI</span>
        </button>
      )}

      {}
      {isOpen && (
        <div className="chatbox-container chatbox-floating">
          <div className="chatbox-header">
            <div className="chatbox-title">
              <span className="chatbox-icon">🤖</span>
              <h3>AI Coach</h3>
              <span className="chatbox-status">Online</span>
            </div>
            <div className="chatbox-actions">
              <button onClick={clearHistory} className="clear-btn" title="Xóa lịch sử">
                🗑️
              </button>
              <button onClick={() => setIsOpen(false)} className="close-btn" title="Đóng">
                ✖
              </button>
            </div>
          </div>

          <div className="chatbox-messages">
            {log.map((m, i) => (
              <div key={i} className={`message-wrapper ${m.who}`}>
                <div className={`message ${m.who}`}>
                  <div className="message-content">{m.text}</div>
                  {m.timestamp && (
                    <div className="message-time">
                      {new Date(m.timestamp).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message-wrapper bot">
                <div className="message bot typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <div className="chatbox-input">
            <input
              className="chat-input"
              placeholder="Nhập tin nhắn..."
              value={msg}
              onChange={e => setMsg(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              disabled={isTyping}
            />
            <button
              onClick={send}
              className="send-btn"
              disabled={isTyping || !msg.trim()}
            >
              <span>➤</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
