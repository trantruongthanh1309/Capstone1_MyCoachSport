from flask import Blueprint, request, jsonify, session
from db import db
from models.user_schedule import UserSchedule

schedule_bp = Blueprint('schedule', __name__, url_prefix='/api/schedule')

@schedule_bp.route('/busy', methods=['GET'])
def get_busy_slots():
    if 'user_id' not in session:
        return jsonify({"error": "Chưa đăng nhập"}), 401
    
    user_id = session['user_id']
    slots = UserSchedule.query.filter_by(User_id=user_id).all()
    
    schedule = {
        "mon": {"morning": None, "afternoon": None, "evening": None},
        "tue": {"morning": None, "afternoon": None, "evening": None},
        "wed": {"morning": None, "afternoon": None, "evening": None},
        "thu": {"morning": None, "afternoon": None, "evening": None},
        "fri": {"morning": None, "afternoon": None, "evening": None},
        "sat": {"morning": None, "afternoon": None, "evening": None},
        "sun": {"morning": None, "afternoon": None, "evening": None}
    }
    
    for slot in slots:
        if slot.DayOfWeek in schedule and slot.Period in schedule[slot.DayOfWeek]:
            schedule[slot.DayOfWeek][slot.Period] = slot.Note
    
    return jsonify(schedule)

@schedule_bp.route('/busy', methods=['POST'])
def save_busy_slots():
    if 'user_id' not in session:
        return jsonify({"error": "Chưa đăng nhập"}), 401
    
    user_id = session['user_id']
    data = request.json
    
    UserSchedule.query.filter_by(User_id=user_id).delete()
    
    for day, periods in data.items():
        for period, note in periods.items():
            if note and isinstance(note, str) and note.strip():
                new_slot = UserSchedule(
                    User_id=user_id,
                    DayOfWeek=day,
                    Period=period,
                    Note=note.strip()
                )
                db.session.add(new_slot)
    
    db.session.commit()
    return jsonify({"message": "Lưu lịch làm việc thành công!"})