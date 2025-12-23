import { useState, useEffect } from 'react';
import './ConfirmModal.css';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Xác nhận', 
  cancelText = 'Hủy',
  type = 'warning',
  requireText = null,
  inputPlaceholder = null
}) {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      setInputValue('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requireText && inputValue !== requireText) {
      return;
    }
    onConfirm();
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (!requireText || inputValue === requireText)) {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="confirm-modal-overlay" onClick={onClose}>
      <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className={`confirm-modal-header ${type}`}>
          <div className="confirm-modal-icon">
            {type === 'danger' && '⚠️'}
            {type === 'warning' && '⚠️'}
            {type === 'info' && 'ℹ️'}
            {type === 'success' && '✅'}
          </div>
          <h2 className="confirm-modal-title">{title}</h2>
        </div>
        
        <div className="confirm-modal-body">
          <p className="confirm-modal-message">{message}</p>
          
          {requireText && (
            <div className="confirm-modal-input-group">
              <label className="confirm-modal-input-label">
                Nhập <strong>'{requireText}'</strong> để xác nhận:
              </label>
              <input
                type="text"
                className="confirm-modal-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={inputPlaceholder || `Nhập "${requireText}"`}
                autoFocus
              />
            </div>
          )}
        </div>
        
        <div className="confirm-modal-footer">
          <button 
            className="confirm-modal-btn confirm-modal-btn-cancel"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button 
            className={`confirm-modal-btn confirm-modal-btn-confirm ${type}`}
            onClick={handleConfirm}
            disabled={requireText && inputValue !== requireText}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}





