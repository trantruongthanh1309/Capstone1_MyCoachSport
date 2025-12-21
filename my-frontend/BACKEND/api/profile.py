from flask import Blueprint, request, jsonify,session
from db import db
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
        data = request.get_json()
        print(f"Received data for user {user_id}: {data}")

        # Validate input
        name = data.get('name', '').strip()
        age = data.get('age')
        height_cm = data.get('height_cm')
        weight_kg = data.get('weight_kg')
        
        # Validate name
        if name and (len(name) == 0 or len(name) > 100):
            return jsonify({"error": "Tên không được để trống và không được quá 100 ký tự"}), 400
        
        # Validate age
        if age is not None:
            try:
                age_int = int(age)
                if age_int < 10 or age_int > 120:
                    return jsonify({"error": "Tuổi phải từ 10 đến 120"}), 400
            except (ValueError, TypeError):
                return jsonify({"error": "Tuổi phải là số hợp lệ"}), 400
        
        # Validate height
        if height_cm is not None:
            try:
                height_float = float(height_cm)
                if height_float < 50 or height_float > 250:
                    return jsonify({"error": "Chiều cao phải từ 50 đến 250 cm"}), 400
            except (ValueError, TypeError):
                return jsonify({"error": "Chiều cao phải là số hợp lệ"}), 400
        
        # Validate weight
        if weight_kg is not None:
            try:
                weight_float = float(weight_kg)
                if weight_float < 20 or weight_float > 300:
                    return jsonify({"error": "Cân nặng phải từ 20 đến 300 kg"}), 400
            except (ValueError, TypeError):
                return jsonify({"error": "Cân nặng phải là số hợp lệ"}), 400

        user = User.query.filter_by(Id=user_id).first()
        if not user:
            print("⚠️ User not found, creating new user...")
            user = User(Id=user_id)
            db.session.add(user)

        if name:
            user.Name = name
        if age is not None:
            user.Age = age
        if data.get('sex'):
            user.Sex = data.get('sex')
        if height_cm is not None:
            user.Height_cm = height_cm
        if weight_kg is not None:
            user.Weight_kg = weight_kg
        if data.get('sport'):
            user.Sport = data.get('sport')
        if data.get('goal'):
            user.Goal = data.get('goal')
        if data.get('sessions_per_week'):
            user.Sessions_per_week = data.get('sessions_per_week')
        
        if 'avatar' in data:
            user.Avatar = data['avatar']

        db.session.commit()
        print("✅ Hồ sơ đã được lưu vào cơ sở dữ liệu.")
        return jsonify({"message": "✅ Hồ sơ đã được lưu vào cơ sở dữ liệu"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"❌ Lỗi khi lưu vào DB: {e}")
        return jsonify({"error": str(e)}), 500

@profile_bp.route('/check-complete', methods=['GET'])
def check_profile_complete():
    """Kiểm tra xem profile đã đầy đủ thông tin chưa"""
    if 'user_id' not in session:
        return jsonify({"error": "Chưa đăng nhập"}), 401
    
    user = User.query.filter_by(Id=session['user_id']).first()
    if not user:
        return jsonify({"error": "Không tìm thấy hồ sơ"}), 404
    
    # Các trường bắt buộc để tạo lịch
    required_fields = {
        "Age": user.Age,
        "Sex": user.Sex,
        "Height_cm": user.Height_cm,
        "Weight_kg": user.Weight_kg,
        "Sport": user.Sport,
        "Goal": user.Goal,
        "Sessions_per_week": user.Sessions_per_week
    }
    
    missing_fields = [field for field, value in required_fields.items() if value is None or (isinstance(value, str) and value.strip() == "")]
    
    is_complete = len(missing_fields) == 0
    
    return jsonify({
        "is_complete": is_complete,
        "missing_fields": missing_fields,
        "message": "Hồ sơ đã đầy đủ" if is_complete else "Vui lòng cập nhật đầy đủ thông tin trong hồ sơ"
    })

@profile_bp.route('/schedule', methods=['GET'])
def get_work_schedule():
    if 'user_id' not in session:
        return jsonify({"error": "Chưa đăng nhập"}), 401
    
    user = User.query.get(session['user_id'])
    if not user:
        return jsonify({"error": "User không tồn tại"}), 404
    
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
    
    if not isinstance(data, dict):
        return jsonify({"error": "Dữ liệu không hợp lệ"}), 400
    
    user.WorkSchedule = json.dumps(data)
    db.session.commit()
    return jsonify({"message": "Cập nhật lịch thành công!"})