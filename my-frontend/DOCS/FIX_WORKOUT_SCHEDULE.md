# 🔧 HƯỚNG DẪN SỬA LỊCH TẬP LUYỆN - TẠO 2 WORKOUTS/NGÀY

## 🎯 Vấn Đề:
Lịch tập luyện chỉ có 1 workout/ngày (hoặc không có), nhiều ngày trống.

## ✅ Giải Pháp:
Sửa code để tạo **2 workouts/ngày** (sáng + tối) thay vì chỉ 1.

## 📝 Cách Sửa:

### File: `recommendation_service.py`

**Tìm dòng 313-340** (phần workout generation):

```python
# CŨ - CHỈ TẠO 1 WORKOUT:
print(f"💪 [WORKOUT] Checking workout slots...")
workout_slot = None

priority_slots = ["morning", "evening", "afternoon"]

for slot in priority_slots:
    if slot not in busy_slots:
        workout_slot = slot
        print(f"   ✅ Selected workout slot: {slot}")
        break  # ← BREAK Ở ĐÂY LÀ VẤN ĐỀ!
    else:
        print(f"   ⏭️ Skipped {slot} (busy)")

selected_workout = None
if workout_slot:
    all_workouts = Workout.query.all()
    scored_workouts = [(w, self._score_workout(w, workout_slot)) for w in all_workouts]
    scored_workouts.sort(key=lambda x: x[1], reverse=True)
    
    top_workouts = scored_workouts[:5]
    if top_workouts:
        selected_workout = random.choice(top_workouts)[0]
        schedule.append({
            "time": f"{workout_slot}_slot",
            "type": "workout",
            "data": self._serialize_workout(selected_workout)
        })
```

**THAY BẰNG - TẠO 2 WORKOUTS:**

```python
# MỚI - TẠO 2 WORKOUTS:
print(f"💪 [WORKOUT] Checking workout slots...")

# ✅ FIX: Tạo 2 workouts/ngày (sáng + tối) thay vì chỉ 1
workout_slots = []

# Ưu tiên sáng và tối
if "morning" not in busy_slots:
    workout_slots.append("morning")
    print(f"   ✅ Morning workout slot available")
else:
    print(f"   ⏭️ Skipped morning (busy)")

if "evening" not in busy_slots:
    workout_slots.append("evening")
    print(f"   ✅ Evening workout slot available")
else:
    print(f"   ⏭️ Skipped evening (busy)")

# Nếu không có cả 2 slot, thử afternoon
if len(workout_slots) < 2 and "afternoon" not in busy_slots:
    workout_slots.append("afternoon")
    print(f"   ✅ Afternoon workout slot available (backup)")

# Tạo workout cho mỗi slot
all_workouts = Workout.query.all()

for slot in workout_slots:
    scored_workouts = [(w, self._score_workout(w, slot)) for w in all_workouts]
    scored_workouts.sort(key=lambda x: x[1], reverse=True)
    
    top_workouts = scored_workouts[:5]
    if top_workouts:
        selected_workout = random.choice(top_workouts)[0]
        schedule.append({
            "time": f"{slot}_slot",
            "type": "workout",
            "data": self._serialize_workout(selected_workout)
        })
        print(f"   ✅ Added {slot} workout: {selected_workout.Name}")
```

## 🚀 Sau Khi Sửa:

1. **Chạy SQL Script:**
   ```sql
   -- Chạy file: clear_schedules.sql
   -- Xóa tất cả lịch cũ để tạo lại
   ```

2. **Restart Backend**

3. **Refresh Planner:**
   - Vào trang Planner
   - AI sẽ tạo lại lịch mới
   - Mỗi ngày sẽ có **2 workouts** (sáng + tối)

## 📊 Kết Quả Mong Đợi:

```
┌─────────────────────────────────┐
│ 🏋️ Kế Hoạch Tập Luyện          │
├─────────────────────────────────┤
│ Buổi sáng:                      │
│ ✅ Chạy bộ 30 phút              │
│ ✅ Gym 45 phút                  │
│ ✅ Bơi lội 40 phút              │
├─────────────────────────────────┤
│ Buổi tối:                       │
│ ✅ Yoga 30 phút                 │
│ ✅ Cầu lông 45 phút             │
│ ✅ Đạp xe 40 phút               │
└─────────────────────────────────┘
```

## ⚠️ Lưu Ý:

- Nếu user có busy slot ở sáng hoặc tối, AI sẽ tự động skip
- Nếu không đủ 2 slots, sẽ dùng afternoon làm backup
- Mỗi workout được chọn dựa trên:
  - Sport match với user
  - Goal match (giảm cân/tăng cơ)
  - Difficulty phù hợp
  - Intensity phù hợp với thời gian

---

**Tóm tắt:** Thay đổi từ **chọn 1 slot rồi break** → **chọn nhiều slots và loop qua từng slot**! 🎯
