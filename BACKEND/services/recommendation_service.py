import json
from datetime import datetime, timedelta
from typing import List, Dict, Tuple, Any

from db import db
from models import Meal, Workout, Log
from services.user_service import get_user_profile, get_user_feedback


def recommend_meals(user_profile, meal_ratings):
    all_meals = db.session.query(Meal).all()
    scored_meals = []

    disliked = set(ing.strip().lower() for ing in user_profile["disliked_ingredients"])
    allergies = set(ing.strip().lower() for ing in user_profile.get("allergies", []))
    forbidden = disliked | allergies

    for meal in all_meals:
        if not meal.IngredientTags:
            continue

        ingredients = {ing.strip().lower() for ing in meal.IngredientTags.split(',') if ing.strip()}
        if ingredients & forbidden:
            continue

        score = 0.0

        # Phù hợp môn thể thao?
        sport_tags = set()
        if meal.SportTags:
            sport_tags = {s.strip().lower() for s in meal.SportTags.split(',') if s.strip()}
        
        user_sport = user_profile["sport"].lower() if user_profile["sport"] else ""
        if user_sport in sport_tags or "general" in sport_tags:
            score += 0.5

        # Feedback lịch sử
        score += meal_ratings.get(meal.Id, 3.0) - 3.0

        scored_meals.append((meal, score))

    # --- THÊM: Nếu không có món ăn phù hợp → lấy tất cả món ---
    if not scored_meals:
        scored_meals = [(meal, 0.0) for meal in all_meals]

    return sorted(scored_meals, key=lambda x: x[1], reverse=True)[:10]


def recommend_workouts(user_profile, workout_ratings):
    all_workouts = db.session.query(Workout).all()
    scored_workouts = []

    for w in all_workouts:
        # ✅ CHỈ LẤY BÀI TẬP PHÙ HỢP MÔN THỂ THAO
        if w.Sport != user_profile["sport"]:
            continue

        score = workout_ratings.get(w.Id, 3.0) - 3.0
        scored_workouts.append((w, score))

    # --- ✅ NẾU KHÔNG CÓ BÀI TẬP PHÙ HỢP → LẤY TẤT CẢ BÀI TẬP ---
    if not scored_workouts:
        # Lấy tất cả bài tập (không lọc môn)
        scored_workouts = [(w, 0.0) for w in all_workouts]

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
    from utils.scheduler import get_free_time_slots

    user = get_user_profile(user_id)
    meal_ratings, workout_ratings = get_user_feedback(user_id)

    meals = recommend_meals(user, meal_ratings)
    workouts = recommend_workouts(user, workout_ratings)  # ← Đây là danh sách bài tập

    free_slots = get_free_time_slots(user["work_schedule"], target_date)

    schedule = []
    slot_idx = 0

    # --- 1. Gán món ăn ---
    meal_types = ["sáng", "trưa", "tối", "ăn vặt"]
    for meal_type in meal_types:
        if slot_idx >= len(free_slots):
            break
        suitable_meal = None
        for meal, score in meals:
            if hasattr(meal, 'MealType') and meal.MealType == meal_type:
                suitable_meal = meal
                break
        if suitable_meal:
            schedule.append({
                "time": free_slots[slot_idx],
                "type": "meal",
                "data": _serialize_meal(suitable_meal)
            })
            slot_idx += 1

    # --- 2. Gán bài tập (luôn có ít nhất 1 bài) ---
    if workouts and slot_idx < len(free_slots):
        schedule.append({
            "time": free_slots[slot_idx],
            "type": "workout",
            "data": _serialize_workout(workouts[0][0])
        })
    else:
        # Nếu không có bài tập phù hợp → lấy bài tập đầu tiên trong database
        all_workouts = db.session.query(Workout).all()
        if all_workouts:
            schedule.append({
                "time": free_slots[slot_idx] if slot_idx < len(free_slots) else "06:00-07:00",
                "type": "workout",
                "data": _serialize_workout(all_workouts[0])
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
