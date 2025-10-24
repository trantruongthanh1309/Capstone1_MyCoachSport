from db import db
from models import Meal, Workout, UserSchedule
from datetime import datetime
import json

def _serialize_meal(meal_obj):
    return {
        "Id": meal_obj.Id,
        "Name": getattr(meal_obj, 'Name', ''),
        "Kcal": getattr(meal_obj, 'Kcal', None),
        "Protein": getattr(meal_obj, 'Protein', None),
        "Carb": getattr(meal_obj, 'Carb', None),
        "Fat": getattr(meal_obj, 'Fat', None),
        "MealType": getattr(meal_obj, 'MealType', None),
        "SportTags": getattr(meal_obj, 'SportTags', None),
        "IngredientTags": getattr(meal_obj, 'IngredientTags', None)
    }

def _serialize_workout(workout_obj):
    return {
        "Id": workout_obj.Id,
        "Name": getattr(workout_obj, 'Name', ''),
        "Sport": getattr(workout_obj, 'Sport', None),
        "MuscleGroups": getattr(workout_obj, 'MuscleGroups', None),
        "Intensity": getattr(workout_obj, 'Intensity', None),
        "Equipment": getattr(workout_obj, 'Equipment', None),
        "Duration_min": getattr(workout_obj, 'Duration_min', None)
    }

def get_user_feedback(user_id: int):
    from models import Log
    logs = db.session.query(Log).filter(Log.User_id == user_id).all()
    meal_ratings = {}
    workout_ratings = {}
    for log in logs:
        if log.Meal_id and log.Rating:
            meal_ratings[log.Meal_id] = meal_ratings.get(log.Meal_id, []) + [log.Rating]
        if log.Workout_id and log.Rating:
            workout_ratings[log.Workout_id] = workout_ratings.get(log.Workout_id, []) + [log.Rating]
    avg_meal = {mid: sum(r)/len(r) for mid, r in meal_ratings.items()}
    avg_workout = {wid: sum(r)/len(r) for wid, r in workout_ratings.items()}
    return avg_meal, avg_workout

def get_user_profile(user_id: int):
    from models import User
    user = db.session.query(User).filter(User.Id == user_id).first()
    if not user:
        raise ValueError("User not found")
    disliked = json.loads(user.DislikedIngredients) if user.DislikedIngredients else []
    allergies = json.loads(user.Allergies) if user.Allergies else []
    return {
        "id": user.Id,
        "sport": user.Sport,
        "goal": user.Goal,
        "disliked_ingredients": disliked,
        "allergies": allergies
    }

def recommend_meals(user_profile, meal_ratings):
    all_meals = db.session.query(Meal).all()
    scored_meals = []

    disliked = set(ing.strip().lower() for ing in user_profile["disliked_ingredients"])
    allergies = set(ing.strip().lower() for ing in user_profile.get("allergies", []))
    forbidden = disliked | allergies

    for meal in all_meals:
        if not meal.IngredientTags:
            continue

        # 1. Loại nếu có nguyên liệu ghét/dị ứng
        ingredients = {ing.strip().lower() for ing in meal.IngredientTags.split(',') if ing.strip()}
        if ingredients & forbidden:
            continue

        score = 0.0

        # 2. Phù hợp môn thể thao? (ưu tiên cao)
        sport_tags = set()
        if meal.SportTags:
            sport_tags = {s.strip().lower() for s in meal.SportTags.split(',') if s.strip()}
        user_sport = user_profile["sport"].lower() if user_profile["sport"] else ""
        if user_sport in sport_tags:
            score += 2.0  # ← Ưu tiên cao

        # 3. Phù hợp mục tiêu? (tùy chỉnh theo goal)
        goal = user_profile.get("goal", "").lower()
        if goal == "giảm cân" and meal.Carb < 50:
            score += 1.0
        elif goal == "tăng cơ" and meal.Protein > 30:
            score += 1.0

        # 4. Lịch sử feedback
        score += meal_ratings.get(meal.Id, 3.0) - 3.0  # rating 5 → +2, rating 1 → -2

        scored_meals.append((meal, score))

    # Sắp xếp theo điểm giảm dần → lấy top 10
    return sorted(scored_meals, key=lambda x: x[1], reverse=True)[:10]

