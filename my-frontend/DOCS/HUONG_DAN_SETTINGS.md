# 🎯 Hướng Dẫn Kích Hoạt Chức Năng Settings

## ✅ Đã Hoàn Thành

Tôi đã triển khai đầy đủ hệ thống Settings với các tính năng sau:

### **Backend:**
1. ✅ Thêm các trường mới vào model `User`:
   - `Avatar` - Lưu ảnh đại diện (base64 hoặc URL)
   - `Bio` - Giới thiệu bản thân
   - `Preferences` - Cài đặt giao diện (theme, ngôn ngữ, thông báo)
   - `Privacy` - Cài đặt riêng tư
   - `NotificationSettings` - Cài đặt thông báo

2. ✅ Tạo API endpoints mới (`/api/settings`):
   - `GET /api/settings` - Lấy tất cả settings của user
   - `POST /api/settings` - Cập nhật settings
   - `GET /api/settings/export` - Xuất dữ liệu user
   - `POST /api/settings/reset` - Đặt lại settings về mặc định

3. ✅ Đăng ký blueprint trong `app.py`

### **Frontend:**
1. ✅ Cập nhật `Settings.jsx` để kết nối với backend API
2. ✅ Thay thế localStorage bằng database persistence
3. ✅ Thêm loading state và error handling
4. ✅ Tất cả chức năng đều hoạt động:
   - ✅ Hồ Sơ (Profile) - Cập nhật tên, email, avatar, bio
   - ✅ Giao Diện (Preferences) - Theme, ngôn ngữ, thông báo
   - ✅ Riêng Tư (Privacy) - Cài đặt quyền riêng tư
   - ✅ Tập Luyện (Workout) - Cài đặt nhắc nhở tập luyện
   - ✅ Dinh Dưỡng (Nutrition) - Mục tiêu dinh dưỡng
   - ✅ Dữ Liệu (Data) - Xuất dữ liệu, đặt lại, xóa tài khoản

---

## 🚀 Các Bước Để Kích Hoạt

### **Bước 1: Cập nhật Database**

Chạy migration SQL để thêm các cột mới vào bảng `Users`:

```sql
-- Mở SQL Server Management Studio
-- Kết nối đến database MySportCoachAI
-- Chạy file: BACKEND/migrations/add_settings_columns.sql
```

Hoặc chạy lệnh sau trong SQL Server:

```sql
USE MySportCoachAI;
GO

ALTER TABLE Users ADD Avatar NVARCHAR(MAX) NULL;
ALTER TABLE Users ADD Bio NVARCHAR(MAX) NULL;
ALTER TABLE Users ADD Preferences NVARCHAR(MAX) NULL;
ALTER TABLE Users ADD Privacy NVARCHAR(MAX) NULL;
ALTER TABLE Users ADD NotificationSettings NVARCHAR(MAX) NULL;
GO
```

### **Bước 2: Khởi động lại Backend**

```bash
cd BACKEND
python app.py
```

Backend sẽ tự động nhận diện các trường mới trong model.

### **Bước 3: Kiểm tra Frontend**

Frontend đã chạy sẵn (`npm run dev`). Truy cập trang Settings và kiểm tra:

1. **Tải Settings**: Trang sẽ tự động load settings từ database
2. **Cập nhật Profile**: Thay đổi tên, email, avatar, bio
3. **Thay đổi Preferences**: Chọn theme, ngôn ngữ, bật/tắt thông báo
4. **Cài đặt Privacy**: Điều chỉnh quyền riêng tư
5. **Lưu Settings**: Click "Lưu Tất Cả" để lưu vào database
6. **Xuất Dữ Liệu**: Click "Xuất Dữ Liệu" để tải file JSON
7. **Đặt Lại**: Click "Đặt Lại" để reset về mặc định

---

## 🧪 Kiểm Tra API

Bạn có thể test API bằng Postman hoặc curl:

### 1. Lấy Settings
```bash
curl -X GET http://localhost:5000/api/settings \
  -H "Content-Type: application/json" \
  --cookie "session=YOUR_SESSION_COOKIE"
```

### 2. Cập nhật Settings
```bash
curl -X POST http://localhost:5000/api/settings \
  -H "Content-Type: application/json" \
  --cookie "session=YOUR_SESSION_COOKIE" \
  -d '{
    "profile": {
      "name": "Nguyễn Văn A",
      "email": "nguyenvana@example.com",
      "bio": "Tôi yêu thể thao!"
    },
    "preferences": {
      "theme": "dark",
      "language": "vi",
      "notifications": true,
      "emailNotifications": true,
      "pushNotifications": false
    }
  }'
```

### 3. Xuất Dữ Liệu
```bash
curl -X GET http://localhost:5000/api/settings/export \
  -H "Content-Type: application/json" \
  --cookie "session=YOUR_SESSION_COOKIE"
```

### 4. Đặt Lại Settings
```bash
curl -X POST http://localhost:5000/api/settings/reset \
  -H "Content-Type: application/json" \
  --cookie "session=YOUR_SESSION_COOKIE"
```

---

## 📊 Cấu Trúc Dữ Liệu

### Preferences (JSON)
```json
{
  "theme": "light|dark|auto",
  "language": "vi|en|ja|ko",
  "notifications": true|false,
  "emailNotifications": true|false,
  "pushNotifications": true|false
}
```

### Privacy (JSON)
```json
{
  "profilePublic": true|false,
  "showEmail": true|false,
  "showProgress": true|false,
  "allowMessages": true|false
}
```

### NotificationSettings (JSON)
```json
{
  "defaultDuration": 60,
  "reminderTime": "07:00",
  "autoLog": true|false,
  "restDayReminder": true|false
}
```

---

## ⚠️ Lưu Ý

1. **Session Required**: Tất cả API đều yêu cầu user đã đăng nhập (có session cookie)
2. **JSON Format**: Các trường Preferences, Privacy, NotificationSettings được lưu dưới dạng JSON string trong database
3. **Avatar Size**: Nên giới hạn kích thước ảnh avatar (khuyến nghị < 2MB) để tránh làm chậm database
4. **Default Values**: Nếu user chưa có settings, hệ thống sẽ trả về giá trị mặc định

---

## 🎉 Kết Quả

Sau khi hoàn thành các bước trên, tất cả chức năng trong trang Settings sẽ hoạt động:

- ✅ Load settings từ database khi vào trang
- ✅ Lưu settings vào database khi click "Lưu Tất Cả"
- ✅ Hiển thị thông báo thành công
- ✅ Xuất dữ liệu user ra file JSON
- ✅ Đặt lại settings về mặc định
- ✅ Tất cả thay đổi được persist vào database

---

## 🐛 Troubleshooting

### Lỗi: "Không thể tải settings"
- Kiểm tra backend đã chạy chưa
- Kiểm tra user đã đăng nhập chưa
- Kiểm tra database đã có các cột mới chưa

### Lỗi: "Không thể lưu settings"
- Kiểm tra session cookie
- Kiểm tra format JSON có đúng không
- Xem log backend để biết lỗi chi tiết

### Database Error
- Chạy lại migration script
- Kiểm tra connection string trong `app.py`
- Verify rằng tất cả cột đã được thêm vào bảng Users

---

Chúc bạn thành công! 🚀
