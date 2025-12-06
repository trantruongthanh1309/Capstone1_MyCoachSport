from app import app
from db import db
from models import UserPlan

def clear_all_schedules():
    with app.app_context():
        print("🧹 Đang dọn dẹp lịch cũ...")
        
        # Đếm số lượng record trước khi xóa
        count = UserPlan.query.count()
        print(f"   Tìm thấy {count} mục trong lịch trình cũ.")
        
        # Xóa tất cả
        UserPlan.query.delete()
        db.session.commit()
        
        print("✅ Đã xóa sạch lịch cũ thành công!")
        print("🚀 Bây giờ bạn hãy Refresh trang Planner để AI tạo lịch mới (2 bài/ngày).")

if __name__ == "__main__":
    clear_all_schedules()
