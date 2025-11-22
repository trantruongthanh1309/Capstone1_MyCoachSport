# Backend API for Swap Feature
# Thêm vào file api/ai_coach.py hoặc tạo file mới

from flask import Blueprint, request, jsonify
from sqlalchemy import text
from db import db
from datetime import datetime

# Nếu tạo file mới, uncomment dòng này:
# swap_bp = Blueprint('swap', __name__)

# Nếu thêm vào ai_coach.py, dùng ai_coach_bp

@ai_coach_bp.route('/swap', methods=['POST'])
def swap_schedule_item():
    """
    Swap một món ăn hoặc bài tập trong lịch trình
    
    Request body:
    {
        "user_id": 18,
        "date": "2025-11-22",
        "old_item_id": 123,
        "new_item_id": 456,
        "type": "meal" hoặc "workout"
    }
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
        
        if item_type == "meal":
            # Lấy thông tin meal cũ để biết MealType
            old_meal_query = text("""
                SELECT MealType FROM dbo.Meals WHERE Id = :meal_id
            """)
            old_meal = db.session.execute(old_meal_query, {"meal_id": old_item_id}).fetchone()
            
            if not old_meal:
                return jsonify({"success": False, "error": "Old meal not found"}), 404
            
            meal_type = old_meal[0]
            
            # Xóa meal cũ khỏi schedule
            delete_query = text("""
                DELETE FROM dbo.UserSchedule 
                WHERE UserId = :user_id 
                AND Date = :date 
                AND MealId = :meal_id
            """)
            db.session.execute(delete_query, {
                "user_id": user_id,
                "date": date,
                "meal_id": old_item_id
            })
            
            # Thêm meal mới vào schedule
            insert_query = text("""
                INSERT INTO dbo.UserSchedule (UserId, Date, MealId, MealType)
                VALUES (:user_id, :date, :meal_id, :meal_type)
            """)
            db.session.execute(insert_query, {
                "user_id": user_id,
                "date": date,
                "meal_id": new_item_id,
                "meal_type": meal_type
            })
            
        elif item_type == "workout":
            # Lấy thông tin workout cũ để biết time slot
            old_workout_query = text("""
                SELECT TimeSlot FROM dbo.UserSchedule 
                WHERE UserId = :user_id 
                AND Date = :date 
                AND WorkoutId = :workout_id
            """)
            old_workout = db.session.execute(old_workout_query, {
                "user_id": user_id,
                "date": date,
                "workout_id": old_item_id
            }).fetchone()
            
            if not old_workout:
                return jsonify({"success": False, "error": "Old workout not found"}), 404
            
            time_slot = old_workout[0]
            
            # Xóa workout cũ
            delete_query = text("""
                DELETE FROM dbo.UserSchedule 
                WHERE UserId = :user_id 
                AND Date = :date 
                AND WorkoutId = :workout_id
            """)
            db.session.execute(delete_query, {
                "user_id": user_id,
                "date": date,
                "workout_id": old_item_id
            })
            
            # Thêm workout mới
            insert_query = text("""
                INSERT INTO dbo.UserSchedule (UserId, Date, WorkoutId, TimeSlot)
                VALUES (:user_id, :date, :workout_id, :time_slot)
            """)
            db.session.execute(insert_query, {
                "user_id": user_id,
                "date": date,
                "workout_id": new_item_id,
                "time_slot": time_slot
            })
        else:
            return jsonify({"success": False, "error": "Invalid type"}), 400
        
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": f"Successfully swapped {item_type}"
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error swapping item: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# Nếu tạo file mới, thêm vào app.py:
# from api.swap import swap_bp
# app.register_blueprint(swap_bp, url_prefix='/api/swap')
