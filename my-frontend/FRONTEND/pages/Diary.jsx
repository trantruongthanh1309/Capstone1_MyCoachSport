import { useState, useEffect } from "react";
import "./DiaryNew.css";
import { useToast } from "../contexts/ToastContext";

const Diary = () => {
    const [activeTab, setActiveTab] = useState("history"); // 'history' or 'preferences'
    const [historyData, setHistoryData] = useState({});
    const [preferences, setPreferences] = useState({
        liked_meals: [],
        disliked_meals: [],
        liked_workouts: [],
        disliked_workouts: []
    });
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    // Fetch History
    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/diary/history");
            const data = await res.json();
            if (res.ok) {
                setHistoryData(data.history);
            }
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Preferences
    const fetchPreferences = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/diary/preferences");
            const data = await res.json();
            if (res.ok) {
                setPreferences(data);
            }
        } catch (error) {
            console.error("Error fetching preferences:", error);
        } finally {
            setLoading(false);
        }
    };

    // Remove Preference (Undo)
    const handleRemovePreference = async (itemId, type) => {
        if (!window.confirm("Bạn có chắc muốn xóa sở thích này?")) return;

        try {
            const res = await fetch("/api/diary/remove-preference", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ item_id: itemId, type: type })
            });

            if (res.ok) {
                toast.success("Đã xóa sở thích thành công!");
                fetchPreferences(); // Reload
            } else {
                toast.error("Có lỗi xảy ra");
            }
        } catch (error) {
            console.error("Error removing preference:", error);
        }
    };

    useEffect(() => {
        if (activeTab === "history") fetchHistory();
        if (activeTab === "preferences") fetchPreferences();
    }, [activeTab]);

    return (
        <div className="diary-container">
            <div className="diary-header">
                <h1 className="diary-title">Nhật Ký & Huấn Luyện AI</h1>
                <p className="diary-subtitle">Theo dõi lịch sử và dạy AI hiểu sở thích của bạn</p>
            </div>

            {/* TABS */}
            <div className="diary-tabs">
                <button
                    className={`diary-tab-btn ${activeTab === "history" ? "active" : ""}`}
                    onClick={() => setActiveTab("history")}
                >
                    📅 Lịch Sử Hoạt Động
                </button>
                <button
                    className={`diary-tab-btn ${activeTab === "preferences" ? "active" : ""}`}
                    onClick={() => setActiveTab("preferences")}
                >
                    ❤️ Sở Thích & AI
                </button>
            </div>

            {/* HISTORY CONTENT */}
            {activeTab === "history" && (
                <div className="history-section">
                    <div className="history-controls">
                        <span className="date-range-display">7 Ngày Gần Nhất</span>
                        <button className="diary-tab-btn" onClick={fetchHistory}>🔄 Làm mới</button>
                    </div>

                    <div className="history-grid">
                        {Object.keys(historyData).length === 0 ? (
                            <div className="empty-state">Chưa có dữ liệu lịch sử nào.</div>
                        ) : (
                            Object.entries(historyData).map(([date, items]) => (
                                <div key={date} className="history-day-card">
                                    <div className="day-header">
                                        <span className="day-date">{new Date(date).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                                        <span className="day-status">{items.filter(i => i.is_completed).length}/{items.length} Hoàn thành</span>
                                    </div>
                                    <div className="day-items">
                                        {items.map((item, index) => (
                                            <div key={index} className="history-item">
                                                {item.type === 'meal' ? (
                                                    <img src={item.details.image ? `/images/${item.details.image}` : "https://via.placeholder.com/70"} alt="" className="item-image" />
                                                ) : (
                                                    <div className="item-image" style={{ background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🏋️</div>
                                                )}
                                                <div className="item-info">
                                                    <div className="item-slot">
                                                        {item.slot === 'morning' ? 'Buổi Sáng' :
                                                            item.slot === 'afternoon' ? 'Buổi Trưa' :
                                                                item.slot === 'evening' ? 'Buổi Tối' : item.slot}
                                                    </div>
                                                    <div className="item-name">{item.details.name}</div>
                                                    <div className="item-meta">
                                                        {item.type === 'meal' ? `${item.details.kcal} Kcal` : `${item.details.duration} phút • ${item.details.sport}`}
                                                    </div>
                                                </div>
                                                <div className="item-status">
                                                    {item.is_completed ? (
                                                        <span className="item-status-icon" title="Đã hoàn thành">✅</span>
                                                    ) : (
                                                        <span className="item-status-icon" title="Chưa hoàn thành" style={{ opacity: 0.3 }}>☑️</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* PREFERENCES CONTENT */}
            {activeTab === "preferences" && (
                <div className="preferences-section">
                    <div className="preferences-grid">
                        {/* LIKED COLUMN */}
                        <div className="pref-column">
                            <div className="pref-header">
                                <span className="pref-icon">👍</span>
                                <div className="pref-title">
                                    <h3>Đã Thích (AI Ưu Tiên)</h3>
                                    <p>AI sẽ thường xuyên gợi ý những món này</p>
                                </div>
                            </div>
                            <div className="pref-list">
                                {preferences.liked_meals.map(item => (
                                    <div key={`m-${item.id}`} className="pref-item">
                                        <div className="pref-item-content">
                                            <img src={item.image ? `/images/${item.image}` : "https://via.placeholder.com/50"} alt="" className="pref-item-image" />
                                            <span className="pref-item-name">{item.name}</span>
                                        </div>
                                        <button className="btn-remove-pref" onClick={() => handleRemovePreference(item.id, 'meal')} title="Xóa">✕</button>
                                    </div>
                                ))}
                                {preferences.liked_workouts.map(item => (
                                    <div key={`w-${item.id}`} className="pref-item">
                                        <div className="pref-item-content">
                                            <span style={{ fontSize: '1.5rem' }}>🏋️</span>
                                            <span className="pref-item-name">{item.name} ({item.sport})</span>
                                        </div>
                                        <button className="btn-remove-pref" onClick={() => handleRemovePreference(item.id, 'workout')} title="Xóa">✕</button>
                                    </div>
                                ))}
                                {preferences.liked_meals.length === 0 && preferences.liked_workouts.length === 0 && (
                                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>Chưa có dữ liệu thích</div>
                                )}
                            </div>
                        </div>

                        {/* DISLIKED COLUMN */}
                        <div className="pref-column">
                            <div className="pref-header">
                                <span className="pref-icon">👎</span>
                                <div className="pref-title">
                                    <h3>Không Thích (AI Né Tránh)</h3>
                                    <p>AI sẽ không bao giờ gợi ý những món này nữa</p>
                                </div>
                            </div>
                            <div className="pref-list">
                                {preferences.disliked_meals.map(item => (
                                    <div key={`m-${item.id}`} className="pref-item">
                                        <div className="pref-item-content">
                                            <img src={item.image ? `/images/${item.image}` : "https://via.placeholder.com/50"} alt="" className="pref-item-image" />
                                            <span className="pref-item-name">{item.name}</span>
                                        </div>
                                        <button className="btn-remove-pref" onClick={() => handleRemovePreference(item.id, 'meal')} title="Xóa">✕</button>
                                    </div>
                                ))}
                                {preferences.disliked_workouts.map(item => (
                                    <div key={`w-${item.id}`} className="pref-item">
                                        <div className="pref-item-content">
                                            <span style={{ fontSize: '1.5rem' }}>🏋️</span>
                                            <span className="pref-item-name">{item.name} ({item.sport})</span>
                                        </div>
                                        <button className="btn-remove-pref" onClick={() => handleRemovePreference(item.id, 'workout')} title="Xóa">✕</button>
                                    </div>
                                ))}
                                {preferences.disliked_meals.length === 0 && preferences.disliked_workouts.length === 0 && (
                                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>Chưa có dữ liệu không thích</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Diary;
