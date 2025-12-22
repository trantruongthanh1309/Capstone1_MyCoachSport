# 🔄 Hướng Dẫn Thêm Nút SWAP vào Planner

## ✅ Đã Tạo

1. **PlannerEnhanced.css** - CSS mới để mở rộng bảng và style nút swap
2. **SwapButton.jsx** - Component nút swap độc lập

## 📝 Cách Thêm Vào Planner.jsx (KHÔNG PHÁ CODE CŨ)

### Bước 1: Import CSS và Component mới

Thêm vào **đầu file** `Planner.jsx` (sau dòng `import "./Planner.css";`):

```javascript
import "./Planner.css";
import "./PlannerEnhanced.css";  // ← THÊM DÒNG NÀY
import SwapButton from "../components/SwapButton";  // ← THÊM DÒNG NÀY
```

### Bước 2: Thêm Nút Swap vào Meal Cards

Tìm đoạn code này trong `Planner.jsx` (khoảng dòng 169-190):

```javascript
<div className="item-actions">
  <button
    className="action-btn like-btn"
    onClick={() => sendFeedback(mealItem.data.Id, "meal", 5)}
    title="Thích"
  >
    👍
  </button>
  <button
    className="action-btn dislike-btn"
    onClick={() => sendFeedback(mealItem.data.Id, "meal", 2)}
    title="Không thích"
  >
    👎
  </button>
  <button
    className="action-btn info-btn"
    onClick={() => showItemDetail(mealItem)}
    title="Chi tiết"
  >
    ℹ️
  </button>
</div>
```

**THÊM** nút swap vào cuối (trước thẻ đóng `</div>`):

```javascript
<div className="item-actions">
  <button
    className="action-btn like-btn"
    onClick={() => sendFeedback(mealItem.data.Id, "meal", 5)}
    title="Thích"
  >
    👍
  </button>
  <button
    className="action-btn dislike-btn"
    onClick={() => sendFeedback(mealItem.data.Id, "meal", 2)}
    title="Không thích"
  >
    👎
  </button>
  <button
    className="action-btn info-btn"
    onClick={() => showItemDetail(mealItem)}
    title="Chi tiết"
  >
    ℹ️
  </button>
  {/* ← THÊM NÚT SWAP Ở ĐÂY */}
  <SwapButton 
    item={{ ...mealItem, date }} 
    type="meal" 
    onSwapSuccess={fetchWeeklyPlan} 
  />
</div>
```

### Bước 3: Thêm Nút Swap vào Workout Cards

Tương tự, tìm 2 đoạn code workout actions (khoảng dòng 248-269 và 300-321) và thêm:

```javascript
<div className="item-actions">
  {/* ... các nút cũ ... */}
  
  {/* ← THÊM NÚT SWAP Ở ĐÂY */}
  <SwapButton 
    item={{ ...workoutItem, date }} 
    type="workout" 
    onSwapSuccess={fetchWeeklyPlan} 
  />
</div>
```

## 🎯 Kết Quả

Sau khi thêm, mỗi món ăn/bài tập sẽ có 4 nút:
- 👍 Thích
- 👎 Không thích  
- ℹ️ Chi tiết
- 🔄 Đổi món (MỚI!)

## 🔧 Tính Năng Nút Swap

1. **Click nút 🔄** → Mở modal
2. **Hiển thị món hiện tại** với thông tin chi tiết
3. **Hiển thị 10 options thay thế** cùng loại
4. **Click chọn món mới** → Highlight màu vàng
5. **Click "Xác nhận đổi"** → Cập nhật lịch trình

## 📊 Bảng Đã Được Mở Rộng

CSS mới đã:
- ✅ Tăng max-width từ 1600px → 1800px
- ✅ Tăng min-width các ô từ 200px → 220px
- ✅ Thêm padding cho cột cuối (Chủ nhật)
- ✅ Đảm bảo không bị lấp nội dung

## ⚠️ Lưu Ý

1. **KHÔNG XÓA** code cũ
2. **CHỈ THÊM** import và component mới
3. **KHÔNG SỬA** logic cũ
4. Nếu lỗi, chỉ cần xóa dòng import và component SwapButton là về như cũ

## 🚀 Backend API Cần Có

Để nút swap hoạt động, cần tạo API endpoint:

```python
# BACKEND/api/ai_coach.py hoặc file mới

@ai_coach_bp.route('/swap', methods=['POST'])
def swap_item():
    data = request.json
    user_id = data.get('user_id')
    date = data.get('date')
    old_item_id = data.get('old_item_id')
    new_item_id = data.get('new_item_id')
    item_type = data.get('type')  # 'meal' or 'workout'
    
    # TODO: Cập nhật database
    # - Xóa old_item khỏi schedule
    # - Thêm new_item vào schedule
    
    return jsonify({"success": True})
```

## 📝 Tóm Tắt

**Files mới tạo:**
- ✅ `PlannerEnhanced.css` - CSS mở rộng
- ✅ `SwapButton.jsx` - Component swap

**Cần thêm vào Planner.jsx:**
- 2 dòng import
- 3 component `<SwapButton />` (1 cho meals, 2 cho workouts)

**Không cần sửa:**
- ❌ Planner.css (giữ nguyên)
- ❌ Logic cũ (giữ nguyên)
- ❌ State management (giữ nguyên)

---

**Tạo bởi:** AI Assistant  
**Ngày:** 2025-11-22  
**Version:** 1.0
