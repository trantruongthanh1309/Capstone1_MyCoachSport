from db import db
import json
from models import User, Log, Meal, Workout

def get_user_profile(user_id: int):
    user = db.session.query(User).filter(User.Id == user_id).first()
    if not user:
        raise ValueError("User not found")

    # 👇 THÊM DÒNG NÀY ĐỂ DEBUG
    print(f"🔍 User Sport: '{user.Sport}'")  # ← XEM GIÁ TRỊ CỦA user.Sport

    work_schedule = json.loads(user.WorkSchedule) if user.WorkSchedule else {}
    disliked = json.loads(user.DislikedIngredients) if user.DislikedIngredients else []
    allergies = json.loads(user.Allergies) if user.Allergies else []

    return {
        "id": user.Id,
        "sport": user.Sport,  # ← Đây là giá trị được gửi đến AI Coach
        "goal": user.Goal,
        "work_schedule": work_schedule,
        "disliked_ingredients": disliked,
        "allergies": allergies
    }

def get_user_feedback(user_id: int):
    logs = db.session.query(Log).filter(Log.User_id == user_id).all()
    meal_ratings = {}
    workout_ratings = {}
    
    for log in logs:
        if log.Meal_id and log.Rating:
            meal_ratings[log.Meal_id] = meal_ratings.get(log.Meal_id, []) + [log.Rating]
        if log.Workout_id and log.Rating:
            workout_ratings[log.Workout_id] = workout_ratings.get(log.Workout_id, []) + [log.Rating]
    
    # Tính trung bình rating
    avg_meal = {mid: sum(r)/len(r) for mid, r in meal_ratings.items()}
    avg_workout = {wid: sum(r)/len(r) for wid, r in workout_ratings.items()}
    
    return avg_meal, avg_workout