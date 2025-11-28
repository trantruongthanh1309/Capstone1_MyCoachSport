# 🎯 Cải Tiến AI Coach - Tôn Trọng Lịch Bận & Phát Hiện Thay Đổi Profile

## ✅ Các Vấn Đề Đã Được Sửa

### 1. **AI Bỏ Qua Lịch Bận** ❌ → ✅
**Trước đây:**
- Bạn đánh dấu lịch bận trong "Quản Lý Lịch Làm Việc"
- Nhưng AI vẫn gợi ý bữa ăn/tập luyện vào các khung giờ đó

**Bây giờ:**
- AI **LUÔN LUÔN** kiểm tra lịch bận, ngay cả với lịch đã lưu
- Nếu phát hiện xung đột, AI sẽ **tự động tạo lại lịch** để tránh khung giờ bận
- Lịch mới sẽ chỉ gợi ý vào các khung giờ rảnh

### 2. **Thay Đổi Môn Thể Thao Không Cập Nhật Lịch** ❌ → ✅
**Trước đây:**
- Bạn đổi môn thể thao (ví dụ: Bóng đá → Bơi lội)
- Lịch vẫn giữ nguyên, không phù hợp với môn mới

**Bây giờ:**
- AI theo dõi **ProfileHash** (hash của Sport + Goal + Allergies)
- Khi phát hiện thay đổi, AI **tự động tạo lại lịch** phù hợp với profile mới
- Bữa ăn và bài tập sẽ được điều chỉnh theo môn thể thao mới

## 🔧 Các Thay Đổi Kỹ Thuật

### 1. **Thêm Cột `ProfileHash` vào Database**
```sql
ALTER TABLE UserPlans
ADD ProfileHash VARCHAR(32) NULL
```

### 2. **Cải Tiến `recommendation_service.py`**
- Thêm hàm `_get_user_profile_hash()`: Tạo hash từ Sport, Goal, Allergies
- Thêm hàm `_has_profile_changed()`: Kiểm tra xem profile có thay đổi không
- Cập nhật `_load_existing_schedule()`: 
  - Luôn kiểm tra busy slots
  - Phát hiện profile changes
  - Tự động regenerate nếu cần

### 3. **Thêm API Endpoint `/api/ai/regenerate`**
Cho phép force regenerate lịch khi cần:
```javascript
POST /api/ai/regenerate
{
  "date": "2025-11-28"
}
```

## 📝 Cách Sử Dụng

### Bước 1: Đánh Dấu Lịch Bận
1. Vào **Quản Lý Lịch Làm Việc**
2. Chọn ngày trong tuần (Thứ 2, Thứ 3, ...)
3. Chọn khung giờ (Buổi sáng, Buổi trưa, Buổi tối)
4. Nhập ghi chú (ví dụ: "Họp", "Đi học", "Bận việc")
5. Nhấn **Lưu Lịch Làm Việc**

### Bước 2: Kiểm Tra Lịch AI
1. Vào **Kế Hoạch Ăn Uống**
2. AI sẽ **TỰ ĐỘNG** tránh các khung giờ bận
3. Chỉ gợi ý bữa ăn/tập luyện vào khung giờ rảnh

### Bước 3: Thay Đổi Môn Thể Thao
1. Vào **Settings** → **Thông tin cá nhân**
2. Thay đổi môn thể thao (ví dụ: Bóng đá → Bơi lội)
3. Nhấn **Lưu**
4. Quay lại **Kế Hoạch Ăn Uống**
5. AI sẽ **TỰ ĐỘNG** tạo lại lịch phù hợp với môn mới

## 🧪 Test Cases

### Test 1: Lịch Bận
1. Đánh dấu Thứ 2 buổi sáng là "Họp"
2. Vào Kế Hoạch Ăn Uống, chọn Thứ 2
3. **Kết quả mong đợi**: Không có bữa sáng hoặc tập luyện buổi sáng

### Test 2: Thay Đổi Sport
1. Profile hiện tại: Bóng đá
2. Lịch hiện tại: Có bài tập "Chạy bộ tốc độ" (phù hợp bóng đá)
3. Đổi sang: Bơi lội
4. Reload lịch
5. **Kết quả mong đợi**: Bài tập mới phù hợp với bơi lội (ví dụ: "Bơi sải")

### Test 3: Thay Đổi Goal
1. Goal hiện tại: Tăng cơ
2. Lịch hiện tại: Bữa ăn giàu protein
3. Đổi sang: Giảm cân
4. Reload lịch
5. **Kết quả mong đợi**: Bữa ăn ít calo hơn

## 🎨 Logs Để Debug

Khi AI tạo lịch, bạn sẽ thấy logs như sau:

```
🔍 [BUSY CHECK] User 1, Date: 2025-11-28, Weekday: thu
   ⛔ Busy slot: morning - 'Họp'
   📋 Total busy slots: {'morning'}
   
💪 [WORKOUT] Checking workout slots...
   ⏭️ Skipped morning (busy)
   ✅ Selected workout slot: evening
   
🍽️ Generating meal for afternoon...
🍽️ Generating meal for evening...
```

Nếu profile thay đổi:
```
🔄 [PROFILE CHANGED] User 1 profile changed, regenerating schedule...
   ⚠️ Profile changed, will regenerate schedule
🔄 {filtered_count} items conflict with busy slots, regenerating schedule...
```

## 🚀 Tính Năng Mới

### 1. **Smart Busy Detection**
- AI kiểm tra busy slots **mỗi lần** load lịch
- Không chỉ khi tạo lịch mới

### 2. **Profile Change Detection**
- AI tự động phát hiện khi bạn đổi:
  - Môn thể thao (Sport)
  - Mục tiêu (Goal)
  - Dị ứng (Allergies)
- Tự động tạo lại lịch phù hợp

### 3. **Force Regenerate API**
- Có thể force regenerate lịch bất cứ lúc nào
- Hữu ích khi cần reset lịch hoàn toàn

## ❓ FAQ

**Q: Tôi đổi môn thể thao nhưng lịch không đổi?**
A: Refresh lại trang hoặc chọn ngày khác rồi quay lại. AI sẽ tự động phát hiện và tạo lại.

**Q: Tôi đánh dấu bận nhưng lịch vẫn hiện bữa ăn?**
A: Kiểm tra xem bạn đã lưu lịch bận chưa. Sau khi lưu, refresh lại trang Kế Hoạch Ăn Uống.

**Q: Làm sao để xóa toàn bộ lịch và tạo lại?**
A: Gọi API `/api/ai/regenerate` với date cụ thể, hoặc đổi Sport/Goal trong Settings.

## 🎯 Kết Luận

Bây giờ AI Coach đã **HOÀN THIỆN** hơn:
- ✅ Tôn trọng lịch bận của bạn
- ✅ Tự động cập nhật khi bạn thay đổi profile
- ✅ Luôn đề xuất lịch phù hợp và thực tế

Hãy thử nghiệm và cho tôi biết nếu còn vấn đề gì! 🚀
