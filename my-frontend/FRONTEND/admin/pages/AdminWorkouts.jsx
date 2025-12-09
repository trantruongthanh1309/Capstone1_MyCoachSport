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

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sport: '',
    duration_min: '',
    calorie_burn: '',
    difficulty: '',
    intensity: '',
    equipment: '',
    muscle_groups: '',
    goal_focus: '',
    sets: '',
    reps: '',
    rest_time: '',
    description: '',
    instructions: '',
    safety_notes: '',
    ai_tags: '',
    goals: '',
    primary_muscles: '',
    secondary_muscles: '',
    progression_notes: '',
    regression_notes: '',
    prerequisites: '',
    video_url: '',
    is_active: true
  });

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

      const response = await fetch(`/api/admin/workouts?${params}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setWorkouts(data.data || []);
          setTotalPages(data.pagination?.pages || 1);
        }
      } else {
        console.error('Failed to fetch workouts');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/workouts/stats', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data);
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchFilters = async () => {
    try {
      const [sportsRes, difficultiesRes] = await Promise.all([
        fetch('/api/admin/workouts/filters/sports', { credentials: 'include' }),
        fetch('/api/admin/workouts/filters/difficulties', { credentials: 'include' })
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const workoutId = editingWorkout ? (editingWorkout.Id || editingWorkout.id) : null;
    const url = workoutId
      ? `/api/admin/workouts/${workoutId}`
      : '/api/admin/workouts';

    const method = workoutId ? 'PUT' : 'POST';

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
      name: workout.Name || workout.name || '',
      sport: workout.Sport || workout.sport || '',
      duration_min: workout.Duration_min || workout.duration_min || '',
      calorie_burn: workout.CalorieBurn || workout.calorie_burn || workout.kcal || '',
      difficulty: workout.Difficulty || workout.difficulty || '',
      intensity: workout.Intensity || workout.intensity || '',
      equipment: workout.Equipment || workout.equipment || '',
      muscle_groups: workout.MuscleGroups || workout.muscle_groups || '',
      goal_focus: workout.GoalFocus || workout.goal_focus || '',
      sets: workout.Sets || workout.sets || '',
      reps: workout.Reps || workout.reps || '',
      rest_time: workout.RestTime || workout.rest_time || '',
      description: workout.Description || workout.description || '',
      instructions: workout.Instructions || workout.instructions || '',
      safety_notes: workout.SafetyNotes || workout.safety_notes || '',
      ai_tags: workout.AITags || workout.ai_tags || workout.tags || '',
      goals: workout.Goals || workout.goals || '',
      primary_muscles: workout.PrimaryMuscles || workout.primary_muscles || '',
      secondary_muscles: workout.SecondaryMuscles || workout.secondary_muscles || '',
      progression_notes: workout.ProgressionNotes || workout.progression_notes || '',
      regression_notes: workout.RegressionNotes || workout.regression_notes || '',
      prerequisites: workout.Prerequisites || workout.prerequisites || '',
      video_url: workout.VideoUrl || workout.video_url || '',
      is_active: workout.IsActive !== undefined ? workout.IsActive : (workout.is_active !== undefined ? workout.is_active : true)
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa workout này?')) return;

    try {
      const response = await fetch(`/api/admin/workouts/${id}`, {
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
      sport: '',
      duration_min: '',
      calorie_burn: '',
      difficulty: '',
      intensity: '',
      equipment: '',
      muscle_groups: '',
      goal_focus: '',
      sets: '',
      reps: '',
      rest_time: '',
      description: '',
      instructions: '',
      safety_notes: '',
      ai_tags: '',
      goals: '',
      primary_muscles: '',
      secondary_muscles: '',
      progression_notes: '',
      regression_notes: '',
      prerequisites: '',
      video_url: '',
      is_active: true
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
          ➕ Thêm mới
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="admin-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
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
                  workouts.map(workout => {
                    const id = workout.Id || workout.id;
                    const name = workout.Name || workout.name;
                    const duration = workout.Duration_min || workout.duration_min;
                    const kcal = workout.CalorieBurn || workout.calorie_burn || workout.kcal;
                    const difficulty = workout.Difficulty || workout.difficulty;
                    const equipment = workout.Equipment || workout.equipment;
                    
                    return (
                      <tr key={id}>
                        <td>{id}</td>
                        <td className="workout-name">{name}</td>
                        <td>{duration}</td>
                        <td>{kcal}</td>
                        <td>
                          <span className={`badge badge-${difficulty?.toLowerCase() || ''}`}>
                            {difficulty || 'N/A'}
                          </span>
                        </td>
                        <td>{equipment || 'Không'}</td>
                        <td className="actions">
                          <button
                            onClick={() => handleEdit(workout)}
                            className="btn-edit"
                            title="Sửa"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(id)}
                            className="btn-delete"
                            title="Xóa"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })
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

      { }
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
                  <label>Môn thể thao *</label>
                  <input
                    type="text"
                    name="sport"
                    value={formData.sport}
                    onChange={handleInputChange}
                    placeholder="Gym, Bóng đá, Chạy bộ..."
                    required
                  />
                </div>
              </div>

              <div className="form-row">
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

                <div className="form-group">
                  <label>Calo tiêu thụ *</label>
                  <input
                    type="number"
                    name="calorie_burn"
                    value={formData.calorie_burn}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Độ khó *</label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Chọn độ khó</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Cường độ</label>
                  <select
                    name="intensity"
                    value={formData.intensity}
                    onChange={handleInputChange}
                  >
                    <option value="">Chọn cường độ</option>
                    <option value="Low">Low</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                    <option value="Very High">Very High</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nhóm cơ chính</label>
                  <input
                    type="text"
                    name="muscle_groups"
                    value={formData.muscle_groups}
                    onChange={handleInputChange}
                    placeholder="Ngực, Lưng, Chân..."
                  />
                </div>

                <div className="form-group">
                  <label>Mục tiêu</label>
                  <input
                    type="text"
                    name="goal_focus"
                    value={formData.goal_focus}
                    onChange={handleInputChange}
                    placeholder="Tốc độ, Sức bền, Sức mạnh..."
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Sets</label>
                  <input
                    type="text"
                    name="sets"
                    value={formData.sets}
                    onChange={handleInputChange}
                    placeholder="3-5"
                  />
                </div>

                <div className="form-group">
                  <label>Reps</label>
                  <input
                    type="text"
                    name="reps"
                    value={formData.reps}
                    onChange={handleInputChange}
                    placeholder="8-12"
                  />
                </div>

                <div className="form-group">
                  <label>Thời gian nghỉ (giây)</label>
                  <input
                    type="number"
                    name="rest_time"
                    value={formData.rest_time}
                    onChange={handleInputChange}
                    placeholder="60"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Dụng cụ cần thiết</label>
                <input
                  type="text"
                  name="equipment"
                  value={formData.equipment}
                  onChange={handleInputChange}
                  placeholder="Dumbbells, Mat, Barbell..."
                />
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Mô tả về bài tập..."
                />
              </div>

              <div className="form-group">
                <label>Hướng dẫn</label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Hướng dẫn chi tiết cách thực hiện..."
                />
              </div>

              <div className="form-group">
                <label>Lưu ý an toàn</label>
                <textarea
                  name="safety_notes"
                  value={formData.safety_notes}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Lưu ý về an toàn khi tập..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>AI Tags (phân cách bằng dấu phẩy)</label>
                  <input
                    type="text"
                    name="ai_tags"
                    value={formData.ai_tags}
                    onChange={handleInputChange}
                    placeholder="bóng đá, cardio, strength..."
                  />
                </div>

                <div className="form-group">
                  <label>Video URL</label>
                  <input
                    type="text"
                    name="video_url"
                    value={formData.video_url}
                    onChange={handleInputChange}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Cơ chính</label>
                  <input
                    type="text"
                    name="primary_muscles"
                    value={formData.primary_muscles}
                    onChange={handleInputChange}
                    placeholder="Cơ ngực, Cơ lưng..."
                  />
                </div>

                <div className="form-group">
                  <label>Cơ phụ</label>
                  <input
                    type="text"
                    name="secondary_muscles"
                    value={formData.secondary_muscles}
                    onChange={handleInputChange}
                    placeholder="Cơ tay trước, Cơ vai..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Điều kiện tiên quyết</label>
                <textarea
                  name="prerequisites"
                  value={formData.prerequisites}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Cần có kỹ năng/điều kiện gì trước khi tập..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ghi chú tăng tiến</label>
                  <textarea
                    name="progression_notes"
                    value={formData.progression_notes}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Cách tăng độ khó..."
                  />
                </div>

                <div className="form-group">
                  <label>Ghi chú giảm độ khó</label>
                  <textarea
                    name="regression_notes"
                    value={formData.regression_notes}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Cách giảm độ khó cho người mới..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  />
                  {' '}Hoạt động
                </label>
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