# logs.py
from flask import Blueprint, request, jsonify
from db import db  # Import db từ db.py
from datetime import date

# Định nghĩa mô hình Log
class Log(db.Model):
    __tablename__ = 'Logs'

    Id = db.Column(db.Integer, primary_key=True)
    User_id = db.Column(db.Integer, nullable=False)
    Day = db.Column(db.Date, nullable=False)
    Meal_id = db.Column(db.Integer, nullable=False)
    Workout_id = db.Column(db.Integer, nullable=False)
    Notes = db.Column(db.String(500))
    RPE = db.Column(db.Integer)

    def __init__(self, user_id, day, meal_id, workout_id, notes, rpe=None):
        self.User_id = user_id
        self.Day = day
        self.Meal_id = meal_id
        self.Workout_id = workout_id
        self.Notes = notes
        self.RPE = rpe

logs_bp = Blueprint('logs', __name__)

# API để thêm log
@logs_bp.route('/api/logs', methods=["POST"])
def add_log():
    data = request.json

    user_id = data.get('user_id')
    meal_id = data.get('meal_id')
    workout_id = data.get('workout_id')
    
    # Kiểm tra xem các dữ liệu bắt buộc có tồn tại không
    if not user_id or not meal_id or not workout_id:
        return jsonify({"error": "user_id, meal_id, và workout_id là bắt buộc!"}), 400

    # Lấy ngày từ request hoặc lấy ngày hiện tại nếu không có
    day = data.get('day', date.today())  # Nếu không có ngày, lấy ngày hiện tại
    notes = data.get('notes', '')  # Nếu không có ghi chú, mặc định là rỗng
    rpe = data.get('rpe')  # Có thể không có RPE, nên để mặc định là None

    # Tạo đối tượng Log mới
    new_log = Log(user_id=user_id, day=day, meal_id=meal_id, workout_id=workout_id, notes=notes, rpe=rpe)

    try:
        # Thêm log vào cơ sở dữ liệu
        db.session.add(new_log)
        db.session.commit()

        return jsonify({"message": "Log đã được lưu thành công!"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Đã xảy ra lỗi khi lưu log: " + str(e)}), 500
