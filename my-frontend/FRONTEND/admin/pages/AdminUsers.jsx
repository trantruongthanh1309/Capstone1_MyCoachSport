import React, { useState, useEffect } from 'react';
import './AdminUsers.css';
import Toast from '../../components/Toast';

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    sex: '',
    height_cm: '',
    weight_kg: '',
    sport: '',
    goal: '',
    sessions_per_week: '',
    role: 'user'
  });

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    fetchFilters();
    fetchUsers();
  }, []);

  useEffect(() => {
    // Skip initial mount to avoid double fetch
    if (pagination.page === 1 && !filters.search && !filters.sport && !filters.goal) {
      return;
    }
    fetchUsers();
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
        showToast('✅ Xóa user thành công!', 'success');
        fetchUsers();
        setShowDeleteModal(false);
      } else {
        showToast('❌ Lỗi: ' + data.error, 'error');
      }
    } catch (error) {
      showToast('❌ Lỗi: ' + error.message, 'error');
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
        showToast('✅ Cập nhật thành công!', 'success');
        fetchUsers();
        setShowEditModal(false);
      } else {
        showToast('❌ Lỗi: ' + data.error, 'error');
      }
    } catch (error) {
      showToast('❌ Lỗi: ' + error.message, 'error');
    }
  };

  const handleAdd = () => {
    // Clear search filter to prevent any autofill interference
    setFilters({ search: '', sport: '', goal: '' });
    setNewUser({
      name: '',
      email: '',
      password: '',
      age: '',
      sex: '',
      height_cm: '',
      weight_kg: '',
      sport: '',
      goal: '',
      sessions_per_week: '',
      role: 'user'
    });
    setShowAddModal(true);
  };

  const createUser = async () => {
    try {
      // Validate required fields
      if (!newUser.name || !newUser.email || !newUser.password) {
        showToast('❌ Vui lòng điền đầy đủ thông tin bắt buộc (Tên, Email, Mật khẩu)', 'error');
        return;
      }

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          age: newUser.age ? parseInt(newUser.age) : null,
          sex: newUser.sex || null,
          height_cm: newUser.height_cm ? parseInt(newUser.height_cm) : null,
          weight_kg: newUser.weight_kg ? parseFloat(newUser.weight_kg) : null,
          sport: newUser.sport || null,
          goal: newUser.goal || null,
          sessions_per_week: newUser.sessions_per_week ? parseInt(newUser.sessions_per_week) : null,
          role: newUser.role || 'user'
        })
      });
      const data = await res.json();

      if (data.success) {
        showToast('✅ Tạo user thành công!', 'success');
        fetchUsers();
        setShowAddModal(false);
        setNewUser({
          name: '',
          email: '',
          password: '',
          age: '',
          sex: '',
          height_cm: '',
          weight_kg: '',
          sport: '',
          goal: '',
          sessions_per_week: '',
          role: 'user'
        });
      } else {
        showToast('❌ Lỗi: ' + data.error, 'error');
      }
    } catch (error) {
      showToast('❌ Lỗi: ' + error.message, 'error');
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
          <div className="admin-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
      <div className="users-header">
        <div>
          <h1>👥 Quản Lý Người Dùng</h1>
          <p className="subtitle">Tổng {pagination.total} người dùng</p>
        </div>
        <button className="btn-add" onClick={handleAdd}>
          ➕ Thêm User
        </button>
      </div>

      { }
      <div className="filters-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm tên hoặc email..."
            value={filters.search || ''}
            onChange={handleSearch}
            autoComplete="off"
            name="user-search"
            id="user-search"
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

      { }
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

      { }
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

      { }
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
                  <select
                    value={selectedUser.sport || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, sport: e.target.value })}
                  >
                    <option value="">Chọn môn thể thao</option>
                    {sports.map(sport => (
                      <option key={sport} value={sport}>{sport}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Mục tiêu</label>
                  <select
                    value={selectedUser.goal || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, goal: e.target.value })}
                  >
                    <option value="">Chọn mục tiêu</option>
                    {goals.map(goal => (
                      <option key={goal} value={goal}>{goal}</option>
                    ))}
                  </select>
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

      { }
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Thêm Người Dùng Mới</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Tên <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Nhập tên"
                  />
                </div>
                <div className="form-group">
                  <label>Email <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="example@email.com"
                    autoComplete="new-password"
                    name="new-user-email"
                    id="new-user-email"
                  />
                </div>
                <div className="form-group">
                  <label>Mật khẩu <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Nhập mật khẩu"
                  />
                </div>
                <div className="form-group">
                  <label>Tuổi</label>
                  <input
                    type="number"
                    value={newUser.age}
                    onChange={(e) => setNewUser({ ...newUser, age: e.target.value })}
                    placeholder="Nhập tuổi"
                  />
                </div>
                <div className="form-group">
                  <label>Giới tính</label>
                  <select
                    value={newUser.sex}
                    onChange={(e) => setNewUser({ ...newUser, sex: e.target.value })}
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
                    value={newUser.height_cm}
                    onChange={(e) => setNewUser({ ...newUser, height_cm: e.target.value })}
                    placeholder="Nhập chiều cao"
                  />
                </div>
                <div className="form-group">
                  <label>Cân nặng (kg)</label>
                  <input
                    type="number"
                    value={newUser.weight_kg}
                    onChange={(e) => setNewUser({ ...newUser, weight_kg: e.target.value })}
                    placeholder="Nhập cân nặng"
                  />
                </div>
                <div className="form-group">
                  <label>Môn thể thao</label>
                  <select
                    value={newUser.sport}
                    onChange={(e) => setNewUser({ ...newUser, sport: e.target.value })}
                  >
                    <option value="">Chọn môn thể thao</option>
                    {sports.map(sport => (
                      <option key={sport} value={sport}>{sport}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Mục tiêu</label>
                  <select
                    value={newUser.goal}
                    onChange={(e) => setNewUser({ ...newUser, goal: e.target.value })}
                  >
                    <option value="">Chọn mục tiêu</option>
                    {goals.map(goal => (
                      <option key={goal} value={goal}>{goal}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
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
                    value={newUser.sessions_per_week}
                    onChange={(e) => setNewUser({ ...newUser, sessions_per_week: e.target.value })}
                    placeholder="Nhập số buổi"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowAddModal(false)}>
                Hủy
              </button>
              <button className="btn-save" onClick={createUser}>
                ➕ Tạo User
              </button>
            </div>
          </div>
        </div>
      )}

      { }
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