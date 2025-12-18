# DANH SÁCH FILE CSS & JSX THEO MỤC
## MySportCoach AI - File Reference Guide

---

## 2.1. Authentication & Authorization (Xác thực & Phân quyền)

### 2.1.1. Sign In (Đăng nhập)
- **JSX**: `my-frontend/FRONTEND/pages/Login.jsx`
- **CSS**: `my-frontend/FRONTEND/pages/Login.module.css`

### 2.1.2. Register (Đăng ký)
- **JSX**: `my-frontend/FRONTEND/pages/Register.jsx`
- **CSS**: `my-frontend/FRONTEND/pages/Register.module.css`

### 2.1.3. Forgot Password (Quên mật khẩu)
- **JSX**: `my-frontend/FRONTEND/pages/ForgotPassword.jsx`
- **CSS**: `my-frontend/FRONTEND/pages/ForgotPassword.module.css`

---

## 2.2. Common Components (Thành phần chung)

### 2.2.1. Header/Navbar (Thanh điều hướng)
- **JSX**: `my-frontend/FRONTEND/components/Navbar.jsx`
- **CSS**: `my-frontend/FRONTEND/components/Navbar.css`

### 2.2.2. Footer (Chân trang)
- **JSX**: `my-frontend/FRONTEND/components/Footer.jsx`
- **CSS**: `my-frontend/FRONTEND/components/Footer.css`

### 2.2.3. Notification Bell (Thông báo)
- **JSX**: `my-frontend/FRONTEND/components/NotificationBell.jsx`
- **CSS**: `my-frontend/FRONTEND/components/NotificationBell.css`

### 2.2.4. ChatBox (Hộp trò chuyện AI)
- **JSX**: `my-frontend/FRONTEND/components/ChatBox.jsx`
- **CSS**: `my-frontend/FRONTEND/components/ChatBox.css`

### 2.2.5. Weather Card (Thẻ thời tiết)
- **JSX**: `my-frontend/FRONTEND/components/WeatherCard.jsx`
- **CSS**: (Có thể được style inline hoặc trong component cha)

### 2.2.6. Toast Notifications (Thông báo toast)
- **JSX**: `my-frontend/FRONTEND/components/Toast.jsx`
- **CSS**: `my-frontend/FRONTEND/components/Toast.css`
- **Context**: `my-frontend/FRONTEND/contexts/ToastContext.jsx`

### 2.2.7. Clock Component (Đồng hồ)
- **JSX**: `my-frontend/FRONTEND/components/Clock.jsx`

---

## 2.3. Homepage (Trang chủ)

### 2.3.1. Home Page Overview
- **JSX**: `my-frontend/FRONTEND/pages/Home.jsx`
- **CSS**: `my-frontend/FRONTEND/pages/Home.module.css`

### 2.3.2. Daily Briefing Modal
- **JSX**: `my-frontend/FRONTEND/components/DailyBriefingModal.jsx`
- **CSS**: `my-frontend/FRONTEND/components/DailyBriefingModal.css`

---

## 2.4. User Profile Management (Quản lý hồ sơ người dùng)

### 2.4.1. View User Profile (Xem hồ sơ)
### 2.4.2. Update User Profile (Cập nhật hồ sơ)
### 2.4.3. Profile Settings (Cài đặt hồ sơ)
- **JSX**: `my-frontend/FRONTEND/pages/Profile.jsx`
- **CSS**: `my-frontend/FRONTEND/pages/Profile.css`

---

## 2.5. Planner & Schedule (Lập kế hoạch & Lịch trình)

### 2.5.1. Planner Page (Trang lập kế hoạch)
- **JSX**: `my-frontend/FRONTEND/pages/Planner.jsx`
- **CSS**: 
  - `my-frontend/FRONTEND/pages/Planner.css` (Main)
  - `my-frontend/FRONTEND/pages/PlannerEnhanced.css`
  - `my-frontend/FRONTEND/pages/PlannerComplete.css`
  - `my-frontend/FRONTEND/pages/PlannerCompact.css`

