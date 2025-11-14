// AdminPosts.jsx
import React, { useState, useEffect } from 'react';
import './AdminPosts.css';

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, per_page: 20, total: 0, pages: 0 });
  const [filters, setFilters] = useState({ status: 'pending', search: '' });
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedPosts, setSelectedPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
    fetchStats();
  }, [pagination.page, filters]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        per_page: pagination.per_page,
        ...filters
      });

      const res = await fetch(`/api/admin/posts?${params}`, {
        credentials: 'include'
      });
      const data = await res.json();

      if (data.success) {
        setPosts(data.data);
        setPagination(data.pagination);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/posts/stats', {
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

  const handleApprove = async (postId) => {
    if (!confirm('Xác nhận duyệt bài đăng này?')) return;

    try {
      const res = await fetch(`/api/admin/posts/${postId}/approve`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();

      if (data.success) {
        alert('✅ Đã duyệt bài đăng!');
        fetchPosts();
        fetchStats();
      } else {
        alert('❌ Lỗi: ' + data.error);
      }
    } catch (error) {
      alert('❌ Lỗi: ' + error.message);
    }
  };

  const handleRejectClick = (post) => {
    setSelectedPost(post);
    setShowRejectModal(true);
    setRejectReason('');
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối!');
      return;
    }

    try {
      const res = await fetch(`/api/admin/posts/${selectedPost.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: rejectReason })
      });
      const data = await res.json();

      if (data.success) {
        alert('✅ Đã từ chối bài đăng!');
        fetchPosts();
        fetchStats();
        setShowRejectModal(false);
      } else {
        alert('❌ Lỗi: ' + data.error);
      }
    } catch (error) {
      alert('❌ Lỗi: ' + error.message);
    }
  };

  const handleDelete = async (postId) => {
    if (!confirm('⚠️ Xác nhận xóa bài đăng này? Hành động không thể hoàn tác!')) return;

    try {
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();

      if (data.success) {
        alert('✅ Đã xóa bài đăng!');
        fetchPosts();
        fetchStats();
      } else {
        alert('❌ Lỗi: ' + data.error);
      }
    } catch (error) {
      alert('❌ Lỗi: ' + error.message);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedPosts.length === 0) {
      alert('Vui lòng chọn ít nhất 1 bài đăng!');
      return;
    }

    const actionText = {
      approve: 'duyệt',
      reject: 'từ chối',
      delete: 'xóa'
    }[action];

    if (!confirm(`Xác nhận ${actionText} ${selectedPosts.length} bài đăng?`)) return;

    try {
      const body = {
        post_ids: selectedPosts,
        action: action
      };

      if (action === 'reject') {
        const reason = prompt('Nhập lý do từ chối:');
        if (!reason) return;
        body.reason = reason;
      }

      const res = await fetch('/api/admin/posts/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (data.success) {
        alert(`✅ ${data.message}`);
        setSelectedPosts([]);
        fetchPosts();
        fetchStats();
      } else {
        alert('❌ Lỗi: ' + data.error);
      }
    } catch (error) {
      alert('❌ Lỗi: ' + error.message);
    }
  };

  const toggleSelectPost = (postId) => {
    setSelectedPosts(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedPosts.length === posts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(posts.map(p => p.id));
    }
  };

  const viewDetail = (post) => {
    setSelectedPost(post);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: '#f59e0b', label: '⏳ Chờ duyệt', icon: '⏳' },
      approved: { color: '#10b981', label: '✅ Đã duyệt', icon: '✅' },
      rejected: { color: '#ef4444', label: '❌ Từ chối', icon: '❌' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className="status-badge" style={{ background: badge.color }}>
        {badge.icon} {badge.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  if (loading && posts.length === 0) {
    return (
      <div className="admin-posts">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-posts">
      <div className="posts-header">
        <h1>📝 Quản Lý Bài Đăng</h1>
        <p className="subtitle">Duyệt và quản lý bài đăng từ người dùng</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="posts-stats">
          <div className="stat-card stat-pending" onClick={() => setFilters({ ...filters, status: 'pending' })}>
            <div className="stat-icon">⏳</div>
            <div>
              <h3>{stats.pending_posts}</h3>
              <p>Chờ duyệt</p>
            </div>
          </div>
          <div className="stat-card stat-approved" onClick={() => setFilters({ ...filters, status: 'approved' })}>
            <div className="stat-icon">✅</div>
            <div>
              <h3>{stats.approved_posts}</h3>
              <p>Đã duyệt</p>
            </div>
          </div>
          <div className="stat-card stat-rejected" onClick={() => setFilters({ ...filters, status: 'rejected' })}>
            <div className="stat-icon">❌</div>
            <div>
              <h3>{stats.rejected_posts}</h3>
              <p>Từ chối</p>
            </div>
          </div>
          <div className="stat-card stat-total" onClick={() => setFilters({ ...filters, status: '' })}>
            <div className="stat-icon">📊</div>
            <div>
              <h3>{stats.total_posts}</h3>
              <p>Tổng số</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Bulk Actions */}
      <div className="filters-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm nội dung hoặc tên user..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ duyệt</option>
          <option value="approved">Đã duyệt</option>
          <option value="rejected">Từ chối</option>
        </select>

        {selectedPosts.length > 0 && (
          <div className="bulk-actions">
            <span className="selected-count">{selectedPosts.length} đã chọn</span>
            <button className="btn-bulk-approve" onClick={() => handleBulkAction('approve')}>
              ✅ Duyệt
            </button>
            <button className="btn-bulk-reject" onClick={() => handleBulkAction('reject')}>
              ❌ Từ chối
            </button>
            <button className="btn-bulk-delete" onClick={() => handleBulkAction('delete')}>
              🗑️ Xóa
            </button>
          </div>
        )}

        <button className="btn-refresh" onClick={fetchPosts}>
          🔄 Làm mới
        </button>
      </div>

      {/* Posts Grid */}
      <div className="posts-grid">
        <div className="select-all-bar">
          <label>
            <input
              type="checkbox"
              checked={selectedPosts.length === posts.length && posts.length > 0}
              onChange={toggleSelectAll}
            />
            <span>Chọn tất cả</span>
          </label>
        </div>

        {posts.map(post => (
          <div key={post.id} className={`post-card ${selectedPosts.includes(post.id) ? 'selected' : ''}`}>
            <div className="post-header">
              <label className="post-checkbox">
                <input
                  type="checkbox"
                  checked={selectedPosts.includes(post.id)}
                  onChange={() => toggleSelectPost(post.id)}
                />
              </label>
              <div className="post-user-info">
                <div className="user-avatar">{post.user_name?.charAt(0)?.toUpperCase()}</div>
                <div>
                  <strong>{post.user_name}</strong>
                  <p className="post-date">{formatDate(post.created_at)}</p>
                </div>
              </div>
              {getStatusBadge(post.status)}
            </div>

            <div className="post-content">
              <p>{post.content}</p>
              {post.image && (
                <img src={post.image} alt="Post" className="post-image" />
              )}
            </div>

            {post.status === 'rejected' && post.rejection_reason && (
              <div className="rejection-reason">
                <strong>Lý do từ chối:</strong> {post.rejection_reason}
              </div>
            )}

            <div className="post-stats">
              <span>👍 {post.likes} likes</span>
              <span>💬 {post.comments} comments</span>
            </div>

            <div className="post-actions">
              <button className="btn-view" onClick={() => viewDetail(post)}>
                👁️ Xem
              </button>
              {post.status === 'pending' && (
                <>
                  <button className="btn-approve" onClick={() => handleApprove(post.id)}>
                    ✅ Duyệt
                  </button>
                  <button className="btn-reject" onClick={() => handleRejectClick(post)}>
                    ❌ Từ chối
                  </button>
                </>
              )}
              <button className="btn-delete" onClick={() => handleDelete(post.id)}>
                🗑️ Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>Không có bài đăng nào</h3>
          <p>Thử thay đổi bộ lọc hoặc tìm kiếm</p>
        </div>
      )}

      {/* Pagination */}
      {posts.length > 0 && (
        <div className="pagination">
          <button
            disabled={pagination.page === 1}
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
          >
            ← Trước
          </button>
          <span>Trang {pagination.page} / {pagination.pages}</span>
          <button
            disabled={pagination.page === pagination.pages}
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
          >
            Sau →
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedPost && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👁️ Chi Tiết Bài Đăng</h2>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <label>Người đăng:</label>
                <p><strong>{selectedPost.user_name}</strong> (ID: {selectedPost.user_id})</p>
              </div>
              <div className="detail-section">
                <label>Trạng thái:</label>
                <p>{getStatusBadge(selectedPost.status)}</p>
              </div>
              <div className="detail-section">
                <label>Ngày đăng:</label>
                <p>{formatDate(selectedPost.created_at)}</p>
              </div>
              <div className="detail-section">
                <label>Nội dung:</label>
                <p className="content-text">{selectedPost.content}</p>
              </div>
              {selectedPost.image && (
                <div className="detail-section">
                  <label>Hình ảnh:</label>
                  <img src={selectedPost.image} alt="Post" className="detail-image" />
                </div>
              )}
              {selectedPost.status === 'rejected' && selectedPost.rejection_reason && (
                <div className="detail-section rejection-box">
                  <label>Lý do từ chối:</label>
                  <p>{selectedPost.rejection_reason}</p>
                </div>
              )}
              <div className="detail-section">
                <label>Tương tác:</label>
                <p>👍 {selectedPost.likes} likes • 💬 {selectedPost.comments} comments</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedPost && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>❌ Từ Chối Bài Đăng</h2>
            </div>
            <div className="modal-body">
              <p><strong>Bài đăng của:</strong> {selectedPost.user_name}</p>
              <div className="form-group">
                <label>Lý do từ chối: *</label>
                <textarea
                  rows="4"
                  placeholder="Nhập lý do từ chối bài đăng..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowRejectModal(false)}>
                Hủy
              </button>
              <button className="btn-reject-confirm" onClick={confirmReject}>
                ❌ Từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}