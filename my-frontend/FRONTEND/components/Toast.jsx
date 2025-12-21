import { useState, useEffect } from 'react';
import './Toast.css';

export default function Toast({ message, type = 'info', duration = 4000, onClose }) {
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => {
                setIsVisible(false);
                if (onClose) onClose();
            }, 300); // Match animation duration
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!isVisible) return null;

    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            setIsVisible(false);
            if (onClose) onClose();
        }, 300);
    };

    return (
        <div className={`toast toast-${type} ${isExiting ? 'toast-hide' : 'toast-show'}`}>
            <div className="toast-icon">{icons[type]}</div>
            <div className="toast-content">
                <div className="toast-message">{message}</div>
            </div>
            <button 
                className="toast-close" 
                onClick={handleClose}
                aria-label="Đóng thông báo"
            >
                ✕
            </button>
        </div>
    );
}
