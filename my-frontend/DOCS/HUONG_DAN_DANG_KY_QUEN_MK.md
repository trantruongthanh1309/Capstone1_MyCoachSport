# 🎉 Hướng dẫn sử dụng tính năng Đăng ký & Quên mật khẩu

## 📋 Tổng quan
Hệ thống đã được cập nhật với các tính năng:
- ✅ **Đăng ký tài khoản mới** với validation đầy đủ
- ✅ **Quên mật khẩu** với xác thực OTP qua email
- ✅ **Gửi email OTP** với template HTML đẹp mắt
- ✅ **Giao diện premium** với animations và gradients

## 🚀 Các bước thực hiện

### 1️⃣ Cập nhật Database
Chạy migration SQL để thêm các trường mới vào bảng `accounts`:

```sql
-- Mở SQL Server Management Studio và chạy file:
BACKEND/migrations/add_password_reset_fields.sql
```

Hoặc chạy trực tiếp các lệnh sau trong SQL Server:

```sql
USE MySportCoachAI;
GO

ALTER TABLE accounts ADD ResetToken NVARCHAR(6) NULL;
ALTER TABLE accounts ADD ResetTokenExpiry DATETIME NULL;
ALTER TABLE accounts ADD CreatedAt DATETIME DEFAULT GETUTCDATE();
GO
```

### 2️⃣ Cấu hình Email (Tùy chọn)
Để gửi email OTP thực sự, cập nhật file `BACKEND/services/email_service.py`:

```python
SENDER_EMAIL = "your-email@gmail.com"  # Email Gmail của bạn
SENDER_PASSWORD = "xxxx xxxx xxxx xxxx"  # App Password của Gmail
```

**Lưu ý:** 
- Nếu không cấu hình email, hệ thống sẽ chạy ở **DEV MODE** và in OTP ra console
- Để lấy App Password Gmail: https://myaccount.google.com/apppasswords

### 3️⃣ Khởi động lại Backend
```bash
cd BACKEND
python app.py
```

### 4️⃣ Test các tính năng

#### ✨ Đăng ký tài khoản mới
1. Truy cập: http://localhost:5173/register
2. Điền thông tin:
   - Họ tên (tùy chọn)
   - Email
   - Mật khẩu (tối thiểu 6 ký tự)
   - Xác nhận mật khẩu
3. Click "Đăng ký"
4. Sau khi thành công, tự động chuyển đến trang đăng nhập

#### 🔐 Quên mật khẩu
1. Truy cập: http://localhost:5173/forgot-password
2. **Bước 1:** Nhập email → Click "Gửi mã OTP"
3. **Bước 2:** Nhập mã OTP 6 số (kiểm tra email hoặc console nếu DEV MODE)
4. **Bước 3:** Nhập mật khẩu mới → Click "Đặt lại mật khẩu"
5. Sau khi thành công, tự động chuyển đến trang đăng nhập

## 🎨 Giao diện

### Trang Đăng ký
- Gradient background với animations
- Form validation real-time
- Toast notifications
- Responsive design

### Trang Quên mật khẩu
- 3-step progress indicator
- OTP verification
- Resend OTP functionality
- Premium animations

## 📡 API Endpoints

### POST `/api/auth/register`
Đăng ký tài khoản mới
```json
{
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "password": "123456",
  "confirmPassword": "123456"
}
```

### POST `/api/auth/forgot-password`
Gửi mã OTP để reset mật khẩu
```json
{
  "email": "user@example.com"
}
```

### POST `/api/auth/verify-otp`
Xác thực mã OTP
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

### POST `/api/auth/reset-password`
Đặt lại mật khẩu
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newpass123",
  "confirmPassword": "newpass123"
}
```

## 🔒 Bảo mật

**Lưu ý quan trọng:**
- Hiện tại mật khẩu được lưu dạng **plain text** (chưa hash)
- Trong production, cần hash mật khẩu bằng `bcrypt` hoặc `argon2`
- OTP có thời hạn 10 phút
- Mỗi OTP chỉ sử dụng được 1 lần

## 🐛 Troubleshooting

### Lỗi: "Email đã được đăng ký"
→ Email này đã tồn tại trong hệ thống, sử dụng email khác hoặc đăng nhập

### Lỗi: "Mã OTP đã hết hạn"
→ Click "Gửi lại mã OTP" để nhận mã mới

### Lỗi: "Không thể gửi email"
→ Kiểm tra cấu hình email trong `email_service.py`
→ Trong DEV MODE, OTP sẽ được in ra console

### Không nhận được email OTP
→ Kiểm tra spam folder
→ Đảm bảo đã cấu hình đúng App Password Gmail
→ Xem console backend để lấy OTP trong DEV MODE

## 📝 Files đã tạo/cập nhật

### Backend:
- ✅ `models/account_model.py` - Thêm fields ResetToken, ResetTokenExpiry, CreatedAt
- ✅ `services/email_service.py` - Thêm hàm send_otp_email()
- ✅ `api/auth.py` - Thêm endpoints register, forgot-password, verify-otp, reset-password
- ✅ `migrations/add_password_reset_fields.sql` - Migration script

### Frontend:
- ✅ `pages/Register.jsx` - Trang đăng ký
- ✅ `pages/Register.module.css` - Styling cho trang đăng ký
- ✅ `pages/ForgotPassword.jsx` - Trang quên mật khẩu
- ✅ `pages/ForgotPassword.module.css` - Styling cho trang quên mật khẩu
- ✅ `App.jsx` - Thêm routes mới

## 🎯 Tính năng nâng cao (có thể thêm sau)

- [ ] Email verification khi đăng ký
- [ ] Rate limiting cho OTP requests
- [ ] Password strength meter
- [ ] Social login (Google, Facebook)
- [ ] Two-factor authentication (2FA)
- [ ] Password history (không cho dùng lại mật khẩu cũ)

## 💡 Tips

1. **Test trong DEV MODE trước:** Không cần cấu hình email, OTP sẽ hiện trong console
2. **Sử dụng email thật để test:** Kiểm tra xem email OTP có đẹp không
3. **Check responsive:** Test trên mobile và tablet
4. **Validation:** Hệ thống đã có validation đầy đủ, không cần lo lắng

---

**Chúc bạn sử dụng vui vẻ! 🎉**

Nếu có vấn đề gì, hãy kiểm tra console của browser và backend để debug.
