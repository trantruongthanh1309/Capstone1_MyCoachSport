from flask import Blueprint, request, jsonify, session
from db import db
from models import User
import json

settings_bp = Blueprint('settings', __name__, url_prefix='/api/settings')

@settings_bp.route('', methods=['GET'])
def get_settings():
    """Lấy tất cả settings của user"""
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({"error": "Chưa đăng nhập"}), 401
    
    user = User.query.filter_by(Id=user_id).first()
    if not user:
        return jsonify({"error": "Không tìm thấy user"}), 404
    
    preferences = json.loads(user.Preferences) if user.Preferences else {
        "theme": "light",
        "language": "vi",
        "notifications": True,
        "emailNotifications": True,
        "pushNotifications": False
    }
    
    privacy = json.loads(user.Privacy) if user.Privacy else {
        "profilePublic": True,
        "showEmail": False,
        "showProgress": True,
        "allowMessages": True
    }
    
    notification_settings = json.loads(user.NotificationSettings) if user.NotificationSettings else {
        "defaultDuration": 60,
        "reminderTime": "07:00",
        "autoLog": True,
        "restDayReminder": True
    }
    
    return jsonify({
        "profile": {
            "name": user.Name or "",
            "email": user.Email or "",
            "avatar": user.Avatar or "",
            "bio": user.Bio or ""
        },
        "preferences": preferences,
        "privacy": privacy,
        "workoutSettings": notification_settings,
        "nutritionSettings": {
            "calorieGoal": 2000,
            "proteinGoal": 150,
            "carbGoal": 200,
            "fatGoal": 60,
            "waterGoal": 8
        }
    })

@settings_bp.route('', methods=['POST'])
def update_settings():
    """Cập nhật settings của user"""
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({"error": "Chưa đăng nhập"}), 401
    
    user = User.query.filter_by(Id=user_id).first()
    if not user:
        return jsonify({"error": "Không tìm thấy user"}), 404
    
    try:
        data = request.get_json()
        
        if 'profile' in data:
            profile = data['profile']
            if 'name' in profile:
                user.Name = profile['name']
            if 'email' in profile:
                user.Email = profile['email']
            if 'avatar' in profile:
                user.Avatar = profile['avatar']
            if 'bio' in profile:
                user.Bio = profile['bio']
        
        if 'preferences' in data:
            user.Preferences = json.dumps(data['preferences'])
        
        if 'privacy' in data:
            user.Privacy = json.dumps(data['privacy'])
        
        if 'workoutSettings' in data:
            user.NotificationSettings = json.dumps(data['workoutSettings'])
        
        db.session.commit()
        
        return jsonify({
            "message": "Cập nhật settings thành công!",
            "success": True
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Lỗi khi cập nhật settings: {e}")
        return jsonify({"error": str(e)}), 500

@settings_bp.route('/export', methods=['GET'])
def export_data():
    """Xuất tất cả dữ liệu của user"""
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({"error": "Chưa đăng nhập"}), 401
    
    user = User.query.filter_by(Id=user_id).first()
    if not user:
        return jsonify({"error": "Không tìm thấy user"}), 404
    
    user_data = {
        "profile": {
            "id": user.Id,
            "name": user.Name,
            "email": user.Email,
            "age": user.Age,
            "sex": user.Sex,
            "height_cm": user.Height_cm,
            "weight_kg": user.Weight_kg,
            "sport": user.Sport,
            "goal": user.Goal,
            "sessions_per_week": user.Sessions_per_week,
            "allergies": user.Allergies,
            "bio": user.Bio
        },
        "preferences": json.loads(user.Preferences) if user.Preferences else {},
        "privacy": json.loads(user.Privacy) if user.Privacy else {},
        "notificationSettings": json.loads(user.NotificationSettings) if user.NotificationSettings else {},
        "workSchedule": json.loads(user.WorkSchedule) if user.WorkSchedule else {},
        "dislikedIngredients": json.loads(user.DislikedIngredients) if user.DislikedIngredients else []
    }
    
    return jsonify(user_data)

@settings_bp.route('/reset', methods=['POST'])
def reset_settings():
    """Đặt lại settings về mặc định"""
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({"error": "Chưa đăng nhập"}), 401
    
    user = User.query.filter_by(Id=user_id).first()
    if not user:
        return jsonify({"error": "Không tìm thấy user"}), 404
    
    try:
        user.Avatar = None
        user.Bio = None
        user.Preferences = json.dumps({
            "theme": "light",
            "language": "vi",
            "notifications": True,
            "emailNotifications": True,
            "pushNotifications": False
        })
        user.Privacy = json.dumps({
            "profilePublic": True,
            "showEmail": False,
            "showProgress": True,
            "allowMessages": True
        })
        user.NotificationSettings = json.dumps({
            "defaultDuration": 60,
            "reminderTime": "07:00",
            "autoLog": True,
            "restDayReminder": True
        })
        
        db.session.commit()
        
        return jsonify({
            "message": "Đã đặt lại settings về mặc định!",
            "success": True
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Lỗi khi reset settings: {e}")
        return jsonify({"error": str(e)}), 500
