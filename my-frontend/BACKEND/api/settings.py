from flask import Blueprint, request, jsonify, session
from db import db
from models import User
import json

settings_bp = Blueprint('settings', __name__, url_prefix='/api/settings')

def _get_nutrition_settings(user):
    """Lấy nutrition settings từ Preferences hoặc trả về mặc định"""
    try:
        prefs = json.loads(user.Preferences) if user.Preferences else {}
        nutrition = prefs.get('nutritionSettings', {})
        if nutrition:
            return nutrition
    except:
        pass
    
    # Defaults
    return {
        "calorieGoal": 2000,
        "proteinGoal": 150,
        "carbGoal": 200,
        "fatGoal": 60,
        "waterGoal": 8
    }

@settings_bp.route('', methods=['GET'])
def get_settings():
    """Lấy tất cả settings của user"""
    try:
        user_id = session.get('user_id')
        
        if not user_id:
            return jsonify({"error": "Chưa đăng nhập"}), 401
        
        user = User.query.filter_by(Id=user_id).first()
        if not user:
            return jsonify({"error": "Không tìm thấy user"}), 404
        
        # Parse preferences với error handling
        try:
            preferences = json.loads(user.Preferences) if user.Preferences else {}
        except:
            preferences = {}
        
        if not preferences:
            preferences = {
                "theme": "light",
                "language": "vi",
                "notifications": True,
                "emailNotifications": True,
                "pushNotifications": False
            }
        
        # Parse privacy với error handling
        try:
            privacy = json.loads(user.Privacy) if user.Privacy else {}
        except:
            privacy = {}
        
        if not privacy:
            privacy = {
                "profilePublic": True,
                "showEmail": False,
                "showProgress": True,
                "allowMessages": True
            }
        
        # Parse notification settings với error handling
        try:
            notification_settings = json.loads(user.NotificationSettings) if user.NotificationSettings else {}
        except:
            notification_settings = {}
        
        if not notification_settings:
            notification_settings = {
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
            "nutritionSettings": _get_nutrition_settings(user)
        }), 200
        
    except Exception as e:
        print(f"❌ Lỗi khi lấy settings: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Lỗi hệ thống: {str(e)}"}), 500

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
            if 'name' in profile and profile['name']:
                user.Name = profile['name']
            # Email không được thay đổi qua settings (phải qua profile chính)
            # if 'email' in profile:
            #     user.Email = profile['email']
            if 'avatar' in profile:
                # Avatar có thể là base64 string hoặc URL
                user.Avatar = profile['avatar'] if profile['avatar'] else None
            if 'bio' in profile:
                user.Bio = profile['bio'] if profile['bio'] else None
        
        if 'preferences' in data:
            try:
                user.Preferences = json.dumps(data['preferences'], ensure_ascii=False)
            except Exception as e:
                print(f"⚠️ Lỗi khi lưu preferences: {e}")
        
        if 'privacy' in data:
            try:
                user.Privacy = json.dumps(data['privacy'], ensure_ascii=False)
            except Exception as e:
                print(f"⚠️ Lỗi khi lưu privacy: {e}")
        
        if 'workoutSettings' in data:
            try:
                user.NotificationSettings = json.dumps(data['workoutSettings'], ensure_ascii=False)
            except Exception as e:
                print(f"⚠️ Lỗi khi lưu workoutSettings: {e}")
        
        if 'nutritionSettings' in data:
            # Merge nutrition settings vào Preferences
            try:
                current_prefs = json.loads(user.Preferences) if user.Preferences else {}
                current_prefs['nutritionSettings'] = data['nutritionSettings']
                user.Preferences = json.dumps(current_prefs, ensure_ascii=False)
            except Exception as e:
                print(f"⚠️ Lỗi khi lưu nutritionSettings: {e}")
                # Nếu không merge được, tạo mới
                user.Preferences = json.dumps({
                    "nutritionSettings": data['nutritionSettings']
                }, ensure_ascii=False)
        
        db.session.commit()
        
        print(f"✅ Đã cập nhật settings cho user {user_id}")
        
        return jsonify({
            "message": "Cập nhật settings thành công!",
            "success": True
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Lỗi khi cập nhật settings: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Lỗi khi lưu: {str(e)}"}), 500

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
            "pushNotifications": False,
            "nutritionSettings": {
                "calorieGoal": 2000,
                "proteinGoal": 150,
                "carbGoal": 200,
                "fatGoal": 60,
                "waterGoal": 8
            }
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

@settings_bp.route('/delete-account', methods=['POST'])
def delete_account():
    """Xóa tài khoản user (tương tự admin delete user với cascade)"""
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({"error": "Chưa đăng nhập"}), 401
    
    try:
        from models.account_model import Account
        from models.leaderboard_models import UserStats, WorkoutLog, UserAchievement
        from models.user_plan import UserPlan
        from models.user_schedule import UserSchedule
        from models.post import Post
        from models.social_models import Comment, Like, Share, Conversation, Message
        from models.chat_history import ChatHistory
        from models.feedback import Feedback
        from models.log import Log
        from models.notification_log import NotificationLog
        from sqlalchemy import or_, text
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "Không tìm thấy user"}), 404
        
        # Cascade deletion giống như admin delete
        account = Account.query.filter_by(User_id=user_id).first()
        if account:
            db.session.delete(account)
        
        try:
            db.session.execute(text("DELETE FROM Leaderboard WHERE User_id = :user_id"), {"user_id": user_id})
        except Exception as e:
            print(f"Warning: Could not delete Leaderboard: {e}")
        
        UserStats.query.filter_by(User_id=user_id).delete()
        WorkoutLog.query.filter_by(User_id=user_id).delete()
        UserAchievement.query.filter_by(User_id=user_id).delete()
        UserPlan.query.filter_by(UserId=user_id).delete()
        UserSchedule.query.filter_by(User_id=user_id).delete()
        Post.query.filter_by(User_id=user_id).delete()
        Comment.query.filter_by(User_id=user_id).delete()
        Like.query.filter_by(User_id=user_id).delete()
        Share.query.filter_by(User_id=user_id).delete()
        Conversation.query.filter(
            or_(Conversation.User1_id == user_id, Conversation.User2_id == user_id)
        ).delete()
        try:
            Message.query.filter_by(User_id=user_id).delete()
        except:
            pass
        ChatHistory.query.filter_by(User_id=user_id).delete()
        Feedback.query.filter_by(User_id=user_id).delete()
        Log.query.filter_by(User_id=user_id).delete()
        NotificationLog.query.filter_by(User_id=user_id).delete()
        
        db.session.delete(user)
        db.session.commit()
        
        session.clear()
        
        return jsonify({
            "success": True,
            "message": "Tài khoản đã được xóa thành công"
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Lỗi khi xóa tài khoản: {e}")
        return jsonify({"error": str(e)}), 500
