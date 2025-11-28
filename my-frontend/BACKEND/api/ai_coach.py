# api/ai_coach.py
from flask import Blueprint, request, jsonify, session
from datetime import datetime
from services.recommendation_service import build_daily_schedule
from db import db
from models import Log, UserPlan, Meal, Workout
from sqlalchemy import text

ai_coach_bp = Blueprint('ai_coach', __name__)

@ai_coach_bp.route('/schedule', methods=['GET'])
def get_schedule():
    if 'user_id' not in session:
        return jsonify({"error": "Chưa đăng nhập"}), 401
    
    user_id = session['user_id']
    date = request.args.get('date', '2025-10-18')
    
    try:
        schedule = build_daily_schedule(user_id, date)
        return jsonify(schedule)
    except Exception as e:
        print("Lỗi AI:", str(e))
        return jsonify({"error": "Lỗi hệ thống"}), 500


@ai_coach_bp.route('/feedback', methods=['POST'])
def submit_feedback():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        meal_id = data.get('meal_id')
        workout_id = data.get('workout_id')
        rating = data.get('rating')  # 1-5
        feedback_type = data.get('feedback_type', 'liked')
            
        if not user_id or not rating:
            return jsonify({"error": "Thiếu user_id hoặc rating"}), 400

        if not (1 <= rating <= 5):
            return jsonify({"error": "Rating phải từ 1 đến 5"}), 400

        log = Log(
            User_id=user_id,
            Meal_id=meal_id,
            Workout_id=workout_id,
            Rating=rating,
            FeedbackType=feedback_type,
            CreatedAt=datetime.utcnow()
        )

        db.session.add(log)
        db.session.commit()

        return jsonify({"status": "success", "message": "Ghi nhận phản hồi thành công!"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@ai_coach_bp.route('/swap', methods=['POST'])
def swap_schedule_item():
    """
    Swap một món ăn hoặc bài tập trong lịch trình (Sử dụng bảng UserPlans)
    """
    try:
        data = request.json
        user_id = data.get('user_id')
        date = data.get('date')
        old_item_id = data.get('old_item_id')
        new_item_id = data.get('new_item_id')
        item_type = data.get('type')
        
        if not all([user_id, date, old_item_id, new_item_id, item_type]):
            return jsonify({"success": False, "error": "Missing required fields"}), 400
            
        # Chuyển đổi date string sang object nếu cần
        try:
            date_obj = datetime.strptime(date, "%Y-%m-%d").date()
        except:
            return jsonify({"success": False, "error": "Invalid date format"}), 400
        
        if item_type == "meal":
            # Tìm plan cũ trong UserPlans
            plan = UserPlan.query.filter_by(
                UserId=user_id, 
                Date=date_obj,
                MealId=old_item_id
            ).first()
            
            if not plan:
                return jsonify({"success": False, "error": "Old meal not found in schedule"}), 404
            
            # Cập nhật sang món mới
            plan.MealId = new_item_id
            db.session.commit()
            
            # Lấy thông tin món mới để trả về (optional)
            new_meal = Meal.query.get(new_item_id)
            return jsonify({
                "success": True, 
                "message": "Swapped meal successfully",
                "new_item": {
                    "Id": new_meal.Id,
                    "Name": new_meal.Name,
                    "Kcal": new_meal.Kcal,
                    "Protein": new_meal.Protein,
                    "Carb": new_meal.Carb,
                    "Fat": new_meal.Fat,
                    "Image": getattr(new_meal, 'Image', None)
                } if new_meal else None
            })
            
        elif item_type == "workout":
            # Tìm plan cũ trong UserPlans
            plan = UserPlan.query.filter_by(
                UserId=user_id, 
                Date=date_obj,
                WorkoutId=old_item_id
            ).first()
            
            if not plan:
                return jsonify({"success": False, "error": "Old workout not found in schedule"}), 404
            
            # Cập nhật sang bài tập mới
            plan.WorkoutId = new_item_id
            db.session.commit()
            
            # Lấy thông tin bài tập mới để trả về
            new_workout = Workout.query.get(new_item_id)
            return jsonify({
                "success": True, 
                "message": "Swapped workout successfully",
                "new_item": {
                    "Id": new_workout.Id,
                    "Name": new_workout.Name,
                    "Duration_min": new_workout.Duration_min,
                    "Intensity": new_workout.Intensity,
                    "VideoUrl": getattr(new_workout, 'VideoUrl', None)
                } if new_workout else None
            })
            
        return jsonify({"success": False, "error": "Invalid item type"}), 400

    except Exception as e:
        db.session.rollback()
        print(f"Error swapping item: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


@ai_coach_bp.route('/regenerate', methods=['POST'])
def regenerate_schedule():
    """
    Force regenerate lịch khi user thay đổi Sport, Goal, hoặc Allergies
    """
    if 'user_id' not in session:
        return jsonify({"error": "Chưa đăng nhập"}), 401
    
    try:
        user_id = session['user_id']
        data = request.json
        date = data.get('date')
        
        if not date:
            return jsonify({"success": False, "error": "Missing date"}), 400
        
        # Chuyển đổi date string sang object
        try:
            date_obj = datetime.strptime(date, "%Y-%m-%d").date()
        except:
            return jsonify({"success": False, "error": "Invalid date format"}), 400
        
        # Xóa lịch cũ
        deleted_count = UserPlan.query.filter_by(
            UserId=user_id,
            Date=date_obj
        ).delete()
        
        db.session.commit()
        
        print(f"🔄 [REGENERATE] Deleted {deleted_count} old schedule items for user {user_id} on {date}")
        
        # Tạo lịch mới
        schedule = build_daily_schedule(user_id, date)
        
        return jsonify({
            "success": True,
            "message": f"Đã tạo lại lịch thành công! (Xóa {deleted_count} items cũ)",
            "schedule": schedule
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error regenerating schedule: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500