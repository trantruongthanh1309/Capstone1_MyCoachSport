from flask import Blueprint, request, jsonify
from sqlalchemy import text
from db import db
import json

smart_swap_bp = Blueprint('smart_swap', __name__)

def parse_list(json_str):
    """Parse JSON string to list"""
    try:
        if not json_str:
            return []
        return json.loads(json_str)
    except:
        return []

def score_meal_for_swap(meal, user, current_meal_kcal, current_meal_protein, time_slot):
    """
    Score a meal for swapping based on:
    - Calorie similarity (highest priority)
    - Protein similarity (important for sports)
    - Sport compatibility
    - Meal type appropriateness
    - User allergies/dislikes
    """
    score = 0
    
    # Parse ingredients từ IngredientTags hoặc Ingredients
    ingredient_str = meal.get('IngredientTags') or meal.get('Ingredients') or ""
    if ingredient_str:
        # Nếu là JSON string, parse nó
        if ingredient_str.startswith('[') or ingredient_str.startswith('{'):
            ingredients = set(i.strip().lower() for i in parse_list(ingredient_str))
        else:
            # Nếu là comma-separated string
            ingredients = set(i.strip().lower() for i in ingredient_str.split(',') if i.strip())
        
        allergies = set(a.lower() for a in parse_list(user.get('Allergies', '[]')))
        dislikes = set(d.lower() for d in parse_list(user.get('DislikedIngredients', '[]')))
        forbidden = allergies | dislikes
        
        if ingredients & forbidden:
            return -1000
    
    kcal_diff = abs(meal['Kcal'] - current_meal_kcal)
    if kcal_diff <= 50:
        score += 40
    elif kcal_diff <= 100:
        score += 20
    else:
        score += 5
        
    protein_diff = abs(meal.get('Protein', 0) - current_meal_protein)
    if protein_diff <= 5:
        score += 30
    elif protein_diff <= 10:
        score += 15
    
    user_sport = (user.get('Sport') or '').lower()
    sport_tags_str = meal.get('SportTags') or meal.get('SuitableSports') or ""
    if sport_tags_str and user_sport:
        sport_tags = set(s.strip().lower() for s in sport_tags_str.split(','))
        if user_sport in sport_tags:
            score += 50
    
    meal_type = (meal.get('MealType') or '').lower()
    meal_timing = (meal.get('MealTiming') or '').lower() # Cột mới thêm
    
    keywords = []
    if time_slot == 'morning':
        keywords = ['breakfast', 'sáng', 'morning', 'preworkout']
    elif time_slot == 'afternoon':
        keywords = ['lunch', 'trưa', 'afternoon']
    elif time_slot == 'evening':
        keywords = ['dinner', 'tối', 'evening', 'postworkout']
    elif time_slot == 'snack':
        keywords = ['snack', 'ăn vặt']
        
    is_match = False
    for kw in keywords:
        if kw in meal_type or kw in meal_timing:
            is_match = True
            break
            
    if is_match:
        score += 30
    else:
        if time_slot == 'morning' and ('dinner' in meal_type or 'tối' in meal_type):
            score -= 50
        elif time_slot == 'evening' and ('breakfast' in meal_type or 'sáng' in meal_type):
            score -= 50
    
    goal = (user.get('Goal') or '').lower()
    protein = meal.get('Protein', 0)
    kcal = meal.get('Kcal', 0)
    
    if 'giảm cân' in goal:
        if kcal < 400 and protein > 20:
            score += 20
    elif 'tăng cơ' in goal:
        if protein > 30:
            score += 20
    
    return score

def score_workout_for_swap(workout, user):
    """
    Score a workout for swapping based on:
    - Sport compatibility
    - Intensity match with user goal
    """
    score = 50
    
    user_sport = (user.get('Sport') or '').lower()
    workout_sport = (workout.get('Sport') or '').lower()
    
    if user_sport and user_sport in workout_sport:
        score += 30
    
    goal = (user.get('Goal') or '').lower()
    intensity = (workout.get('Intensity') or '').lower()
    workout_name = (workout.get('Name') or '').lower()
    
    if 'tăng cơ' in goal:
        if 'gym' in workout_name or 'tạ' in workout_name or intensity == 'cao':
            score += 20
    elif 'giảm cân' in goal:
        if 'cardio' in workout_name or 'hiit' in workout_name or 'chạy' in workout_name:
            score += 20
    
    return score

