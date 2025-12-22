# 🔧 Hướng Dẫn Debug Leaderboard

## ✅ Đã Sửa

1. **API Query** - Đã sửa join từ `Name` sang `User_id` để khớp với database schema
2. **Frontend Logging** - Đã thêm console.log để debug
3. **Test Script** - Đã tạo script test API

## 🧪 Kết Quả Test

API đang hoạt động tốt:
- ✅ Status Code: 200
- ✅ Success: True
- ✅ Total Users: 7
- ✅ Top User: Thành - 1002 points

## 🔍 Cách Debug

### 1. Kiểm Tra Console trong Browser

1. Mở trang: `http://localhost:3000/leaderboard`
2. Nhấn **F12** để mở DevTools
3. Chuyển sang tab **Console**
4. Tìm các log:
   - 🔄 "Fetching leaderboard data..."
   - 📦 "Response received:"
   - 📊 "Response data:"
   - ✅ "Success! Data:"

### 2. Kiểm Tra Network Tab

1. Trong DevTools, chuyển sang tab **Network**
2. Refresh trang (F5)
3. Tìm request tới `/api/leaderboard`
4. Click vào request đó
5. Xem:
   - **Status**: Phải là 200
   - **Response**: Phải có `success: true` và `data: [...]`

### 3. Kiểm Tra Backend Server

Backend server phải đang chạy:
```bash
# Kiểm tra xem server có chạy không
curl http://localhost:5000/api/leaderboard
```

### 4. Restart Servers

Nếu vẫn không hiển thị, hãy restart cả 2 servers:

**Backend:**
```bash
# Stop server hiện tại (Ctrl+C)
# Sau đó chạy lại:
cd my-frontend/BACKEND
python app.py
```

**Frontend:**
```bash
# Stop server hiện tại (Ctrl+C)
# Sau đó chạy lại:
cd my-frontend
npm run dev
```

## 🐛 Các Lỗi Thường Gặp

### Lỗi 1: "Không tìm thấy kết quả phù hợp"

**Nguyên nhân:** Frontend nhận được data nhưng không hiển thị

**Giải pháp:**
1. Mở Console (F12)
2. Xem log "Success! Data:"
3. Kiểm tra xem `leaderboard` state có data không

### Lỗi 2: CORS Error

**Nguyên nhân:** Backend không cho phép request từ frontend

**Giải pháp:**
- Kiểm tra file `app.py` có `CORS(app)` không
- Restart backend server

### Lỗi 3: Network Error

**Nguyên nhân:** Backend server không chạy hoặc URL sai

**Giải pháp:**
- Kiểm tra backend server đang chạy: `http://localhost:5000`
- Kiểm tra URL trong code: `http://localhost:5000/api/leaderboard`

## 📝 Checklist Debug

- [ ] Backend server đang chạy (port 5000)
- [ ] Frontend server đang chạy (port 3000)
- [ ] Database có dữ liệu (160 records)
- [ ] API trả về status 200
- [ ] API trả về `success: true`
- [ ] Console có log "Success! Data:"
- [ ] Data có trong response
- [ ] Không có CORS error
- [ ] Không có Network error

## 🚀 Bước Tiếp Theo

Sau khi debug:

1. **Mở Browser Console** (F12)
2. **Refresh trang** (Ctrl + F5)
3. **Xem logs** trong Console
4. **Chụp màn hình** console nếu vẫn lỗi
5. **Gửi screenshot** để được hỗ trợ thêm

## 📞 Cần Hỗ Trợ?

Nếu vẫn không hiển thị, hãy cung cấp:
1. Screenshot của Console tab
2. Screenshot của Network tab (request /api/leaderboard)
3. Log từ backend terminal

---

**Cập nhật:** 2025-11-22 11:15