### 2.5.2. Work Schedule Manager (Quản lý lịch làm việc)
- **JSX**: `my-frontend/FRONTEND/pages/WorkScheduleManager.jsx`
- **CSS**: `my-frontend/FRONTEND/pages/WorkScheduleManager.css`

### 2.5.3. Smart Swap Feature (Tính năng đổi thông minh)
- **JSX**: `my-frontend/FRONTEND/components/SwapButton.jsx`

---

## 2.6. Meals & Nutrition (Bữa ăn & Dinh dưỡng)

### 2.6.1. View Meals (Xem bữa ăn)
### 2.6.2. Meal Preferences (Sở thích bữa ăn)
### 2.6.3. Meal History (Lịch sử bữa ăn)
- **Note**: Các tính năng này có thể được tích hợp trong Planner hoặc Diary
- **Xem thêm**: Diary.jsx cho meal history

---

## 2.7. Workouts & Exercise (Bài tập & Thể dục)

### 2.7.1. View Workouts (Xem bài tập)
### 2.7.2. Workout Details (Chi tiết bài tập)
### 2.7.3. Workout History (Lịch sử bài tập)
### 2.7.4. Workout Preferences (Sở thích bài tập)
- **Note**: Các tính năng này có thể được tích hợp trong Planner hoặc Diary
- **Xem thêm**: Diary.jsx cho workout history

---

## 2.8. Diary & Logs (Nhật ký & Ghi chép)

### 2.8.1. Diary Page (Trang nhật ký)
- **JSX**: `my-frontend/FRONTEND/pages/Diary.jsx`
- **CSS**: `my-frontend/FRONTEND/pages/DiaryNew.css`

### 2.8.2. Activity History (Lịch sử hoạt động)
- **Note**: Được tích hợp trong Diary.jsx

### 2.8.3. Logs Page (Trang ghi chép)
- **JSX**: `my-frontend/FRONTEND/pages/Logs.jsx`
- **CSS**: `my-frontend/FRONTEND/pages/Logs.css`

---

## 2.9. Social Features (Tính năng xã hội)

### 2.9.1. Social Page (Trang xã hội)
- **JSX**: `my-frontend/FRONTEND/pages/Social.jsx`
- **CSS**: `my-frontend/FRONTEND/pages/Social.css`

### 2.9.2. NewsFeed (Bảng tin)
- **JSX**: `my-frontend/FRONTEND/pages/NewsFeed.jsx`
- **CSS**: `my-frontend/FRONTEND/pages/NewsFeed.css`

### 2.9.3. Create Post (Tạo bài đăng)
- **JSX**: `my-frontend/FRONTEND/components/CreatePost.jsx`

### 2.9.4. Post Card Component (Thành phần thẻ bài đăng)
- **JSX**: `my-frontend/FRONTEND/components/PostCard.jsx`

### 2.9.5. Messenger (Tin nhắn)
- **JSX**: `my-frontend/FRONTEND/components/Messenger.jsx`

---

## 2.10. Leaderboard (Bảng xếp hạng)

### 2.10.1. Leaderboard Page (Trang bảng xếp hạng)
### 2.10.2. Ranking Display (Hiển thị xếp hạng)
- **JSX**: `my-frontend/FRONTEND/pages/Leaderboard.jsx`
- **CSS**: `my-frontend/FRONTEND/pages/Leaderboard.css`

---

## 2.11. Videos & Content (Video & Nội dung)

### 2.11.1. Videos Page (Trang video)
### 2.11.2. Video Player (Trình phát video)
- **JSX**: `my-frontend/FRONTEND/pages/Videos.jsx`
- **CSS**: `my-frontend/FRONTEND/pages/Videos.css`

---

## 2.12. Settings (Cài đặt)

