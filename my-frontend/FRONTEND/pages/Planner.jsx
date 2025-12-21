import { useState, useEffect } from "react";
import "./Planner.css";

import SwapButton from "../components/SwapButton";
import { useToast } from "../contexts/ToastContext";

// Helper function to convert YouTube URL to embed URL
function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  
  // Handle different YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }
  
  // If already an embed URL, return as is
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  
  return null;
}

export default function Planner() {
  const [weeklyPlan, setWeeklyPlan] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const [missingFields, setMissingFields] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = tuần này, -1 = tuần trước, -2 = tuần trước nữa
  const toast = useToast();

  // Lấy user_id từ localStorage hoặc session
  const getUserId = () => {
    const stored = localStorage.getItem('user_id');
    return stored ? parseInt(stored) : null;
  };

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

  const checkProfileComplete = async () => {
    try {
      const res = await fetch("/api/profile/check-complete", {
        credentials: "include"
      });
      if (!res.ok) return true; // Nếu lỗi thì cho phép tiếp tục
      const data = await res.json();
      if (!data.is_complete) {
        setProfileIncomplete(true);
        setMissingFields(data.missing_fields || []);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Lỗi kiểm tra profile:", err);
      return true; // Nếu lỗi thì cho phép tiếp tục
    }
  };

  // Tính toán monday của tuần dựa trên weekOffset
  const getMondayForWeek = (weekOffset) => {
    const today = new Date();
    const currentMonday = getMonday(today);
    const targetMonday = new Date(currentMonday);
    targetMonday.setDate(targetMonday.getDate() + (weekOffset * 7));
    return targetMonday;
  };

  // Format tuần để hiển thị
  const formatWeekLabel = (weekOffset) => {
    if (weekOffset === 0) return "Tuần này";
    if (weekOffset === -1) return "Tuần trước";
    if (weekOffset === -2) return "2 tuần trước";
    if (weekOffset === -3) return "3 tuần trước";
    
    const monday = getMondayForWeek(weekOffset);
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    
    const formatDate = (date) => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${day}/${month}`;
    };
    
    return `${formatDate(monday)} - ${formatDate(sunday)}/${sunday.getFullYear()}`;
  };

  const fetchWeeklyPlan = async (offset = weekOffset) => {
    setLoading(true);
    setError("");
    setProfileIncomplete(false);
    
    // Kiểm tra profile trước (chỉ kiểm tra cho tuần hiện tại và tương lai)
    if (offset >= 0) {
      const isComplete = await checkProfileComplete();
      if (!isComplete) {
        setLoading(false);
        return;
      }
    }
    
    const monday = getMondayForWeek(offset);
    const dates = getDates(monday, 7);
    const plan = {};

    try {
      const userId = getUserId();
      if (!userId) {
        setError("Vui lòng đăng nhập để xem lịch trình");
        setLoading(false);
        return;
      }
      
      for (const date of dates) {
        const res = await fetch(
          `/api/ai/schedule?date=${date}`,
          { credentials: "include" }
        );
        if (!res.ok) {
          const errorData = await res.json();
          // Nếu lỗi do profile chưa đầy đủ
          if (errorData.error === "profile_incomplete") {
            setProfileIncomplete(true);
            setMissingFields(errorData.missing_fields || []);
            setLoading(false);
            return;
          }
          throw new Error(`Lỗi ngày ${date}`);
        }
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

  // Kiểm tra xem ngày đã qua chưa (so với hôm nay)
  const isPastDate = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  const sendFeedback = async (itemId, type, rating) => {
    try {
      const userId = getUserId();
      if (!userId) return;
      const payload = { user_id: userId, rating };
      if (type === "meal") payload.meal_id = itemId;
      else payload.workout_id = itemId;

      await fetch("/api/ai/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      fetchWeeklyPlan(weekOffset);
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
      const res = await fetch('/api/leaderboard/complete-schedule-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ schedule_id: scheduleId })
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        fetchWeeklyPlan(weekOffset);
      } else {
        toast.error(data.error || 'Lỗi khi hoàn thành');
      }
    } catch (err) {
      console.error('Error completing item:', err);
      toast.error('Lỗi kết nối');
    }
  };

  // Khi weekOffset thay đổi, fetch lại lịch
  useEffect(() => {
    fetchWeeklyPlan(weekOffset);
  }, [weekOffset]);

  if (loading) return <div className="loading-screen"><div className="spinner"></div><p>⏳ Đang tải lịch trình...</p></div>;
  if (error) return <div className="error-screen"><p>❌ {error}</p></div>;
  
  // Hiển thị thông báo yêu cầu hoàn thiện hồ sơ
  if (profileIncomplete) {
    const fieldLabels = {
      "Age": "Tuổi",
      "Sex": "Giới tính",
      "Height_cm": "Chiều cao",
      "Weight_kg": "Cân nặng",
      "Sport": "Môn thể thao",
      "Goal": "Mục tiêu",
      "Sessions_per_week": "Số buổi tập/tuần"
    };
    
    return (
      <div className="planner-wrap">
        <div className="planner-header">
          <h1 className="planner-title">🗓️ Lịch Trình Cá Nhân Hóa</h1>
          <p className="planner-subtitle">Kế hoạch ăn uống & tập luyện được AI tối ưu riêng cho bạn</p>
        </div>
        
        <div className="error-screen" style={{
          background: "white",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
          maxWidth: "600px",
          margin: "40px auto"
        }}>
          <div style={{ fontSize: "4rem", marginBottom: "20px" }}>⚠️</div>
          <h2 style={{ fontSize: "1.5rem", color: "#1e293b", marginBottom: "15px", fontWeight: 700 }}>
            Hồ sơ chưa đầy đủ
          </h2>
          <p style={{ fontSize: "1rem", color: "#64748b", marginBottom: "20px", lineHeight: 1.6 }}>
            Để tạo lịch trình cá nhân hóa, vui lòng cập nhật đầy đủ thông tin trong hồ sơ của bạn:
          </p>
          <ul style={{
            listStyle: "none",
            padding: 0,
            margin: "20px 0",
            textAlign: "left",
            display: "inline-block"
          }}>
            {missingFields.map(field => (
              <li key={field} style={{
                padding: "8px 0",
                fontSize: "0.95rem",
                color: "#475569"
              }}>
                • {fieldLabels[field] || field}
              </li>
            ))}
          </ul>
          <button 
            className="btn-primary"
            onClick={() => window.location.href = "/profile"}
            style={{ marginTop: "30px" }}
          >
            <span>📝 Đi đến Hồ sơ</span>
          </button>
        </div>
      </div>
    );
  }

  const monday = getMondayForWeek(weekOffset);
  const dates = getDates(monday, 7);

  return (
    <div className="planner-wrap">
      <div className="planner-header">
        <h1 className="planner-title">🗓️ Lịch Trình Cá Nhân Hóa</h1>
        <p className="planner-subtitle">Kế hoạch ăn uống & tập luyện được AI tối ưu riêng cho bạn</p>
      </div>

      <div className="user-actions" style={{ display: "flex", gap: "15px", alignItems: "center", justifyContent: "flex-end", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label style={{ fontSize: "0.95rem", fontWeight: 600, color: "#475569" }}>📅 Xem lịch:</label>
          <select 
            value={weekOffset} 
            onChange={(e) => setWeekOffset(parseInt(e.target.value))}
            style={{
              padding: "10px 15px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "#1e293b",
              backgroundColor: "white",
              cursor: "pointer",
              outline: "none",
              minWidth: "180px"
            }}
          >
            {[0, -1, -2, -3, -4].map(offset => (
              <option key={offset} value={offset}>
                {formatWeekLabel(offset)}
              </option>
            ))}
          </select>
        </div>
        <button className="btn-primary" onClick={() => fetchWeeklyPlan(weekOffset)}>
          <span className="btn-icon">🔄</span>
          <span>Tải lại</span>
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
                              {mealItem.feedback_status === 'liked' && (
                                <span className="meta-badge" style={{ background: '#dbeafe', color: '#1e40af' }}>
                                  👍 Đã thích
                                </span>
                              )}
                              {mealItem.feedback_status === 'disliked' && (
                                <span className="meta-badge" style={{ background: '#fee2e2', color: '#991b1b' }}>
                                  👎 Đã không thích
                                </span>
                              )}
                            </div>

                            { }
                            <button
                              className={`btn-complete ${
                                mealItem.is_completed 
                                  ? 'completed' 
                                  : isPastDate(date) 
                                    ? 'missed' 
                                    : ''
                              }`}
                              onClick={() => handleComplete(mealItem.schedule_id)}
                              disabled={mealItem.is_completed || isPastDate(date)}
                              title={isPastDate(date) && !mealItem.is_completed ? 'Đã quá hạn, không thể đánh dấu hoàn thành' : ''}
                            >
                              {mealItem.is_completed 
                                ? '✅ Đã ăn' 
                                : isPastDate(date) 
                                  ? '❌ Bỏ lỡ' 
                                  : '☑️ Hoàn thành'
                              }
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
                              <SwapButton item={{ ...mealItem, date }} type="meal" userId={getUserId()} onSwapSuccess={fetchWeeklyPlan} />
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
                            {workoutItem.feedback_status === 'liked' && (
                              <span className="meta-badge" style={{ background: '#dbeafe', color: '#1e40af' }}>
                                👍 Đã thích
                              </span>
                            )}
                            {workoutItem.feedback_status === 'disliked' && (
                              <span className="meta-badge" style={{ background: '#fee2e2', color: '#991b1b' }}>
                                👎 Đã không thích
                              </span>
                            )}
                          </div>

                          { }
                          <button
                            className={`btn-complete ${
                              workoutItem.is_completed 
                                ? 'completed' 
                                : isPastDate(date) 
                                  ? 'missed' 
                                  : ''
                            }`}
                            onClick={() => handleComplete(workoutItem.schedule_id)}
                            disabled={workoutItem.is_completed || isPastDate(date)}
                            title={isPastDate(date) && !workoutItem.is_completed ? 'Đã quá hạn, không thể đánh dấu hoàn thành' : ''}
                          >
                            {workoutItem.is_completed 
                              ? '✅ Đã tập' 
                              : isPastDate(date) 
                                ? '❌ Bỏ lỡ' 
                                : '☑️ Hoàn thành'
                            }
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
                            <SwapButton item={{ ...workoutItem, date }} type="workout" userId={getUserId()} onSwapSuccess={fetchWeeklyPlan} />
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
                            {workoutItem.feedback_status === 'liked' && (
                              <span className="meta-badge" style={{ background: '#dbeafe', color: '#1e40af' }}>
                                👍 Đã thích
                              </span>
                            )}
                            {workoutItem.feedback_status === 'disliked' && (
                              <span className="meta-badge" style={{ background: '#fee2e2', color: '#991b1b' }}>
                                👎 Đã không thích
                              </span>
                            )}
                          </div>

                          { }
                          <button
                            className={`btn-complete ${
                              workoutItem.is_completed 
                                ? 'completed' 
                                : isPastDate(date) 
                                  ? 'missed' 
                                  : ''
                            }`}
                            onClick={() => handleComplete(workoutItem.schedule_id)}
                            disabled={workoutItem.is_completed || isPastDate(date)}
                            title={isPastDate(date) && !workoutItem.is_completed ? 'Đã quá hạn, không thể đánh dấu hoàn thành' : ''}
                          >
                            {workoutItem.is_completed 
                              ? '✅ Đã tập' 
                              : isPastDate(date) 
                                ? '❌ Bỏ lỡ' 
                                : '☑️ Hoàn thành'
                            }
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
                            <SwapButton item={{ ...workoutItem, date }} type="workout" userId={getUserId()} onSwapSuccess={fetchWeeklyPlan} />
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
                      <div className="video-container">
                        {getYouTubeEmbedUrl(detailItem.data.VideoUrl) ? (
                          <iframe
                            src={getYouTubeEmbedUrl(detailItem.data.VideoUrl)}
                            title="Video hướng dẫn"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="youtube-embed"
                          ></iframe>
                        ) : (
                          <a href={detailItem.data.VideoUrl} target="_blank" rel="noopener noreferrer" className="video-link">
                            ▶️ Xem video hướng dẫn
                          </a>
                        )}
                      </div>
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

                  {/* Video */}
                  {detailItem.data.VideoUrl && (
                    <div className="detail-section">
                      <h4 className="section-title">🎥 Video Hướng Dẫn</h4>
                      <div className="video-container">
                        {getYouTubeEmbedUrl(detailItem.data.VideoUrl) ? (
                          <iframe
                            src={getYouTubeEmbedUrl(detailItem.data.VideoUrl)}
                            title="Video hướng dẫn"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="youtube-embed"
                          ></iframe>
                        ) : (
                          <a href={detailItem.data.VideoUrl} target="_blank" rel="noopener noreferrer" className="video-link">
                            ▶️ Xem video hướng dẫn
                          </a>
                        )}
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
