import React, { useState, useEffect } from 'react';
import './AdminMeals.css';
import Toast from '../../components/Toast';

export default function AdminMeals() {
  const [meals, setMeals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, per_page: 20, total: 0, pages: 0 });
  const [filters, setFilters] = useState({ search: '', sport: '', meal_time: '' });
  const [sports, setSports] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mealTypes, setMealTypes] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    fetchMeals();
    fetchStats();
    fetchFilters();
  }, [pagination.page, filters]);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        per_page: pagination.per_page,
        ...filters
      });

      const res = await fetch(`/api/admin/meals?${params}`, {
        credentials: 'include'
      });
      const data = await res.json();

      if (data.success) {
        setMeals(data.data);
        setPagination(data.pagination);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching meals:', error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/meals/stats', {
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

  const fetchFilters = async () => {
    try {
      const [sportsRes, typesRes] = await Promise.all([
        fetch('/api/admin/meals/filters/sports', { credentials: 'include' }),
        fetch('/api/admin/meals/filters/meal-types', { credentials: 'include' })
      ]);

      const sportsData = await sportsRes.json();
      const typesData = await typesRes.json();

      if (sportsData.success) setSports(sportsData.data);
      if (typesData.success) setMealTypes(typesData.data);
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

  const handleAdd = () => {
    setSelectedMeal({
      name: '',
      kcal: '',
      protein: '',
      carb: '',
      fat: '',
      serving_size: '',
      meal_time: '',
      suitable_sports: '',
      ingredients: '',
      recipe: '',
      cooking_time_min: '',
      difficulty: 'Medium',
      image: '',
      video_url: ''
    });
    setIsEditing(false);
    setShowModal(true);
  };


  const handleEdit = (meal) => {
    setSelectedMeal({ ...meal });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = (meal) => {
    setSelectedMeal(meal);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`/api/admin/meals/${selectedMeal.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();

      if (data.success) {
        showToast('✅ Xóa meal thành công!', 'success');
        fetchMeals();
        fetchStats();
        setShowDeleteModal(false);
      } else {
        showToast('❌ Lỗi: ' + data.error, 'error');
      }
    } catch (error) {
      showToast('❌ Lỗi: ' + error.message, 'error');
    }
  };

  const saveMeal = async () => {
    try {
      if (!selectedMeal.name || !selectedMeal.kcal) {
        showToast('Vui lòng điền đầy đủ thông tin bắt buộc (Tên, Kcal, Protein...)!', 'warning');
        return;
      }

      const url = isEditing
        ? `/api/admin/meals/${selectedMeal.id}`
        : '/api/admin/meals';

      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(selectedMeal)
      });
      const data = await res.json();

      if (data.success) {
        showToast(`✅ ${isEditing ? 'Cập nhật' : 'Thêm'} meal thành công!`, 'success');
        fetchMeals();
        fetchStats();
        setShowModal(false);
      } else {
        showToast('❌ Lỗi: ' + data.error, 'error');
      }
    } catch (error) {
      showToast('❌ Lỗi: ' + error.message, 'error');
    }
  };

  return (
    <div className="admin-meals">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
      <div className="meals-header">
        <div>
          <h1>🍽️ Quản Lý Món Ăn</h1>
          <p className="subtitle">Tổng {pagination.total} món ăn</p>
        </div>
        <button className="btn-add" onClick={handleAdd}>
          ➕ Thêm Món Ăn
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="meals-stats">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div>
              <h3>{stats.total_meals}</h3>
              <p>Tổng món</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div>
              <h3>{stats.avg_kcal}</h3>
              <p>TB Kcal</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💪</div>
            <div>
              <h3>{stats.avg_protein}g</h3>
              <p>TB Protein</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="filters-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm tên món..."
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
          value={filters.meal_time}
          onChange={(e) => handleFilterChange('meal_time', e.target.value)}
        >
          <option value="">Tất cả bữa ăn</option>
          {mealTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <button className="btn-refresh" onClick={fetchMeals}>
          🔄 Làm mới
        </button>
      </div>

      {/* Meals Grid */}
      <div className="meals-grid">
        {meals.map(meal => (
          <div key={meal.id} className="meal-card">
            <div className="meal-header">
              <h3>{meal.name}</h3>
              {meal.difficulty && (
                <span className={`meal-type-badge ${meal.difficulty.toLowerCase()}`}>{meal.difficulty}</span>
              )}
            </div>

            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>
              <strong>{meal.serving_size}</strong>
            </p>

            <div className="meal-nutrition">
              <div className="nutrition-item">
                <span className="nutrition-label">🔥 Kcal</span>
                <span className="nutrition-value">{meal.kcal}</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-label">💪 Protein</span>
                <span className="nutrition-value">{meal.protein}g</span>
              </div>
            </div>

            {meal.meal_time && (
              <div className="meal-tags">
                <strong>🕒 Bữa:</strong> {meal.meal_time}
              </div>
            )}

            {meal.suitable_sports && (
              <div className="meal-tags">
                <strong>🏅 Môn:</strong> {meal.suitable_sports}
              </div>
            )}

            <div className="meal-actions">
              <button className="btn-edit" onClick={() => handleEdit(meal)}>
                ✏️ Sửa
              </button>
              <button className="btn-delete" onClick={() => handleDelete(meal)}>
                🗑️ Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {meals.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">🍽️</div>
          <h3>Chưa có món ăn nào</h3>
          <p>Thêm món ăn đầu tiên nhé!</p>
        </div>
      )}

      {/* Pagination */}
      {meals.length > 0 && (
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

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditing ? '✏️ Sửa Món Ăn' : '➕ Thêm Món Ăn'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Tên món *</label>
                  <input
                    type="text"
                    value={selectedMeal.name}
                    onChange={(e) => setSelectedMeal({ ...selectedMeal, name: e.target.value })}
                    placeholder="Ví dụ: Ức gà luộc"
                  />
                </div>

                <div className="form-group">
                  <label>Kcal *</label>
                  <input type="number" value={selectedMeal.kcal} onChange={(e) => setSelectedMeal({ ...selectedMeal, kcal: e.target.value })} placeholder="300" />
                </div>
                <div className="form-group">
                  <label>Protein (g) *</label>
                  <input type="number" value={selectedMeal.protein} onChange={(e) => setSelectedMeal({ ...selectedMeal, protein: e.target.value })} placeholder="30" />
                </div>
                <div className="form-group">
                  <label>Carb (g) *</label>
                  <input type="number" value={selectedMeal.carb} onChange={(e) => setSelectedMeal({ ...selectedMeal, carb: e.target.value })} placeholder="40" />
                </div>
                <div className="form-group">
                  <label>Fat (g) *</label>
                  <input type="number" value={selectedMeal.fat} onChange={(e) => setSelectedMeal({ ...selectedMeal, fat: e.target.value })} placeholder="10" />
                </div>

                <div className="form-group">
                  <label>Khẩu phần (Serving Size)</label>
                  <input type="text" value={selectedMeal.serving_size} onChange={(e) => setSelectedMeal({ ...selectedMeal, serving_size: e.target.value })} placeholder="Ví dụ: 100g, 1 bát" />
                </div>

                <div className="form-group">
                  <label>Độ khó</label>
                  <select value={selectedMeal.difficulty} onChange={(e) => setSelectedMeal({ ...selectedMeal, difficulty: e.target.value })}>
                    <option value="Dễ">Dễ</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Khó">Khó</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Bữa ăn phù hợp (VD: Bữa Sáng, Bữa Trưa)</label>
                  <input type="text" value={selectedMeal.meal_time} onChange={(e) => setSelectedMeal({ ...selectedMeal, meal_time: e.target.value })} placeholder="Bữa Sáng, Bữa Trưa, Bữa Tối" />
                </div>

                <div className="form-group full-width">
                  <label>Môn thể thao phù hợp</label>
                  <input type="text" value={selectedMeal.suitable_sports} onChange={(e) => setSelectedMeal({ ...selectedMeal, suitable_sports: e.target.value })} placeholder="Gym, Yoga, Chạy bộ..." />
                </div>

                <div className="form-group full-width">
                  <label>Nguyên liệu (Ingredients)</label>
                  <textarea
                    rows="3"
                    value={selectedMeal.ingredients}
                    onChange={(e) => setSelectedMeal({ ...selectedMeal, ingredients: e.target.value })}
                    placeholder="Danh sách nguyên liệu..."
                  />
                </div>

                <div className="form-group full-width">
                  <label>Công thức / Cách làm (Recipe)</label>
                  <textarea
                    rows="4"
                    value={selectedMeal.recipe}
                    onChange={(e) => setSelectedMeal({ ...selectedMeal, recipe: e.target.value })}
                    placeholder="Hướng dẫn chi tiết cách làm..."
                  />
                </div>

              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="btn-save" onClick={saveMeal}>💾 Lưu</button>
            </div>
          </div>
        </div>
      )}


      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>⚠️ Xác Nhận Xóa</h2></div>
            <div className="modal-body">
              <p>Bạn có chắc muốn xóa <strong>{selectedMeal?.name}</strong>?</p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>Hủy</button>
              <button className="btn-delete-confirm" onClick={confirmDelete}>🗑️ Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}