### 2.12.1. User Settings Page (Trang cài đặt người dùng)
### 2.12.2. Account Settings (Cài đặt tài khoản)
### 2.12.3. Privacy Settings (Cài đặt quyền riêng tư)
### 2.12.4. Notification Settings (Cài đặt thông báo)
- **JSX**: `my-frontend/FRONTEND/pages/Settings.jsx`
- **CSS**: `my-frontend/FRONTEND/pages/Settings.css`

---

## 2.13. Admin Interface (Giao diện quản trị)

### 2.13.1. Admin Layout (Bố cục admin)
- **JSX**: `my-frontend/FRONTEND/admin/pages/AdminLayout.jsx`
- **CSS**: 
  - `my-frontend/FRONTEND/admin/pages/AdminLayout.css`
  - `my-frontend/FRONTEND/admin/pages/AdminOverride.css`

### 2.13.2. Admin Dashboard (Bảng điều khiển admin)
- **JSX**: `my-frontend/FRONTEND/admin/pages/AdminDashboard.jsx`
- **CSS**: `my-frontend/FRONTEND/admin/pages/AdminDashboard.css`

### 2.13.3. User Management (Quản lý người dùng)
#### 2.13.3.1. View All Users (Xem tất cả người dùng)
#### 2.13.3.2. Create User (Tạo người dùng)
#### 2.13.3.3. Update User (Cập nhật người dùng)
#### 2.13.3.4. Delete User (Xóa người dùng)
- **JSX**: `my-frontend/FRONTEND/admin/pages/AdminUsers.jsx`
- **CSS**: `my-frontend/FRONTEND/admin/pages/AdminUsers.css`

### 2.13.4. Posts Management (Quản lý bài đăng)
#### 2.13.4.1. View All Posts (Xem tất cả bài đăng)
#### 2.13.4.2. Approve/Reject Posts (Duyệt/Từ chối bài đăng)
- **JSX**: `my-frontend/FRONTEND/admin/pages/AdminPosts.jsx`
- **CSS**: `my-frontend/FRONTEND/admin/pages/AdminPosts.css`

### 2.13.5. Meals Management (Quản lý bữa ăn)
#### 2.13.5.1. View All Meals (Xem tất cả bữa ăn)
#### 2.13.5.2. Create/Edit Meal (Tạo/Chỉnh sửa bữa ăn)
#### 2.13.5.3. Delete Meal (Xóa bữa ăn)
- **JSX**: `my-frontend/FRONTEND/admin/pages/AdminMeals.jsx`
- **CSS**: `my-frontend/FRONTEND/admin/pages/AdminMeals.css`

### 2.13.6. Workouts Management (Quản lý bài tập)
#### 2.13.6.1. View All Workouts (Xem tất cả bài tập)
#### 2.13.6.2. Create/Edit Workout (Tạo/Chỉnh sửa bài tập)
#### 2.13.6.3. Delete Workout (Xóa bài tập)
- **JSX**: `my-frontend/FRONTEND/admin/pages/AdminWorkouts.jsx`
- **CSS**: `my-frontend/FRONTEND/admin/pages/AdminWorkouts.css`

### 2.13.7. Feedback Management (Quản lý phản hồi)
#### 2.13.7.1. View All Feedback (Xem tất cả phản hồi)
#### 2.13.7.2. Respond to Feedback (Phản hồi)
- **JSX**: `my-frontend/FRONTEND/admin/pages/AdminFeedback.jsx`
- **CSS**: `my-frontend/FRONTEND/admin/pages/AdminFeedback.css`

### 2.13.8. Admin Settings (Cài đặt admin)
- **JSX**: `my-frontend/FRONTEND/admin/pages/AdminSettings.jsx`
- **CSS**: `my-frontend/FRONTEND/admin/pages/AdminSettings.css`

### 2.13.9. Admin Protected Route
- **JSX**: `my-frontend/FRONTEND/admin/components/ProtectedRoute.jsx`

---

