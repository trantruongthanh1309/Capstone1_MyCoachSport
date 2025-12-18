# 📋 CẤU TRÚC TÀI LIỆU INTERFACE DESIGN - MySportCoachAI

## 1. Introduction
- 1.1. Purpose (Mục đích)
- 1.2. Scope (Phạm vi)
- 1.3. System Overview (Tổng quan hệ thống)

---

## 2. Interface Design

### 2.1. Authentication & Authorization (Xác thực & Phân quyền)
- **2.1.1. Login Page** (Trang đăng nhập)
  - Form đăng nhập
  - Xác thực OTP (nếu có)
  
- **2.1.2. Register Page** (Trang đăng ký)
  - Form đăng ký (Bước 1)
  - Xác thực OTP Email (Bước 2)
  
- **2.1.3. Forgot Password Page** (Trang quên mật khẩu)
  - Nhập email
  - Xác thực OTP
  - Đặt lại mật khẩu

---

### 2.2. Common Components (Thành phần chung)

- **2.2.1. Navbar** (Thanh điều hướng)
  - Logo
  - Menu navigation
  - User profile dropdown
  - Notification bell
  
- **2.2.2. Footer** (Chân trang)
  - Thông tin liên hệ
  - Links nhanh
  - Social media

- **2.2.3. ChatBox** (Hộp chat AI)
  - Floating button
  - Chat interface
  - Message history

---

### 2.3. Homepage (Trang chủ)

- **2.3.1. Home Page**
  - Welcome section
  - Clock & Date display
  - Weather widget
  - Feature cards
  - Daily Briefing Modal (Modal tóm tắt hàng ngày)
    - Buổi sáng/trưa/chiều/tối
    - Lịch tập luyện
    - Lịch dinh dưỡng

---

### 2.4. Planning & Scheduling (Lập kế hoạch & Lịch trình)

- **2.4.1. Planner Page** (Trang lập kế hoạch)
  - Weekly view
  - Meal planning table (Bảng kế hoạch ăn uống)
    - Morning (Bữa sáng)
    - Afternoon (Bữa trưa)
    - Evening (Bữa tối)
  - Workout planning table (Bảng kế hoạch tập luyện)
    - Morning workout
    - Evening workout
  - Swap functionality (Đổi món/bài tập)
  - Feedback buttons (Like/Dislike)
  - Complete button (Đánh dấu hoàn thành)
  - Item detail modal

- **2.4.2. Work Schedule Manager** (Quản lý lịch làm việc)
  - Weekly schedule view
  - Add busy slots
  - Edit/Delete busy slots
  - Day of week selection

---

### 2.5. Tracking & History (Theo dõi & Lịch sử)

- **2.5.1. Diary Page** (Trang nhật ký)
  - Tab: Lịch sử hoạt động
    - 7 ngày gần nhất
    - Meal history
    - Workout history
    - Completion status
  - Tab: Sở thích & AI
    - Liked meals/workouts
    - Disliked meals/workouts
    - Remove preference

- **2.5.2. Logs Page** (Trang nhật ký tập luyện)
  - Workout logs
  - Meal logs
  - Notes & ratings

---

### 2.6. Profile Management (Quản lý hồ sơ)

- **2.6.1. Profile Page** (Trang hồ sơ)
  - View profile
    - Avatar
    - Personal info
    - Body stats
    - Sport preferences
    - Goals
  - Edit profile
    - Update personal info
    - Update body measurements
    - Update preferences
    - Update allergies/dislikes
  - Change password
  - Upload avatar

- **2.6.2. Settings Page** (Trang cài đặt)
  - Account settings
  - Notification settings
  - Privacy settings
  - App preferences

---

### 2.7. Social & Community (Xã hội & Cộng đồng)

- **2.7.1. NewsFeed Page** (Trang bảng tin)
  - Feed header
  - Sport filter bar
  - Create post component
  - Post cards
    - User info
    - Content
    - Image
    - Like/Comment
    - Share
  - Infinite scroll
  - Messenger sidebar

- **2.7.2. Social Page** (Trang xã hội)
  - Social features
  - User interactions

- **2.7.3. Videos Page** (Trang video)
  - Video library
  - Video categories
  - Video player
  - Video details

---

### 2.8. Competition & Rankings (Thi đua & Xếp hạng)

