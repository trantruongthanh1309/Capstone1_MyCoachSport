import time
import threading
from datetime import datetime, timedelta
from db import db
# Import models bên trong hàm để tránh circular import

def check_upcoming_events(app):
    with app.app_context():
        from models.user_schedule import UserSchedule
        from models.user_model import User
        from models.workout import Workout
        from models.meal import Meal
        from services.email_service import send_notification_email

        now = datetime.now()
        upcoming_time = now + timedelta(minutes=30)
        today = now.date()

        # Lấy lịch hôm nay chưa thông báo
        # Lưu ý: Logic này giả định s.Time là đối tượng time của Python
        try:
            schedules = UserSchedule.query.filter_by(Date=today, IsNotified=False).all()
        except Exception as e:
            print(f"⚠️ Lỗi DB Scheduler (Có thể chưa có cột IsNotified): {e}")
            return

        for s in schedules:
            if not s.Time: continue
            
            # Tạo datetime đầy đủ cho lịch
            schedule_dt = datetime.combine(today, s.Time)
            
            # Nếu lịch nằm trong khoảng (Hiện tại -> 30 phút tới)
            # Hoặc đã quá giờ mà chưa báo (báo bù, nhưng giới hạn quá 1 tiếng thôi)
            if (now <= schedule_dt <= upcoming_time) or (now > schedule_dt and (now - schedule_dt).seconds < 3600):
                
                user = User.query.get(s.User_id)
                if not user or not user.Email: continue
                
                title = ""
                content = ""
                
                if s.WorkoutId:
                    w = Workout.query.get(s.WorkoutId)
                    if w:
                        title = f"💪 Sắp đến giờ tập: {w.Name}"
                        content = f"Chào {user.Name},\n\nNhắc nhở nhẹ: Bạn có lịch tập '{w.Name}' vào lúc {s.Time.strftime('%H:%M')}.\n\nHãy chuẩn bị sẵn sàng nhé!\n\n- MySportCoach AI"
                elif s.MealId:
                    m = Meal.query.get(s.MealId)
                    if m:
                        title = f"🥗 Sắp đến giờ ăn: {m.Name}"
                        content = f"Chào {user.Name},\n\nĐừng quên nạp năng lượng! Bữa ăn: '{m.Name}' vào lúc {s.Time.strftime('%H:%M')}.\n\nChúc ngon miệng!\n\n- MySportCoach AI"
                
                if title:
                    print(f"🔔 Phát hiện lịch: {title} cho {user.Name}")
                    # Gửi Email
                    sent = send_notification_email(user.Email, title, content)
                    
                    # Đánh dấu đã thông báo (dù gửi mail lỗi cũng đánh dấu để tránh spam loop)
                    s.IsNotified = True
                    db.session.commit()

def start_scheduler(app):
    """Khởi chạy luồng kiểm tra lịch"""
    def run_job():
        print("⏳ Scheduler đã khởi động...")
        while True:
            try:
                check_upcoming_events(app)
            except Exception as e:
                print(f"❌ Scheduler Error: {e}")
            time.sleep(60) # Check mỗi 60 giây

    thread = threading.Thread(target=run_job)
    thread.daemon = True # Tắt thread khi app tắt
    thread.start()
