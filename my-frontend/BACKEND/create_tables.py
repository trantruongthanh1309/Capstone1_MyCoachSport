from app import app
from db import db
from models.notification_log import NotificationLog

with app.app_context():
    try:
        db.create_all()
        print("✅ Đã tạo bảng NotificationLogs và các bảng thiếu!")
    except Exception as e:
        print(f"❌ Lỗi: {e}")
