import React, { useState, useEffect } from 'react';
import './AdminFeedback.css';

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, resolved
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
  }, [filter]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    
    // Mock data - Thay bằng API call thực
    setTimeout(() => {
      const mockData = [
        {
          id: 1,
          userName: 'Nguyễn Văn A',
          userEmail: 'nguyenvana@email.com',
          type: 'bug',
          title: 'Lỗi không load được meal plan',
          message: 'Khi tôi click vào meal plan thì trang bị trắng, không load được gì cả. Mong admin kiểm tra.',
          status: 'pending',
          priority: 'high',
          createdAt: '2025-11-12 10:30',
          response: null
        },
        {
          id: 2,
          userName: 'Trần Thị B',
          userEmail: 'tranthib@email.com',
          type: 'feature',
          title: 'Đề xuất thêm chế độ Dark mode',
          message: 'Ứng dụng rất hay nhưng nếu có dark mode thì tuyệt vời hơn, nhìn dễ chịu hơn khi tập buổi tối.',
          status: 'resolved',
          priority: 'medium',
          createdAt: '2025-11-11 15:20',
          response: 'Cảm ơn góp ý! Chúng tôi sẽ triển khai trong phiên bản tiếp theo.'
        },
        {
          id: 3,
          userName: 'Lê Văn C',
          userEmail: 'levanc@email.com',
          type: 'general',
          title: 'App rất tốt!',
          message: 'Cảm ơn team đã tạo ra app này. Đã giúp mình giảm được 5kg trong 2 tháng!',
          status: 'resolved',
          priority: 'low',
          createdAt: '2025-11-10 09:15',
          response: 'Cảm ơn bạn đã tin tùng và sử dụng MySportCoach! 💪'
        },
        {
          id: 4,
          userName: 'Phạm Thị D',
          userEmail: 'phamthid@email.com',
          type: 'bug',
          title: 'Video workout không play được',
          message: 'Video hướng dẫn bài tập không chạy được trên iPhone 12 của mình.',
          status: 'pending',
          priority: 'high',
          createdAt: '2025-11-12 14:45',
          response: null
        },
        {
          id: 5,
          userName: 'Hoàng Văn E',
          userEmail: 'hoangvane@email.com',
          type: 'feature',
          title: 'Muốn kết nối với Apple Watch',
          message: 'Mình dùng Apple Watch, có thể sync dữ liệu workout không ạ?',
          status: 'pending',
          priority: 'medium',
          createdAt: '2025-11-12 16:00',
          response: null
        }
      ];

      const filtered = filter === 'all' 
        ? mockData 
        : mockData.filter(f => f.status === filter);

      setFeedbacks(filtered);
      setLoading(false);
    }, 500);
  };

  const handleViewDetails = (feedback) => {
    setSelectedFeedback(feedback);
    setShowModal(true);
  };

  const handleResolve = (id) => {
    setFeedbacks(prev => 
      prev.map(f => f.id === id ? { ...f, status: 'resolved' } : f)
    );
    alert('✅ Đã đánh dấu feedback là đã xử lý!');
  };

  const handleDelete = (id) => {
    if (confirm('Bạn có chắc muốn xóa feedback này?')) {
      setFeedbacks(prev => prev.filter(f => f.id !== id));
      alert('🗑️ Đã xóa feedback!');
    }
  };

  const handleReply = (id, reply) => {
    setFeedbacks(prev =>
      prev.map(f => f.id === id ? { ...f, response: reply, status: 'resolved' } : f)
    );
    setShowModal(false);
    alert('✅ Đã gửi phản hồi!');
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

  const stats = {
    total: feedbacks.length,
    pending: feedbacks.filter(f => f.status === 'pending').length,
    resolved: feedbacks.filter(f => f.status === 'resolved').length
  };

  return (
    <div className="admin-feedback">
      <div className="feedback-header">
        <div className="header-icon">📨</div>
        <h1>Quản Lý Feedback</h1>
      </div>

      {/* Stats */}
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

      {/* Filters */}
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

      {/* Feedback List */}
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
                    <div className="user-avatar">{feedback.userName[0]}</div>
                    <div>
                      <div className="user-name">{feedback.userName}</div>
                      <div className="user-email">{feedback.userEmail}</div>
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
                  <span className="feedback-date">📅 {feedback.createdAt}</span>
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

      {/* Modal */}
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

// Modal Component
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
              <span>{feedback.userName} ({feedback.userEmail})</span>
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