@smart_swap_bp.route('/suggest-meal', methods=['POST'])
def suggest_meal_swap():
    """
    Suggest smart meal alternatives based on user profile and current meal
    """
    try:
        data = request.json
        user_id = data.get('user_id')
        current_meal_id = data.get('current_meal_id')
        time_slot = data.get('time_slot')
        
        if not all([user_id, current_meal_id, time_slot]):
            return jsonify({"error": "Missing required fields"}), 400
        
        user_query = text("""
            SELECT Sport, Goal, Allergies, DislikedIngredients 
            FROM dbo.Users WHERE Id = :user_id
        """)
        user_result = db.session.execute(user_query, {"user_id": user_id}).fetchone()
        
        if not user_result:
            return jsonify({"error": "User not found"}), 404
        
        user = {
            "Sport": user_result[0],
            "Goal": user_result[1],
            "Allergies": user_result[2],
            "DislikedIngredients": user_result[3]
        }
        
        current_meal_query = text("""
            SELECT Kcal, Protein, MealTime FROM dbo.Meals WHERE Id = :meal_id
        """)
        current_meal_result = db.session.execute(current_meal_query, {"meal_id": current_meal_id}).fetchone()
        
        if not current_meal_result:
            return jsonify({"error": "Current meal not found"}), 404
        
        current_kcal = current_meal_result[0]
        current_protein = current_meal_result[1] or 0
        
        min_kcal = current_kcal - 100
        max_kcal = current_kcal + 100
        
        alternatives_query = text("""
            SELECT Id, Name, Kcal, Protein, Carb, Fat, MealTime, SuitableSports, Ingredients
            FROM dbo.Meals 
            WHERE Kcal >= :min_kcal 
            AND Kcal <= :max_kcal
            AND Id != :current_meal_id
        """)
        
        alternatives_result = db.session.execute(alternatives_query, {
            "min_kcal": min_kcal,
            "max_kcal": max_kcal,
            "current_meal_id": current_meal_id
        }).fetchall()
        
        scored_meals = []
        for row in alternatives_result:
            meal = {
                "Id": row[0],
                "Name": row[1],
                "Kcal": row[2],
                "Protein": row[3],
                "Carb": row[4],
                "Fat": row[5],
                "MealType": row[6],  # MealTime từ DB
                "SportTags": row[7],  # SuitableSports từ DB
                "IngredientTags": row[8] if row[8] else "",  # Ingredients từ DB
                "MealTiming": row[6]  # Dùng MealTime cho MealTiming
            }
            
            score = score_meal_for_swap(meal, user, current_kcal, current_protein, time_slot)
            
            if score > 0:
                scored_meals.append({
                    "meal": meal,
                    "score": score,
                    "kcal_diff": abs(meal['Kcal'] - current_kcal)
                })
        
        scored_meals.sort(key=lambda x: x['score'], reverse=True)
        
        top_suggestions = scored_meals[:5]
        
        return jsonify({
            "suggestions": [
                {
                    "Id": s['meal']['Id'],
                    "Name": s['meal']['Name'],
                    "Kcal": s['meal']['Kcal'],
                    "Protein": s['meal']['Protein'],
                    "Carb": s['meal']['Carb'],
                    "Fat": s['meal']['Fat'],
                    "score": s['score'],
                    "kcal_diff": s['kcal_diff']
                }
                for s in top_suggestions
            ],
            "current_kcal": current_kcal
        })
        
    except Exception as e:
        print(f"Error suggesting meal swap: {e}")
        return jsonify({"error": str(e)}), 500

@smart_swap_bp.route('/suggest-workout', methods=['POST'])
def suggest_workout_swap():
    """
    Suggest smart workout alternatives based on user profile and current workout
    """
    try:
        data = request.json
        user_id = data.get('user_id')
        current_workout_id = data.get('current_workout_id')
        
        if not all([user_id, current_workout_id]):
            return jsonify({"error": "Missing required fields"}), 400
        
        user_query = text("""
            SELECT Sport, Goal FROM dbo.Users WHERE Id = :user_id
        """)
        user_result = db.session.execute(user_query, {"user_id": user_id}).fetchone()
        
        if not user_result:
            return jsonify({"error": "User not found"}), 404
        
        user = {
            "Sport": user_result[0],
            "Goal": user_result[1]
        }
        
        current_workout_query = text("""
            SELECT Intensity FROM dbo.Workouts WHERE Id = :workout_id
        """)
        current_workout_result = db.session.execute(current_workout_query, {"workout_id": current_workout_id}).fetchone()
        
        if not current_workout_result:
            return jsonify({"error": "Current workout not found"}), 404
        
        current_intensity = current_workout_result[0]
        
        alternatives_query = text("""
            SELECT Id, Name, Sport, Intensity, Duration_min, MuscleGroups, Equipment
            FROM dbo.Workouts 
            WHERE Intensity = :intensity
            AND Id != :current_workout_id
        """)
        
        alternatives_result = db.session.execute(alternatives_query, {
            "intensity": current_intensity,
            "current_workout_id": current_workout_id
        }).fetchall()
        
        scored_workouts = []
        for row in alternatives_result:
            workout = {
                "Id": row[0],
                "Name": row[1],
                "Sport": row[2],
                "Intensity": row[3],
                "Duration_min": row[4],
                "MuscleGroups": row[5],
                "Equipment": row[6]
            }
            
            score = score_workout_for_swap(workout, user)
            scored_workouts.append({
                "workout": workout,
                "score": score
            })
        
        scored_workouts.sort(key=lambda x: x['score'], reverse=True)
        
        top_suggestions = scored_workouts[:5]
        
        return jsonify({
            "suggestions": [
                {
                    "Id": s['workout']['Id'],
                    "Name": s['workout']['Name'],
                    "Sport": s['workout']['Sport'],
                    "Intensity": s['workout']['Intensity'],
                    "Duration_min": s['workout']['Duration_min'],
                    "score": s['score']
                }
                for s in top_suggestions
            ]
        })
        
    except Exception as e:
        print(f"Error suggesting workout swap: {e}")
        return jsonify({"error": str(e)}), 500
