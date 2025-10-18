import json
from datetime import datetime, timedelta
from typing import List, Dict, Tuple, Any

from db import db
from models import Meal, Workout, Log
from services.user_service import get_user_profile, get_user_feedback


def recommend_meals(user_profile: Dict[str, Any], meal_ratings: Dict[int, float]) -> List[Tuple[Meal, float]]:
    """Gợi ý món ăn dựa trên môn thể thao, nguyên liệu ghét, và feedback"""
    all_meals = db.session.query(Meal).all()
    scored_meals = []

    disliked = set(ing.strip().lower() for ing in user_profile["disliked_ingredients"])
    allergies = set(ing.strip().lower() for ing in user_profile.get("allergies", []))
    forbidden = disliked | allergies

    for meal in all_meals:
        if not meal.IngredientTags:
            continue

        # 1. Loại nếu có nguyên liệu ghét hoặc dị ứng
        ingredients = {ing.strip().lower() for ing in meal.IngredientTags.split(',') if ing.strip()}
        if ingredients & forbidden:
            continue

        # 2. Tính điểm
        score = 0.0

        # 3. Phù hợp môn thể thao?
        sport_tags = set()
        if meal.SportTags:
            sport_tags = {s.strip().lower() for s in meal.SportTags.split(',') if s.strip()}
        
        user_sport = user_profile["sport"].lower() if user_profile["sport"] else ""
        if user_sport in sport_tags or "general" in sport_tags:
            score += 1.0

        # 4. Phù hợp mục tiêu? (tạm thời: không xử lý sâu)
        # → Có thể mở rộng sau

        # 5. Feedback lịch sử (ưu tiên phản hồi gần đây)
        score += meal_ratings.get(meal.Id, 3.0) - 3.0

        # 6. Tránh lặp món gần đây (7 ngày)
        recent_meals = get_recent_meal_ids(user_profile["id"], days=7)
        if meal.Id in recent_meals:
            score -= 0.5

        scored_meals.append((meal, score))

    # Sắp xếp và trả về top 10
    return sorted(scored_meals, key=lambda x: x[1], reverse=True)[:10]


def recommend_workouts(user_profile: Dict[str, Any], workout_ratings: Dict[int, float]) -> List[Tuple[Workout, float]]:
    """Gợi ý bài tập dựa trên môn thể thao, nhóm cơ, thiết bị, và lịch sử"""
    all_workouts = db.session.query(Workout).all()
    scored_workouts = []

    # Lấy nhóm cơ đã tập trong 48h
    recent_muscles = get_recent_muscle_groups(user_profile["id"], hours=48)

    for w in all_workouts:
        # 1. Phù hợp môn thể thao?
        if w.Sport and w.Sport.lower() != user_profile["sport"].lower():
            continue

        # 2. Tránh nhóm cơ đã tập gần đây
        if w.MuscleGroups:
            workout_muscles = {m.strip().lower() for m in w.MuscleGroups.split(',')}
            if workout_muscles & recent_muscles:
                continue  # Bỏ qua nếu trùng nhóm cơ

        # 3. Tính điểm
        score = 0.0

        # 4. Phù hợp thiết bị? (tạm thời: giả sử user có bodyweight)
        # → Sau này có thể thêm user.equipment

        # 5. Feedback
        score += workout_ratings.get(w.Id, 3.0) - 3.0

        scored_workouts.append((w, score))

    return sorted(scored_workouts, key=lambda x: x[1], reverse=True)[:10]


def get_recent_meal_ids(user_id: int, days: int = 7) -> set:
    """Lấy ID món ăn đã dùng trong N ngày qua"""
    since = datetime.utcnow() - timedelta(days=days)
    logs = db.session.query(Log).filter(
        Log.User_id == user_id,
        Log.Meal_id.isnot(None),
        Log.CreatedAt >= since
    ).all()
    return {log.Meal_id for log in logs}


def get_recent_muscle_groups(user_id: int, hours: int = 48) -> set:
    """Lấy nhóm cơ đã tập trong N giờ qua"""
    since = datetime.utcnow() - timedelta(hours=hours)
    logs = db.session.query(Log).filter(
        Log.User_id == user_id,
        Log.Workout_id.isnot(None),
        Log.CreatedAt >= since
    ).all()

    muscle_set = set()
    for log in logs:
        workout = db.session.query(Workout).filter(Workout.Id == log.Workout_id).first()
        if workout and workout.MuscleGroups:
            muscles = {m.strip().lower() for m in workout.MuscleGroups.split(',') if m.strip()}
            muscle_set.update(muscles)
    return muscle_set


def build_daily_schedule(user_id: int, target_date: str):
    
    """Xây dựng lịch trình ăn uống & tập luyện cho 1 ngày"""
    from utils.scheduler import get_free_time_slots
    
    user = get_user_profile(user_id)
    meal_ratings, workout_ratings = get_user_feedback(user_id)

    # Lấy danh sách món & bài tập đã được sắp xếp theo điểm
    meals = recommend_meals(user, meal_ratings)          # List[(Meal, score)]
    workouts = recommend_workouts(user, workout_ratings) # List[(Workout, score)]

    # Lấy các khung giờ rảnh trong ngày
    free_slots = get_free_time_slots(user["work_schedule"], target_date)
    if not free_slots:
        free_slots = ["06:00-07:00", "12:00-13:00", "19:00-20:00"]  # fallback

    schedule = []
    used_meals = set()
    used_workouts = set()

    # --- 1. Gán món ăn theo thứ tự bữa: sáng → trưa → tối → snack ---
    meal_type_order = ["breakfast", "lunch", "dinner", "snack"]
    slot_idx = 0

    for meal_type in meal_type_order:
        if slot_idx >= len(free_slots):
            break

        # Tìm món ăn phù hợp loại bữa và chưa dùng
        selected_meal = None
        for meal_obj, _ in meals:
            if meal_obj.Id in used_meals:
                continue
            if getattr(meal_obj, 'MealType', None) == meal_type:
                selected_meal = meal_obj
                used_meals.add(meal_obj.Id)
                break

        if selected_meal:
            schedule.append({
                "time": free_slots[slot_idx],
                "type": "meal",
                "data": _serialize_meal(selected_meal)
            })
            slot_idx += 1

    # --- 2. Gán 1 bài tập (nếu còn slot) ---
    if slot_idx < len(free_slots) and workouts:
        selected_workout = None
        for workout_obj, _ in workouts:
            if workout_obj.Id not in used_workouts:
                selected_workout = workout_obj
                used_workouts.add(workout_obj.Id)
                break

        if selected_workout:
            schedule.append({
                "time": free_slots[slot_idx],
                "type": "workout",
                "data": _serialize_workout(selected_workout)
            })

    return {
        "date": target_date,
        "user_id": user_id,
        "schedule": schedule
    }


def _serialize_meal(meal_obj):
    """Chuyển đối tượng Meal thành dict an toàn"""
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
    """Chuyển đối tượng Workout thành dict an toàn"""
    return {
        "Id": workout_obj.Id,
        "Name": getattr(workout_obj, 'Name', ''),
        "Sport": getattr(workout_obj, 'Sport', None),
        "MuscleGroups": getattr(workout_obj, 'MuscleGroups', None),
        "Intensity": getattr(workout_obj, 'Intensity', None),
        "Equipment": getattr(workout_obj, 'Equipment', None),
        "Duration_min": getattr(workout_obj, 'Duration_min', None)
    }
