# -*- coding: utf-8 -*-
from flask import Flask, jsonify, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
from datetime import timedelta
from flask_session import Session
from db import db 
from utils.logger import setup_logger

# Import Blueprints
from api.leaderboard import leaderboard_bp  
from api.logs import logs_bp  
from api.videos import videos_bp  
from api.auth import auth_bp
from api.profile import profile_bp
from api.planner import planner_bp
from api.ai_coach import ai_coach_bp
from api.schedule_manager import schedule_bp
from api.meals import meals_bp
from api.newsfeed import newsfeed_bp
from api.chatbot_local import chatbot_bp
from api.smart_swap import smart_swap_bp
from api.settings import settings_bp
from api.social import social_bp
from api.notifications import notifications_bp
from api.upload import upload_bp
from api.diary import diary_bp
from api.leaderboard_new import leaderboard_bp as leaderboard_new_bp

# Admin Blueprints
from api.routes.admin_routes.users_admin import users_admin_bp
from api.routes.admin_routes.dashboard_admin import dashboard_bp
from api.routes.admin_routes.accounts import accounts_bp
from api.routes.admin_routes.meals_admin_api import meals_admin_bp
from api.routes.admin_routes.workouts_admin_api import workouts_admin_bp
from api.routes.admin_routes.posts_admin_api import posts_admin_bp
from api.routes.admin_routes.feedback import feedback_bp
from api.routes.admin_routes.settings_admin_api import settings_admin_bp

# ✅ Patch chatbot schedule query
import chatbot_core.schedule_patch
# ✅ Patch chatbot weather integration
import chatbot_core.weather_patch

# Khởi tạo Flask app
app = Flask(__name__)

# Cấu hình Logger
setup_logger(app)

# Cấu hình kết nối cơ sở dữ liệu SQL Server với UTF-8
app.config['SQLALCHEMY_DATABASE_URI'] = 'mssql+pyodbc://sa:123@MSI\\SQLEXPRESS01/MySportCoachAI?driver=ODBC+Driver+17+for+SQL+Server&charset=utf8'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'my_secret_key'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=1)

# ✅ Cấu hình session chuẩn cho dev (HTTP localhost)
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = True
app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SESSION_COOKIE_DOMAIN'] = None
app.config['SESSION_COOKIE_PATH'] = '/'
app.config['JSON_AS_ASCII'] = False
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = False 

# ✅ Cấu hình Email (Gmail SMTP)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'trantruongthanh04@gmail.com'
app.config['MAIL_PASSWORD'] = 'isqr gucl buaq yoyh'
app.config['MAIL_DEFAULT_SENDER'] = ('MySportCoach AI', app.config['MAIL_USERNAME'])

Session(app)

# ✅ Khởi tạo Mail Service
from services.email_service import mail
mail.init_app(app)

# ✅ Import NotificationLog để tạo bảng (nếu cần)
from models.notification_log import NotificationLog

# Khởi tạo db với app
db.init_app(app)

