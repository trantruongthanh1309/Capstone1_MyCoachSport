# api/ai_coach.py
from flask import Blueprint, request, jsonify, session
from datetime import datetime
from services.recommendation_service import build_daily_schedule
from db import db
from models import Log
from sqlalchemy import text

ai_coach_bp = Blueprint('ai_coach', __name__)

@ai_coach_bp.route('/schedule', methods=['GET'])
def get_schedule():
    if 'user_id' not in session:
        return jsonify({"error": "Chưa đăng nhập"}), 401
    
    user_id = session['user_id']  # ← LẤY TỪ SESSION
    date = request.args.get('date', '2025-10-18')
    
    try:
        schedule = build_daily_schedule(user_id, date)  # ← TRUYỀN user_id
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
    Swap một món ăn hoặc bài tập trong lịch trình
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
            # Lấy thông tin meal cũ từ schedule để biết Period (time slot)
            old_schedule_query = text("""
                SELECT Period FROM dbo.UserSchedule 
                WHERE User_id = :user_id 
                AND Date = :date 
                AND MealId = :meal_id
            """)
            old_schedule = db.session.execute(old_schedule_query, {
                "user_id": user_id,
                "date": date,
                "meal_id": old_item_id
            }).fetchone()
            
            if not old_schedule:
                return jsonify({"success": False, "error": "Old meal not found in schedule"}), 404
            
            period = old_schedule[0]
            
            # Xóa meal cũ khỏi schedule
            delete_query = text("""
                DELETE FROM dbo.UserSchedule 
                WHERE User_id = :user_id 
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
                INSERT INTO dbo.UserSchedule (User_id, Date, MealId, Period)
                VALUES (:user_id, :date, :meal_id, :period)
            """)
            db.session.execute(insert_query, {
                "user_id": user_id,
                "date": date,
                "meal_id": new_item_id,
                "period": period
            })
            
        elif item_type == "workout":
            # Lấy thông tin workout cũ để biết Period (time slot)
            old_workout_query = text("""
                SELECT Period FROM dbo.UserSchedule 
                WHERE User_id = :user_id 
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
            
            period = old_workout[0]
            
            # Xóa workout cũ
            delete_query = text("""
                DELETE FROM dbo.UserSchedule 
                WHERE User_id = :user_id 
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
                INSERT INTO dbo.UserSchedule (User_id, Date, WorkoutId, Period)
                VALUES (:user_id, :date, :workout_id, :period)
            """)
            db.session.execute(insert_query, {
                "user_id": user_id,
                "date": date,
                "workout_id": new_item_id,
                "period": period
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