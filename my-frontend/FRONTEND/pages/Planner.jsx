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
  const [completingIds, setCompletingIds] = useState(new Set()); // Track items đang được complete
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
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };
    
    return `${formatDate(monday)} - ${formatDate(sunday)}`;
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
        
        // Debug log cho thứ 2
        if (date === dates[0]) {
          console.log(`[DEBUG] Schedule cho thứ 2 (${date}):`, data.schedule);
        }
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

  const isFutureDate = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    return date > today;
  };

  const isToday = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  };

  // Lấy khoảng thời gian của slot (start và end)
  const getSlotTimeRange = (slot) => {
    // Normalize slot name
    let normalizedSlot = slot;
    if (slot && typeof slot === 'string') {
      normalizedSlot = slot.toLowerCase();
      if (normalizedSlot.includes('morning') || normalizedSlot.includes('sáng')) normalizedSlot = 'morning';
      else if (normalizedSlot.includes('afternoon') || normalizedSlot.includes('trưa')) normalizedSlot = 'afternoon';
      else if (normalizedSlot.includes('evening') || normalizedSlot.includes('tối')) normalizedSlot = 'evening';
    }
    
    // Khoảng thời gian của các slot (start hour, start minute, end hour, end minute)
    const slotTimeRanges = {
      'morning': { startHour: 6, startMinute: 0, endHour: 10, endMinute: 0 },      // 06:00 - 10:00
      'afternoon': { startHour: 11, startMinute: 0, endHour: 14, endMinute: 0 },  // 11:00 - 14:00
      'evening': { startHour: 18, startMinute: 0, endHour: 21, endMinute: 0 }     // 18:00 - 21:00
    };
    
    return slotTimeRanges[normalizedSlot] || null;
  };

  // Lấy thời gian của slot (để tương thích với code cũ)
  const getSlotTime = (slot) => {
    const timeRange = getSlotTimeRange(slot);
    if (timeRange) {
      return { hour: timeRange.startHour, minute: timeRange.startMinute };
    }
    return null;
  };

  // Kiểm tra xem slot đã đến chưa (đã đến khoảng thời gian của slot chưa)
  const isSlotReached = (dateStr, slot) => {
    // Nếu là ngày tương lai, chưa đến
    if (isFutureDate(dateStr)) {
      return false;
    }
    
    // Nếu là ngày quá khứ, đã đến rồi (cho phép hoàn thành)
    if (isPastDate(dateStr)) {
      return true;
    }
    
    // Nếu là hôm nay, check khoảng thời gian của slot
    if (!isToday(dateStr)) {
      return false;
    }
    
    const timeRange = getSlotTimeRange(slot);
    if (!timeRange) {
      // Nếu không tìm thấy slot, coi như đã đến (cho phép hoàn thành)
      return true;
    }
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Tính số phút hiện tại trong ngày
    const currentMinutes = currentHour * 60 + currentMinute;
    const startMinutes = timeRange.startHour * 60 + timeRange.startMinute;
    const endMinutes = timeRange.endHour * 60 + timeRange.endMinute;
    
    // Cho phép hoàn thành nếu:
    // 1. Đã đến start time (trong hoặc sau khoảng thời gian)
    // 2. Hoặc đã qua khoảng thời gian nhưng vẫn trong ngày hôm nay
    return currentMinutes >= startMinutes;
  };

  // Kiểm tra xem slot đã qua chưa trong ngày hôm nay
  const isSlotPassed = (dateStr, slot) => {
    if (!isToday(dateStr)) {
      // Nếu không phải hôm nay, dùng logic cũ (check ngày)
      return isPastDate(dateStr);
    }
    
    // Nếu là hôm nay, check khoảng thời gian của slot
    const timeRange = getSlotTimeRange(slot);
    if (!timeRange) {
      // Nếu không tìm thấy slot, dùng logic cũ
      return isPastDate(dateStr);
    }
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Tính số phút hiện tại trong ngày
    const currentMinutes = currentHour * 60 + currentMinute;
    const endMinutes = timeRange.endHour * 60 + timeRange.endMinute;
    
    // Nếu đã qua khoảng thời gian của slot (sau end time)
    return currentMinutes > endMinutes;
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

  const handleComplete = async (scheduleId, event) => {
    // Ngăn event bubbling
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === 'function') {
        event.stopImmediatePropagation(); // Ngăn các handler khác
      }
    }
    
    // Kiểm tra scheduleId hợp lệ
    if (!scheduleId || scheduleId === null || scheduleId === undefined) {
      toast.error('Lỗi: Không tìm thấy ID của item');
      console.error('Invalid scheduleId:', scheduleId);
      return;
    }
    
    // Kiểm tra xem item này đang được complete không (prevent double click)
    if (completingIds.has(scheduleId)) {
      console.log('Item đang được complete, bỏ qua request');
      return;
    }
    
    // Đánh dấu item đang được complete ngay lập tức
    setCompletingIds(prev => new Set(prev).add(scheduleId));
    
    try {
      console.log('Completing schedule item:', scheduleId);
      
      const res = await fetch('/api/leaderboard/complete-schedule-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ schedule_id: scheduleId })
      });

      const data = await res.json();

      console.log('Complete API response:', data);
      console.log('Response status:', res.status);

      if (data.success || res.ok) {
        toast.success(data.message || 'Đã hoàn thành!');
        
        // Chỉ update local state, không refresh toàn bộ để tránh regenerate schedule
        setWeeklyPlan(prev => {
          const updated = { ...prev };
          let found = false;
          
          Object.keys(updated).forEach(date => {
            if (updated[date]) {
              // Update meal items
              if (updated[date].meals && Array.isArray(updated[date].meals)) {
                updated[date].meals = updated[date].meals.map(meal => {
                  if (meal.schedule_id === scheduleId) {
                    console.log('✅ Updating meal to completed:', meal);
                    found = true;
                    return { ...meal, is_completed: true };
                  }
                  return meal;
                });
              }
              // Update workout items
              if (updated[date].workouts && Array.isArray(updated[date].workouts)) {
                updated[date].workouts = updated[date].workouts.map(workout => {
                  if (workout.schedule_id === scheduleId) {
                    console.log('✅ Updating workout to completed:', workout);
                    found = true;
                    return { ...workout, is_completed: true };
                  }
                  return workout;
                });
              }
            }
          });
          
          if (!found) {
            console.warn('⚠️ Schedule item not found in state for update:', scheduleId);
          }
          
          return updated;
        });
        
        // Remove khỏi completingIds sau khi update thành công
        setCompletingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(scheduleId);
          return newSet;
        });
        
        // Refresh lại weekly plan để hiển thị trạng thái mới nhất
        console.log('🔄 Refreshing weekly plan after complete');
        await fetchWeeklyPlan(weekOffset);
      } else {
        toast.error(data.error || 'Lỗi khi hoàn thành');
        console.error('Complete error:', data);
        // Nếu lỗi, remove khỏi completingIds để có thể thử lại
        setCompletingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(scheduleId);
          return newSet;
        });
      }
    } catch (err) {
      console.error('Error completing item:', err);
      toast.error('Lỗi kết nối: ' + err.message);
      // Nếu lỗi, remove khỏi completingIds để có thể thử lại
      setCompletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(scheduleId);
        return newSet;
      });
    } finally {
      // Sau khi xong (thành công hoặc lỗi), remove khỏi completingIds sau một chút
      // Nhưng nếu thành công thì schedule sẽ refresh và button sẽ disabled tự động
      setTimeout(() => {
        setCompletingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(scheduleId);
          return newSet;
        });
      }, 1000);
    }
  };

  // Khi weekOffset thay đổi, fetch lại lịch
  useEffect(() => {
    fetchWeeklyPlan(weekOffset);
  }, [weekOffset]);

  // Listen event khi busy schedule được update để reload Planner
  useEffect(() => {
    const handleScheduleUpdate = () => {
      console.log('📅 Schedule updated, reloading Planner...');
      fetchWeeklyPlan(weekOffset);
    };

    window.addEventListener('scheduleUpdated', handleScheduleUpdate);

    return () => {
      window.removeEventListener('scheduleUpdated', handleScheduleUpdate);
    };
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
                              {mealItem.data.Kcal && mealItem.data.Kcal > 0 && (
                                <span className="meta-badge">🔥 {mealItem.data.Kcal} kcal</span>
                              )}
                              {mealItem.data.Protein && mealItem.data.Protein > 0 && (
                                <span className="meta-badge">💪 {mealItem.data.Protein}g</span>
                              )}
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
                                  : isSlotPassed(date, mealItem.data?.MealType || mealTimes[idx]) 
                                    ? 'missed' 
                                    : ''
                              }`}
                              onClick={(e) => {
                                if (e) {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (typeof e.stopImmediatePropagation === 'function') {
                                    e.stopImmediatePropagation();
                                  }
                                }
                                const slot = mealItem.data?.MealType || mealTimes[idx];
                                const slotReached = isSlotReached(date, slot);
                                const slotPassed = isSlotPassed(date, slot);
                                console.log('🔍 Complete button clicked:', {
                                  schedule_id: mealItem.schedule_id,
                                  is_completed: mealItem.is_completed,
                                  slotReached: slotReached,
                                  slotPassed: slotPassed,
                                  date: date,
                                  slot: slot,
                                  inCompletingIds: completingIds.has(mealItem.schedule_id)
                                });
                                
                                // Không cho phép hoàn thành nếu đã "Bỏ lỡ"
                                if (slotPassed && !mealItem.is_completed) {
                                  toast.error('Đã qua thời gian, không thể hoàn thành');
                                } else if (!mealItem.is_completed && mealItem.schedule_id && !completingIds.has(mealItem.schedule_id) && slotReached && !slotPassed) {
                                  console.log('✅ Calling handleComplete');
                                  handleComplete(mealItem.schedule_id, e);
                                } else if (mealItem.is_completed) {
                                  toast.info('Món ăn này đã được hoàn thành rồi');
                                } else if (!mealItem.schedule_id) {
                                  toast.error('Lỗi: Không tìm thấy ID của item');
                                  console.error('Missing schedule_id for meal:', mealItem);
                                } else if (completingIds.has(mealItem.schedule_id)) {
                                  toast.info('Đang xử lý...');
                                } else if (!slotReached) {
                                  if (isFutureDate(date)) {
                                    toast.error('Chưa đến ngày, không thể đánh dấu hoàn thành');
                                  } else {
                                    const timeRange = getSlotTimeRange(slot);
                                    if (timeRange) {
                                      toast.error(`Chưa đến giờ. Có thể hoàn thành từ ${timeRange.startHour}:${String(timeRange.startMinute).padStart(2, '0')} trở đi`);
                                    } else {
                                      toast.error('Chưa đến giờ của bữa ăn này, không thể hoàn thành');
                                    }
                                  }
                                }
                              }}
                              disabled={mealItem.is_completed || !mealItem.schedule_id || completingIds.has(mealItem.schedule_id) || !isSlotReached(date, mealItem.data?.MealType || mealTimes[idx]) || isSlotPassed(date, mealItem.data?.MealType || mealTimes[idx])}
                              title={
                                mealItem.is_completed 
                                  ? 'Đã hoàn thành' 
                                  : !isSlotReached(date, mealItem.data?.MealType || mealTimes[idx])
                                    ? isFutureDate(date)
                                      ? 'Chưa đến ngày, không thể hoàn thành'
                                      : 'Chưa đến giờ của bữa ăn này, không thể hoàn thành'
                                    : completingIds.has(mealItem.schedule_id) 
                                      ? 'Đang xử lý...' 
                                      : !mealItem.schedule_id 
                                        ? 'Thiếu thông tin ID' 
                                        : 'Đánh dấu hoàn thành'
                              }
                            >
                              {mealItem.is_completed 
                                ? '✅ Đã ăn' 
                                : !isSlotReached(date, mealItem.data?.MealType || mealTimes[idx])
                                  ? isFutureDate(date)
                                    ? '⏳ Chưa đến'
                                    : '⏳ Chưa đến giờ'
                                : isSlotPassed(date, mealItem.data?.MealType || mealTimes[idx])
                                  ? '❌ Bỏ lỡ' 
                                  : '☑️ Hoàn thành'
                              }
                            </button>

                            <div className="item-actions-compact">
                              <button
                                className={`action-btn-small like ${isPastDate(date) ? 'disabled' : ''}`}
                                onClick={() => !isPastDate(date) && sendFeedback(mealItem.data.Id, "meal", 5)}
                                disabled={isPastDate(date)}
                                title={isPastDate(date) ? 'Lịch đã qua, không thể đánh giá' : 'Thích'}
                              >
                                👍
                              </button>
                              <button
                                className={`action-btn-small dislike ${isPastDate(date) ? 'disabled' : ''}`}
                                onClick={() => !isPastDate(date) && sendFeedback(mealItem.data.Id, "meal", 2)}
                                disabled={isPastDate(date)}
                                title={isPastDate(date) ? 'Lịch đã qua, không thể đánh giá' : 'Không thích'}
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
                              <SwapButton 
                                item={{ ...mealItem, date }} 
                                type="meal" 
                                userId={getUserId()} 
                                onSwapSuccess={fetchWeeklyPlan}
                                disabled={isPastDate(date) || isSlotPassed(date, mealItem.data?.MealType || mealTimes[idx])}
                              />
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
                  // Tìm workout item - có thể time là "morning_slot" hoặc "morning" hoặc có chứa "morning"
                  const workoutItem = schedule.find(
                    (item) => {
                      if (item.type !== "workout") return false;
                      const time = (item.time || "").toLowerCase();
                      return time === "morning_slot" || time === "morning" || time.includes("morning");
                    }
                  );
                  
                  // Debug log nếu thứ 2 không có workout
                  if (date === dates[0] && !workoutItem && schedule.length > 0) {
                    console.log(`[DEBUG] Thứ 2 (${date}) schedule:`, schedule.map(s => ({ type: s.type, time: s.time })));
                  }
                  
                  return (
                    <td key={date} className="cell-content">
                      {workoutItem ? (
                        <div className="item-card workout-card">
                          <div className="item-header">
                            <h3 className="item-title">{workoutItem.data.Name}</h3>
                          </div>
                          <div className="item-meta">
                            {workoutItem.data.Duration_min && workoutItem.data.Duration_min > 0 && (
                              <span className="meta-badge">⏱️ {workoutItem.data.Duration_min} phút</span>
                            )}
                            {workoutItem.data.Intensity && (
                              <span className="meta-badge">💪 {workoutItem.data.Intensity}</span>
                            )}
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
                          
                          {/* Workout Details: Sets/Reps/RestTime */}
                          {((workoutItem.data.Sets && workoutItem.data.Sets !== '0' && workoutItem.data.Sets !== 0 && workoutItem.data.Sets.toString().trim() !== '') || 
                            (workoutItem.data.Reps && workoutItem.data.Reps !== '0' && workoutItem.data.Reps !== 0 && workoutItem.data.Reps.toString().trim() !== '' && !workoutItem.data.Reps.toString().trim().endsWith(' 0')) || 
                            (workoutItem.data.RestTime && workoutItem.data.RestTime > 0)) && (
                            <div className="workout-details-compact">
                              {workoutItem.data.Sets && workoutItem.data.Sets !== '0' && workoutItem.data.Sets !== 0 && workoutItem.data.Sets.toString().trim() !== '' && (
                                <span className="detail-badge">📊 {workoutItem.data.Sets} hiệp</span>
                              )}
                              {workoutItem.data.Reps && workoutItem.data.Reps !== '0' && workoutItem.data.Reps !== 0 && workoutItem.data.Reps.toString().trim() !== '' && !workoutItem.data.Reps.toString().trim().endsWith(' 0') && (
                                <span className="detail-badge">🔄 {workoutItem.data.Reps.toString().replace(/\s+0$/, '').trim()}</span>
                              )}
                              {workoutItem.data.RestTime && workoutItem.data.RestTime > 0 && (
                                <span className="detail-badge">⏱️ {workoutItem.data.RestTime}s nghỉ</span>
                              )}
                            </div>
                          )}
                          
                          {/* Primary Muscles - Ẩn trong card, chỉ hiển thị trong modal */}
                          {/* Safety Warning - Ẩn trong card, chỉ hiển thị trong modal */}

                          <button
                            className={`btn-complete ${
                              workoutItem.is_completed 
                                ? 'completed' 
                                : isSlotPassed(date, workoutItem.time || 'morning') 
                                  ? 'missed' 
                                  : ''
                            }`}
                            onClick={(e) => {
                              if (e) {
                                e.preventDefault();
                                e.stopPropagation();
                                if (typeof e.stopImmediatePropagation === 'function') {
                                  e.stopImmediatePropagation();
                                }
                              }
                              const slot = workoutItem.time || 'morning';
                              const slotReached = isSlotReached(date, slot);
                              const slotPassed = isSlotPassed(date, slot);
                              console.log('🔍 Complete workout button clicked:', {
                                schedule_id: workoutItem.schedule_id,
                                is_completed: workoutItem.is_completed,
                                slotReached: slotReached,
                                slotPassed: slotPassed,
                                date: date,
                                slot: slot,
                                inCompletingIds: completingIds.has(workoutItem.schedule_id)
                              });
                              
                              // Không cho phép hoàn thành nếu đã "Bỏ lỡ"
                              if (slotPassed && !workoutItem.is_completed) {
                                toast.error('Đã qua thời gian, không thể hoàn thành');
                              } else if (!workoutItem.is_completed && workoutItem.schedule_id && !completingIds.has(workoutItem.schedule_id) && slotReached && !slotPassed) {
                                console.log('✅ Calling handleComplete for workout');
                                handleComplete(workoutItem.schedule_id, e);
                              } else if (workoutItem.is_completed) {
                                toast.info('Bài tập này đã được hoàn thành rồi');
                              } else if (!workoutItem.schedule_id) {
                                toast.error('Lỗi: Không tìm thấy ID của item');
                                console.error('Missing schedule_id for workout:', workoutItem);
                              } else if (completingIds.has(workoutItem.schedule_id)) {
                                toast.info('Đang xử lý...');
                              } else if (!slotReached) {
                                if (isFutureDate(date)) {
                                  toast.error('Chưa đến ngày, không thể đánh dấu hoàn thành');
                                } else {
                                  const timeRange = getSlotTimeRange(slot);
                                  if (timeRange) {
                                    toast.error(`Chưa đến giờ. Có thể hoàn thành từ ${timeRange.startHour}:${String(timeRange.startMinute).padStart(2, '0')} trở đi`);
                                  } else {
                                    toast.error('Chưa đến giờ của buổi tập này, không thể hoàn thành');
                                  }
                                }
                              }
                            }}
                            disabled={workoutItem.is_completed || !workoutItem.schedule_id || completingIds.has(workoutItem.schedule_id) || !isSlotReached(date, workoutItem.time || 'morning') || isSlotPassed(date, workoutItem.time || 'morning')}
                            title={
                              workoutItem.is_completed 
                                ? 'Đã hoàn thành' 
                                : !isSlotReached(date, workoutItem.time || 'morning')
                                  ? isFutureDate(date)
                                    ? 'Chưa đến ngày, không thể hoàn thành'
                                    : 'Chưa đến giờ của buổi tập này, không thể hoàn thành'
                                  : completingIds.has(workoutItem.schedule_id) 
                                    ? 'Đang xử lý...' 
                                    : !workoutItem.schedule_id 
                                      ? 'Thiếu thông tin ID' 
                                      : 'Đánh dấu hoàn thành'
                            }
                          >
                            {workoutItem.is_completed 
                              ? '✅ Đã tập' 
                              : !isSlotReached(date, workoutItem.time || 'morning')
                                ? isFutureDate(date)
                                  ? '⏳ Chưa đến'
                                  : '⏳ Chưa đến giờ'
                              : isSlotPassed(date, workoutItem.time || 'morning') 
                                ? '❌ Bỏ lỡ' 
                                : '☑️ Hoàn thành'
                            }
                          </button>

                          <div className="item-actions-compact">
                            <button
                              className={`action-btn-small like ${isPastDate(date) ? 'disabled' : ''}`}
                              onClick={() => !isPastDate(date) && sendFeedback(workoutItem.data.Id, "workout", 5)}
                              disabled={isPastDate(date)}
                              title={isPastDate(date) ? 'Lịch đã qua, không thể đánh giá' : 'Thích'}
                            >
                              👍
                            </button>
                            <button
                              className={`action-btn-small dislike ${isPastDate(date) ? 'disabled' : ''}`}
                              onClick={() => !isPastDate(date) && sendFeedback(workoutItem.data.Id, "workout", 2)}
                              disabled={isPastDate(date)}
                              title={isPastDate(date) ? 'Lịch đã qua, không thể đánh giá' : 'Không thích'}
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
                            <SwapButton 
                              item={{ ...workoutItem, date }} 
                              type="workout" 
                              userId={getUserId()} 
                              onSwapSuccess={fetchWeeklyPlan}
                              disabled={isPastDate(date) || isSlotPassed(date, workoutItem.time || 'morning')}
                            />
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
                  // Tìm workout item - có thể time là "evening_slot" hoặc "evening" hoặc có chứa "evening"
                  const workoutItem = schedule.find(
                    (item) => {
                      if (item.type !== "workout") return false;
                      const time = (item.time || "").toLowerCase();
                      return time === "evening_slot" || time === "evening" || time.includes("evening");
                    }
                  );
                  return (
                    <td key={date} className="cell-content">
                      {workoutItem ? (
                        <div className="item-card workout-card">
                          <div className="item-header">
                            <h3 className="item-title">{workoutItem.data.Name}</h3>
                          </div>
                          <div className="item-meta">
                            {workoutItem.data.Duration_min && workoutItem.data.Duration_min > 0 && (
                              <span className="meta-badge">⏱️ {workoutItem.data.Duration_min} phút</span>
                            )}
                            {workoutItem.data.Intensity && (
                              <span className="meta-badge">💪 {workoutItem.data.Intensity}</span>
                            )}
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
                          
                          {/* Workout Details: Sets/Reps/RestTime */}
                          {((workoutItem.data.Sets && workoutItem.data.Sets !== '0' && workoutItem.data.Sets !== 0 && workoutItem.data.Sets.toString().trim() !== '') || 
                            (workoutItem.data.Reps && workoutItem.data.Reps !== '0' && workoutItem.data.Reps !== 0 && workoutItem.data.Reps.toString().trim() !== '' && !workoutItem.data.Reps.toString().trim().endsWith(' 0')) || 
                            (workoutItem.data.RestTime && workoutItem.data.RestTime > 0)) && (
                            <div className="workout-details-compact">
                              {workoutItem.data.Sets && workoutItem.data.Sets !== '0' && workoutItem.data.Sets !== 0 && workoutItem.data.Sets.toString().trim() !== '' && (
                                <span className="detail-badge">📊 {workoutItem.data.Sets} hiệp</span>
                              )}
                              {workoutItem.data.Reps && workoutItem.data.Reps !== '0' && workoutItem.data.Reps !== 0 && workoutItem.data.Reps.toString().trim() !== '' && !workoutItem.data.Reps.toString().trim().endsWith(' 0') && (
                                <span className="detail-badge">🔄 {workoutItem.data.Reps.toString().replace(/\s+0$/, '').trim()}</span>
                              )}
                              {workoutItem.data.RestTime && workoutItem.data.RestTime > 0 && (
                                <span className="detail-badge">⏱️ {workoutItem.data.RestTime}s nghỉ</span>
                              )}
                            </div>
                          )}
                          
                          {/* Primary Muscles - Ẩn trong card, chỉ hiển thị trong modal */}
                          {/* Safety Warning - Ẩn trong card, chỉ hiển thị trong modal */}

                          <button
                            className={`btn-complete ${
                              workoutItem.is_completed 
                                ? 'completed' 
                                : isSlotPassed(date, workoutItem.time || 'morning') 
                                  ? 'missed' 
                                  : ''
                            }`}
                            onClick={(e) => {
                              if (e) {
                                e.preventDefault();
                                e.stopPropagation();
                                if (typeof e.stopImmediatePropagation === 'function') {
                                  e.stopImmediatePropagation();
                                }
                              }
                              const slot = workoutItem.time || 'morning';
                              const slotReached = isSlotReached(date, slot);
                              const slotPassed = isSlotPassed(date, slot);
                              console.log('🔍 Complete workout button clicked:', {
                                schedule_id: workoutItem.schedule_id,
                                is_completed: workoutItem.is_completed,
                                slotReached: slotReached,
                                slotPassed: slotPassed,
                                date: date,
                                slot: slot,
                                inCompletingIds: completingIds.has(workoutItem.schedule_id)
                              });
                              
                              // Không cho phép hoàn thành nếu đã "Bỏ lỡ"
                              if (slotPassed && !workoutItem.is_completed) {
                                toast.error('Đã qua thời gian, không thể hoàn thành');
                              } else if (!workoutItem.is_completed && workoutItem.schedule_id && !completingIds.has(workoutItem.schedule_id) && slotReached && !slotPassed) {
                                console.log('✅ Calling handleComplete for workout');
                                handleComplete(workoutItem.schedule_id, e);
                              } else if (workoutItem.is_completed) {
                                toast.info('Bài tập này đã được hoàn thành rồi');
                              } else if (!workoutItem.schedule_id) {
                                toast.error('Lỗi: Không tìm thấy ID của item');
                                console.error('Missing schedule_id for workout:', workoutItem);
                              } else if (completingIds.has(workoutItem.schedule_id)) {
                                toast.info('Đang xử lý...');
                              } else if (!slotReached) {
                                if (isFutureDate(date)) {
                                  toast.error('Chưa đến ngày, không thể đánh dấu hoàn thành');
                                } else {
                                  const timeRange = getSlotTimeRange(slot);
                                  if (timeRange) {
                                    toast.error(`Chưa đến giờ. Có thể hoàn thành từ ${timeRange.startHour}:${String(timeRange.startMinute).padStart(2, '0')} trở đi`);
                                  } else {
                                    toast.error('Chưa đến giờ của buổi tập này, không thể hoàn thành');
                                  }
                                }
                              }
                            }}
                            disabled={workoutItem.is_completed || !workoutItem.schedule_id || completingIds.has(workoutItem.schedule_id) || !isSlotReached(date, workoutItem.time || 'morning') || isSlotPassed(date, workoutItem.time || 'morning')}
                            title={
                              workoutItem.is_completed 
                                ? 'Đã hoàn thành' 
                                : !isSlotReached(date, workoutItem.time || 'morning')
                                  ? isFutureDate(date)
                                    ? 'Chưa đến ngày, không thể hoàn thành'
                                    : 'Chưa đến giờ của buổi tập này, không thể hoàn thành'
                                  : completingIds.has(workoutItem.schedule_id) 
                                    ? 'Đang xử lý...' 
                                    : !workoutItem.schedule_id 
                                      ? 'Thiếu thông tin ID' 
                                      : 'Đánh dấu hoàn thành'
                            }
                          >
                            {workoutItem.is_completed 
                              ? '✅ Đã tập' 
                              : !isSlotReached(date, workoutItem.time || 'morning')
                                ? isFutureDate(date)
                                  ? '⏳ Chưa đến'
                                  : '⏳ Chưa đến giờ'
                              : isSlotPassed(date, workoutItem.time || 'morning') 
                                ? '❌ Bỏ lỡ' 
                                : '☑️ Hoàn thành'
                            }
                          </button>

                          <div className="item-actions-compact">
                            <button
                              className={`action-btn-small like ${isPastDate(date) ? 'disabled' : ''}`}
                              onClick={() => !isPastDate(date) && sendFeedback(workoutItem.data.Id, "workout", 5)}
                              disabled={isPastDate(date)}
                              title={isPastDate(date) ? 'Lịch đã qua, không thể đánh giá' : 'Thích'}
                            >
                              👍
                            </button>
                            <button
                              className={`action-btn-small dislike ${isPastDate(date) ? 'disabled' : ''}`}
                              onClick={() => !isPastDate(date) && sendFeedback(workoutItem.data.Id, "workout", 2)}
                              disabled={isPastDate(date)}
                              title={isPastDate(date) ? 'Lịch đã qua, không thể đánh giá' : 'Không thích'}
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
                            <SwapButton 
                              item={{ ...workoutItem, date }} 
                              type="workout" 
                              userId={getUserId()} 
                              onSwapSuccess={fetchWeeklyPlan}
                              disabled={isPastDate(date) || isSlotPassed(date, workoutItem.time || 'morning')}
                            />
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
                      {detailItem.data.Duration_min && detailItem.data.Duration_min > 0 && (
                        <div className="info-item">
                          <span className="info-label">Thời lượng:</span>
                          <span className="info-value">{detailItem.data.Duration_min} phút</span>
                        </div>
                      )}
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
                      {detailItem.data.CalorieBurn && detailItem.data.CalorieBurn > 0 && (
                        <div className="info-item">
                          <span className="info-label">Calo đốt:</span>
                          <span className="info-value">🔥 {detailItem.data.CalorieBurn} kcal</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Workout Details */}
                  {((detailItem.data.Sets && detailItem.data.Sets !== '0' && detailItem.data.Sets !== 0) || 
                    (detailItem.data.Reps && detailItem.data.Reps !== '0' && detailItem.data.Reps !== 0) || 
                    (detailItem.data.RestTime && detailItem.data.RestTime > 0)) && (
                    <div className="detail-section">
                      <h4 className="section-title">💪 Chi Tiết Tập Luyện</h4>
                      <div className="info-grid">
                        {detailItem.data.Sets && detailItem.data.Sets !== '0' && detailItem.data.Sets !== 0 && (
                          <div className="info-item">
                            <span className="info-label">Số hiệp:</span>
                            <span className="info-value">{detailItem.data.Sets}</span>
                          </div>
                        )}
                        {detailItem.data.Reps && detailItem.data.Reps !== '0' && detailItem.data.Reps !== 0 && (
                          <div className="info-item">
                            <span className="info-label">Số lần/Thời gian:</span>
                            <span className="info-value">{detailItem.data.Reps}</span>
                          </div>
                        )}
                        {detailItem.data.RestTime && detailItem.data.RestTime > 0 && (
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
                      {detailItem.data.Kcal && detailItem.data.Kcal > 0 && (
                        <div className="info-item">
                          <span className="info-label">Calo:</span>
                          <span className="info-value">🔥 {detailItem.data.Kcal} kcal</span>
                        </div>
                      )}
                      {detailItem.data.Protein && detailItem.data.Protein > 0 && (
                        <div className="info-item">
                          <span className="info-label">Protein:</span>
                          <span className="info-value">💪 {detailItem.data.Protein}g</span>
                        </div>
                      )}
                      {detailItem.data.Carb && detailItem.data.Carb > 0 && (
                        <div className="info-item">
                          <span className="info-label">Carb:</span>
                          <span className="info-value">🍚 {detailItem.data.Carb}g</span>
                        </div>
                      )}
                      {detailItem.data.Fat && detailItem.data.Fat > 0 && (
                        <div className="info-item">
                          <span className="info-label">Fat:</span>
                          <span className="info-value">🥑 {detailItem.data.Fat}g</span>
                        </div>
                      )}
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
