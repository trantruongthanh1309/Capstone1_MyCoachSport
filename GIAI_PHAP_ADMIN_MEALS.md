# ✅ GIẢI PHÁP: SỬA LỖI ADMIN MEALS REDIRECT

## 🎯 Vấn đề đã tìm ra
Khi bấm vào Admin Meals, trang bị redirect về trang user vì:
- **Bạn đang đăng nhập với tài khoản USER** thay vì ADMIN
- Hoặc **chưa đăng nhập**

## ✅ TÀI KHOẢN ADMIN CÓ SẴN

Database đã có tài khoản admin:
```
📧 Email: admin@gmail.com
🔑 Role: admin
```

## 🔧 CÁCH SỬA (3 BƯỚC ĐƠN GIẢN)

### Bước 1: Đăng xuất (nếu đang đăng nhập)
1. Mở Console (F12)
2. Gõ: `sessionStorage.clear()`
3. Hoặc refresh trang (Ctrl+R)

### Bước 2: Đăng nhập với tài khoản ADMIN
1. Truy cập: http://localhost:5173/login
2. Nhập:
   - **Email**: `admin@gmail.com`
   - **Password**: (mật khẩu của tài khoản admin)
3. Click "Đăng nhập"

### Bước 3: Truy cập Admin Meals
1. Sau khi đăng nhập thành công, bạn sẽ được redirect về `/admin`
2. Click vào "Meals" trong sidebar
3. Hoặc truy cập trực tiếp: http://localhost:5173/admin/meals

## 🔍 KIỂM TRA ĐÃ ĐĂNG NHẬP ĐÚNG ADMIN CHƯA

Mở Console (F12) và gõ:
```javascript
console.log('Role:', sessionStorage.getItem('role'));
```

**Kết quả mong đợi:**
```
Role: admin
```

**Nếu kết quả là:**
- `Role: user` → Bạn đang đăng nhập với tài khoản user, KHÔNG phải admin
- `Role: null` → Bạn chưa đăng nhập

## ⚠️ NẾU KHÔNG NHỚ MẬT KHẨU ADMIN

### Cách 1: Đổi mật khẩu trong database
1. Mở SQL Server Management Studio
2. Chạy query:
```sql
-- Đổi mật khẩu thành "admin123" (đã hash)
UPDATE accounts 
SET Password = 'scrypt:32768:8:1$...' -- Hash của "admin123"
WHERE Email = 'admin@gmail.com'
```

### Cách 2: Tạo tài khoản admin mới
1. Đăng ký tài khoản mới với email khác
2. Thay đổi role thành admin:
```sql
UPDATE accounts 
SET Role = 'admin' 
WHERE Email = 'your_new_email@gmail.com'
```

### Cách 3: Dùng tài khoản hiện tại và đổi role
Nếu bạn đang có tài khoản user, đổi role thành admin:
```sql
UPDATE accounts 
SET Role = 'admin' 
WHERE Email = 'your_current_email@gmail.com'
```

## 📋 FLOW ĐÚNG

1. ✅ Đăng nhập với `admin@gmail.com`
2. ✅ Console log: `✅ Login success - Role: admin`
3. ✅ Redirect to: `/admin`
4. ✅ Click "Meals" trong sidebar
5. ✅ Console log: `🔍 AdminRoute Check: { isLoggedIn: "true", userRole: "admin", ... }`
6. ✅ Console log: `✅ Admin access granted`
7. ✅ Trang Admin Meals hiển thị dữ liệu (31 meals)

## 🐛 NẾU VẪN BỊ REDIRECT

### Kiểm tra 1: SessionStorage
```javascript
// Mở Console (F12)
console.log('isLoggedIn:', sessionStorage.getItem('isLoggedIn'));
console.log('role:', sessionStorage.getItem('role'));
console.log('user_id:', sessionStorage.getItem('user_id'));
```

### Kiểm tra 2: Console Log
Khi truy cập `/admin/meals`, bạn sẽ thấy log:
- `🔍 AdminRoute Check: ...` - Kiểm tra authentication
- `✅ Admin access granted` - Nếu OK
- `❌ Not admin - Role: user` - Nếu không phải admin
- `❌ Not logged in` - Nếu chưa đăng nhập

### Kiểm tra 3: Alert
Nếu bị redirect, sẽ có alert:
- "⚠️ Bạn chưa đăng nhập!" → Chưa login
- "⚠️ Bạn không có quyền truy cập trang Admin!" → Không phải admin

## 💡 LƯU Ý

1. **Phải đăng nhập với tài khoản ADMIN**, không phải user
2. **SessionStorage sẽ bị xóa** khi đóng tab/browser
3. **Mỗi lần refresh** có thể mất session, cần đăng nhập lại
4. **Backend server phải đang chạy** (http://127.0.0.1:5000)
5. **Frontend server phải đang chạy** (http://localhost:5173)

## 🎬 VIDEO DEMO

1. Mở http://localhost:5173/login
2. Đăng nhập với `admin@gmail.com`
3. Vào `/admin/meals`
4. Xem dữ liệu hiển thị:
   - Stats: Tổng 31 meals
   - Bảng danh sách meals
   - Debug info ở cuối trang

## 📞 HỖ TRỢ

Nếu vẫn gặp vấn đề:
1. Chụp màn hình Console log
2. Chụp màn hình Network tab (F12 → Network)
3. Kiểm tra backend server có chạy không
4. Chạy script: `check_admin_account.py` để xem tài khoản admin
