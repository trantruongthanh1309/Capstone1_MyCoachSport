# -*- coding: utf-8 -*-
from flask import Flask, jsonify, session
from flask_cors import CORS  # type: ignore[import]
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
from api.leaderboard import leaderboard_bp  
from api.logs import logs_bp  
from api.videos import videos_bp  
from db import db 
from api.auth import auth_bp
from api.profile import profile_bp
from datetime import timedelta
from flask_session import Session
from api.planner import planner_bp
from api.ai_coach import ai_coach_bp
from api.schedule_manager import schedule_bp
from api.meals import meals_bp
from api.newsfeed import newsfeed_bp
from api.chatbot_local import chatbot_bp
from api.smart_swap import smart_swap_bp
from api.settings import settings_bp
from api.social import social_bp  # ✅ Social Media API


from api.routes.admin_routes.users_admin import users_admin_bp
from api.routes.admin_routes.dashboard_admin import dashboard_bp
from api.routes.admin_routes.accounts import accounts_bp
from api.routes.admin_routes.meals_admin_api import meals_admin_bp
from api.routes.admin_routes.workouts_admin_api import workouts_admin_bp
from api.routes.admin_routes.posts_admin_api import posts_admin_bp
from api.routes.admin_routes.feedback import feedback_bp

# Khởi tạo Flask app
app = Flask(__name__)

# Cấu hình Logger
from utils.logger import setup_logger
setup_logger(app)

# Cấu hình kết nối cơ sở dữ liệu SQL Server
app.config['SQLALCHEMY_DATABASE_URI'] = 'mssql+pyodbc://sa:123@MSI\\SQLEXPRESS01/MySportCoachAI?driver=ODBC+Driver+17+for+SQL+Server'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'my_secret_key'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=1)

# ✅ Cấu hình session chuẩn cho dev (HTTP localhost)
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = True
app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'     # 👈 an toàn, không bị chặn cookie
app.config['SESSION_COOKIE_SECURE'] = False       # 👈 vì đang dùng HTTP, không HTTPS
app.config['SESSION_COOKIE_DOMAIN'] = None        # 👈 Flask tự nhận domain (localhost/127.0.0.1 đều được)
app.config['SESSION_COOKIE_PATH'] = '/'
app.config['JSON_AS_ASCII'] = False  # ← Cho phép JSON có Unicode
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = False 

Session(app)
# Khởi tạo db với app
db.init_app(app)

CORS(app, 
     resources={r"/*": {"origins": ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"]}},
     supports_credentials=True, 
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])


# Hàm kiểm tra kết nối cơ sở dữ liệu
def check_connection(db_url, db_name):
    """
    Hàm kiểm tra kết nối với cơ sở dữ liệu.
    """
    try:
        engine = create_engine(db_url)
        with engine.connect() as conn:
            print(f"✅ Kết nối thành công tới {db_name}!")
        return True
    except Exception as e:
        print(f"❌ Lỗi kết nối tới {db_name}: {e}")
        return False

# Kiểm tra kết nối SQL Server
sql_server_status = check_connection(
    'mssql+pyodbc://sa:123@MSI\\SQLEXPRESS01/MySportCoachAI?driver=ODBC+Driver+17+for+SQL+Server', 
    "SQL Server"
)

# Đăng ký Blueprint
app.register_blueprint(logs_bp, url_prefix='/api/logs')
app.register_blueprint(leaderboard_bp, url_prefix='/api/leaderboard')
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
app.register_blueprint(social_bp)  # ✅ Social Media endpoints
from api.routes.admin_routes.settings_admin_api import settings_admin_bp
app.register_blueprint(settings_admin_bp)

from api.notifications import notifications_bp
app.register_blueprint(notifications_bp, url_prefix='/api/notifications')

from api.upload import upload_bp
app.register_blueprint(upload_bp, url_prefix='/api')

from api.leaderboard_new import leaderboard_bp
app.register_blueprint(leaderboard_bp)

from api.diary import diary_bp
app.register_blueprint(diary_bp, url_prefix='/api/diary')

if __name__ == "__main__":
    # Khởi chạy Scheduler (Thông báo & Email)
    from services.scheduler import start_scheduler
    start_scheduler(app)

    app.run(debug=True, port=5000)
