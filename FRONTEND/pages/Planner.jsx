import { useState, useEffect } from "react";
import "./Planner.css";

export default function Planner() {
  // === STATE ===
  const [weeklyPlan, setWeeklyPlan] = useState({}); // { "2025-10-18": [...], ... }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  // === USER INFO (sẽ lấy từ auth sau) ===
  const currentUser = { id: 1 }; // ← thay bằng user thực tế

  // === HÀM TIỆN ÍCH ===
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
  // Thêm "Ăn vặt" vào mealTimes
  const mealTimes = ["Sáng", "Trưa", "Tối", "Ăn vặt"];
  const workoutTimes = ["Sáng", "Tối"];

  // === LẤY LỊCH 7 NGÀY TỪ AI COACH ===
  const fetchWeeklyPlan = async () => {
    setLoading(true);
    setError("");
    const dates = getDates(new Date(), 7);
    const plan = {};

    try {
      for (const date of dates) {
        const res = await fetch(
          `http://localhost:5000/api/ai/schedule?user_id=${currentUser.id}&date=${date}`,
          {
            credentials: "include", // Đảm bảo cookie được gửi
          }
        );
        if (!res.ok) throw new Error(`Lỗi ngày ${date}`);

        const data = await res.json();
        console.log("✅ Dữ liệu AI Coach trả về:", data); // Log dữ liệu để debug

        // Lưu dữ liệu vào kế hoạch cho từng ngày
        plan[date] = data.schedule || [];
      }

      console.log("✅ Dữ liệu kế hoạch:", plan);
      // Log dữ liệu kế hoạch trước khi cập nhật state
      setWeeklyPlan(plan); // Cập nhật weeklyPlan
    } catch (err) {
      console.error("❌ Lỗi tải lịch:", err);
      setError("Không thể tải lịch từ AI Coach. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // === GỬI FEEDBACK ===
  const sendFeedback = async (itemId, type, rating) => {
    try {
      const payload = {
        user_id: currentUser.id,
        rating,
      };
      if (type === "meal") payload.meal_id = itemId;
      else payload.workout_id = itemId;

      await fetch("/api/ai/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      // Tải lại lịch để cập nhật đề xuất mới
      fetchWeeklyPlan();
    } catch (err) {
      alert("Gửi phản hồi thất bại. Vui lòng thử lại.");
    }
  };

  // === HIỆN CHI TIẾT ===
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
        // Trong showItemDetail
        content: `Môn: ${item.data.Sport || "N/A"}\nNhóm cơ: ${
          item.data.MuscleGroups || "N/A"
        }\nThời gian: ${item.data.Duration_min || 0} phút\nCường độ: ${
          item.data.Intensity || "N/A" // ← giờ là "thấp", "trung bình"
        }\nDụng cụ: ${item.data.Equipment || "N/A"}`,
      });
    }
    setShowDetail(true);
  };

  // === KHỞI TẠO ===
  useEffect(() => {
    fetchWeeklyPlan();
  }, []);

  // === RENDER ===
  if (loading)
    return <p className="text-center mt-10">⏳ Đang tải lịch từ AI Coach...</p>;
  if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;

  const dates = getDates(new Date(), 7);

  return (
    <div className="planner-wrap">
      <h1 className="planner-title">🗓️ Lịch Trình Cá Nhân Hóa từ AI Coach</h1>

      <div className="user-actions mb-6">
        <button className="btn-primary" onClick={fetchWeeklyPlan}>
          🔄 Tải lại lịch
        </button>
        {/* Sau này thêm: nút chỉnh sửa sở thích */}
      </div>

      {/* === MEAL PLAN === */}
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
              {mealTimes.map((time) => (
                <tr key={time}>
                  <td className="font-semibold">{time}</td>
                  {dates.map((date) => {
                    const schedule = weeklyPlan[date] || [];
                    // Thay thế mealTypeMap
                    const mealTypeMap = {
                      Sáng: "sáng", // Cập nhật từ bảng MealType trong CSDL
                      Trưa: "trưa",
                      Tối: "tối",
                      "Ăn vặt": "ăn vặt",
                    };

                    const targetMealType = mealTypeMap[time];

                    // Tìm mealItem từ schedule với đúng MealType
                    // Trong phần Meal Plan
                    const mealItem = schedule.find(
                      (item) =>
                        item.type === "meal" &&
                        item.data.MealType === time.toLowerCase()
                    );

                    return (
                      <td key={date} className="hover-cell p-2">
                        {mealItem ? (
                          <>
                            <div className="meal-title font-medium">
                              {mealItem.data?.Name || "Không có tên"}{" "}
                              {/* Kiểm tra nếu tên có */}
                            </div>
                            <div className="small-meta text-sm text-gray-600">
                              {mealItem.data?.Kcal || "-"} kcal{" "}
                              {/* Kiểm tra số calo */}
                            </div>
                            <div className="actions-inline mt-1">
                              <button
                                className="btn-mini bg-green-500 hover:bg-green-600 text-white"
                                onClick={() =>
                                  sendFeedback(mealItem.data?.Id, "meal", 5)
                                }
                                title="Thích"
                              >
                                👍
                              </button>
                              <button
                                className="btn-mini bg-red-500 hover:bg-red-600 text-white ml-1"
                                onClick={() =>
                                  sendFeedback(mealItem.data?.Id, "meal", 2)
                                }
                                title="Không thích"
                              >
                                👎
                              </button>
                              <button
                                className="btn-mini bg-blue-500 hover:bg-blue-600 text-white ml-1"
                                onClick={() => showItemDetail(mealItem)}
                                title="Chi tiết"
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

      {/* === WORKOUT PLAN === */}
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
              {workoutTimes.map((time) => (
                <tr key={time}>
                  <td className="font-semibold">{time}</td>
                  {dates.map((date) => {
                    const schedule = weeklyPlan[date] || [];
                    const workoutItem = schedule.find(
                      (item) => item.type === "workout"
                    );

                    const alreadyShown = dates
                      .slice(0, dates.indexOf(date))
                      .some((d) =>
                        (weeklyPlan[d] || []).some((i) => i.type === "workout")
                      );

                    return (
                      <td key={date} className="hover-cell p-2">
                        {workoutItem && !alreadyShown ? (
                          <>
                            <div className="meal-title font-medium">
                              {workoutItem.data.Name}
                            </div>
                            <div className="small-meta text-sm text-gray-600">
                              {workoutItem.data.Duration_min} phút
                            </div>
                            <div className="actions-inline mt-1">
                              <button
                                className="btn-mini bg-green-500 hover:bg-green-600 text-white"
                                onClick={() =>
                                  sendFeedback(
                                    workoutItem.data.Id,
                                    "workout",
                                    5
                                  )
                                }
                                title="Thích"
                              >
                                👍
                              </button>
                              <button
                                className="btn-mini bg-red-500 hover:bg-red-600 text-white ml-1"
                                onClick={() =>
                                  sendFeedback(
                                    workoutItem.data.Id,
                                    "workout",
                                    2
                                  )
                                }
                                title="Không thích"
                              >
                                👎
                              </button>
                              <button
                                className="btn-mini bg-blue-500 hover:bg-blue-600 text-white ml-1"
                                onClick={() => showItemDetail(workoutItem)}
                                title="Chi tiết"
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

      {/* === MODAL CHI TIẾT === */}
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
