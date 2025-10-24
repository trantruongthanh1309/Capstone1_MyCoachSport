import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./WorkScheduleManager.css";

export default function WorkScheduleManager() {
  const [schedule, setSchedule] = useState({
    mon: { morning: "", afternoon: "", evening: "" },
    tue: { morning: "", afternoon: "", evening: "" },
    wed: { morning: "", afternoon: "", evening: "" },
    thu: { morning: "", afternoon: "", evening: "" },
    fri: { morning: "", afternoon: "", evening: "" },
    sat: { morning: "", afternoon: "", evening: "" },
    sun: { morning: "", afternoon: "", evening: "" },
  });

  const navigate = useNavigate();
  const dayNames = {
    
    fri: "Thứ 2",
    sat: "Thứ 3",
    sun: "Thứ 4",
    mon: "Thứ 5",
    tue: "Thứ 6",
    wed: "Thứ 7",
    thu: "Chủ nhật",
  };
  const periods = ["morning", "afternoon", "evening"];
  const periodLabels = {
    morning: "Buổi sáng",
    afternoon: "Buổi trưa",
    evening: "Buổi tối",
  };

  useEffect(() => {
    fetch("http://localhost:5000/api/schedule/busy", {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json; charset=utf-8" },
    })
      .then((res) => res.json())
      .then((data) => {
        const filled = {};
        for (let day in data) {
          filled[day] = { morning: "", afternoon: "", evening: "" };
          for (let period in data[day]) {
            if (period in filled[day]) {
              filled[day][period] = data[day][period] || "";
            }
          }
        }
        setSchedule(filled);
      })
      .catch((err) => alert("Lỗi tải lịch"));
  }, []);

  const handleInputChange = (day, period, value) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [period]: value },
    }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/schedule/busy", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        credentials: "include",
        body: JSON.stringify(schedule),
      });
      if (res.ok) {
        alert("✅ Lưu lịch thành công!");
        navigate("/planner");
      } else {
        alert("❌ Lỗi khi lưu lịch");
      }
    } catch (err) {
      alert("Không thể kết nối đến máy chủ");
    }
  };

  return (
    <div className="schedule-manager">
      <h1>📅 Quản Lý Lịch Làm Việc</h1>
      <table className="schedule-table">
        <thead>
          <tr>
            <th>Ngày</th>
            <th>Buổi sáng</th>
            <th>Buổi trưa</th>
            <th>Buổi tối</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(dayNames).map(([dayKey, dayLabel]) => (
            <tr key={dayKey}>
              <td>{dayLabel}</td>
              {periods.map((period) => (
                <td key={period}>
                  <input
                    type="text"
                    value={schedule[dayKey][period]}
                    onChange={(e) =>
                      handleInputChange(dayKey, period, e.target.value)
                    }
                    placeholder="Ghi chú nếu bận"
                    className="schedule-input"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleSave} className="save-btn">
        💾 Lưu Lịch Làm Việc
      </button>
    </div>
  );
}
