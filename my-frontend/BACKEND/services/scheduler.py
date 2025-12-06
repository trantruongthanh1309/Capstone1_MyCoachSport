import time
import threading
from datetime import datetime, timedelta
from db import db

def check_upcoming_events(app):
    with app.app_context():
        from models.user_schedule import UserSchedule
        from models.user_model import User
        from models.workout import Workout
        from models.meal import Meal
        from models.notification_log import NotificationLog
        from services.email_service import send_schedule_reminder
        
        now = datetime.now()
        today = now.date()

        # Lấy lịch hôm nay
        try:
            schedules = UserSchedule.query.filter_by(Date=today).all()
        except Exception as e:
            print(f"⚠️ Lỗi truy vấn lịch: {e}")
            return

        for s in schedules:
            if not s.Time: continue
            
            # Tạo datetime đầy đủ cho lịch
            schedule_dt = datetime.combine(today, s.Time)
            
            # Tính khoảng cách thời gian (phút)
            # time_diff = phút cho đến giờ tập (ví dụ còn 30 phút -> time_diff=30)
            time_diff = (schedule_dt - now).total_seconds() / 60 

            item_type = None
            is_time_to_remind = False
            item_data = {}

            # --- Logic nhắc nhở ---
            
            if s.WorkoutId:
                item_type = 'Workout'
                # Nhắc trước 2 tiếng (120 phút) -> Quét trong khoảng 110-130 phút
                if 110 <= time_diff <= 130: 
                    is_time_to_remind = True
                    w = Workout.query.get(s.WorkoutId)
                    item_data = {'title': w.Name if w else 'Bài tập', 'time': s.Time.strftime('%H:%M')}
            
            elif s.MealId:
                item_type = 'Meal'
                # Nhắc trước 30 phút -> Quét trong khoảng 20-40 phút
                if 20 <= time_diff <= 40:
                    is_time_to_remind = True
                    m = Meal.query.get(s.MealId)
                    item_data = {'title': m.Name if m else 'Bữa ăn', 'calories': m.Calories if m else 0, 'time': s.Time.strftime('%H:%M')}

            # --- Gửi Mail ---
            if is_time_to_remind and item_type:
                # Kiểm tra xem đã gửi chưa trong bảng Log
                # Chúng ta check theo User, Type và ReferenceID (ID lịch)
                existing_log = NotificationLog.query.filter_by(
                    User_id=s.User_id, 
                    Type=item_type, 
                    ReferenceId=s.Id
                ).first()

                if not existing_log:
                    user = User.query.get(s.User_id)
                    if user and user.Email:
                        print(f"📧 Đang gửi mail nhắc {item_type} cho {user.Email}...")
                        send_schedule_reminder(user, item_data, type=item_type)

                        # Lưu log
                        new_log = NotificationLog(
                            User_id=user.Id,
                            Type=item_type,
                            ReferenceId=s.Id,
                            SentAt=datetime.now()
                        )
                        db.session.add(new_log)
                        db.session.commit()

def start_scheduler(app):
    """Khởi chạy luồng kiểm tra lịch"""
    def run_job():
        print("⏳ Scheduler Email đã khởi động...")
        while True:
            try:
                check_upcoming_events(app)
            except Exception as e:
                print(f"❌ Scheduler Error: {e}")
            time.sleep(300) # Check mỗi 5 phút (300s) để không bị miss khoảng thời gian 20p

    thread = threading.Thread(target=run_job)
    thread.daemon = True # Tắt thread khi app tắt
    thread.start()
