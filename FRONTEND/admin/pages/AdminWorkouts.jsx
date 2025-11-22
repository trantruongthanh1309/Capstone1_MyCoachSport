import React, { useState, useEffect } from 'react';
import './AdminWorkouts.css';

const AdminWorkouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0 });
  const [filters, setFilters] = useState({
    sports: [],
    difficulties: []
  });
  
  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  
  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    duration_min: '',
    kcal: '',
    difficulty: '',
    sport_tags: '',
    equipment: '',
    tags: ''
  });

  // Fetch workouts
  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        per_page: 20,
        search: searchTerm,
        sport: selectedSport,
        difficulty: selectedDifficulty
      });

      const response = await fetch(`http://localhost:5000/api/admin/workouts?${params}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setWorkouts(data.workouts || []);
        setTotalPages(data.pages || 1);
      } else {
        console.error('Failed to fetch workouts');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/workouts/stats', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch filters
  const fetchFilters = async () => {
    try {
      const [sportsRes, difficultiesRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/workouts/filters/sports', { credentials: 'include' }),
        fetch('http://localhost:5000/api/admin/workouts/filters/difficulties', { credentials: 'include' })
      ]);

      if (sportsRes.ok) {
        const sports = await sportsRes.json();
        setFilters(prev => ({ ...prev, sports }));
      }
      
      if (difficultiesRes.ok) {
        const difficulties = await difficultiesRes.json();
        setFilters(prev => ({ ...prev, difficulties }));
      }
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  useEffect(() => {
    fetchWorkouts();
    fetchStats();
    fetchFilters();
  }, [currentPage, searchTerm, selectedSport, selectedDifficulty]);

  // Handle form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const url = editingWorkout
      ? `http://localhost:5000/api/admin/workouts/${editingWorkout.id}`
      : 'http://localhost:5000/api/admin/workouts';
    
    const method = editingWorkout ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(editingWorkout ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
        setShowModal(false);
        resetForm();
        fetchWorkouts();
        fetchStats();
      } else {
        alert('Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra');
    }
  };

  const handleEdit = (workout) => {
    setEditingWorkout(workout);
    setFormData({
      name: workout.name || '',
      duration_min: workout.duration_min || '',
      kcal: workout.kcal || '',
      difficulty: workout.difficulty || '',
      sport_tags: workout.sport_tags || '',
      equipment: workout.equipment || '',
      tags: workout.tags || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa workout này?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/workouts/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        alert('Xóa thành công!');
        fetchWorkouts();
        fetchStats();
      } else {
        alert('Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      duration_min: '',
      kcal: '',
      difficulty: '',
      sport_tags: '',
      equipment: '',
      tags: ''
    });
    setEditingWorkout(null);
  };

  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  return (
    <div className="admin-workouts">
      <div className="workouts-header">
        <div className="header-icon">💪</div>
        <h1>Quản Lý Bài Tập</h1>
      </div>

      <div className="workouts-stats">
        <h2>Tổng {stats.total} bài tập</h2>
      </div>

      <div className="workouts-controls">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm tên bài tập..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={selectedSport}
          onChange={(e) => setSelectedSport(e.target.value)}
          className="filter-select"
        >
          <option value="">Tất cả môn thể thao</option>
          {filters.sports.map(sport => (
            <option key={sport} value={sport}>{sport}</option>
          ))}
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="filter-select"
        >
          <option value="">Tất cả độ khó</option>
          {filters.difficulties.map(diff => (
            <option key={diff} value={diff}>{diff}</option>
          ))}
        </select>

        <button onClick={handleAddNew} className="btn-add">
          ➕ Làm mới
        </button>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : (
        <>
          <div className="workouts-table-container">
            <table className="workouts-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>TÊN BÀI TẬP</th>
                  <th>THỜI GIAN (phút)</th>
                  <th>KCAL</th>
                  <th>ĐỘ KHÓ</th>
                  <th>DỤNG CỤ</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {workouts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data">Không có dữ liệu</td>
                  </tr>
                ) : (
                  workouts.map(workout => (
                    <tr key={workout.id}>
                      <td>{workout.id}</td>
                      <td className="workout-name">{workout.name}</td>
                      <td>{workout.duration_min}</td>
                      <td>{workout.kcal}</td>
                      <td>
                        <span className={`badge badge-${workout.difficulty?.toLowerCase()}`}>
                          {workout.difficulty || 'N/A'}
                        </span>
                      </td>
                      <td>{workout.equipment || 'Không'}</td>
                      <td className="actions">
                        <button
                          onClick={() => handleEdit(workout)}
                          className="btn-edit"
                          title="Sửa"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(workout.id)}
                          className="btn-delete"
                          title="Xóa"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn-page"
            >
              ← Trước
            </button>
            <span className="page-info">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn-page"
            >
              Sau →
            </button>
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingWorkout ? '✏️ Sửa Bài Tập' : '➕ Thêm Bài Tập Mới'}</h2>
              <button onClick={() => setShowModal(false)} className="btn-close">×</button>
            </div>

            <form onSubmit={handleSubmit} className="workout-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Tên bài tập *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Thời gian (phút) *</label>
                  <input
                    type="number"
                    name="duration_min"
                    value={formData.duration_min}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Kcal tiêu thụ *</label>
                  <input
                    type="number"
                    name="kcal"
                    value={formData.kcal}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Độ khó *</label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Chọn độ khó</option>
                    <option value="easy">Dễ</option>
                    <option value="medium">Trung bình</option>
                    <option value="hard">Khó</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Môn thể thao (phân cách bằng dấu phẩy)</label>
                <input
                  type="text"
                  name="sport_tags"
                  value={formData.sport_tags}
                  onChange={handleInputChange}
                  placeholder="basketball,football"
                />
              </div>

              <div className="form-group">
                <label>Dụng cụ cần thiết</label>
                <input
                  type="text"
                  name="equipment"
                  value={formData.equipment}
                  onChange={handleInputChange}
                  placeholder="Dumbbells, Mat"
                />
              </div>

              <div className="form-group">
                <label>Tags (phân cách bằng dấu phẩy)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="cardio,strength"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  {editingWorkout ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWorkouts;