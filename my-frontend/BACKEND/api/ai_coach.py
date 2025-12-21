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
    
    # Kiểm tra profile có đầy đủ chưa
    from models import User
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Không tìm thấy người dùng"}), 404
    
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
    
    if missing_fields:
        return jsonify({
            "error": "profile_incomplete",
            "message": "Vui lòng cập nhật đầy đủ thông tin trong hồ sơ trước khi xem lịch trình",
            "missing_fields": missing_fields
        }), 400
    
    try:
        schedule = build_daily_schedule(user_id, date)
        
        for item in schedule.get('schedule', []):
            query = text("""
                SELECT TOP 1 Id, IsCompleted 
                FROM UserPlans 
                WHERE UserId = :user_id 
                AND Date = :date 
                AND Type = :item_type 
                AND (MealId = :meal_id OR WorkoutId = :workout_id)
            """)
            
            item_type = item.get('type')
            item_id = item.get('data', {}).get('Id')
            
            result = db.session.execute(query, {
                'user_id': user_id,
                'date': date,
                'item_type': item_type,
                'meal_id': item_id if item_type == 'meal' else None,
                'workout_id': item_id if item_type == 'workout' else None
            }).first()
            
            if result:
                item['schedule_id'] = result.Id
                item['is_completed'] = bool(result.IsCompleted) if result.IsCompleted is not None else False
            else:
                item['schedule_id'] = None
                item['is_completed'] = False
            
            # Lấy feedback status (liked/disliked) từ Logs
            feedback_query = text("""
                SELECT TOP 1 FeedbackType 
                FROM Logs 
                WHERE User_id = :user_id 
                AND (Meal_id = :meal_id OR Workout_id = :workout_id)
                AND FeedbackType IS NOT NULL
                ORDER BY CreatedAt DESC
            """)
            
            feedback_result = db.session.execute(feedback_query, {
                'user_id': user_id,
                'meal_id': item_id if item_type == 'meal' else None,
                'workout_id': item_id if item_type == 'workout' else None
            }).first()
            
            if feedback_result and feedback_result.FeedbackType:
                item['feedback_status'] = feedback_result.FeedbackType  # 'liked' hoặc 'disliked'
            else:
                item['feedback_status'] = None
        
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
        rating = data.get('rating')
        # Xác định feedback_type dựa trên rating: 4-5 = liked, 1-2 = disliked
        if rating >= 4:
            feedback_type = 'liked'
        elif rating <= 2:
            feedback_type = 'disliked'
        else:
            feedback_type = data.get('feedback_type', 'liked')  # rating = 3 thì dùng mặc định hoặc từ request
            
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
            
        try:
            date_obj = datetime.strptime(date, "%Y-%m-%d").date()
        except:
            return jsonify({"success": False, "error": "Invalid date format"}), 400
        
        if item_type == "meal":
            # Lấy slot từ request
            slot = data.get('slot')
            
            # Nếu không có slot từ request, tìm từ UserPlan hiện tại
            if not slot:
                existing_plan = UserPlan.query.filter_by(
                    UserId=user_id,
                    Date=date_obj,
                    MealId=old_item_id,
                    Type="meal"
                ).first()
                if existing_plan:
                    slot = existing_plan.Slot
            
            # Tìm plan với cả MealId và Slot để đảm bảo swap đúng meal (morning/afternoon/evening)
            if slot:
                plan = UserPlan.query.filter_by(
                    UserId=user_id, 
                    Date=date_obj,
                    MealId=old_item_id,
                    Slot=slot,
                    Type="meal"
                ).first()
            else:
                # Fallback: chỉ filter theo MealId (có thể swap sai nếu có nhiều meal trong ngày)
                plan = UserPlan.query.filter_by(
                    UserId=user_id, 
                    Date=date_obj,
                    MealId=old_item_id,
                    Type="meal"
                ).first()
            
            if not plan:
                return jsonify({"success": False, "error": "Old meal not found in schedule"}), 404
            
            plan.MealId = new_item_id
            db.session.commit()
            
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
                    "ServingSize": getattr(new_meal, 'ServingSize', ''),
                    "SuitableSports": getattr(new_meal, 'SuitableSports', ''),
                    "MealTime": getattr(new_meal, 'MealTime', ''),
                    "Ingredients": getattr(new_meal, 'Ingredients', ''),
                    "Recipe": getattr(new_meal, 'Recipe', ''),
                    "Difficulty": getattr(new_meal, 'Difficulty', ''),
                    "CookingTimeMin": getattr(new_meal, 'CookingTimeMin', 0),
                    "Image": getattr(new_meal, 'Image', None)
                } if new_meal else None
            })
            
        elif item_type == "workout":
            plan = UserPlan.query.filter_by(
                UserId=user_id, 
                Date=date_obj,
                WorkoutId=old_item_id
            ).first()
            
            if not plan:
                return jsonify({"success": False, "error": "Old workout not found in schedule"}), 404
            
            plan.WorkoutId = new_item_id
            db.session.commit()
            
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
        
        try:
            date_obj = datetime.strptime(date, "%Y-%m-%d").date()
        except:
            return jsonify({"success": False, "error": "Invalid date format"}), 400
        
        deleted_count = UserPlan.query.filter_by(
            UserId=user_id,
            Date=date_obj
        ).delete()
        
        db.session.commit()
        
        print(f"🔄 [REGENERATE] Deleted {deleted_count} old schedule items for user {user_id} on {date}")
        
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