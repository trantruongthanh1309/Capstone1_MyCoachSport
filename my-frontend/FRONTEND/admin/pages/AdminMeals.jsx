import React, { useState, useEffect } from 'react';
import './AdminMeals.css';

export default function AdminMeals() {
  const [meals, setMeals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, per_page: 20, total: 0, pages: 0 });
  const [filters, setFilters] = useState({ search: '', sport: '', meal_type: '' });
  const [sports, setSports] = useState([]);
  const [mealTypes, setMealTypes] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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
      meal_type: '',
      sport_tags: '',
      ingredient_tags: ''
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
        alert('✅ Xóa meal thành công!');
        fetchMeals();
        fetchStats();
        setShowDeleteModal(false);
      } else {
        alert('❌ Lỗi: ' + data.error);
      }
    } catch (error) {
      alert('❌ Lỗi: ' + error.message);
    }
  };

  const saveMeal = async () => {
    try {
      if (!selectedMeal.name || !selectedMeal.kcal) {
        alert('Vui lòng điền đầy đủ thông tin!');
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
        alert(`✅ ${isEditing ? 'Cập nhật' : 'Thêm'} meal thành công!`);
        fetchMeals();
        fetchStats();
        setShowModal(false);
      } else {
        alert('❌ Lỗi: ' + data.error);
      }
    } catch (error) {
      alert('❌ Lỗi: ' + error.message);
    }
  };

  const getMealTypeLabel = (type) => {
    const labels = {
      breakfast: '🍳 Sáng',
      lunch: '🍱 Trưa',
      dinner: '🍽️ Tối',
      snack: '🍿 Snack'
    };
    return labels[type] || type;
  };

  if (loading && meals.length === 0) {
    return (
      <div className="admin-meals">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-meals">
      <div className="meals-header">
        <div>
          <h1>🍽️ Quản Lý Món Ăn</h1>
          <p className="subtitle">Tổng {pagination.total} món ăn</p>
        </div>
        <button className="btn-add" onClick={handleAdd}>
          ➕ Thêm Món Ăn
        </button>
      </div>

      {}
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
            <div className="stat-icon">🍳</div>
            <div>
              <h3>{stats.breakfast}</h3>
              <p>Bữa sáng</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🍱</div>
            <div>
              <h3>{stats.lunch}</h3>
              <p>Bữa trưa</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🍽️</div>
            <div>
              <h3>{stats.dinner}</h3>
              <p>Bữa tối</p>
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

      {}
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
          value={filters.meal_type}
          onChange={(e) => handleFilterChange('meal_type', e.target.value)}
        >
          <option value="">Tất cả bữa ăn</option>
          {mealTypes.map(type => (
            <option key={type} value={type}>{getMealTypeLabel(type)}</option>
          ))}
        </select>

        <button className="btn-refresh" onClick={fetchMeals}>
          🔄 Làm mới
        </button>
      </div>

      {}
      <div className="meals-grid">
        {meals.map(meal => (
          <div key={meal.id} className="meal-card">
            <div className="meal-header">
              <h3>{meal.name}</h3>
              {meal.meal_type && (
                <span className="meal-type-badge">{getMealTypeLabel(meal.meal_type)}</span>
              )}
            </div>

            <div className="meal-nutrition">
              <div className="nutrition-item">
                <span className="nutrition-label">🔥 Kcal</span>
                <span className="nutrition-value">{meal.kcal}</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-label">💪 Protein</span>
                <span className="nutrition-value">{meal.protein}g</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-label">🍚 Carb</span>
                <span className="nutrition-value">{meal.carb}g</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-label">🥑 Fat</span>
                <span className="nutrition-value">{meal.fat}g</span>
              </div>
            </div>

            {meal.sport_tags && (
              <div className="meal-tags">
                <strong>Môn:</strong> {meal.sport_tags}
              </div>
            )}

            {meal.ingredient_tags && (
              <div className="meal-tags">
                <strong>Nguyên liệu:</strong> {meal.ingredient_tags}
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

      {}
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

      {}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditing ? '✏️ Sửa Món Ăn' : '➕ Thêm Món Ăn'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Tên món *</label>
                  <input
                    type="text"
                    value={selectedMeal.name}
                    onChange={(e) => setSelectedMeal({ ...selectedMeal, name: e.target.value })}
                    placeholder="Ví dụ: Ức gà luộc"
                  />
                </div>
                <div className="form-group">
                  <label>Loại bữa</label>
                  <select
                    value={selectedMeal.meal_type}
                    onChange={(e) => setSelectedMeal({ ...selectedMeal, meal_type: e.target.value })}
                  >
                    <option value="">Chọn</option>
                    <option value="breakfast">Sáng</option>
                    <option value="lunch">Trưa</option>
                    <option value="dinner">Tối</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Kcal *</label>
                  <input
                    type="number"
                    value={selectedMeal.kcal}
                    onChange={(e) => setSelectedMeal({ ...selectedMeal, kcal: parseFloat(e.target.value) })}
                    placeholder="300"
                  />
                </div>
                <div className="form-group">
                  <label>Protein (g) *</label>
                  <input
                    type="number"
                    value={selectedMeal.protein}
                    onChange={(e) => setSelectedMeal({ ...selectedMeal, protein: parseFloat(e.target.value) })}
                    placeholder="30"
                  />
                </div>
                <div className="form-group">
                  <label>Carb (g) *</label>
                  <input
                    type="number"
                    value={selectedMeal.carb}
                    onChange={(e) => setSelectedMeal({ ...selectedMeal, carb: parseFloat(e.target.value) })}
                    placeholder="40"
                  />
                </div>
                <div className="form-group">
                  <label>Fat (g) *</label>
                  <input
                    type="number"
                    value={selectedMeal.fat}
                    onChange={(e) => setSelectedMeal({ ...selectedMeal, fat: parseFloat(e.target.value) })}
                    placeholder="10"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Môn thể thao</label>
                  <input
                    type="text"
                    value={selectedMeal.sport_tags}
                    onChange={(e) => setSelectedMeal({ ...selectedMeal, sport_tags: e.target.value })}
                    placeholder="football, gym (phân cách bằng dấu phẩy)"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Nguyên liệu</label>
                  <input
                    type="text"
                    value={selectedMeal.ingredient_tags}
                    onChange={(e) => setSelectedMeal({ ...selectedMeal, ingredient_tags: e.target.value })}
                    placeholder="chicken, rice, broccoli (phân cách bằng dấu phẩy)"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>
                Hủy
              </button>
              <button className="btn-save" onClick={saveMeal}>
                💾 {isEditing ? 'Cập nhật' : 'Thêm'}
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
              <p>Bạn có chắc muốn xóa món <strong>{selectedMeal?.name}</strong>?</p>
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