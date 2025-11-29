from app import app
from db import db
from models.chat_history import ChatHistory

with app.app_context():
    # Tạo bảng ChatHistory
    db.create_all()
    print("✅ Đã tạo bảng ChatHistory thành công!")
