import { useState, useEffect } from 'react';
import './Toast.css';

export default function Toast({ message, type = 'info', duration = 4000, onClose }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            if (onClose) onClose();
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

    return (
        <div className={`toast toast-${type} ${isVisible ? 'toast-show' : 'toast-hide'}`}>
            <div className="toast-icon">{icons[type]}</div>
            <div className="toast-content">
                <pre className="toast-message">{message}</pre>
            </div>
            <button className="toast-close" onClick={() => {
                setIsVisible(false);
                if (onClose) onClose();
            }}>
                ✕
            </button>
        </div>
    );
}
