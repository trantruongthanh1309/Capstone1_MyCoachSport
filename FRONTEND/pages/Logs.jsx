import { useState, useEffect } from "react";
import styles from "./Logs.module.css";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [date, setDate] = useState("");
  const [type, setType] = useState("workout");
  const [content, setContent] = useState("");
  const [feeling, setFeeling] = useState("");
  const [rpe, setRpe] = useState(5);
  
  // Thêm các trường user_id, meal_id, workout_id vào form
  const [userId, setUserId] = useState("");   // user_id
  const [mealId, setMealId] = useState("");   // meal_id
  const [workoutId, setWorkoutId] = useState("");  // workout_id

  useEffect(() => {
    const saved = localStorage.getItem("msc_logs_v4");
    if (saved) setLogs(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("msc_logs_v4", JSON.stringify(logs));
  }, [logs]);

  // Hàm thêm log mới
  const addLog = async (e) => {
    e.preventDefault();

    // Kiểm tra các trường bắt buộc có dữ liệu chưa
    if (!date || !content || !userId || !mealId || !workoutId) {
      return alert("⚠️ Nhập đủ thông tin!");
    }

    const newLog = { date, type, content, feeling, rpe, user_id: userId, meal_id: mealId, workout_id: workoutId };

    // Gửi yêu cầu POST tới API Flask
    try {
      const response = await fetch("http://127.0.0.1:5000/api/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newLog),
      });

      const data = await response.json();

      if (response.ok) {
        setLogs([data, ...logs]);
        alert("✅ Log đã được lưu thành công!");
      } else {
        alert("❌ Lỗi khi lưu log: " + data.error);
      }
    } catch (error) {
      alert("❌ Đã xảy ra lỗi khi gửi yêu cầu: " + error.message);
    }

    // Reset form
    setDate("");
    setType("workout");
    setContent("");
    setFeeling("");
    setRpe(5);
    setUserId("");
    setMealId("");
    setWorkoutId("");
  };

  // Hàm xóa log
  const deleteLog = (id) => {
    if (window.confirm("Xóa log này?")) {
      setLogs(logs.filter((l) => l.id !== id));
    }
  };

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>📒 Nhật ký tập luyện & ăn uống</h1>

      {/* Form thêm log */}
      <form onSubmit={addLog} className={styles.form}>
        <div className={styles.row}>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={styles.input} />
          <select value={type} onChange={(e) => setType(e.target.value)} className={styles.input}>
            <option value="workout">💪 Tập luyện</option>
            <option value="meal">🍽️ Ăn uống</option>
            <option value="other">📝 Khác</option>
          </select>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Nội dung chi tiết..."
          className={styles.input}
          rows={3}
        />

        <div className={styles.row}>
          <input
            value={feeling}
            onChange={(e) => setFeeling(e.target.value)}
            placeholder="Cảm nhận (VD: sung, mệt, no bụng...)"
            className={styles.input}
          />
          <div className={styles.rpe}>
            <label>RPE: {rpe}</label>
            <input type="range" min="1" max="10" value={rpe} onChange={(e) => setRpe(e.target.value)} />
          </div>
        </div>

        {/* Thêm các trường nhập cho user_id, meal_id, workout_id */}
        <input
          type="number"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className={styles.input}
          required
        />
        <input
          type="number"
          placeholder="Meal ID"
          value={mealId}
          onChange={(e) => setMealId(e.target.value)}
          className={styles.input}
          required
        />
        <input
          type="number"
          placeholder="Workout ID"
          value={workoutId}
          onChange={(e) => setWorkoutId(e.target.value)}
          className={styles.input}
          required
        />

        <button type="submit" className={styles.btn}>+ Thêm log</button>
      </form>

      {/* List log */}
      {logs.length === 0 ? (
        <p className={styles.empty}>Chưa có log nào, hãy thêm mới!</p>
      ) : (
        <div className={styles.grid}>
          {logs.map((l) => (
            <div key={l.id} className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.badge}>
                  {l.type === "workout" ? "💪 Tập" : l.type === "meal" ? "🍽️ Ăn" : "📝 Khác"}
                </span>
                <span className={styles.date}>{l.date}</span>
              </div>
              <p className={styles.content}>{l.content}</p>
              {l.feeling && <p className={styles.feel}>😌 {l.feeling}</p>}
              <p className={styles.rpeShow}>RPE: {l.rpe}</p>
              <button onClick={() => deleteLog(l.id)} className={styles.deleteBtn}>Xóa</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
