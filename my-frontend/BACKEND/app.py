from flask import Flask, jsonify, session, Response
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
from datetime import timedelta
from flask_session import Session
from db import db 
from utils.logger import setup_logger

from api.logs import logs_bp  
from api.videos import videos_bp  
from api.weather import weather_bp
from api.auth import auth_bp
from api.profile import profile_bp
from api.planner import planner_bp
from api.ai_coach import ai_coach_bp
from api.schedule_manager import schedule_bp
from api.meals import meals_bp
from api.chatbot_local import chatbot_bp
from api.smart_swap import smart_swap_bp
from api.settings import settings_bp
from api.social import social_bp
from api.notifications import notifications_bp
from api.upload import upload_bp
from api.diary import diary_bp
from api.leaderboard_new import leaderboard_bp as leaderboard_new_bp
from api.user_feedback import user_feedback_bp

from api.routes.admin_routes.users_admin import users_admin_bp
from api.routes.admin_routes.dashboard_admin import dashboard_bp
from api.routes.admin_routes.accounts import accounts_bp
from api.routes.admin_routes.meals_admin_api import meals_admin_bp
from api.routes.admin_routes.workouts_admin_api import workouts_admin_bp
from api.routes.admin_routes.posts_admin_api import posts_admin_bp
from api.routes.admin_routes.feedback import feedback_bp
from api.routes.admin_routes.settings_admin_api import settings_admin_bp

app = Flask(__name__)

setup_logger(app)

@app.errorhandler(500)
def internal_error(error):
    app.logger.error(f"Server Error: {error}")
    return jsonify({
        "success": False,
        "error": "Internal Server Error",
        "message": str(error)
    }), 500

@app.errorhandler(404)
def not_found_error(error):
    return jsonify({
        "success": False,
        "error": "Not Found",
        "message": "Resource not found"
    }), 404

app.config['SQLALCHEMY_DATABASE_URI'] = 'mssql+pyodbc://sa:123@MSI\\SQLEXPRESS01/MySportCoachAI?driver=ODBC+Driver+17+for+SQL+Server&charset=utf8'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'my_secret_key'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=1)

app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = True
app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SESSION_COOKIE_DOMAIN'] = None
app.config['SESSION_COOKIE_PATH'] = '/'
app.config['JSON_AS_ASCII'] = False
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = False 

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'trantruongthanh04@gmail.com'
app.config['MAIL_PASSWORD'] = 'isqr gucl buaq yoyh'
app.config['MAIL_DEFAULT_SENDER'] = ('MySportCoach AI', app.config['MAIL_USERNAME'])

Session(app)

from services.email_service import mail
mail.init_app(app)

from models.notification_log import NotificationLog

db.init_app(app)

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

def check_connection(db_url, db_name):
    try:
        # Configure engine with proper encoding
        engine = create_engine(
            db_url,
            connect_args={
                'timeout': 10,
                'encoding': 'utf-8'
            },
            pool_pre_ping=True
        )
        with engine.connect() as conn:
            print(f"Connection successful to {db_name}!")
        return True
    except Exception as e:
        print(f"Connection failed to {db_name}: {e}")
        return False

check_connection(app.config['SQLALCHEMY_DATABASE_URI'], "SQL Server")

# Ensure all JSON responses have UTF-8 charset
@app.after_request
def after_request(response):
    """Set charset=utf-8 for all JSON responses"""
    if response.content_type and 'application/json' in response.content_type:
        response.headers['Content-Type'] = 'application/json; charset=utf-8'
    return response

app.register_blueprint(logs_bp, url_prefix='/api/logs')
app.register_blueprint(videos_bp, url_prefix='/api/videos')
app.register_blueprint(weather_bp, url_prefix='/api/weather')
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
app.register_blueprint(chatbot_bp, url_prefix='/api/bot')
app.register_blueprint(smart_swap_bp, url_prefix='/api/smart-swap')
app.register_blueprint(settings_bp, url_prefix='/api/settings')
app.register_blueprint(social_bp)
app.register_blueprint(settings_admin_bp)
app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
app.register_blueprint(upload_bp, url_prefix='/api')
app.register_blueprint(leaderboard_new_bp)
app.register_blueprint(diary_bp, url_prefix='/api/diary')
app.register_blueprint(user_feedback_bp)

if __name__ == "__main__":
    from services.scheduler import start_scheduler
    start_scheduler(app)
    app.run(debug=True, host='0.0.0.0', port=5000)
