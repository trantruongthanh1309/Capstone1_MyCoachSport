import React, { useState, useEffect } from 'react';
import './AdminFeedback.css';

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });

  useEffect(() => {
    fetchFeedbacks();
    fetchStats();
  }, [filter]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/feedback?status=${filter}`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setFeedbacks(data.data);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/feedback/stats', {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleViewDetails = (feedback) => {
    setSelectedFeedback(feedback);
    setShowModal(true);
  };

  const handleResolve = async (id) => {
    try {
      const res = await fetch(`/api/admin/feedback/${id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reply: 'Resolved without reply' })
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Đã đánh dấu feedback là đã xử lý!');
        fetchFeedbacks();
        fetchStats();
      } else {
        alert('❌ Lỗi: ' + data.error);
      }
    } catch (error) {
      alert('❌ Lỗi: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Bạn có chắc muốn xóa feedback này?')) {
      try {
        const res = await fetch(`/api/admin/feedback/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        const data = await res.json();
        if (data.success) {
          alert('🗑️ Đã xóa feedback!');
          fetchFeedbacks();
          fetchStats();
        } else {
          alert('❌ Lỗi: ' + data.error);
        }
      } catch (error) {
        alert('❌ Lỗi: ' + error.message);
      }
    }
  };

  const handleReply = async (id, reply) => {
    try {
      const res = await fetch(`/api/admin/feedback/${id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reply })
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Đã gửi phản hồi!');
        setShowModal(false);
        fetchFeedbacks();
        fetchStats();
      } else {
        alert('❌ Lỗi: ' + data.error);
      }
    } catch (error) {
      alert('❌ Lỗi: ' + error.message);
    }
  };

  const getTypeLabel = (type) => {
    const types = {
      bug: { label: 'Lỗi', color: 'red' },
      feature: { label: 'Đề xuất', color: 'blue' },
      general: { label: 'Chung', color: 'gray' }
    };
    return types[type] || types.general;
  };

  const getPriorityLabel = (priority) => {
    const priorities = {
      high: { label: 'Cao', color: 'red' },
      medium: { label: 'Trung bình', color: 'orange' },
      low: { label: 'Thấp', color: 'green' }
    };
    return priorities[priority] || priorities.low;
  };

  return (
    <div className="admin-feedback">
      <div className="feedback-header">
        <div className="header-icon">📨</div>
        <h1>Quản Lý Feedback</h1>
      </div>

      {}
      <div className="feedback-stats">
        <div className="stat-box">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Tổng feedback</div>
        </div>
        <div className="stat-box pending">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Chờ xử lý</div>
        </div>
        <div className="stat-box resolved">
          <div className="stat-value">{stats.resolved}</div>
          <div className="stat-label">Đã xử lý</div>
        </div>
      </div>

      {}
      <div className="feedback-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tất cả
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Chờ xử lý
        </button>
        <button
          className={`filter-btn ${filter === 'resolved' ? 'active' : ''}`}
          onClick={() => setFilter('resolved')}
        >
          Đã xử lý
        </button>
      </div>

      {}
      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : (
        <div className="feedback-list">
          {feedbacks.length === 0 ? (
            <div className="no-data">Không có feedback nào</div>
          ) : (
            feedbacks.map(feedback => (
              <div key={feedback.id} className="feedback-card">
                <div className="feedback-card-header">
                  <div className="user-info">
                    <div className="user-avatar">{feedback.user_name?.[0] || '?'}</div>
                    <div>
                      <div className="user-name">{feedback.user_name}</div>
                      <div className="user-email">{feedback.user_email}</div>
                    </div>
                  </div>
                  <div className="feedback-meta">
                    <span className={`badge badge-${getTypeLabel(feedback.type).color}`}>
                      {getTypeLabel(feedback.type).label}
                    </span>
                    <span className={`badge badge-${getPriorityLabel(feedback.priority).color}`}>
                      {getPriorityLabel(feedback.priority).label}
                    </span>
                    <span className={`status status-${feedback.status}`}>
                      {feedback.status === 'pending' ? '⏳ Chờ' : '✅ Xong'}
                    </span>
                  </div>
                </div>

                <div className="feedback-content">
                  <h3>{feedback.title}</h3>
                  <p>{feedback.message}</p>
                  {feedback.response && (
                    <div className="feedback-response">
                      <strong>📝 Phản hồi:</strong> {feedback.response}
                    </div>
                  )}
                </div>

                <div className="feedback-card-footer">
                  <span className="feedback-date">📅 {new Date(feedback.created_at).toLocaleString('vi-VN')}</span>
                  <div className="feedback-actions">
                    <button
                      onClick={() => handleViewDetails(feedback)}
                      className="btn-view"
                    >
                      👁️ Xem
                    </button>
                    {feedback.status === 'pending' && (
                      <button
                        onClick={() => handleResolve(feedback.id)}
                        className="btn-resolve"
                      >
                        ✅ Xử lý
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(feedback.id)}
                      className="btn-delete"
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {}
      {showModal && selectedFeedback && (
        <FeedbackModal
          feedback={selectedFeedback}
          onClose={() => setShowModal(false)}
          onReply={handleReply}
        />
      )}
    </div>
  );
};

const FeedbackModal = ({ feedback, onClose, onReply }) => {
  const [reply, setReply] = useState(feedback.response || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (reply.trim()) {
      onReply(feedback.id, reply);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chi Tiết Feedback</h2>
          <button onClick={onClose} className="btn-close">×</button>
        </div>

        <div className="modal-body">
          <div className="feedback-detail">
            <div className="detail-row">
              <strong>Người gửi:</strong>
              <span>{feedback.user_name} ({feedback.user_email})</span>
            </div>
            <div className="detail-row">
              <strong>Loại:</strong>
              <span>{feedback.type}</span>
            </div>
            <div className="detail-row">
              <strong>Tiêu đề:</strong>
              <span>{feedback.title}</span>
            </div>
            <div className="detail-row">
              <strong>Nội dung:</strong>
              <p>{feedback.message}</p>
            </div>
            <div className="detail-row">
              <strong>Trạng thái:</strong>
              <span className={`status status-${feedback.status}`}>
                {feedback.status === 'pending' ? 'Chờ xử lý' : 'Đã xử lý'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="reply-form">
            <label>Phản hồi của bạn:</label>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Nhập phản hồi..."
              rows="4"
              required
            />
            <div className="form-actions">
              <button type="button" onClick={onClose} className="btn-cancel">
                Hủy
              </button>
              <button type="submit" className="btn-submit">
                📨 Gửi phản hồi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminFeedback;