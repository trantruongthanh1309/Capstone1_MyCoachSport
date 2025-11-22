# 🔍 HƯỚNG DẪN DEBUG VẤN ĐỀ ADMIN MEALS REDIRECT

## Vấn đề
Khi bấm vào Admin Meals, trang bị redirect về trang user thay vì hiển thị dữ liệu.

## Nguyên nhân có thể
1. ❌ **Chưa đăng nhập** hoặc session đã hết hạn
2. ❌ **Đăng nhập với tài khoản user** thay vì admin
3. ❌ **SessionStorage bị xóa** (do refresh hoặc clear cache)

## ✅ CÁCH KIỂM TRA

### Bước 1: Kiểm tra SessionStorage
1. Mở trang web: http://localhost:5173
2. Nhấn **F12** để mở Developer Tools
3. Vào tab **Console**
4. Copy và paste đoạn code sau vào console:

```javascript
console.log('isLoggedIn:', sessionStorage.getItem('isLoggedIn'));
console.log('role:', sessionStorage.getItem('role'));
console.log('user_id:', sessionStorage.getItem('user_id'));
```

### Bước 2: Kiểm tra kết quả

#### ✅ Nếu kết quả là:
```
isLoggedIn: "true"
role: "admin"
user_id: "1"
```
→ **OK!** Bạn đã đăng nhập với tài khoản admin

#### ❌ Nếu kết quả là:
```
isLoggedIn: "true"
role: "user"
user_id: "2"
```
→ **KHÔNG OK!** Bạn đang đăng nhập với tài khoản user, không phải admin

#### ❌ Nếu kết quả là:
```
isLoggedIn: null
role: null
user_id: null
```
→ **KHÔNG OK!** Bạn chưa đăng nhập

## 🔧 CÁCH SỬA

### Trường hợp 1: Chưa đăng nhập
1. Truy cập: http://localhost:5173/login
2. Đăng nhập với tài khoản admin
3. Sau đó truy cập: http://localhost:5173/admin/meals

### Trường hợp 2: Đăng nhập với tài khoản user
1. **Đăng xuất** (hoặc xóa sessionStorage)
2. Đăng nhập lại với **tài khoản admin**

**Cách xóa sessionStorage:**
- Mở Console (F12)
- Gõ: `sessionStorage.clear()`
- Hoặc: Application tab → Storage → Session Storage → Clear All

### Trường hợp 3: Không có tài khoản admin
Bạn cần tạo tài khoản admin trong database. Chạy script sau:

```python
# check_admin_account.py
from app import app, db
from models.user import User

with app.app_context():
    # Tìm tài khoản admin
    admin = User.query.filter_by(Role='admin').first()
    
    if admin:
        print(f"✅ Tài khoản admin tồn tại:")
        print(f"   Email: {admin.Email}")
        print(f"   Role: {admin.Role}")
    else:
        print("❌ Không có tài khoản admin!")
        print("Bạn cần tạo tài khoản admin trong database")
```

## 📋 KIỂM TRA SAU KHI SỬA

1. **Đăng nhập** với tài khoản admin
2. Mở **Console** (F12)
3. Truy cập: http://localhost:5173/admin/meals
4. Kiểm tra console log:
   - Nếu thấy: `✅ Admin access granted` → **OK!**
   - Nếu thấy: `❌ Not admin` → **KHÔNG OK!** Kiểm tra lại role

## 🎯 DEBUG SCRIPT

File `debug_session.js` đã được tạo. Bạn có thể:
1. Mở file này
2. Copy toàn bộ nội dung
3. Paste vào Console (F12)
4. Xem kết quả debug

## ⚠️ LƯU Ý QUAN TRỌNG

### SessionStorage vs Cookies
- **SessionStorage**: Lưu trên client, bị xóa khi đóng tab/browser
- **Backend Session**: Lưu trên server, dùng cookies để authenticate

Hiện tại app đang dùng **cả hai**:
- SessionStorage: Để check role ở frontend (ProtectedRoute)
- Backend Session: Để authenticate API calls

### Khi nào sessionStorage bị xóa?
- Đóng tab/browser
- Clear cache/cookies
- Chạy `sessionStorage.clear()`
- Logout

### Giải pháp lâu dài
Nên dùng **localStorage** thay vì sessionStorage nếu muốn giữ login lâu hơn:

```javascript
// Thay đổi trong Login.jsx
localStorage.setItem('role', result.role);  // Thay vì sessionStorage

// Thay đổi trong ProtectedRoute.jsx
const userRole = localStorage.getItem('role');  // Thay vì sessionStorage
```

## 📞 NẾU VẪN GẶP VẤN ĐỀ

1. Kiểm tra console log khi truy cập admin meals
2. Chụp màn hình console log
3. Kiểm tra Network tab xem API call có lỗi gì không
4. Kiểm tra backend server có đang chạy không

## 🎬 DEMO FLOW ĐÚNG

1. Mở http://localhost:5173/login
2. Đăng nhập với admin account
3. Console log: `✅ Login success - Role: admin`
4. Redirect to: http://localhost:5173/admin
5. Click vào "Meals" trong sidebar
6. Console log: `🔍 AdminRoute Check: { isLoggedIn: "true", userRole: "admin", ... }`
7. Console log: `✅ Admin access granted`
8. Trang Admin Meals hiển thị dữ liệu
