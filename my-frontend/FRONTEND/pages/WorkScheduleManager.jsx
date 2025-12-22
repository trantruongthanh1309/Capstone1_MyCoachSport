import { useState, useEffect } from "react";
import "./WorkScheduleManager.css";
import { useToast } from "../contexts/ToastContext";

export default function WorkScheduleManager() {
  const toast = useToast();
  const [schedule, setSchedule] = useState({
    mon: { morning: "", afternoon: "", evening: "" },
    tue: { morning: "", afternoon: "", evening: "" },
    wed: { morning: "", afternoon: "", evening: "" },
    thu: { morning: "", afternoon: "", evening: "" },
    fri: { morning: "", afternoon: "", evening: "" },
    sat: { morning: "", afternoon: "", evening: "" },
    sun: { morning: "", afternoon: "", evening: "" },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const dayNames = {
    mon: "Thứ 2",    // Monday
    tue: "Thứ 3",    // Tuesday
    wed: "Thứ 4",    // Wednesday
    thu: "Thứ 5",    // Thursday
    fri: "Thứ 6",    // Friday
    sat: "Thứ 7",    // Saturday
    sun: "Chủ nhật", // Sunday
  };

  const dayIcons = {
    fri: "",
    sat: "",
    sun: "",
    mon: "",
    tue: "",
    wed: "",
    thu: "",
  };

  const periods = ["morning", "afternoon", "evening"];
  const periodLabels = {
    morning: "Buổi sáng",
    afternoon: "Buổi trưa",
    evening: "Buổi tối",
  };

  const periodIcons = {
    morning: "🌅",
    afternoon: "☀️",
    evening: "🌙",
  };

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/schedule/busy", {
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
        setIsLoading(false);
      })
      .catch((err) => {
        toast.error("Lỗi tải lịch");
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (day, period, value) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [period]: value },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/schedule/busy", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        credentials: "include",
        body: JSON.stringify(schedule),
      });
      if (res.ok) {
        const data = await res.json();
        const btn = document.querySelector('.save-btn');
        btn?.classList.add('success-pulse');
        
        // Nếu backend yêu cầu regenerate, dispatch event để Planner reload
        if (data.regenerate_needed) {
          // Dispatch custom event để Planner biết cần reload
          window.dispatchEvent(new CustomEvent('scheduleUpdated'));
        }
        
        setTimeout(() => {
          toast.success("✅ Lưu lịch thành công!");
        }, 500);
      } else {
        toast.error("❌ Lỗi khi lưu lịch");
      }
    } catch (err) {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="schedule-manager">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Đang tải lịch làm việc...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="schedule-manager">
      <div className="animated-bg"></div>

      <div className="header-section">
        <div className="header-icon-wrapper">
          <span className="header-icon">📅</span>
        </div>
        <h1 className="gradient-title">Quản Lý Lịch Làm Việc</h1>
        <p className="subtitle">Lập kế hoạch thời gian của bạn một cách thông minh</p>
      </div>

      <div className="schedule-card glass-effect">
        <div className="table-wrapper">
          <table className="schedule-table">
            <thead>
              <tr>
                <th className="day-header">
                  <span className="header-label">Ngày trong tuần</span>
                </th>
                {periods.map((period) => (
                  <th key={period} className="period-header">
                    <div className="header-content">
                      <span className="period-icon">{periodIcons[period]}</span>
                      <span className="period-label">{periodLabels[period]}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(dayNames).map(([dayKey, dayLabel], index) => (
                <tr key={dayKey} className="day-row" style={{ animationDelay: `${index * 0.05}s` }}>
                  <td className="day-cell">
                    <div className="day-label-wrapper">
                      <span className="day-icon">{dayIcons[dayKey]}</span>
                      <span className="day-label">{dayLabel}</span>
                    </div>
                  </td>
                  {periods.map((period) => (
                    <td key={period} className="input-cell">
                      <div className="input-wrapper">
                        <input
                          type="text"
                          value={schedule[dayKey][period]}
                          onChange={(e) =>
                            handleInputChange(dayKey, period, e.target.value)
                          }
                          placeholder="Nhập ghi chú..."
                          className="schedule-input"
                        />
                        {schedule[dayKey][period] && (
                          <button
                            className="clear-btn"
                            onClick={() => handleInputChange(dayKey, period, "")}
                            title="Xóa"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="action-section">
        <button
          onClick={handleSave}
          className={`save-btn ${isSaving ? 'saving' : ''}`}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <span className="btn-spinner"></span>
              <span>Đang lưu...</span>
            </>
          ) : (
            <>
              <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16L21 8V19C21 20.1046 20.1046 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 3V8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Lưu Lịch Làm Việc</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}