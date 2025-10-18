# logs.py
from flask import Blueprint, request, jsonify
from db import db
from datetime import date
from models.log import Log  # ✅ Import model từ models/

logs_bp = Blueprint('logs', __name__)

@logs_bp.route('/api/logs', methods=["POST"])
def add_log():
    data = request.json
    user_id = data.get('user_id')
    meal_id = data.get('meal_id')
    workout_id = data.get('workout_id')
    
    if not user_id or not meal_id or not workout_id:
        return jsonify({"error": "user_id, meal_id, và workout_id là bắt buộc!"}), 400

    day = data.get('day', date.today().isoformat())  # Chuyển sang string nếu cần
    notes = data.get('notes', '')
    rpe = data.get('rpe')

    # DÙNG MODEL TỪ models/log.py
    new_log = Log(
        User_id=user_id,
        Day=day,
        Meal_id=meal_id,
        Workout_id=workout_id,
        Notes=notes,
        RPE=rpe
    )

    try:
        db.session.add(new_log)
        db.session.commit()
        return jsonify({"message": "Log đã được lưu thành công!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Đã xảy ra lỗi khi lưu log: " + str(e)}), 500