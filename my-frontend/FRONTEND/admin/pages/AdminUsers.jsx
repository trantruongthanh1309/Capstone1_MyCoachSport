import React, { useState, useEffect } from 'react';
import './AdminUsers.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, per_page: 20, total: 0, pages: 0 });
  const [filters, setFilters] = useState({ search: '', sport: '', goal: '' });
  const [sports, setSports] = useState([]);
  const [goals, setGoals] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchFilters();
  }, [pagination.page, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        per_page: pagination.per_page,
        ...filters
      });

      const res = await fetch(`/api/admin/users?${params}`, {
        credentials: 'include'
      });
      const data = await res.json();

      if (data.success) {
        setUsers(data.data);
        setPagination(data.pagination);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [sportsRes, goalsRes] = await Promise.all([
        fetch('/api/admin/filters/sports', { credentials: 'include' }),
        fetch('/api/admin/filters/goals', { credentials: 'include' })
      ]);

      const sportsData = await sportsRes.json();
      const goalsData = await goalsRes.json();

      if (sportsData.success) setSports(sportsData.data);
      if (goalsData.success) setGoals(goalsData.data);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value });
    setPagination({ ...pagination, page: 1 });
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, page: 1 });
  };

  const handleEdit = (user) => {
    setSelectedUser({ ...user });
    setShowEditModal(true);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();

      if (data.success) {
        alert('✅ Xóa user thành công!');
        fetchUsers();
        setShowDeleteModal(false);
      } else {
        alert('❌ Lỗi: ' + data.error);
      }
    } catch (error) {
      alert('❌ Lỗi: ' + error.message);
    }
  };

  const saveUser = async () => {
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(selectedUser)
      });
      const data = await res.json();

      if (data.success) {
        alert('✅ Cập nhật thành công!');
        fetchUsers();
        setShowEditModal(false);
      } else {
        alert('❌ Lỗi: ' + data.error);
      }
    } catch (error) {
      alert('❌ Lỗi: ' + error.message);
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: { color: '#ef4444', label: 'Admin' },
      manager: { color: '#f59e0b', label: 'Manager' },
      trainer: { color: '#8b5cf6', label: 'Trainer' },
      user: { color: '#10b981', label: 'User' }
    };
    const badge = badges[role] || badges.user;
    return <span className="role-badge" style={{ background: badge.color }}>{badge.label}</span>;
  };

  if (loading && users.length === 0) {
    return (
      <div className="admin-users">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <div className="users-header">
        <h1>👥 Quản Lý Người Dùng</h1>
        <p className="subtitle">Tổng {pagination.total} người dùng</p>
      </div>

      {}
      <div className="filters-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm tên hoặc email..."
            value={filters.search}
            onChange={handleSearch}
          />
        </div>

        <select 
          value={filters.sport} 
          onChange={(e) => handleFilterChange('sport', e.target.value)}
        >
          <option value="">Tất cả môn thể thao</option>
          {sports.map(sport => (
            <option key={sport} value={sport}>{sport}</option>
          ))}
        </select>

        <select 
          value={filters.goal} 
          onChange={(e) => handleFilterChange('goal', e.target.value)}
        >
          <option value="">Tất cả mục tiêu</option>
          {goals.map(goal => (
            <option key={goal} value={goal}>{goal}</option>
          ))}
        </select>

        <button className="btn-refresh" onClick={fetchUsers}>
          🔄 Làm mới
        </button>
      </div>

      {}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Email</th>
              <th>Tuổi</th>
              <th>Giới tính</th>
              <th>Môn thể thao</th>
              <th>Mục tiêu</th>
              <th>Role</th>
              <th>Hoạt động</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td className="user-name">
                  <div className="user-avatar">{user.name?.charAt(0)?.toUpperCase()}</div>
                  <span>{user.name}</span>
                </td>
                <td>{user.email}</td>
                <td>{user.age || '-'}</td>
                <td>{user.sex || '-'}</td>
                <td>
                  {user.sport ? (
                    <span className="sport-tag">{user.sport}</span>
                  ) : '-'}
                </td>
                <td>
                  {user.goal ? (
                    <span className="goal-tag">{user.goal}</span>
                  ) : '-'}
                </td>
                <td>{getRoleBadge(user.role)}</td>
                <td>
                  <span className="activity-badge">{user.activity_level || 'Normal'}</span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(user)}
                      title="Chỉnh sửa"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(user)}
                      title="Xóa"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {}
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

      {}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Chỉnh Sửa Người Dùng</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Tên</label>
                  <input
                    type="text"
                    value={selectedUser.name || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={selectedUser.email || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Tuổi</label>
                  <input
                    type="number"
                    value={selectedUser.age || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, age: parseInt(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Giới tính</label>
                  <select
                    value={selectedUser.sex || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, sex: e.target.value })}
                  >
                    <option value="">Chọn</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Chiều cao (cm)</label>
                  <input
                    type="number"
                    value={selectedUser.height_cm || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, height_cm: parseInt(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Cân nặng (kg)</label>
                  <input
                    type="number"
                    value={selectedUser.weight_kg || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, weight_kg: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Môn thể thao</label>
                  <input
                    type="text"
                    value={selectedUser.sport || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, sport: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Mục tiêu</label>
                  <input
                    type="text"
                    value={selectedUser.goal || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, goal: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={selectedUser.role || 'user'}
                    onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                  >
                    <option value="user">User</option>
                    <option value="trainer">Trainer</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Số buổi/tuần</label>
                  <input
                    type="number"
                    value={selectedUser.sessions_per_week || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, sessions_per_week: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEditModal(false)}>
                Hủy
              </button>
              <button className="btn-save" onClick={saveUser}>
                💾 Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚠️ Xác Nhận Xóa</h2>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc muốn xóa user <strong>{selectedUser?.name}</strong>?</p>
              <p className="warning-text">⚠️ Hành động này không thể hoàn tác!</p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>
                Hủy
              </button>
              <button className="btn-delete-confirm" onClick={confirmDelete}>
                🗑️ Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}