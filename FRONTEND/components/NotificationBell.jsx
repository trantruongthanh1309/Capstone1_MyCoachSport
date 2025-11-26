import { useState, useEffect, useRef } from 'react';
import "./NotificationBell.css";

export default function NotificationBell() {
    const [notifs, setNotifs] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    // Fetch notifications
    const fetchNotifs = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/notifications/', { credentials: 'include' });
            const data = await res.json();
            setNotifs(data);
        } catch (err) {
            console.error("Notif error", err);
        }
    };

    useEffect(() => {
        fetchNotifs();
        const interval = setInterval(fetchNotifs, 60000);
        return () => clearInterval(interval);
    }, []);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    return (
        <div className="notif-wrapper" ref={wrapperRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="notif-btn">
                <span className="notif-icon">🔔</span>
                {notifs.length > 0 && (
                    <span className="notif-badge">{notifs.length}</span>
                )}
            </button>

            {isOpen && (
                <div className="notif-dropdown">
                    <div className="notif-header">
                        <h3>Thông báo</h3>
                        <button onClick={() => setIsOpen(false)} className="close-btn">✕</button>
                    </div>

                    <div className="notif-list">
                        {notifs.length === 0 ? (
                            <div className="notif-empty">
                                <p>Không có thông báo nào</p>
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
                                            {n.minutes_diff > 0 ? `⏰ ${n.minutes_diff} phút nữa` : `⏰ ${Math.abs(n.minutes_diff)} phút trước`}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {notifs.length > 0 && (
                        <div className="notif-footer">
                            <button className="mark-read-btn">Đánh dấu tất cả đã đọc</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