# Cấu hình CORS
CORS(app, 
     resources={r"/*": {
         "origins": [
             "http://localhost:5173", 
             "http://localhost:5174", 
             "http://localhost:3000",
             "http://192.168.1.111:5173"
         ]
     }},
     supports_credentials=True, 
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Hàm kiểm tra kết nối cơ sở dữ liệu
def check_connection(db_url, db_name):
    try:
        engine = create_engine(db_url)
        with engine.connect() as conn:
            print(f"✅ Kết nối thành công tới {db_name}!")
        return True
    except Exception as e:
        print(f"❌ Lỗi kết nối tới {db_name}: {e}")
        return False

# Kiểm tra kết nối SQL Server
check_connection(app.config['SQLALCHEMY_DATABASE_URI'], "SQL Server")

# Đăng ký Blueprint
app.register_blueprint(logs_bp, url_prefix='/api/logs')
# app.register_blueprint(leaderboard_bp, url_prefix='/api/leaderboard') # Old leaderboard
app.register_blueprint(videos_bp, url_prefix='/api/videos')
app.register_blueprint(auth_bp)
app.register_blueprint(profile_bp, url_prefix='/api/profile') 
app.register_blueprint(planner_bp, url_prefix="/api/planner")
app.register_blueprint(ai_coach_bp, url_prefix='/api/ai')
app.register_blueprint(schedule_bp, url_prefix="/api/schedule")
app.register_blueprint(users_admin_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(accounts_bp)
app.register_blueprint(meals_admin_bp)
app.register_blueprint(workouts_admin_bp)
app.register_blueprint(posts_admin_bp)
app.register_blueprint(feedback_bp)
app.register_blueprint(meals_bp, url_prefix='/api/meals')
app.register_blueprint(newsfeed_bp, url_prefix='/api/newsfeed')
app.register_blueprint(chatbot_bp, url_prefix='/api/bot')
app.register_blueprint(smart_swap_bp, url_prefix='/api/smart-swap')
app.register_blueprint(settings_bp, url_prefix='/api/settings')
app.register_blueprint(social_bp)
app.register_blueprint(settings_admin_bp)
app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
app.register_blueprint(upload_bp, url_prefix='/api')
app.register_blueprint(leaderboard_new_bp)
app.register_blueprint(diary_bp, url_prefix='/api/diary')

# Test Email Route
@app.route('/test-email-direct')
def test_email_direct():
    try:
        from flask_mail import Message
        from services.email_service import mail
        msg = Message("Test Email MySportCoach", recipients=["trantruongthanh04@gmail.com"])
        msg.body = "Đây là email test kiểm tra kết nối."
        mail.send(msg)
        return "✅ Gửi email thành công! Hãy kiểm tra hộp thư (cả mục Spam)."
    except Exception as e:
        return f"❌ Lỗi gửi email: {str(e)}"

@app.route('/test-user-data')
def test_user_data():
    """Debug: Xem thông tin user hiện tại"""
    user_id = session.get('user_id')
    if not user_id:
        return "❌ Chưa đăng nhập"
    
    from models.user_model import User
    user = User.query.get(user_id)
    if not user:
        return f"❌ Không tìm thấy user ID {user_id}"
    
    return f"""
    <h2>Thông tin User (ID: {user_id})</h2>
    <p><strong>Name:</strong> {user.Name}</p>
    <p><strong>Email:</strong> {user.Email}</p>
    <p><strong>Avatar:</strong> {user.Avatar}</p>
    <p><strong>Sport:</strong> {user.Sport}</p>
    """

@app.route('/test-schedule-email')
def test_schedule_email():
    """Test gửi email nhắc lịch"""
    try:
        from models.user_model import User
        from services.email_service import send_schedule_reminder
        
        # Tạo user giả
        class FakeUser:
            Name = "Test User"
            Email = "truongga471@gmail.com"
        
        user = FakeUser()
        
        # Test email nhắc tập
        workout_item = {
            'title': 'Tập Gym buổi sáng',
            'time': '14:00'
        }
        send_schedule_reminder(user, workout_item, type="Workout")
        
        # Test email nhắc ăn
        meal_item = {
            'title': 'Bữa trưa healthy',
            'calories': 650,
            'time': '12:00'
        }
        send_schedule_reminder(user, meal_item, type="Meal")
        
        return """
        <h2>✅ Đã gửi 2 email test!</h2>
        <p>📧 Email nhắc tập luyện</p>
        <p>🍽️ Email nhắc ăn uống</p>
        <p>Kiểm tra hộp thư: truongga471@gmail.com</p>
        """
    except Exception as e:
        return f"❌ Lỗi: {str(e)}"

if __name__ == "__main__":
    # Khởi chạy Scheduler
    from services.scheduler import start_scheduler
    start_scheduler(app)

    # Chạy server
    app.run(debug=True, host='0.0.0.0', port=5000)
