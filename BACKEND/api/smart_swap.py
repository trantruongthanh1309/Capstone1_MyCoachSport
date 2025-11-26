# api/smart_swap.py - Smart meal/workout swap with scoring
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

def score_meal_for_swap(meal, user, current_meal_kcal, time_slot):
    """
    Score a meal for swapping based on:
    - Calorie similarity (highest priority)
    - Sport compatibility
    - Meal type appropriateness
    - User allergies/dislikes
    """
    score = 0
    
    # 1. Check allergies/dislikes (CRITICAL - return -1000 if found)
    if meal.get('IngredientTags'):
        ingredients = set(i.strip().lower() for i in meal['IngredientTags'].split(','))
        allergies = set(a.lower() for a in parse_list(user.get('Allergies', '[]')))
        dislikes = set(d.lower() for d in parse_list(user.get('DislikedIngredients', '[]')))
        forbidden = allergies | dislikes
        
        if ingredients & forbidden:
            return -1000
    
    # 2. Calorie similarity (HIGHEST PRIORITY - 50 points max)
    kcal_diff = abs(meal['Kcal'] - current_meal_kcal)
    if kcal_diff <= 10:
        score += 50
    elif kcal_diff <= 20:
        score += 40
    elif kcal_diff <= 30:
        score += 30
    elif kcal_diff <= 50:
        score += 20
    else:
        score += 10
    
    # 3. Sport compatibility (30 points)
    user_sport = (user.get('Sport') or '').lower()
    if meal.get('SportTags') and user_sport:
        sport_tags = set(s.strip().lower() for s in meal['SportTags'].split(','))
        if user_sport in sport_tags:
            score += 30
    
    # 4. Meal type appropriateness (20 points)
    meal_type = (meal.get('MealType') or '').lower()
    if time_slot == 'morning':
        if any(x in meal_type for x in ['morning', 'breakfast', 'sáng']):
            score += 20
        elif any(x in meal_type for x in ['evening', 'dinner', 'tối']):
            score -= 10
    elif time_slot == 'afternoon':
        if any(x in meal_type for x in ['lunch', 'afternoon', 'trưa']):
            score += 20
    elif time_slot == 'evening':
        if any(x in meal_type for x in ['dinner', 'evening', 'tối']):
            score += 20
        elif any(x in meal_type for x in ['morning', 'breakfast', 'sáng']):
            score -= 10
    
    # 5. Goal compatibility (bonus 10 points)
    goal = (user.get('Goal') or '').lower()
    protein = meal.get('Protein', 0)
    kcal = meal.get('Kcal', 0)
    
    if 'giảm cân' in goal:
        if kcal < 500 and protein > 20:
            score += 10
    elif 'tăng cơ' in goal:
        if protein > 25:
            score += 10
    
    return score

def score_workout_for_swap(workout, user):
    """
    Score a workout for swapping based on:
    - Sport compatibility
    - Intensity match with user goal
    """
    score = 50  # Base score
    
    # 1. Sport compatibility (30 points)
    user_sport = (user.get('Sport') or '').lower()
    workout_sport = (workout.get('Sport') or '').lower()
    
    if user_sport and user_sport in workout_sport:
        score += 30
    
    # 2. Goal compatibility (20 points)
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
        time_slot = data.get('time_slot')  # morning, afternoon, evening
        
        if not all([user_id, current_meal_id, time_slot]):
            return jsonify({"error": "Missing required fields"}), 400
        
        # Get user profile
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
        
        # Get current meal info
        current_meal_query = text("""
            SELECT Kcal, MealType FROM dbo.Meals WHERE Id = :meal_id
        """)
        current_meal_result = db.session.execute(current_meal_query, {"meal_id": current_meal_id}).fetchone()
        
        if not current_meal_result:
            return jsonify({"error": "Current meal not found"}), 404
        
        current_kcal = current_meal_result[0]
        current_meal_type = current_meal_result[1]
        
        # Get alternative meals (same meal type, within ±50 kcal range)
        min_kcal = current_kcal - 50
        max_kcal = current_kcal + 50
        
        alternatives_query = text("""
            SELECT Id, Name, Kcal, Protein, Carb, Fat, MealType, SportTags, IngredientTags
            FROM dbo.Meals 
            WHERE MealType = :meal_type 
            AND Kcal >= :min_kcal 
            AND Kcal <= :max_kcal
            AND Id != :current_meal_id
        """)
        
        alternatives_result = db.session.execute(alternatives_query, {
            "meal_type": current_meal_type,
            "min_kcal": min_kcal,
            "max_kcal": max_kcal,
            "current_meal_id": current_meal_id
        }).fetchall()
        
        # Score each alternative
        scored_meals = []
        for row in alternatives_result:
            meal = {
                "Id": row[0],
                "Name": row[1],
                "Kcal": row[2],
                "Protein": row[3],
                "Carb": row[4],
                "Fat": row[5],
                "MealType": row[6],
                "SportTags": row[7],
                "IngredientTags": row[8]
            }
            
            score = score_meal_for_swap(meal, user, current_kcal, time_slot)
            
            if score > 0:  # Only include meals with positive score
                scored_meals.append({
                    "meal": meal,
                    "score": score,
                    "kcal_diff": abs(meal['Kcal'] - current_kcal)
                })
        
        # Sort by score (descending)
        scored_meals.sort(key=lambda x: x['score'], reverse=True)
        
        # Return top 5 suggestions
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
        
        # Get user profile
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
        
        # Get current workout intensity
        current_workout_query = text("""
            SELECT Intensity FROM dbo.Workouts WHERE Id = :workout_id
        """)
        current_workout_result = db.session.execute(current_workout_query, {"workout_id": current_workout_id}).fetchone()
        
        if not current_workout_result:
            return jsonify({"error": "Current workout not found"}), 404
        
        current_intensity = current_workout_result[0]
        
        # Get alternative workouts (same intensity)
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
        
        # Score each alternative
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
        
        # Sort by score (descending)
        scored_workouts.sort(key=lambda x: x['score'], reverse=True)
        
        # Return top 5 suggestions
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