- **2.8.1. Leaderboard Page** (Trang bảng xếp hạng)
  - My Stats Card
    - Rank
    - Total points
    - Total workouts
    - Current streak
    - Level & EXP bar
  - Tab: Rankings
    - Top users list
    - Rank badges (👑🥈🥉)
    - User stats inline
  - Tab: Achievements
    - Achievement cards
    - Unlocked/Locked status
  - Log Workout Modal
    - Workout form
    - Sport selection
    - Duration & calories
    - Difficulty level

---

### 2.9. Admin Interface (Giao diện quản trị)

- **2.9.1. Admin Dashboard**
  - Statistics overview
  - Charts & graphs
  - Recent activities

- **2.9.2. User Management**
  - View all users
  - User details
  - Edit user
  - Delete user
  - Set admin role

- **2.9.3. Content Management**
  - **Meals Management**
    - View all meals
    - Create/Edit meal
    - Delete meal
    - Meal details
  - **Workouts Management**
    - View all workouts
    - Create/Edit workout
    - Delete workout
    - Workout details
  - **Posts Management**
    - View all posts
    - Approve/Reject posts
    - Delete posts
    - Post details

- **2.9.4. Feedback Management**
  - View all feedback
  - Filter feedback
  - Feedback details

- **2.9.5. Admin Settings**
  - System settings
  - Configuration

---

## 3. Component Details (Chi tiết thành phần)

### 3.1. Reusable Components
- **Toast Notification** (Thông báo)
- **Modal** (Hộp thoại)
- **SwapButton** (Nút đổi)
- **PostCard** (Thẻ bài viết)
- **CreatePost** (Tạo bài viết)
- **Messenger** (Tin nhắn)
- **ImageUploader** (Upload ảnh)
- **NotificationBell** (Chuông thông báo)

### 3.2. Form Components
- Input fields
- Select dropdowns
- Date pickers
- File upload
- Rating stars
- Checkboxes/Radio buttons

---

## 4. User Flows (Luồng người dùng)

### 4.1. Authentication Flow
- Register → Verify OTP → Login
- Login → Home
- Forgot Password → Reset Password

### 4.2. Planning Flow
- Home → Planner → View/Edit Schedule
- Planner → Swap Item → Confirm
- Planner → Complete Item → Update Stats

### 4.3. Social Flow
- Home → NewsFeed → Create Post
- NewsFeed → View Post → Like/Comment
- NewsFeed → Start Chat → Messenger

### 4.4. Tracking Flow
- Home → Diary → View History
- Home → Leaderboard → Log Workout → Update Stats

---

## 5. Responsive Design (Thiết kế đáp ứng)

### 5.1. Desktop View (> 1024px)
- Full layout
- Sidebar navigation
- Multi-column layouts

### 5.2. Tablet View (768px - 1024px)
- Adjusted layouts
- Collapsible menus

### 5.3. Mobile View (< 768px)
- Single column
- Hamburger menu
- Touch-friendly buttons
- Bottom navigation

---

## 6. UI/UX Guidelines (Hướng dẫn UI/UX)

### 6.1. Color Scheme
- Primary colors
- Secondary colors
- Accent colors
- Status colors (success, error, warning)

### 6.2. Typography
- Font families
- Font sizes
- Font weights
- Line heights

### 6.3. Spacing & Layout
- Grid system
- Padding & margins
- Component spacing

### 6.4. Icons & Images
- Icon library
- Image guidelines
- Avatar handling

---

## 7. States & Interactions (Trạng thái & Tương tác)

### 7.1. Loading States
- Page loading
- Button loading
- Skeleton screens

### 7.2. Error States
- Error messages
- Empty states
- Not found pages

### 7.3. Success States
- Success messages
- Confirmation dialogs
- Success animations

---

## 8. Accessibility (Khả năng truy cập)

### 8.1. Keyboard Navigation
- Tab order
- Keyboard shortcuts

### 8.2. Screen Readers
- ARIA labels
- Alt texts

### 8.3. Color Contrast
- WCAG compliance
- Color blind friendly

---

## Gợi ý cách trình bày trong tài liệu:

1. **Mỗi section nên có:**
   - Mô tả chức năng
   - Wireframe/Mockup
   - Các trường dữ liệu
   - Các hành động (actions)
   - Validation rules
   - Error handling

2. **Sử dụng số trang:**
   - Đánh số trang cho mỗi section
   - Tạo mục lục tự động
   - Tham chiếu chéo giữa các section

3. **Thêm screenshots:**
   - Chụp màn hình thực tế
   - Ghi chú các phần quan trọng
   - Highlight các tính năng chính

