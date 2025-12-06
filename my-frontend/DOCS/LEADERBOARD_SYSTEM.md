# 🏆 HỆ THỐNG BẢNG XẾP HẠNG CHUYÊN NGHIỆP

## 📋 Tổng Quan

Hệ thống bảng xếp hạng mới được thiết kế để:
- ✅ Tính điểm công bằng dựa trên nhiều yếu tố
- ✅ Khuyến khích người dùng tập luyện đều đặn (streak system)
- ✅ Tạo động lực qua achievements (thành tựu)
- ✅ Theo dõi tiến độ cá nhân chi tiết
- ✅ Cạnh tranh lành mạnh giữa người dùng

## 🎯 Công Thức Tính Điểm

### Điểm Cơ Bản
```
Điểm = Thời gian (phút) × Hệ số độ khó × Hệ số môn thể thao
```

### Hệ Số Độ Khó
- **Easy**: x1.0
- **Medium**: x1.5
- **Hard**: x2.0
- **Expert**: x3.0

### Hệ Số Môn Thể Thao
- Yoga: x0.8
- Chạy bộ: x1.0
- Cầu lông: x1.1
- Bóng đá: x1.2
- Bóng rổ: x1.2
- Gym: x1.3
- Bơi lội: x1.5

### Ví Dụ Tính Điểm
```
Bài tập: Bơi lội 30 phút, độ khó Hard
Điểm = 30 × 2.0 × 1.5 = 90 điểm
```

## 📊 Cấu Trúc Database

### 1. WorkoutLogs
Lưu lịch sử tập luyện của người dùng
- `Id`: ID tự động tăng
- `User_id`: ID người dùng
- `Workout_name`: Tên bài tập
- `Sport`: Môn thể thao
- `Duration_minutes`: Thời gian (phút)
- `Calories_burned`: Calo đốt cháy
- `Difficulty`: Độ khó (Easy/Medium/Hard/Expert)
- `Completed_at`: Thời gian hoàn thành
- `Points_earned`: Điểm nhận được

### 2. UserStats
Thống kê tổng hợp của người dùng
- `User_id`: ID người dùng
- `Total_points`: Tổng điểm
- `Total_workouts`: Tổng số bài tập
- `Current_streak`: Chuỗi ngày tập hiện tại
- `Longest_streak`: Chuỗi ngày tập dài nhất
- `Last_workout_date`: Ngày tập gần nhất
- `Level`: Cấp độ (mỗi 1000 điểm = 1 level)
- `Experience`: Kinh nghiệm (điểm % 1000)
- `Rank`: Hạng hiện tại

### 3. Achievements
Danh sách thành tựu
- `Name`: Tên thành tựu
- `Description`: Mô tả
- `Icon`: Biểu tượng emoji
- `Points_reward`: Điểm thưởng
- `Requirement_type`: Loại yêu cầu (workouts/streak/points)
- `Requirement_value`: Giá trị yêu cầu

### 4. UserAchievements
Thành tựu đã mở khóa của người dùng

## 🚀 Hướng Dẫn Cài Đặt

### Bước 1: Chạy Script SQL
```bash
# Mở SQL Server Management Studio
# Mở file: BACKEND/migrations/update_leaderboard_system.sql
# Chạy toàn bộ script (F5)
```

### Bước 2: Cập Nhật Route (Đã làm sẵn)
File `BACKEND/app.py` đã được cập nhật với blueprint mới.

### Bước 3: Cập Nhật Frontend Route
Thêm route mới vào `App.jsx`:
```jsx
import LeaderboardNew from './pages/LeaderboardNew';

// Trong routes:
<Route path="/leaderboard-new" element={<LeaderboardNew />} />
```

### Bước 4: Cập Nhật Navbar
Thêm link vào Navbar:
```jsx
<Link to="/leaderboard-new">🏆 Bảng Xếp Hạng</Link>
```

## 📱 Tính Năng Chính

