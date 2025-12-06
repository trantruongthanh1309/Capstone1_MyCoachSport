# 🎯 HỆ THỐNG ĐIỂM TỰ ĐỘNG - HƯỚNG DẪN

## 📋 Tổng Quan

Hệ thống mới đơn giản hơn nhiều:
- ✅ User chỉ cần **tick ✅** hoàn thành
- ✅ Hệ thống **tự động tính điểm**
- ✅ Không cần nhập thông tin thủ công
- ✅ Công bằng cho tất cả người dùng

## 🚀 Cách Hoạt Động

### 1. Ở Trang Planner/Schedule:

```
┌─────────────────────────────────────┐
│ 🏋️ Bài Tập Hôm Nay                │
├─────────────────────────────────────┤
│ ☐ Chạy bộ 30 phút      [✅ Hoàn thành] │
│ ☐ Gym 45 phút          [✅ Hoàn thành] │
│ ☐ Yoga 20 phút         [✅ Hoàn thành] │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🍽️ Bữa Ăn Hôm Nay                 │
├─────────────────────────────────────┤
│ ☐ Bữa sáng (500 cal)   [✅ Đã ăn]    │
│ ☐ Bữa trưa (700 cal)   [✅ Đã ăn]    │
│ ☐ Bữa tối (600 cal)    [✅ Đã ăn]    │
└─────────────────────────────────────┘
```

### 2. Click "✅ Hoàn thành":
- Hệ thống tự động tính điểm
- Cập nhật UserStats
- Kiểm tra và mở khóa achievements
- Hiển thị thông báo: "Hoàn thành! +54 điểm"

## 💯 Công Thức Tính Điểm

### Workout Points:
```
Điểm = Thời gian (phút) × Độ khó × Hệ số môn thể thao

Hệ số độ khó: 1.5 (Medium - mặc định)
Hệ số môn thể thao:
  - Yoga: 0.8
  - Chạy bộ: 1.0
  - Cầu lông: 1.1
  - Bóng đá: 1.2
  - Bóng rổ: 1.2
  - Gym: 1.3
  - Bơi lội: 1.5
```

**Ví dụ:**
- Chạy bộ 30 phút: `30 × 1.5 × 1.0 = 45 điểm`
- Bơi lội 45 phút: `45 × 1.5 × 1.5 = 101 điểm`
- Gym 60 phút: `60 × 1.5 × 1.3 = 117 điểm`

### Meal Points:
```
Điểm = (Calories / 10) × Hệ số bữa ăn + Bonus protein

Hệ số bữa ăn:
  - Sáng (morning): 1.2 (khuyến khích ăn sáng)
  - Trưa (afternoon): 1.0
  - Tối (evening): 0.9 (khuyến khích ăn ít)

Bonus protein:
  - ≥ 30g: +10 điểm
  - ≥ 20g: +5 điểm
  - < 20g: +0 điểm

Giới hạn: Tối đa 100 điểm/bữa
```

**Ví dụ:**
- Bữa sáng 500 cal, 25g protein: `(500/10) × 1.2 + 5 = 65 điểm`
- Bữa trưa 700 cal, 35g protein: `(700/10) × 1.0 + 10 = 80 điểm`
- Bữa tối 600 cal, 15g protein: `(600/10) × 0.9 + 0 = 54 điểm`

## 🎯 Tại Sao Công Bằng?

### 1. Dựa Trên Effort Thực Tế:
- Tập lâu hơn = điểm cao hơn
- Môn khó hơn = điểm cao hơn
- Ăn đủ chất = điểm cao hơn

### 2. Khuyến Khích Thói Quen Tốt:
- Ăn sáng đầy đủ (x1.2)
- Ăn tối vừa phải (x0.9)
- Protein cao (bonus)

### 3. Cân Bằng Workout vs Meal:
- 1 workout 30 phút ≈ 45-100 điểm
- 1 bữa ăn ≈ 50-100 điểm
- Cả 2 đều quan trọng!