## 2.14. AI Coach Features (Tính năng AI Coach)

### 2.14.1. AI Chat Interface (Giao diện chat AI)
- **JSX**: `my-frontend/FRONTEND/components/ChatBox.jsx` (đã liệt kê ở 2.2.4)

### 2.14.2. AI Recommendations (Đề xuất AI)
- **Note**: Có thể được tích hợp trong Planner, Home, hoặc Diary

### 2.14.3. Daily Briefing (Tóm tắt hàng ngày)
- **JSX**: `my-frontend/FRONTEND/components/DailyBriefingModal.jsx` (đã liệt kê ở 2.3.2)

---

## 2.15. Image Upload & Media (Tải ảnh & Phương tiện)

### 2.15.1. Image Uploader Component (Thành phần tải ảnh)
### 2.15.2. Avatar Upload (Tải avatar)
### 2.15.3. Post Image Upload (Tải ảnh bài đăng)
- **JSX**: `my-frontend/FRONTEND/components/ImageUploader.jsx`

---

## FILES KHÁC (Other Files)

### App Configuration
- **Main App**: `my-frontend/FRONTEND/App.jsx`
- **App CSS**: `my-frontend/FRONTEND/App.css`
- **Main Entry**: `my-frontend/FRONTEND/main.jsx`
- **Index CSS**: `my-frontend/FRONTEND/index.css`

### Config Files
- **Config**: `my-frontend/FRONTEND/config.js`

---

## QUICK NAVIGATION GUIDE

### 📁 Pages (User-facing)
- `pages/Login.jsx` - Đăng nhập
- `pages/Register.jsx` - Đăng ký
- `pages/ForgotPassword.jsx` - Quên mật khẩu
- `pages/Home.jsx` - Trang chủ
- `pages/Profile.jsx` - Hồ sơ
- `pages/Planner.jsx` - Lập kế hoạch
- `pages/WorkScheduleManager.jsx` - Quản lý lịch
- `pages/Diary.jsx` - Nhật ký
- `pages/Logs.jsx` - Ghi chép
- `pages/Social.jsx` - Xã hội
- `pages/NewsFeed.jsx` - Bảng tin
- `pages/Leaderboard.jsx` - Bảng xếp hạng
- `pages/Videos.jsx` - Video
- `pages/Settings.jsx` - Cài đặt

### 📁 Components (Reusable)
- `components/Navbar.jsx` - Thanh điều hướng
- `components/Footer.jsx` - Chân trang
- `components/ChatBox.jsx` - Chat AI
- `components/NotificationBell.jsx` - Thông báo
- `components/Toast.jsx` - Toast notification
- `components/WeatherCard.jsx` - Thẻ thời tiết
- `components/DailyBriefingModal.jsx` - Modal tóm tắt
- `components/CreatePost.jsx` - Tạo bài đăng
- `components/PostCard.jsx` - Thẻ bài đăng
- `components/Messenger.jsx` - Tin nhắn
- `components/ImageUploader.jsx` - Tải ảnh
- `components/SwapButton.jsx` - Nút đổi thông minh
- `components/Clock.jsx` - Đồng hồ

### 📁 Admin Pages
- `admin/pages/AdminLayout.jsx` - Layout admin
- `admin/pages/AdminDashboard.jsx` - Dashboard
- `admin/pages/AdminUsers.jsx` - Quản lý users
- `admin/pages/AdminPosts.jsx` - Quản lý posts
- `admin/pages/AdminMeals.jsx` - Quản lý meals
- `admin/pages/AdminWorkouts.jsx` - Quản lý workouts
- `admin/pages/AdminFeedback.jsx` - Quản lý feedback
- `admin/pages/AdminSettings.jsx` - Cài đặt admin

---

**Lưu ý**: Một số tính năng có thể được tích hợp trong cùng một component (ví dụ: Profile có thể bao gồm cả view và update). Hãy kiểm tra từng file để xác nhận chức năng cụ thể.

