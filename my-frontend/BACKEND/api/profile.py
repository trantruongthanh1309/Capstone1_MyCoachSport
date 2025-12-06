from flask import Blueprint, request, jsonify,session
from db import db  # Giả sử bạn đã có `db = SQLAlchemy(app)` trong file `db.py` # Từ models.py chứa class User
from models import User  
import json
profile_bp = Blueprint('profile', __name__, url_prefix='/api/profile')

def to_dict(self):
    return {
        "Id": self.Id,
        "Name": self.Name,
        "Email": self.Email,
        "Age": self.Age,
        "Sex": self.Sex,
        "Height_cm": self.Height_cm,
        "Weight_kg": self.Weight_kg,
        "Sport": self.Sport,
        "Goal": self.Goal,
        "Sessions_per_week": self.Sessions_per_week,
    }
@profile_bp.route('', methods=['GET'])
def get_profile():
    # Lấy user_id từ session
    user_id_from_session = session.get('user_id')

    if not user_id_from_session:
        return jsonify({"error": "Chưa đăng nhập"}), 401

    user = User.query.filter_by(Id=user_id_from_session).first()
    if not user:
        return jsonify({"error": "Không tìm thấy hồ sơ"}), 404

    return jsonify({
        "Id": user.Id,
        "Name": user.Name,
        "Email": user.Email,
        "Age": user.Age,
        "Sex": user.Sex,
        "Height_cm": user.Height_cm,
        "Weight_kg": user.Weight_kg,
        "Sport": user.Sport,
        "Goal": user.Goal,
        "Sessions_per_week": user.Sessions_per_week,
        "Avatar": user.Avatar
    })


@profile_bp.route('/<int:user_id>', methods=['POST'])
def update_profile(user_id):
    try:
        data = request.get_json()  # Lấy dữ liệu từ body
        print(f"Received data for user {user_id}: {data}")

        user = User.query.filter_by(Id=user_id).first()
        if not user:
            print("⚠️ User not found, creating new user...")
            user = User(Id=user_id)
            db.session.add(user)

        user.Name = data.get('name', user.Name)
        user.Age = data.get('age', user.Age)
        user.Sex = data.get('sex', user.Sex)
        user.Height_cm = data.get('height_cm', user.Height_cm)
        user.Weight_kg = data.get('weight_kg', user.Weight_kg)
        user.Sport = data.get('sport', user.Sport)
        user.Goal = data.get('goal', user.Goal)
        user.Sessions_per_week = data.get('sessions_per_week', user.Sessions_per_week)
        
        if 'avatar' in data:
            user.Avatar = data['avatar']

        db.session.commit()
        print("✅ Hồ sơ đã được lưu vào cơ sở dữ liệu.")
        return jsonify({"message": "✅ Hồ sơ đã được lưu vào cơ sở dữ liệu"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"❌ Lỗi khi lưu vào DB: {e}")
        return jsonify({"error": str(e)}), 500


    
@profile_bp.route('/schedule', methods=['GET'])
def get_work_schedule():
    if 'user_id' not in session:
        return jsonify({"error": "Chưa đăng nhập"}), 401
    
    user = User.query.get(session['user_id'])
    if not user:
        return jsonify({"error": "User không tồn tại"}), 404
    
    # Nếu WorkSchedule là NULL → gán mặc định
    schedule = json.loads(user.WorkSchedule) if user.WorkSchedule else {
        "mon": [], "tue": [], "wed": [], "thu": [], "fri": [], "sat": [], "sun": []
    }
    return jsonify(schedule)

@profile_bp.route('/schedule', methods=['POST'])
def update_work_schedule():
    if 'user_id' not in session:
        return jsonify({"error": "Chưa đăng nhập"}), 401
    
    data = request.json
    user = User.query.get(session['user_id'])
    if not user:
        return jsonify({"error": "User không tồn tại"}), 404
    
    # Kiểm tra dữ liệu đầu vào
    if not isinstance(data, dict):
        return jsonify({"error": "Dữ liệu không hợp lệ"}), 400
    
    user.WorkSchedule = json.dumps(data)
    db.session.commit()
    return jsonify({"message": "Cập nhật lịch thành công!"})