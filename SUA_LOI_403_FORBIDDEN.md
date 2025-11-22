# 🔧 SỬA LỖI 403 FORBIDDEN - ADMIN API

## Vấn đề
- AdminRoute cho phép truy cập (✅ Admin access granted)
- Nhưng tất cả API calls trả về **403 FORBIDDEN**
- Session không được gửi từ frontend đến backend

## Nguyên nhân
1. **CORS settings thiếu methods** (PUT, DELETE)
2. **CORS thiếu headers** cần thiết
3. **Session cookie** có thể không được gửi đúng

## ✅ Đã sửa

### 1. CORS Settings (app.py)
```python
CORS(app, 
     supports_credentials=True, 
     origins=["http://localhost:5173"],
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
     expose_headers=["Content-Type"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"])
```

### 2. Admin Middleware (admin_middleware.py)
- Thêm logging chi tiết để debug session
- In ra toàn bộ session data

## 🚀 CÁCH SỬA (QUAN TRỌNG!)

### Bước 1: Restart Backend Server
**Backend server PHẢI được restart để áp dụng thay đổi CORS!**

1. Tìm terminal đang chạy backend
2. Nhấn `Ctrl+C` để dừng
3. Chạy lại:
```powershell
& "c:/Users/MSI M/Desktop/CodeDoanCap1/venv/Scripts/python.exe" "c:/Users/MSI M/Desktop/CodeDoanCap1/my-frontend/BACKEND/app.py"
```

**HOẶC** dùng script restart:
```powershell
powershell -ExecutionPolicy Bypass -File "c:\Users\MSI M\Desktop\CodeDoanCap1\my-frontend\BACKEND\restart_backend.ps1"
```

### Bước 2: Clear Browser Cache & Cookies
1. Mở DevTools (F12)
2. Application tab → Storage → Clear site data
3. Hoặc: Ctrl+Shift+Delete → Clear cookies

### Bước 3: Đăng nhập lại
1. Truy cập: http://localhost:5173/login
2. Đăng nhập với `admin@gmail.com`
3. Kiểm tra Console log xem có `✅ Login successful` không

### Bước 4: Truy cập Admin Meals
1. Vào: http://localhost:5173/admin/meals
2. Kiểm tra Console log
3. Kiểm tra Network tab (F12 → Network)

## 🔍 KIỂM TRA

### Console Log Backend
Sau khi restart và đăng nhập lại, khi truy cập admin API, bạn sẽ thấy:

```
==================================================
🔒 [Middleware] Admin Access Check
==================================================
Session Data: {'user_id': 1, 'account_id': 3, 'role': 'admin'}
User ID from session: 1
==================================================

✅ [Middleware] Account found. Role: admin
```

### Console Log Frontend
```
🔍 AdminRoute Check: {isLoggedIn: "true", userRole: "admin", ...}
✅ Admin access granted
Meals data: {success: true, data: [...]}
Stats data: {success: true, data: {...}}
```

### Network Tab
- Status: **200 OK** (không còn 403)
- Response có data

## ⚠️ LƯU Ý QUAN TRỌNG

1. **PHẢI restart backend server** sau khi sửa CORS
2. **PHẢI clear cookies** và đăng nhập lại
3. **Kiểm tra backend terminal** xem có log session data không
4. **Kiểm tra Network tab** xem cookies có được gửi không

## 🐛 NẾU VẪN LỖI 403

### Kiểm tra 1: Backend có chạy không?
```powershell
# Test endpoint
curl http://localhost:5000/api/auth/test
```

### Kiểm tra 2: Cookies có được gửi không?
1. F12 → Network tab
2. Click vào request bị 403
3. Headers → Request Headers
4. Kiểm tra có `Cookie: session=...` không

### Kiểm tra 3: Session có được set không?
Sau khi login, gọi:
```javascript
fetch('/api/auth/me', { credentials: 'include' })
  .then(r => r.json())
  .then(d => console.log(d))
```

Nếu trả về user data → Session OK
Nếu trả về 401 → Session không được set

## 📋 CHECKLIST

- [ ] Đã sửa CORS trong app.py
- [ ] Đã restart backend server
- [ ] Đã clear browser cookies
- [ ] Đã đăng nhập lại với admin account
- [ ] Kiểm tra console log backend có session data
- [ ] Kiểm tra Network tab có cookies được gửi
- [ ] API trả về 200 OK thay vì 403

## 🎯 KẾT QUẢ MONG ĐỢI

Sau khi làm theo các bước trên:
- ✅ Login thành công
- ✅ Session được set đúng
- ✅ Cookies được gửi trong mọi request
- ✅ Admin API trả về 200 OK
- ✅ Dữ liệu hiển thị trên trang admin meals