### 4. Giới Hạn Hợp Lý:
- Meal tối đa 100 điểm/bữa (tránh spam)
- Workout không giới hạn (khuyến khích tập nhiều)

## 📊 Ví Dụ Thực Tế

### User A - Chăm Chỉ:
```
Sáng:
  ✅ Chạy bộ 30 phút = 45 điểm
  ✅ Bữa sáng 500 cal, 25g protein = 65 điểm

Trưa:
  ✅ Gym 45 phút = 88 điểm
  ✅ Bữa trưa 700 cal, 35g protein = 80 điểm

Tối:
  ✅ Yoga 30 phút = 36 điểm
  ✅ Bữa tối 600 cal, 20g protein = 59 điểm

TỔNG: 373 điểm/ngày
```

### User B - Bình Thường:
```
Sáng:
  ✅ Bữa sáng 400 cal, 15g protein = 48 điểm

Trưa:
  ✅ Chạy bộ 20 phút = 30 điểm
  ✅ Bữa trưa 600 cal, 20g protein = 65 điểm

Tối:
  ✅ Bữa tối 500 cal, 15g protein = 45 điểm

TỔNG: 188 điểm/ngày
```

## 🔧 Cài Đặt

### Bước 1: Chạy Script SQL
```sql
-- Chạy file: auto_points_system.sql
-- Thêm cột IsCompleted, CompletedAt, PointsEarned vào UserSchedule
-- Tạo trigger tự động tính điểm
```

### Bước 2: API Endpoint Mới
```
POST /api/leaderboard/complete-schedule-item
Body: { "schedule_id": 123 }
Response: { "success": true, "points_earned": 54 }
```

### Bước 3: Cập Nhật Frontend
Thêm nút "✅ Hoàn thành" vào mỗi item trong Planner:

```jsx
<button onClick={() => handleComplete(scheduleId)}>
  ✅ Hoàn thành
</button>
```

## 🎮 Gamification

### Streak System:
- Tập/ăn đều đặn mỗi ngày → Tăng streak
- Streak càng cao → Unlock achievements
- Bỏ lỡ 1 ngày → Reset về 1

### Achievements:
- 🌱 Người mới: 1 bài tập (+10đ)
- 🔥 Kiên trì: 7 ngày liên tục (+50đ)
- ⚔️ Chiến binh: 30 ngày liên tục (+200đ)
- 👑 Huyền thoại: 100 ngày liên tục (+1000đ)

### Level System:
```
Level = (Tổng điểm / 1000) + 1
Experience = Tổng điểm % 1000

Ví dụ:
- 450 điểm → Level 1, EXP: 450/1000
- 1250 điểm → Level 2, EXP: 250/1000
- 5600 điểm → Level 6, EXP: 600/1000
```

## 💡 Tips Để Leo Hạng

1. **Tập đều đặn** - Duy trì streak
2. **Tập lâu hơn** - Thời gian = điểm
3. **Thử môn khó** - Bơi lội, Gym
4. **Ăn sáng đầy đủ** - Bonus x1.2
5. **Ăn đủ protein** - Bonus +5 hoặc +10
6. **Hoàn thành cả workout + meal** - Tối đa hóa điểm

## 🎯 Kết Luận

Hệ thống mới:
- ✅ **Đơn giản** - Chỉ cần tick
- ✅ **Tự động** - Không cần nhập
- ✅ **Công bằng** - Dựa trên effort thực
- ✅ **Động lực** - Gamification đầy đủ
- ✅ **Cân bằng** - Workout + Meal đều quan trọng

**Mục tiêu:** Khuyến khích người dùng:
- Tập luyện đều đặn
- Ăn uống khoa học
- Cạnh tranh lành mạnh
- Phát triển thói quen tốt

---

**Tạo bởi**: Antigravity AI
**Ngày**: 2025-12-04
**Version**: 2.0 - Auto Points System
