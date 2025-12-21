import { useState, useEffect, useRef } from "react";
import "./ChatBox.css";

export default function ChatBox() {
  const [msg, setMsg] = useState("");
  const [log, setLog] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState(
    localStorage.getItem("user_id") || sessionStorage.getItem("user_id")
  );
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [log, isTyping]);

  // Auto focus input when chat opens or after sending message
  useEffect(() => {
    if (isOpen && !isTyping) {
      // Small delay to ensure input is rendered
      const timer = setTimeout(() => {
        try {
          inputRef.current?.focus();
        } catch (err) {
          console.error("Focus error:", err);
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isTyping]);

  useEffect(() => {
    if (!userId) {
      fetch(`/api/auth/me`, { credentials: 'include' })
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
      fetch(`/api/bot/chat/history`, {
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

  const handleChipClick = (text) => {
    setMsg(text);
    // Optional: Auto send or just set text. Let's auto send for "Smart" feel.
    // We need to use state updater or just call send with the text directly
    // But send() uses 'msg' state. So we need to set msg then send.
    // Better: modify send to accept optional argument
    send(text);
  };

  const send = async (textOverride = null) => {
    const content = textOverride || msg.trim();
    if (!content || isTyping) return;

    setLog(l => [...l, { who: "you", text: content, timestamp: new Date().toISOString() }]);
    setMsg("");
    setIsTyping(true);

    try {
      const currentUserId = userId || localStorage.getItem("user_id");
      const r = await fetch(`/api/bot/chat`, {
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
      
      // Auto focus input after bot responds for continuous chat
      setTimeout(() => {
        try {
          inputRef.current?.focus();
        } catch (err) {
          console.error("Focus error after response:", err);
        }
      }, 150);
    } catch (err) {
      console.error("Chat error:", err);
      setIsTyping(false);
      setLog(l => [...l, { who: "bot", text: "❌ Backend error", timestamp: new Date().toISOString() }]);
      
      // Auto focus even on error
      setTimeout(() => {
        try {
          inputRef.current?.focus();
        } catch (focusErr) {
          console.error("Focus error after error:", focusErr);
        }
      }, 150);
    }
  };

  const clearHistory = async () => {
    if (!confirm("Bạn có chắc muốn xóa toàn bộ lịch sử chat?")) return;

    try {
      await fetch(`/api/bot/chat/history/clear`, {
        method: "DELETE",
        credentials: "include"
      });
      setLog([]);
    } catch (err) {
      console.error("Failed to clear history", err);
    }
  };

  const chips = [
    { label: "📅 Lịch hôm nay", text: "Lịch tập hôm nay của tôi thế nào?" },
    { label: "🥗 Gợi ý món ăn", text: "Gợi ý món ăn cho tôi" },
    { label: "💪 Gợi ý bài tập", text: "Gợi ý bài tập cho tôi" },
    { label: "📊 Chỉ số của tôi", text: "Chỉ số cơ thể của tôi" },
  ];

  return (
    <>
      {!isOpen && (
        <button className="chat-float-btn" onClick={() => setIsOpen(true)}>
          <span className="chat-icon">💬</span>
          <span className="chat-badge">10x</span>
        </button>
      )}

      {isOpen && (
        <div className="chatbox-container chatbox-floating">
          <div className="chatbox-header">
            <div className="chatbox-title">
              <div className="chatbox-avatar">🤖</div>
              <div className="chatbox-info">
                <h3>AI Coach Pro</h3>
                <div className="chatbox-status">
                  <span className="status-dot"></span> Online
                </div>
              </div>
            </div>
            <div className="chatbox-actions">
              <button onClick={clearHistory} title="Xóa lịch sử">🗑️</button>
              <button onClick={() => setIsOpen(false)} title="Đóng">✕</button>
            </div>
          </div>

          <div className="chatbox-messages">
            {log.length === 0 && (
              <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '20px', fontSize: '0.9rem' }}>
                👋 Chào bạn! Tôi là Coach AI.<br />Hãy hỏi tôi về lịch tập, dinh dưỡng nhé!
              </div>
            )}

            {log.map((m, i) => (
              <div key={i} className={`message-wrapper ${m.who}`}>
                {m.who === 'bot' && <div className="bot-avatar-small">🤖</div>}
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
                <div className="bot-avatar-small">🤖</div>
                <div className="message bot typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <div className="quick-chips">
            {chips.map((chip, idx) => (
              <div
                key={idx}
                className="chip"
                onClick={() => handleChipClick(chip.text)}
              >
                {chip.label}
              </div>
            ))}
          </div>

          <div className="chatbox-input">
            <input
              ref={inputRef}
              className="chat-input"
              placeholder="Hỏi AI Coach điều gì đó..."
              value={msg}
              onChange={e => setMsg(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              disabled={isTyping}
              autoFocus
            />
            <button
              onClick={() => send()}
              className="send-btn"
              disabled={isTyping || !msg.trim()}
            >
              <span style={{ fontSize: '1.2rem', marginLeft: '2px' }}>➤</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
