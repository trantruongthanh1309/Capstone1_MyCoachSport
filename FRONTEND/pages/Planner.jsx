import { useState, useEffect } from "react";
import "./Planner.css";

export default function Planner() {
  const [weeklyPlan, setWeeklyPlan] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  // ✅ DÙNG USER_ID THẬT CỦA BẠN
  const currentUser = { id: 18 };

  const getDates = (startDate, days) => {
    const dates = [];
    const date = new Date(startDate);
    for (let i = 0; i < days; i++) {
      dates.push(new Date(date).toISOString().split("T")[0]);
      date.setDate(date.getDate() + 1);
    }
    return dates;
  };

  const dayNames = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ nhật",
  ];
  // ✅ CHỈ CÓ 3 BỮA: Sáng, Trưa, Tối — KHÔNG CÓ ĂN VẶT
const mealTimes = ["morning", "afternoon", "evening"];
const mealTimeLabels = ["Bữa sáng", "Bữa trưa", "Bữa tối"];

  const fetchWeeklyPlan = async () => {
    setLoading(true);
    setError("");
    const dates = getDates(new Date(), 7);
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
      alert("Gửi phản hồi thất bại.");
    }
  };

  const showItemDetail = (item) => {
    if (item.type === "meal") {
      setDetailItem({
        title: item.data.Name,
        content: `Calo: ${item.data.Kcal || 0} kcal\nProtein: ${
          item.data.Protein || 0
        }g\nCarb: ${item.data.Carb || 0}g\nFat: ${item.data.Fat || 0}g`,
      });
    } else {
      setDetailItem({
        title: item.data.Name,
        content: `Môn: ${item.data.Sport || "N/A"}\nNhóm cơ: ${
          item.data.MuscleGroups || "N/A"
        }\nThời gian: ${item.data.Duration_min || 0} phút\nCường độ: ${
          item.data.Intensity || "N/A"
        }\nDụng cụ: ${item.data.Equipment || "N/A"}`,
      });
    }
    setShowDetail(true);
  };

  useEffect(() => {
    fetchWeeklyPlan();
  }, []);

  if (loading) return <p className="text-center mt-10">⏳ Đang tải...</p>;
  if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;

  const dates = getDates(new Date(), 7);

  return (
    <div className="planner-wrap">
      <h1 className="planner-title">🗓️ Lịch Trình Cá Nhân Hóa</h1>

      <div className="user-actions mb-6">
        <button className="btn-primary" onClick={fetchWeeklyPlan}>
          🔄 Tải lại lịch
        </button>
      </div>

      {/* MEAL PLAN */}
      <div className="section">
        <h2>🍽 Kế Hoạch Ăn Uống</h2>
        <div className="overflow-x-auto">
          <table className="planner-table w-full border-collapse shadow-md">
            <thead>
              <tr>
                <th>Bữa</th>
                {dates.map((date, i) => (
                  <th key={date}>{dayNames[i]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mealTimeLabels.map((label, idx) => (
                <tr key={label}>
                  <td className="font-semibold">{label}</td>
                  {dates.map((date) => {
                    const schedule = weeklyPlan[date] || [];
                    const mealItem = schedule.find(
                      (item) =>
                        item.type === "meal" &&
                        item.data.MealType === mealTimes[idx]
                    );
                    return (
                      <td key={date} className="hover-cell p-2">
                        {mealItem ? (
                          <>
                            <div className="meal-title font-medium">
                              {mealItem.data.Name}
                            </div>
                            <div className="small-meta text-sm text-gray-600">
                              {mealItem.data.Kcal} kcal
                            </div>
                            <div className="actions-inline mt-1">
                              <button
                                className="btn-mini bg-green-500"
                                onClick={() =>
                                  sendFeedback(mealItem.data.Id, "meal", 5)
                                }
                              >
                                👍
                              </button>
                              <button
                                className="btn-mini bg-red-500 ml-1"
                                onClick={() =>
                                  sendFeedback(mealItem.data.Id, "meal", 2)
                                }
                              >
                                👎
                              </button>
                              <button
                                className="btn-mini bg-blue-500 ml-1"
                                onClick={() => showItemDetail(mealItem)}
                              >
                                ℹ️
                              </button>
                            </div>
                          </>
                        ) : (
                          <span className="text-gray-400">-</span>
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

{/* WORKOUT PLAN — 2 BUỔI: SÁNG & TỐI */}
<div className="section mt-8">
  <h2>🏋️ Kế Hoạch Tập Luyện</h2>
  <div className="overflow-x-auto">
    <table className="planner-table w-full border-collapse shadow-md">
      <thead>
        <tr>
          <th>Buổi</th>
          {dates.map((date, i) => (
            <th key={date}>{dayNames[i]}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="font-semibold">Buổi sáng</td>
          {dates.map((date) => {
            const schedule = weeklyPlan[date] || [];
            // 🔥 SỬA: DÙNG "morning_slot" (TIẾNG ANH)
            const workoutItem = schedule.find(
              (item) => item.type === "workout" && item.time === "morning_slot"
            );
            return (
              <td key={date} className="hover-cell p-2">
                {workoutItem ? (
                  <>
                    <div className="meal-title font-medium">{workoutItem.data.Name}</div>
                    <div className="small-meta text-sm text-gray-600">{workoutItem.data.Duration_min} phút</div>
                    <div className="actions-inline mt-1">
                      <button className="btn-mini bg-green-500" onClick={() => sendFeedback(workoutItem.data.Id, "workout", 5)}>👍</button>
                      <button className="btn-mini bg-red-500 ml-1" onClick={() => sendFeedback(workoutItem.data.Id, "workout", 2)}>👎</button>
                      <button className="btn-mini bg-blue-500 ml-1" onClick={() => showItemDetail(workoutItem)}>ℹ️</button>
                    </div>
                  </>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
            );
          })}
        </tr>
        <tr>
          <td className="font-semibold">Buổi tối</td>
          {dates.map((date) => {
            const schedule = weeklyPlan[date] || [];
            // 🔥 SỬA: DÙNG "evening_slot" (TIẾNG ANH)
            const workoutItem = schedule.find(
              (item) => item.type === "workout" && item.time === "evening_slot"
            );
            return (
              <td key={date} className="hover-cell p-2">
                {workoutItem ? (
                  <>
                    <div className="meal-title font-medium">{workoutItem.data.Name}</div>
                    <div className="small-meta text-sm text-gray-600">{workoutItem.data.Duration_min} phút</div>
                    <div className="actions-inline mt-1">
                      <button className="btn-mini bg-green-500" onClick={() => sendFeedback(workoutItem.data.Id, "workout", 5)}>👍</button>
                      <button className="btn-mini bg-red-500 ml-1" onClick={() => sendFeedback(workoutItem.data.Id, "workout", 2)}>👎</button>
                      <button className="btn-mini bg-blue-500 ml-1" onClick={() => showItemDetail(workoutItem)}>ℹ️</button>
                    </div>
                  </>
                ) : (
                  <span className="text-gray-400">-</span>
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
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-2">{detailItem?.title}</h3>
            <pre className="bg-gray-100 p-3 rounded whitespace-pre-wrap">
              {detailItem?.content}
            </pre>
            <button
              className="btn-close mt-3 px-4 py-2 bg-gray-500 text-white rounded"
              onClick={() => setShowDetail(false)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
