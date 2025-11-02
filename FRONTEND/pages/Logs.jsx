import { useState, useEffect } from "react";
import "./Logs.css";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [date, setDate] = useState("");
  const [type, setType] = useState("workout");
  const [content, setContent] = useState("");
  const [feeling, setFeeling] = useState("");
  const [rpe, setRpe] = useState(5);
  const [userId, setUserId] = useState("");
  const [mealId, setMealId] = useState("");
  const [workoutId, setWorkoutId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const saved = localStorage.getItem("msc_logs_v4");
    if (saved) setLogs(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("msc_logs_v4", JSON.stringify(logs));
  }, [logs]);

  const addLog = async (e) => {
    e.preventDefault();
    if (!date || !content || !userId || !mealId || !workoutId) {
      alert("⚠️ Nhập đủ thông tin!");
      return;
    }

    const newLog = {
      id: Date.now(),
      date,
      type,
      content,
      feeling,
      rpe: parseInt(rpe),
      user_id: userId,
      meal_id: mealId,
      workout_id: workoutId,
    };

    try {
      const res = await fetch("http://127.0.0.1:5000/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLog),
      });
      const data = await res.json();
      if (res.ok) {
        setLogs([data, ...logs]);
        alert("✅ Đã lưu!");
        resetForm();
      } else {
        alert("❌ Lỗi: " + data.error);
      }
    } catch (err) {
      alert("❌ Lỗi: " + err.message);
    }
  };

  const resetForm = () => {
    setDate("");
    setType("workout");
    setContent("");
    setFeeling("");
    setRpe(5);
    setUserId("");
    setMealId("");
    setWorkoutId("");
    setShowModal(false);
  };

  const deleteLog = (id) => {
    if (confirm("Xóa log này?")) {
      setLogs(logs.filter((l) => l.id !== id));
    }
  };

  const filteredLogs = filter === "all" ? logs : logs.filter((l) => l.type === filter);

  return (
    <div className="logs-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="hero-icon">📒</span>
            Nhật Ký Tập Luyện
          </h1>
          <p className="hero-subtitle">Ghi lại mọi khoảnh khắc trên hành trình của bạn</p>
          <button className="btn-hero" onClick={() => setShowModal(true)}>
            <span className="btn-plus">+</span>
            Thêm Log Mới
          </button>
        </div>
      </div>

      <div className="logs-content">
        {/* Stats Cards */}
        <div className="stats-section">
          <div className="stat-box">
            <div className="stat-icon-wrap" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
              <span className="stat-emoji">💪</span>
            </div>
            <div className="stat-info">
              <div className="stat-num">{logs.filter((l) => l.type === "workout").length}</div>
              <div className="stat-label">Buổi Tập</div>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon-wrap" style={{ background: "linear-gradient(135deg, #f093fb, #f5576c)" }}>
              <span className="stat-emoji">🍽️</span>
            </div>
            <div className="stat-info">
              <div className="stat-num">{logs.filter((l) => l.type === "meal").length}</div>
              <div className="stat-label">Bữa Ăn</div>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon-wrap" style={{ background: "linear-gradient(135deg, #4facfe, #00f2fe)" }}>
              <span className="stat-emoji">📝</span>
            </div>
            <div className="stat-info">
              <div className="stat-num">{logs.length}</div>
              <div className="stat-label">Tổng Logs</div>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon-wrap" style={{ background: "linear-gradient(135deg, #fa709a, #fee140)" }}>
              <span className="stat-emoji">🔥</span>
            </div>
            <div className="stat-info">
              <div className="stat-num">
                {logs.length > 0 ? (logs.reduce((sum, l) => sum + l.rpe, 0) / logs.length).toFixed(1) : "0"}
              </div>
              <div className="stat-label">RPE TB</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="filter-section">
          <button className={`filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
            <span className="filter-icon">📋</span>
            Tất cả
            <span className="filter-count">{logs.length}</span>
          </button>
          <button className={`filter-btn ${filter === "workout" ? "active" : ""}`} onClick={() => setFilter("workout")}>
            <span className="filter-icon">💪</span>
            Tập luyện
            <span className="filter-count">{logs.filter((l) => l.type === "workout").length}</span>
          </button>
          <button className={`filter-btn ${filter === "meal" ? "active" : ""}`} onClick={() => setFilter("meal")}>
            <span className="filter-icon">🍽️</span>
            Ăn uống
            <span className="filter-count">{logs.filter((l) => l.type === "meal").length}</span>
          </button>
          <button className={`filter-btn ${filter === "other" ? "active" : ""}`} onClick={() => setFilter("other")}>
            <span className="filter-icon">📝</span>
            Khác
            <span className="filter-count">{logs.filter((l) => l.type === "other").length}</span>
          </button>
        </div>

        {/* Logs Grid */}
        {filteredLogs.length === 0 ? (
          <div className="empty-box">
            <div className="empty-icon">📭</div>
            <h2 className="empty-title">Chưa có log nào</h2>
            <p className="empty-text">Hãy bắt đầu ghi lại hành trình của bạn ngay hôm nay!</p>
            <button className="btn-empty" onClick={() => setShowModal(true)}>
              Tạo log đầu tiên
            </button>
          </div>
        ) : (
          <div className="logs-grid">
            {filteredLogs.map((log, idx) => (
              <div key={log.id} className="log-item" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="log-header">
                  <span className={`log-badge ${log.type}`}>
                    {log.type === "workout" ? "💪 Tập luyện" : log.type === "meal" ? "🍽️ Ăn uống" : "📝 Khác"}
                  </span>
                  <span className="log-date">📅 {log.date}</span>
                </div>
                <p className="log-text">{log.content}</p>
                {log.feeling && (
                  <div className="log-feeling">
                    <span className="feeling-icon">💭</span>
                    {log.feeling}
                  </div>
                )}
                <div className="log-footer">
                  <div className="rpe-bar">
                    <span className="rpe-label">RPE</span>
                    <div className="rpe-dots">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div
                          key={i}
                          className={`rpe-dot ${i < log.rpe ? "filled" : ""}`}
                          style={
                            i < log.rpe
                              ? {
                                  background:
                                    log.rpe <= 3 ? "#10b981" : log.rpe <= 6 ? "#f59e0b" : "#ef4444",
                                }
                              : {}
                          }
                        />
                      ))}
                    </div>
                    <span
                      className="rpe-num"
                      style={{
                        color: log.rpe <= 3 ? "#10b981" : log.rpe <= 6 ? "#f59e0b" : "#ef4444",
                      }}
                    >
                      {log.rpe}/10
                    </span>
                  </div>
                  <button className="btn-del" onClick={() => deleteLog(log.id)} title="Xóa">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-bg" onClick={resetForm}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h2 className="modal-title">✨ Thêm Log Mới</h2>
              <button className="modal-close" onClick={resetForm}>
                ✕
              </button>
            </div>

            <form onSubmit={addLog} className="modal-form">
              <div className="input-row">
                <div className="input-group">
                  <label className="input-label">📅 Ngày</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field" required />
                </div>
                <div className="input-group">
                  <label className="input-label">🏷️ Loại</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className="input-field">
                    <option value="workout">💪 Tập luyện</option>
                    <option value="meal">🍽️ Ăn uống</option>
                    <option value="other">📝 Khác</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">📝 Nội dung</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="input-field textarea-field"
                  rows="4"
                  placeholder="Mô tả chi tiết..."
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">😊 Cảm nhận</label>
                <input
                  value={feeling}
                  onChange={(e) => setFeeling(e.target.value)}
                  className="input-field"
                  placeholder="VD: Tràn đầy năng lượng..."
                />
              </div>

              <div className="input-group">
                <label className="input-label">
                  💯 Mức độ vất vả (RPE):{" "}
                  <strong style={{ color: rpe <= 3 ? "#10b981" : rpe <= 6 ? "#f59e0b" : "#ef4444" }}>
                    {rpe}/10
                  </strong>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={rpe}
                  onChange={(e) => setRpe(e.target.value)}
                  className="range-slider"
                  style={{
                    background: `linear-gradient(to right, ${
                      rpe <= 3 ? "#10b981" : rpe <= 6 ? "#f59e0b" : "#ef4444"
                    } ${rpe * 10}%, #e0e0e0 ${rpe * 10}%)`,
                  }}
                />
                <div className="range-labels">
                  <span>Dễ</span>
                  <span>Trung bình</span>
                  <span>Khó</span>
                </div>
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label className="input-label">🆔 User ID</label>
                  <input
                    type="number"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">🍽️ Meal ID</label>
                  <input
                    type="number"
                    value={mealId}
                    onChange={(e) => setMealId(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">💪 Workout ID</label>
                  <input
                    type="number"
                    value={workoutId}
                    onChange={(e) => setWorkoutId(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={resetForm} className="btn-cancel">
                  Hủy
                </button>
                <button type="submit" className="btn-save">
                  ✓ Lưu Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}