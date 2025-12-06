import { useState, useEffect, useRef } from 'react';
import "./NotificationBell.css";

export default function NotificationBell() {
    const [notifs, setNotifs] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    const fetchNotifs = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/notifications/', { credentials: 'include' });
            const data = await res.json();
            setNotifs(data);
        } catch (err) {
            console.error("Notif error", err);
        }
    };

    const markAllAsRead = () => {
        setNotifs([]);
    };

    useEffect(() => {
        fetchNotifs();
        const interval = setInterval(fetchNotifs, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const unreadCount = notifs.length;

    return (
        <div className="notif-wrapper" ref={wrapperRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="notif-btn">
                <span className="notif-icon">🔔</span>
                {unreadCount > 0 && (
                    <span className="notif-badge">{unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notif-dropdown">
                    <div className="notif-header">
                        <h3>Thông báo {unreadCount > 0 && `(${unreadCount})`}</h3>
                        <button onClick={() => setIsOpen(false)} className="close-btn">✕</button>
                    </div>

                    <div className="notif-list">
                        {notifs.length === 0 ? (
                            <div className="notif-empty">
                                <span style={{ fontSize: '2.5rem' }}>🔕</span>
                                <p>Không có thông báo mới</p>
                                <small>Lịch ăn/tập sắp tới sẽ hiện ở đây</small>
                            </div>
                        ) : (
                            notifs.map((n) => (
                                <div key={n.id} className="notif-item">
                                    <div className={`item-icon ${n.type}`}>
                                        {n.type === 'workout' ? '🏋️' : '🥗'}
                                    </div>
                                    <div className="item-content">
                                        <h4>{n.title}</h4>
                                        <p>{n.message}</p>
                                        <span className="item-time">
                                            {n.minutes_diff > 0
                                                ? `⏰ Còn ${n.minutes_diff} phút`
                                                : `⏱️ Đã qua ${Math.abs(n.minutes_diff)} phút`}
                                            {n.time && ` • ${n.time}`}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {notifs.length > 0 && (
                        <div className="notif-footer">
                            <button className="mark-read-btn" onClick={markAllAsRead}>
                                ✓ Đánh dấu tất cả đã đọc
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
