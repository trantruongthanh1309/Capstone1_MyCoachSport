import { useState, useEffect } from "react";
import axios from "axios";
import "./Logs.css";
import { useToast } from "../contexts/ToastContext";
import { validateLogContent } from "../utils/validation";

export default function Logs() {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState("workout");
  const [content, setContent] = useState("");
  const [feeling, setFeeling] = useState("");
  const [rpe, setRpe] = useState(5);
  const [rating, setRating] = useState(5);

  const [mealId, setMealId] = useState("");
  const [workoutId, setWorkoutId] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("all");

  const API_URL = "/api/logs";

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL, { withCredentials: true });
      if (res.data.success) {
        const mappedLogs = res.data.data.map(log => ({
          id: log.id,
          date: log.day,
          type: log.workoutName ? "workout" : (log.mealName ? "meal" : "other"),
          content: log.notes,
          feeling: log.feedbackType,
          rpe: log.rpe || 0,
          rating: log.rating || 0,
          mealName: log.mealName,
          workoutName: log.workoutName
        }));
        setLogs(mappedLogs);
      }
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const addLog = async (e) => {
    e.preventDefault();

    // Validate log content
    if (!content.trim()) {
      toast.error("❌ Vui lòng nhập ghi chú");
      return;
    }
    
    const contentValidation = validateLogContent(content);
    if (!contentValidation.valid) {
      toast.error(`❌ ${contentValidation.message}`);
      return;
    }

    const newLog = {
      day: date,
      notes: content,
      rpe: parseInt(rpe),
      rating: parseInt(rating),
      feedback_type: feeling,
      meal_id: mealId ? parseInt(mealId) : null,
      workout_id: workoutId ? parseInt(workoutId) : null
    };

    try {
      const res = await axios.post(`${API_URL}/create`, newLog, { withCredentials: true });
      if (res.data.success) {
        toast.success("✅ Đã lưu log thành công!");
        resetForm();
        fetchLogs();
      } else {
        toast.error("❌ Lỗi: " + res.data.error);
      }
    } catch (err) {
      toast.error("❌ Lỗi kết nối: " + err.message);
    }
  };

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setType("workout");
    setContent("");
    setFeeling("");
    setRpe(5);
    setRating(5);
    setMealId("");
    setWorkoutId("");
    setShowModal(false);
  };

  const filteredLogs = filter === "all" ? logs : logs.filter((l) => l.type === filter);

  return (
    <div className="logs-page">
      {}
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
        {}
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
        </div>

        {}
        <div className="filter-section">
          <button className={`filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
            Tất cả ({logs.length})
          </button>
          <button className={`filter-btn ${filter === "workout" ? "active" : ""}`} onClick={() => setFilter("workout")}>
            Tập luyện
          </button>
          <button className={`filter-btn ${filter === "meal" ? "active" : ""}`} onClick={() => setFilter("meal")}>
            Ăn uống
          </button>
        </div>

        {}
        {loading ? (
          <div className="loading-text">Đang tải nhật ký...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="empty-box">
            <h2 className="empty-title">Chưa có log nào</h2>
            <button className="btn-empty" onClick={() => setShowModal(true)}>
              Tạo log đầu tiên
            </button>
          </div>
        ) : (
          <div className="logs-grid">
            {filteredLogs.map((log, idx) => (
              <div key={log.id} className="log-item">
                <div className="log-header">
                  <span className={`log-badge ${log.type}`}>
                    {log.type === "workout" ? "💪 Tập luyện" : log.type === "meal" ? "🍽️ Ăn uống" : "📝 Khác"}
                  </span>
                  <span className="log-date">📅 {log.date}</span>
                </div>

                {log.workoutName && <div className="log-ref">Bài tập: <strong>{log.workoutName}</strong></div>}
                {log.mealName && <div className="log-ref">Món ăn: <strong>{log.mealName}</strong></div>}

                <p className="log-text">{log.content}</p>

                {log.feeling && (
                  <div className="log-feeling">
                    <span className="feeling-icon">💭</span> {log.feeling}
                  </div>
                )}

                <div className="log-footer">
                  <div className="rpe-bar">
                    <span className="rpe-label">RPE: {log.rpe}/10</span>
                    <div className="rpe-dots">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className={`rpe-dot ${i < log.rpe ? "filled" : ""}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {}
      {showModal && (
        <div className="modal-bg" onClick={resetForm}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h2 className="modal-title">✨ Thêm Log Mới</h2>
              <button className="modal-close" onClick={resetForm}>✕</button>
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

              {}
              {type === 'workout' && (
                <div className="input-group">
                  <label className="input-label">💪 Workout ID (Tùy chọn)</label>
                  <input type="number" value={workoutId} onChange={(e) => setWorkoutId(e.target.value)} className="input-field" placeholder="Nhập ID bài tập..." />
                </div>
              )}

              {type === 'meal' && (
                <div className="input-group">
                  <label className="input-label">🍽️ Meal ID (Tùy chọn)</label>
                  <input type="number" value={mealId} onChange={(e) => setMealId(e.target.value)} className="input-field" placeholder="Nhập ID món ăn..." />
                </div>
              )}

              <div className="input-group">
                <label className="input-label">📝 Ghi chú</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="input-field textarea-field"
                  rows="3"
                  placeholder="Hôm nay tập thế nào?"
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">💭 Cảm nhận (Feedback Type)</label>
                <input
                  value={feeling}
                  onChange={(e) => setFeeling(e.target.value)}
                  className="input-field"
                  placeholder="VD: Mệt, Hưng phấn, Đau cơ..."
                />
              </div>

              <div className="input-group">
                <label className="input-label">💯 Mức độ vất vả (RPE): <strong>{rpe}/10</strong></label>
                <input
                  type="range" min="1" max="10" value={rpe}
                  onChange={(e) => setRpe(e.target.value)}
                  className="range-slider"
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={resetForm} className="btn-cancel">Hủy</button>
                <button type="submit" className="btn-save">✓ Lưu Log</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}