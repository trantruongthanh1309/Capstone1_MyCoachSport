import { useState, useEffect } from "react";
import "./Planner.css";
import "./PlannerEnhanced.css";
import "./PlannerCompact.css";
import SwapButton from "../components/SwapButton";
import { useToast } from "../contexts/ToastContext";

export default function Planner() {
  const [weeklyPlan, setWeeklyPlan] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const toast = useToast();

  // ✅ DÙNG USER_ID THẬT CỦA BẠN
  const currentUser = { id: 18 };

  // Hàm lấy ngày Thứ 2 của tuần hiện tại
  const getMonday = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Nếu Chủ nhật thì lùi 6 ngày, không thì tính từ Thứ 2
    return new Date(d.setDate(diff));
  };

  const getDates = (startDate, days) => {
    const dates = [];
    const date = new Date(startDate);
    for (let i = 0; i < days; i++) {
      dates.push(new Date(date).toISOString().split("T")[0]);
      date.setDate(date.getDate() + 1);
    }
    return dates;
  };

  // Mảng tên ngày theo thứ tự JavaScript getDay() (0=CN, 1=T2, 2=T3...)
  const getDayName = (dateStr) => {
    const dayNames = [
      "Chủ nhật",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
    ];
    const date = new Date(dateStr);
    return dayNames[date.getDay()];
  };

  const mealTimes = ["morning", "afternoon", "evening"];
  const mealTimeLabels = ["Bữa sáng", "Bữa trưa", "Bữa tối"];

  const fetchWeeklyPlan = async () => {
    setLoading(true);
    setError("");
    const monday = getMonday(new Date()); // Bắt đầu từ Thứ 2
    const dates = getDates(monday, 7);
    const plan = {};

    try {
      for (const date of dates) {
        const res = await fetch(
          `http://localhost:5000/api/ai/schedule?user_id=${currentUser.id}&date=${date}`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error(`Lỗi ngày ${date}`);
        const data = await res.json();
        plan[date] = data.schedule || [];
      }
      setWeeklyPlan(plan);
    } catch (err) {
      console.error("Lỗi tải lịch:", err);
      setError("Không thể tải lịch từ AI Coach.");
    } finally {
      setLoading(false);
    }
  };

  const sendFeedback = async (itemId, type, rating) => {
    try {
      const payload = { user_id: currentUser.id, rating };
      if (type === "meal") payload.meal_id = itemId;
      else payload.workout_id = itemId;

      await fetch("http://localhost:5000/api/ai/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      fetchWeeklyPlan();
    } catch (err) {
      toast.error("Gửi phản hồi thất bại.");
    }
  };

  const showItemDetail = (item) => {
    if (item.type === "meal") {
      setDetailItem({
        title: item.data.Name,
        content: `Calo: ${item.data.Kcal || 0} kcal\nProtein: ${item.data.Protein || 0
          }g\nCarb: ${item.data.Carb || 0}g\nFat: ${item.data.Fat || 0}g`,
      });
    } else {
      setDetailItem({
        title: item.data.Name,
        content: `Môn: ${item.data.Sport || "N/A"}\nNhóm cơ: ${item.data.MuscleGroups || "N/A"
          }\nThời gian: ${item.data.Duration_min || 0} phút\nCường độ: ${item.data.Intensity || "N/A"
          }\nDụng cụ: ${item.data.Equipment || "N/A"}`,
      });
    }
    setShowDetail(true);
  };

  useEffect(() => {
    fetchWeeklyPlan();
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner"></div><p>⏳ Đang tải lịch trình...</p></div>;
  if (error) return <div className="error-screen"><p>❌ {error}</p></div>;

  const monday = getMonday(new Date());
  const dates = getDates(monday, 7);

  return (
    <div className="planner-wrap">
      <div className="planner-header">
        <h1 className="planner-title">🗓️ Lịch Trình Cá Nhân Hóa</h1>
        <p className="planner-subtitle">Kế hoạch ăn uống & tập luyện được AI tối ưu riêng cho bạn</p>
      </div>

      <div className="user-actions">
        <button className="btn-primary" onClick={fetchWeeklyPlan}>
          <span className="btn-icon">🔄</span>
          <span>Tải lại lịch</span>
        </button>
      </div>

      {/* MEAL PLAN */}
      <div className="section meal-section">
        <div className="section-header">
          <h2><span className="emoji">🍽</span> Kế Hoạch Ăn Uống</h2>
        </div>
        <div className="table-container">
          <table className="planner-table">
            <thead>
              <tr>
                <th className="sticky-col">Bữa</th>
                {dates.map((date) => (
                  <th key={date}>
                    <div className="day-header">
                      <span className="day-name">{getDayName(date)}</span>
                      <span className="day-date">{new Date(date).getDate()}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mealTimeLabels.map((label, idx) => (
                <tr key={label}>
                  <td className="sticky-col meal-time-label">
                    <span className="time-icon">{idx === 0 ? '🌅' : idx === 1 ? '☀️' : '🌙'}</span>
                    <span>{label}</span>
                  </td>
                  {dates.map((date) => {
                    const schedule = weeklyPlan[date] || [];
                    const mealItem = schedule.find(
                      (item) =>
                        item.type === "meal" &&
                        item.data.MealType === mealTimes[idx]
                    );
                    return (
                      <td key={date} className="cell-content">
                        {mealItem ? (
                          <div className="item-card meal-card">
                            <div className="item-header">
                              <h3 className="item-title">{mealItem.data.Name}</h3>
                            </div>
                            <div className="item-meta">
                              <span className="meta-badge">🔥 {mealItem.data.Kcal} kcal</span>
                              <span className="meta-badge">💪 {mealItem.data.Protein}g</span>
                            </div>
                            <div className="item-actions">
                              <button
                                className="action-btn like-btn"
                                onClick={() => sendFeedback(mealItem.data.Id, "meal", 5)}
                                title="Thích"
                              >
                                👍
                              </button>
                              <button
                                className="action-btn dislike-btn"
                                onClick={() => sendFeedback(mealItem.data.Id, "meal", 2)}
                                title="Không thích"
                              >
                                👎
                              </button>
                              <button
                                className="action-btn info-btn"
                                onClick={() => showItemDetail(mealItem)}
                                title="Chi tiết"
                              >
                                ℹ️
                              </button>
                              <SwapButton item={{ ...mealItem, date }} type="meal" userId={currentUser.id} onSwapSuccess={fetchWeeklyPlan} />
                            </div>
                          </div>
                        ) : (
                          <div className="empty-cell">-</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* WORKOUT PLAN */}
      <div className="section workout-section">
        <div className="section-header">
          <h2><span className="emoji">🏋️</span> Kế Hoạch Tập Luyện</h2>
        </div>
        <div className="table-container">
          <table className="planner-table">
            <thead>
              <tr>
                <th className="sticky-col">Buổi</th>
                {dates.map((date) => (
                  <th key={date}>
                    <div className="day-header">
                      <span className="day-name">{getDayName(date)}</span>
                      <span className="day-date">{new Date(date).getDate()}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="sticky-col meal-time-label">
                  <span className="time-icon">🌅</span>
                  <span>Buổi sáng</span>
                </td>
                {dates.map((date) => {
                  const schedule = weeklyPlan[date] || [];
                  const workoutItem = schedule.find(
                    (item) => item.type === "workout" && item.time === "morning_slot"
                  );
                  return (
                    <td key={date} className="cell-content">
                      {workoutItem ? (
                        <div className="item-card workout-card">
                          <div className="item-header">
                            <h3 className="item-title">{workoutItem.data.Name}</h3>
                          </div>
                          <div className="item-meta">
                            <span className="meta-badge">⏱️ {workoutItem.data.Duration_min} phút</span>
                            <span className="meta-badge">💪 {workoutItem.data.Intensity}</span>
                          </div>
                          <div className="item-actions">
                            <button
                              className="action-btn like-btn"
                              onClick={() => sendFeedback(workoutItem.data.Id, "workout", 5)}
                              title="Thích"
                            >
                              👍
                            </button>
                            <button
                              className="action-btn dislike-btn"
                              onClick={() => sendFeedback(workoutItem.data.Id, "workout", 2)}
                              title="Không thích"
                            >
                              👎
                            </button>
                            <button
                              className="action-btn info-btn"
                              onClick={() => showItemDetail(workoutItem)}
                              title="Chi tiết"
                            >
                              ℹ️
                            </button>
                            <SwapButton item={{ ...workoutItem, date }} type="workout" userId={currentUser.id} onSwapSuccess={fetchWeeklyPlan} />
                          </div>
                        </div>
                      ) : (
                        <div className="empty-cell">-</div>
                      )}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="sticky-col meal-time-label">
                  <span className="time-icon">🌙</span>
                  <span>Buổi tối</span>
                </td>
                {dates.map((date) => {
                  const schedule = weeklyPlan[date] || [];
                  const workoutItem = schedule.find(
                    (item) => item.type === "workout" && item.time === "evening_slot"
                  );
                  return (
                    <td key={date} className="cell-content">
                      {workoutItem ? (
                        <div className="item-card workout-card">
                          <div className="item-header">
                            <h3 className="item-title">{workoutItem.data.Name}</h3>
                          </div>
                          <div className="item-meta">
                            <span className="meta-badge">⏱️ {workoutItem.data.Duration_min} phút</span>
                            <span className="meta-badge">💪 {workoutItem.data.Intensity}</span>
                          </div>
                          <div className="item-actions">
                            <button
                              className="action-btn like-btn"
                              onClick={() => sendFeedback(workoutItem.data.Id, "workout", 5)}
                              title="Thích"
                            >
                              👍
                            </button>
                            <button
                              className="action-btn dislike-btn"
                              onClick={() => sendFeedback(workoutItem.data.Id, "workout", 2)}
                              title="Không thích"
                            >
                              👎
                            </button>
                            <button
                              className="action-btn info-btn"
                              onClick={() => showItemDetail(workoutItem)}
                              title="Chi tiết"
                            >
                              ℹ️
                            </button>
                            <SwapButton item={{ ...workoutItem, date }} type="workout" userId={currentUser.id} onSwapSuccess={fetchWeeklyPlan} />
                          </div>
                        </div>
                      ) : (
                        <div className="empty-cell">-</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CHI TIẾT */}
      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{detailItem?.title}</h3>
              <button className="modal-close" onClick={() => setShowDetail(false)}>✕</button>
            </div>
            <div className="modal-content">
              <pre className="detail-pre">{detailItem?.content}</pre>
            </div>
            <div className="modal-footer">
              <button className="btn-close" onClick={() => setShowDetail(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

