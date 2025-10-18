from flask import Flask, jsonify, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
from api.leaderboard import leaderboard_bp  # Import leaderboard API từ leaderboard_route.py
from api.logs import logs_bp  # Import logs API từ logs.py
from api.chatbot import chatbot_bp 
from api.videos import videos_bp  # Import video API từ video.py
from db import db # Import db từ db.py nếu bạn đang sử dụng chung
from api.auth import auth_bp
from api.profile import profile_bp
from datetime import timedelta
from flask_session import Session

# Khởi tạo Flask app
app = Flask(__name__)

# Cấu hình kết nối cơ sở dữ liệu SQL Server
app.config['SQLALCHEMY_DATABASE_URI'] = 'mssql+pyodbc://sa:123@MSI\\SQLEXPRESS01/MySportCoachAI?driver=ODBC+Driver+17+for+SQL+Server'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Tắt theo dõi thay đổi trong SQLAlchemy để tiết kiệm bộ nhớ
app.config['SECRET_KEY'] = 'my_secret_key'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=1)
app.config['SESSION_TYPE'] = 'filesystem'   # ✅ Lưu session trong server, không bị CORS block
app.config['SESSION_PERMANENT'] = True
app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SESSION_COOKIE_DOMAIN'] = 'localhost'
app.config['SESSION_COOKIE_PATH'] = '/'

Session(app)
# Khởi tạo db với app
db.init_app(app)

CORS(app, supports_credentials=True, origins=["http://localhost:5173"])


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

# Đăng ký Blueprint từ logs.py, leaderboard_route.py, chat.py và video.py
app.register_blueprint(logs_bp, url_prefix='/api/logs')  # Đăng ký logs API với tiền tố /api/logs
app.register_blueprint(leaderboard_bp, url_prefix='/api/leaderboard')  # Đăng ký leaderboard API với tiền tố /api/leaderboard
app.register_blueprint(chatbot_bp, url_prefix='/api/chatbot')  # Đăng ký chat API với tiền tố /api/chat
app.register_blueprint(videos_bp, url_prefix='/api/videos')  # Đăng ký video API với tiền tố /api/video
app.register_blueprint(auth_bp, url_prefix='/api/auth') 
app.register_blueprint(profile_bp, url_prefix='/api/profile') 


GEMINI_API_KEY = "AIzaSyC5Dwwo6PYfKOS9RwUsaunIiyBNTevJy5U"  # Thay thế bằng API Key của bạn
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

from flask import Flask, request, jsonify
import requests
@app.route('/chat', methods=['POST'])
def chat():
    # Nhận tin nhắn từ người dùng
    data = request.json or {}
    user_msg = data.get("message", "").strip()

    # Kiểm tra nếu người dùng chưa nhập tin nhắn
    if not user_msg:
        return jsonify({"reply": "❌ Bạn chưa nhập tin nhắn."})

    # Kiểm tra API Key
    if not GEMINI_API_KEY:
        return jsonify({"reply": "⚠️ GEMINI_API_KEY chưa được cấu hình."}), 500

    try:
        sys_prompt = "Bạn là MySportCoachAI - huấn luyện viên AI thân thiện. Trả lời ngắn gọn bằng tiếng Việt."

        payload = {
            "contents": [
                {"role": "user", "parts": [{"text": sys_prompt}]},
                {"role": "user", "parts": [{"text": user_msg}]}
            ]
        }

        # Gửi yêu cầu đến API Gemini
        r = requests.post(
            GEMINI_URL,
            headers={"Content-Type": "application/json"},
            params={"key": GEMINI_API_KEY},
            json=payload,
            timeout=20,
        )

        if r.status_code == 200:
            data = r.json()
            reply = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "⚠️ Không có phản hồi")
            return jsonify({"reply": reply})

        return jsonify({"reply": f"⚠️ Lỗi gọi Gemini API: {r.text}"}), 500

    except Exception as e:
        return jsonify({"reply": f"❌ Lỗi Backend: {e}"}), 500

@app.before_request
def show_session():
    
    print("📦 Session hiện tại: ", dict(session))  # Kiểm tra session có giá trị không
    print("🍪 Cookies nhận từ client: ", request.cookies)  # Kiểm tra cookie gửi từ client

if __name__ == "__main__":
    app.run(debug=True, host="localhost", port=5000)

