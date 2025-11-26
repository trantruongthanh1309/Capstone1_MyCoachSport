# api/meals.py - API for meals with filtering
from flask import Blueprint, request, jsonify
from sqlalchemy import text
from db import db

meals_bp = Blueprint('meals', __name__)

@meals_bp.route('/', methods=['GET'])
def get_meals():
    """
    Get meals with optional filtering
    Query params:
    - meal_type: morning, afternoon, evening
    - min_kcal: minimum calories
    - max_kcal: maximum calories
    """
    try:
        meal_type = request.args.get('meal_type')
        min_kcal = request.args.get('min_kcal', type=int)
        max_kcal = request.args.get('max_kcal', type=int)
        
        # Build query
        query = "SELECT * FROM dbo.Meals WHERE 1=1"
        params = {}
        
        if meal_type:
            query += " AND MealType = :meal_type"
            params['meal_type'] = meal_type
        
        if min_kcal is not None:
            query += " AND Kcal >= :min_kcal"
            params['min_kcal'] = min_kcal
        
        if max_kcal is not None:
            query += " AND Kcal <= :max_kcal"
            params['max_kcal'] = max_kcal
        
        query += " ORDER BY NEWID()"  # Random order
        
        result = db.session.execute(text(query), params).fetchall()
        
        meals = []
        for row in result:
            meals.append({
                "Id": row[0],
                "Name": row[1],
                "MealType": row[2],
                "Kcal": row[3],
                "Protein": row[4],
                "Carb": row[5],
                "Fat": row[6]
            })
        
        return jsonify(meals)
        
    except Exception as e:
        print(f"Error fetching meals: {e}")
        return jsonify({"error": str(e)}), 500


@meals_bp.route('/workouts', methods=['GET'])
def get_workouts():
    """
    Get workouts with optional filtering
    Query params:
    - intensity: Low, Medium, High
    """
    try:
        intensity = request.args.get('intensity')
        
        query = "SELECT * FROM dbo.Workouts WHERE 1=1"
        params = {}
        
        if intensity:
            query += " AND Intensity = :intensity"
            params['intensity'] = intensity
        
        query += " ORDER BY NEWID()"  # Random order
        
        result = db.session.execute(text(query), params).fetchall()
        
        workouts = []
        for row in result:
            workouts.append({
                "Id": row[0],
                "Name": row[1],
                "Sport": row[2],
                "MuscleGroups": row[3],
                "Duration_min": row[4],
                "Intensity": row[5],
                "Equipment": row[6]
            })
        
        return jsonify(workouts)
        
    except Exception as e:
        print(f"Error fetching workouts: {e}")
        return jsonify({"error": str(e)}), 500
