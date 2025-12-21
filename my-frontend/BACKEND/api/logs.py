from flask import Blueprint, request, jsonify, session
from sqlalchemy import text
from db import db
from datetime import datetime

logs_bp = Blueprint('logs', __name__)

def get_current_user_id():
    if 'user_id' in session:
        return session['user_id']
    return 18 # Fallback cho dev

@logs_bp.route('', methods=['GET'])
def get_logs():
    try:
        user_id = get_current_user_id()
        
        query = text("""
            SELECT 
                l.Id, l.Day, l.Notes, l.RPE, l.Rating, l.FeedbackType, l.CreatedAt,
                m.Name as MealName,
                w.Name as WorkoutName
            FROM dbo.Logs l
            LEFT JOIN dbo.Meals m ON l.Meal_id = m.Id
            LEFT JOIN dbo.Workouts w ON l.Workout_id = w.Id
            WHERE l.User_id = :uid
            ORDER BY l.CreatedAt DESC
        """)
        
        result = db.session.execute(query, {"uid": user_id}).fetchall()
        
        logs = []
        for row in result:
            logs.append({
                "id": row[0],
                "day": row[1].strftime("%Y-%m-%d") if row[1] else "",
                "notes": row[2],
                "rpe": row[3],
                "rating": row[4],
                "feedbackType": row[5],
                "createdAt": row[6].strftime("%d/%m/%Y %H:%M") if row[6] else "",
                "mealName": row[7],
                "workoutName": row[8]
            })

        return jsonify({"success": True, "data": logs})

    except Exception as e:
        print(f"❌ ERROR get_logs: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@logs_bp.route('/create', methods=['POST'])
def create_log():
    try:
        user_id = get_current_user_id()
        data = request.json
        
        day = data.get('day', datetime.now().strftime("%Y-%m-%d"))
        meal_id = data.get('meal_id')
        workout_id = data.get('workout_id')
        notes = data.get('notes', '').strip() if data.get('notes') else ''
        rpe = data.get('rpe')
        rating = data.get('rating')
        feedback_type = data.get('feedback_type')
        
        # Validate notes length
        if notes and len(notes) > 1000:
            return jsonify({"success": False, "error": "Ghi chú không được quá 1000 ký tự"}), 400

        query = text("""
            INSERT INTO dbo.Logs 
            (User_id, Day, Meal_id, Workout_id, Notes, RPE, Rating, FeedbackType, CreatedAt)
            VALUES 
            (:uid, :day, :mid, :wid, :notes, :rpe, :rating, :fb_type, GETDATE())
        """)
        
        db.session.execute(query, {
            "uid": user_id,
            "day": day,
            "mid": meal_id,
            "wid": workout_id,
            "notes": notes,
            "rpe": rpe,
            "rating": rating,
            "fb_type": feedback_type
        })
        db.session.commit()

        return jsonify({"success": True, "message": "Đã lưu nhật ký thành công!"})

    except Exception as e:
        db.session.rollback()
        print(f"❌ ERROR create_log: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500