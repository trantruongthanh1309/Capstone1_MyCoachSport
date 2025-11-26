from flask import Blueprint, jsonify, session
from models.user_schedule import UserSchedule
from models.workout import Workout
from models.meal import Meal
from datetime import datetime, timedelta

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/', methods=['GET'])
def get_notifications():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify([])

    now = datetime.now()
    # Lấy lịch trong khoảng: 30 phút trước -> 60 phút tới (để nhắc nhở)
    start_time = now - timedelta(minutes=30)
    end_time = now + timedelta(minutes=60)
    
    today = now.date()
    
    # Query lịch hôm nay
    try:
        schedules = UserSchedule.query.filter(
            UserSchedule.User_id == user_id,
            UserSchedule.Date == today
        ).all()
    except Exception as e:
        print(f"Error fetching notifications: {e}")
        return jsonify([])
    
    notifs = []
    for s in schedules:
        if not s.Time: continue
        sched_time = datetime.combine(today, s.Time)
        
        # Chỉ lấy lịch nằm trong khoảng quan tâm
        if start_time <= sched_time <= end_time:
            time_diff = sched_time - now
            minutes_diff = int(time_diff.total_seconds() / 60)
            
            item = {
                "id": s.Id,
                "time": s.Time.strftime("%H:%M"),
                "minutes_diff": minutes_diff, # Âm là đã qua, Dương là sắp tới
                "type": "workout" if s.WorkoutId else "meal",
                "title": "",
                "message": ""
            }
            
            if s.WorkoutId:
                w = Workout.query.get(s.WorkoutId)
                if w:
                    item["title"] = "Đến giờ tập luyện" if minutes_diff <= 0 else "Sắp đến giờ tập"
                    item["message"] = f"{w.Name} lúc {s.Time.strftime('%H:%M')}"
            elif s.MealId:
                m = Meal.query.get(s.MealId)
                if m:
                    item["title"] = "Đến giờ ăn uống" if minutes_diff <= 0 else "Sắp đến giờ ăn"
                    item["message"] = f"{m.Name} lúc {s.Time.strftime('%H:%M')}"
            
            if item["title"]: # Chỉ thêm nếu tìm thấy workout/meal
                notifs.append(item)
            
    # Sắp xếp: Ưu tiên cái sắp tới gần nhất
    notifs.sort(key=lambda x: abs(x['minutes_diff']))
    
    return jsonify(notifs)
