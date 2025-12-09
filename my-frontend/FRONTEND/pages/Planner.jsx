import { useState, useEffect } from "react";
import "./Planner.css";

import SwapButton from "../components/SwapButton";
import { useToast } from "../contexts/ToastContext";

export default function Planner() {
  const [weeklyPlan, setWeeklyPlan] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const toast = useToast();

  const currentUser = { id: 18 };

  const getMonday = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
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
    const monday = getMonday(new Date());
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
        type: "meal",
        title: item.data.Name,
        data: item.data
      });
    } else {
      setDetailItem({
        type: "workout",
        title: item.data.Name,
        data: item.data
      });
    }
    setShowDetail(true);
  };

  const handleComplete = async (scheduleId) => {
    try {
      const res = await fetch('http://localhost:5000/api/leaderboard/complete-schedule-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ schedule_id: scheduleId })
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        fetchWeeklyPlan();
      } else {
        toast.error(data.error || 'Lỗi khi hoàn thành');
      }
    } catch (err) {
      console.error('Error completing item:', err);
      toast.error('Lỗi kết nối');
    }
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

      { }
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

                            { }
                            <button
                              className={`btn-complete ${mealItem.is_completed ? 'completed' : ''}`}
                              onClick={() => handleComplete(mealItem.schedule_id)}
                              disabled={mealItem.is_completed}
                            >
                              {mealItem.is_completed ? '✅ Đã ăn' : '☑️ Hoàn thành'}
                            </button>

                            { }
                            <div className="item-actions-compact">
                              <button
                                className="action-btn-small like"
                                onClick={() => sendFeedback(mealItem.data.Id, "meal", 5)}
                                title="Thích"
                              >
                                👍
                              </button>
                              <button
                                className="action-btn-small dislike"
                                onClick={() => sendFeedback(mealItem.data.Id, "meal", 2)}
                                title="Không thích"
                              >
                                👎
                              </button>
                              <button
                                className="action-btn-small info"
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

      { }
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

                          { }
                          <button
                            className={`btn-complete ${workoutItem.is_completed ? 'completed' : ''}`}
                            onClick={() => handleComplete(workoutItem.schedule_id)}
                            disabled={workoutItem.is_completed}
                          >
                            {workoutItem.is_completed ? '✅ Đã tập' : '☑️ Hoàn thành'}
                          </button>

                          { }
                          <div className="item-actions-compact">
                            <button
                              className="action-btn-small like"
                              onClick={() => sendFeedback(workoutItem.data.Id, "workout", 5)}
                              title="Thích"
                            >
                              👍
                            </button>
                            <button
                              className="action-btn-small dislike"
                              onClick={() => sendFeedback(workoutItem.data.Id, "workout", 2)}
                              title="Không thích"
                            >
                              👎
                            </button>
                            <button
                              className="action-btn-small info"
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

                          { }
                          <button
                            className={`btn-complete ${workoutItem.is_completed ? 'completed' : ''}`}
                            onClick={() => handleComplete(workoutItem.schedule_id)}
                            disabled={workoutItem.is_completed}
                          >
                            {workoutItem.is_completed ? '✅ Đã tập' : '☑️ Hoàn thành'}
                          </button>

                          { }
                          <div className="item-actions-compact">
                            <button
                              className="action-btn-small like"
                              onClick={() => sendFeedback(workoutItem.data.Id, "workout", 5)}
                              title="Thích"
                            >
                              👍
                            </button>
                            <button
                              className="action-btn-small dislike"
                              onClick={() => sendFeedback(workoutItem.data.Id, "workout", 2)}
                              title="Không thích"
                            >
                              👎
                            </button>
                            <button
                              className="action-btn-small info"
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

      {/* Detail Modal */}
      {showDetail && detailItem && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal-box detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{detailItem.title}</h3>
              <button className="modal-close" onClick={() => setShowDetail(false)}>✕</button>
            </div>

            <div className="modal-content">
              {detailItem.type === "workout" ? (
                <div className="workout-detail">
                  {/* Basic Info */}
                  <div className="detail-section">
                    <h4 className="section-title">📋 Thông Tin Cơ Bản</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Môn thể thao:</span>
                        <span className="info-value">{detailItem.data.Sport || "N/A"}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Thời lượng:</span>
                        <span className="info-value">{detailItem.data.Duration_min || 0} phút</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Cường độ:</span>
                        <span className="info-value intensity-badge">{detailItem.data.Intensity || "N/A"}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Độ khó:</span>
                        <span className="info-value difficulty-badge">{detailItem.data.Difficulty || "N/A"}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Dụng cụ:</span>
                        <span className="info-value">{detailItem.data.Equipment || "Không cần"}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Calo đốt:</span>
                        <span className="info-value">🔥 {detailItem.data.CalorieBurn || 0} kcal</span>
                      </div>
                    </div>
                  </div>

                  {/* Workout Details */}
                  {(detailItem.data.Sets || detailItem.data.Reps || detailItem.data.RestTime) && (
                    <div className="detail-section">
                      <h4 className="section-title">💪 Chi Tiết Tập Luyện</h4>
                      <div className="info-grid">
                        {detailItem.data.Sets && (
                          <div className="info-item">
                            <span className="info-label">Số hiệp:</span>
                            <span className="info-value">{detailItem.data.Sets}</span>
                          </div>
                        )}
                        {detailItem.data.Reps && (
                          <div className="info-item">
                            <span className="info-label">Số lần/Thời gian:</span>
                            <span className="info-value">{detailItem.data.Reps}</span>
                          </div>
                        )}
                        {detailItem.data.RestTime && (
                          <div className="info-item">
                            <span className="info-label">Nghỉ giữa hiệp:</span>
                            <span className="info-value">⏱️ {detailItem.data.RestTime}s</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {detailItem.data.Description && (
                    <div className="detail-section">
                      <h4 className="section-title">📝 Mô Tả</h4>
                      <p className="detail-text">{detailItem.data.Description}</p>
                    </div>
                  )}

                  {/* Instructions */}
                  {detailItem.data.Instructions && (
                    <div className="detail-section">
                      <h4 className="section-title">📖 Hướng Dẫn Thực Hiện</h4>
                      <div className="instructions-box">
                        {detailItem.data.Instructions.split('\n').map((line, idx) => (
                          <p key={idx} className="instruction-line">{line}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Safety Notes */}
                  {detailItem.data.SafetyNotes && (
                    <div className="detail-section safety-section">
                      <h4 className="section-title">⚠️ Lưu Ý An Toàn</h4>
                      <div className="safety-box">
                        {detailItem.data.SafetyNotes.split('\n').map((line, idx) => (
                          <p key={idx} className="safety-line">{line}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Muscles */}
                  {(detailItem.data.PrimaryMuscles || detailItem.data.SecondaryMuscles) && (
                    <div className="detail-section">
                      <h4 className="section-title">🎯 Nhóm Cơ</h4>
                      <div className="info-grid">
                        {detailItem.data.PrimaryMuscles && (
                          <div className="info-item full-width">
                            <span className="info-label">Cơ chính:</span>
                            <span className="info-value muscle-primary">{detailItem.data.PrimaryMuscles}</span>
                          </div>
                        )}
                        {detailItem.data.SecondaryMuscles && (
                          <div className="info-item full-width">
                            <span className="info-label">Cơ phụ:</span>
                            <span className="info-value muscle-secondary">{detailItem.data.SecondaryMuscles}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Progression/Regression */}
                  {(detailItem.data.ProgressionNotes || detailItem.data.RegressionNotes) && (
                    <div className="detail-section">
                      <h4 className="section-title">📈 Điều Chỉnh Cường Độ</h4>
                      {detailItem.data.ProgressionNotes && (
                        <div className="progression-box">
                          <strong>⬆️ Tăng cường độ:</strong>
                          <p>{detailItem.data.ProgressionNotes}</p>
                        </div>
                      )}
                      {detailItem.data.RegressionNotes && (
                        <div className="regression-box">
                          <strong>⬇️ Giảm cường độ:</strong>
                          <p>{detailItem.data.RegressionNotes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Prerequisites */}
                  {detailItem.data.Prerequisites && (
                    <div className="detail-section">
                      <h4 className="section-title">✅ Yêu Cầu Trước Khi Tập</h4>
                      <p className="detail-text prerequisites">{detailItem.data.Prerequisites}</p>
                    </div>
                  )}

                  {/* Video */}
                  {detailItem.data.VideoUrl && (
                    <div className="detail-section">
                      <h4 className="section-title">🎥 Video Hướng Dẫn</h4>
                      <a href={detailItem.data.VideoUrl} target="_blank" rel="noopener noreferrer" className="video-link">
                        ▶️ Xem video hướng dẫn
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                // Meal Detail
                <div className="meal-detail">
                  <div className="detail-section">
                    <h4 className="section-title">🍽️ Thông Tin Dinh Dưỡng</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Calo:</span>
                        <span className="info-value">🔥 {detailItem.data.Kcal || 0} kcal</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Protein:</span>
                        <span className="info-value">💪 {detailItem.data.Protein || 0}g</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Carb:</span>
                        <span className="info-value">🍚 {detailItem.data.Carb || 0}g</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Fat:</span>
                        <span className="info-value">🥑 {detailItem.data.Fat || 0}g</span>
                      </div>
                    </div>
                  </div>

                  {detailItem.data.Ingredients && (
                    <div className="detail-section">
                      <h4 className="section-title">🥗 Nguyên Liệu</h4>
                      <p className="detail-text">{detailItem.data.Ingredients}</p>
                    </div>
                  )}

                  {detailItem.data.Recipe && (
                    <div className="detail-section">
                      <h4 className="section-title">👨‍🍳 Công Thức</h4>
                      <div className="recipe-box">
                        {detailItem.data.Recipe.split('\n').map((line, idx) => (
                          <p key={idx} className="recipe-line">{line}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
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
