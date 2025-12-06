# 🚀 HƯỚNG DẪN THÊM NÚT "✅ HOÀN THÀNH" VÀO PLANNER

## ✅ Đã Làm Xong:

1. ✅ Database: Script `auto_points_system.sql` - Chạy xong
2. ✅ API: Endpoint `/api/leaderboard/complete-schedule-item` - Đã có
3. ✅ Function: `handleComplete()` đã thêm vào `Planner.jsx` (dòng 117-137)

## 📝 CẦN LÀM TIẾP:

### Bước 1: Thêm Nút Vào Meal Items

Tìm dòng 208 trong `Planner.jsx`, thêm nút này **TRƯỚC** nút "👍":

```jsx
<button
  className="action-btn complete-btn"
  onClick={() => handleComplete(mealItem.schedule_id)}
  title="Hoàn thành"
  disabled={mealItem.is_completed}
>
  {mealItem.is_completed ? '✅' : '☑️'}
</button>
```

### Bước 2: Thêm Nút Vào Workout Morning (dòng ~297)

Tìm `morning_slot` workout, thêm nút tương tự:

```jsx
<button
  className="action-btn complete-btn"
  onClick={() => handleComplete(workoutItem.schedule_id)}
  title="Hoàn thành"
  disabled={workoutItem.is_completed}
>
  {workoutItem.is_completed ? '✅' : '☑️'}
</button>
```

### Bước 3: Thêm Nút Vào Workout Evening (dòng ~350)

Tìm `evening_slot` workout, thêm nút tương tự.

### Bước 4: Thêm CSS Cho Nút Complete

Thêm vào `Planner.css` hoặc `PlannerEnhanced.css`:

```css
.complete-btn {
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
  font-size: 1.2rem;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.complete-btn:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.complete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #ccc;
}
```

## 🎯 Cách Hoạt Động:

1. User click nút "☑️ Hoàn thành"
2. Gọi API với `schedule_id`
3. Backend:
   - Update `IsCompleted = 1`
   - Trigger tự động tính điểm
   - Cập nhật UserStats
4. Frontend:
   - Hiển thị toast: "Hoàn thành! +54 điểm"
   - Reload lịch để cập nhật UI
   - Nút chuyển thành "✅" và disabled

## 🔧 Nếu Lỗi "schedule_id not found":

Cần cập nhật API `/api/ai/schedule` để trả về `schedule_id` và `is_completed`:

```python
# Trong api/ai_coach.py
for item in schedule:
    item['schedule_id'] = item.get('id')  # ID từ UserSchedule
    item['is_completed'] = item.get('IsCompleted', False)
```

## 📊 Test Thử:

1. Chạy script SQL: `auto_points_system.sql`
2. Restart backend
3. Vào trang Planner
4. Click "☑️" trên một meal/workout
5. Xem toast hiển thị: "Hoàn thành! +XX điểm"
6. Vào Leaderboard xem điểm đã tăng

## 💡 Tips:

- Nút sẽ disabled sau khi complete (không click được nữa)
- Icon đổi từ ☑️ → ✅
- Mỗi item chỉ complete được 1 lần
- Điểm tự động tính dựa trên:
  - Workout: Thời gian × Độ khó × Hệ số môn
  - Meal: (Calories/10) × Hệ số bữa + Bonus protein

---

**Nếu cần tôi tạo file Planner.jsx hoàn chỉnh, cho tôi biết!** 😊