def recommend_workouts(user_profile, workout_ratings):
    all_workouts = db.session.query(Workout).all()
    scored_workouts = []

    for w in all_workouts:
        if w.Sport != user_profile["sport"]:
            continue  # chỉ lấy bài tập đúng môn

        score = 0.0

        # Phù hợp mục tiêu?
        goal = user_profile.get("goal", "").lower()
        if goal == "tốc độ" and "chạy" in w.Name.lower():
            score += 1.5
        elif goal == "sức bền" and w.Intensity == "cao":
            score += 1.0

        # Lịch sử feedback
        score += workout_ratings.get(w.Id, 3.0) - 3.0

        scored_workouts.append((w, score))

    return sorted(scored_workouts, key=lambda x: x[1], reverse=True)[:10]

def get_busy_periods_for_date(user_id: int, target_date: str):

    dt = datetime.strptime(target_date, "%Y-%m-%d")
    day_map = {0: "mon", 1: "tue", 2: "wed", 3: "thu", 4: "fri", 5: "sat", 6: "sun"}
    weekday_key = day_map[dt.weekday()]

    slots = UserSchedule.query.filter_by(
        User_id=user_id,
        DayOfWeek=weekday_key
    ).all()

    return [slot.Period for slot in slots if slot.Period]


def build_daily_schedule(user_id: int, target_date: str):
    """
    Xây dựng lịch trình ăn uống & tập luyện cho 1 ngày
    - Tránh các buổi bận trong UserSchedule
    - Trả về món ăn cho từng buổi trống
    - Trả về bài tập cho buổi SÁNG và TỐI (nếu trống)
    """
    from models.user_schedule import UserSchedule
    from datetime import datetime

    user = get_user_profile(user_id)
    meal_ratings, workout_ratings = get_user_feedback(user_id)

    meals = recommend_meals(user, meal_ratings)
    workouts = recommend_workouts(user, workout_ratings)

    # 🔥 LẤY LỊCH BẬN TỪ BẢNG UserSchedule
    dt = datetime.strptime(target_date, "%Y-%m-%d")
    day_map = {0: "mon", 1: "tue", 2: "wed", 3: "thu", 4: "fri", 5: "sat", 6: "sun"}
    weekday_key = day_map[dt.weekday()]

    busy_slots = UserSchedule.query.filter_by(
        User_id=user_id,
        DayOfWeek=weekday_key
    ).all()
    busy_periods = {slot.Period for slot in busy_slots if slot.Period}

    # DÙNG TIẾNG ANH CHO TẤT CẢ
    all_periods = ["morning", "afternoon", "evening"]
    free_periods = [p for p in all_periods if p not in busy_periods]

    schedule = []
    period_to_time = {
        "morning": "06:00-09:00",
        "afternoon": "12:00-14:00",
        "evening": "18:00-21:00"
    }

    # Gán món ăn cho từng buổi TRỐNG
    for period in free_periods:
        suitable_meal = None
        for meal, _ in meals:
            if getattr(meal, 'MealType', None) == period:
                suitable_meal = meal
                break
        if suitable_meal:
            schedule.append({
                "time": period_to_time[period],
                "type": "meal",
                "data": _serialize_meal(suitable_meal)
            })

    # 🔥 GÁN BÀI TẬP CHO BUỔI SÁNG VÀ TỐI RIÊNG BIỆT
    morning_workout = None
    evening_workout = None

    for workout, _ in workouts:
        if not morning_workout and "morning" in free_periods:
            morning_workout = workout
        elif not evening_workout and "evening" in free_periods:
            evening_workout = workout
        if morning_workout and evening_workout:
            break

    if morning_workout:
        schedule.append({
            "time": "morning_slot",  # ← FRONTEND DÙNG CÁI NÀY ĐỂ PHÂN BIỆT
            "type": "workout",
            "data": _serialize_workout(morning_workout)
        })

    if evening_workout:
        schedule.append({
            "time": "evening_slot",  # ← FRONTEND DÙNG CÁI NÀY ĐỂ PHÂN BIỆT
            "type": "workout",
            "data": _serialize_workout(evening_workout)
        })

    return {
        "date": target_date,
        "user_id": user_id,
        "schedule": schedule
    }