### 1. Ghi Nhận Bài Tập
- Người dùng click "➕ Ghi nhận bài tập"
- Điền thông tin: tên bài tập, môn thể thao, thời gian, độ khó
- Hệ thống tự động tính điểm
- Cập nhật streak (chuỗi ngày tập)
- Kiểm tra và mở khóa achievements

### 2. Bảng Xếp Hạng
- Hiển thị top users theo điểm
- Top 1: 👑 Vàng
- Top 2: 🥈 Bạc
- Top 3: 🥉 Đồng
- Hiển thị: điểm, số bài tập, streak, level

### 3. Thống Kê Cá Nhân
- Hạng hiện tại
- Tổng điểm
- Số bài tập đã hoàn thành
- Streak hiện tại
- Level và thanh EXP

### 4. Thành Tựu (Achievements)
- Người mới bắt đầu: 1 bài tập
- Kiên trì: 7 ngày liên tục
- Chiến binh: 30 ngày liên tục
- Huyền thoại: 100 ngày liên tục
- Người chăm chỉ: 50 bài tập
- Chuyên gia: 200 bài tập
- Thạc sĩ thể thao: 1000 điểm
- Tiến sĩ thể thao: 5000 điểm

## 🔧 API Endpoints

### POST /api/leaderboard/log-workout
Ghi nhận bài tập mới
```json
{
  "workout_name": "Chạy bộ buổi sáng",
  "sport": "Chạy bộ",
  "duration_minutes": 30,
  "calories_burned": 250,
  "difficulty": "Medium"
}
```

### GET /api/leaderboard/rankings
Lấy bảng xếp hạng
```
Query params:
- page: số trang (default: 1)
- per_page: số items/trang (default: 50)
- sport: lọc theo môn thể thao
```

### GET /api/leaderboard/my-stats
Lấy thống kê cá nhân

### GET /api/leaderboard/achievements
Lấy danh sách thành tựu

### GET /api/leaderboard/my-workouts
Lấy lịch sử tập luyện

## 🎨 Giao Diện

### Màu Sắc
- Primary: Gradient #667eea → #764ba2
- Gold: #FFD700
- Silver: #C0C0C0
- Bronze: #CD7F32
- Success: #4caf50

### Animations
- Hover effects trên cards
- Smooth transitions
- Progress bar animation
- Modal fade in/out

## 💡 Tips Sử Dụng

### Cho Người Dùng
1. Tập luyện đều đặn để duy trì streak
2. Thử các độ khó khác nhau để tối ưu điểm
3. Mở khóa achievements để nhận điểm thưởng
4. Cạnh tranh với bạn bè trên bảng xếp hạng

### Cho Admin
1. Có thể thêm achievements mới vào bảng Achievements
2. Điều chỉnh hệ số tính điểm trong stored procedure
3. Theo dõi thống kê tổng quan qua view vw_Leaderboard

## 🔒 Bảo Mật

- Tất cả endpoints yêu cầu đăng nhập (session)
- User chỉ có thể ghi nhận bài tập cho chính mình
- Trigger tự động cập nhật stats, không thể cheat
- Achievements tự động unlock dựa trên dữ liệu thực

## 🐛 Troubleshooting

### Lỗi: "Stored procedure not found"
→ Chạy lại script SQL migration

### Lỗi: "Table already exists"
→ Bình thường, script đã xử lý

### Không hiển thị dữ liệu
→ Kiểm tra session đăng nhập
→ Kiểm tra CORS settings

## 📈 Tương Lai

Có thể mở rộng:
- [ ] Leaderboard theo tuần/tháng
- [ ] Challenges giữa users
- [ ] Rewards system (coins, badges)
- [ ] Social features (follow, like workouts)
- [ ] Integration với wearables (Fitbit, Apple Watch)
- [ ] AI coaching dựa trên performance

---

**Tạo bởi**: Antigravity AI
**Ngày**: 2025-12-04
**Version**: 1.0
