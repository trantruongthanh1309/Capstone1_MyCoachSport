from app import app
from db import db
from models.pending_registration import PendingRegistration

with app.app_context():
    try:
        db.create_all()
        print("✅ Đã tạo bảng PendingRegistrations!")
    except Exception as e:
        print(f"❌ Lỗi: {e}")
