from flask import Blueprint, request, jsonify
from .admin_middleware import require_admin
from models.meal import Meal
from db import db

meals_admin_bp = Blueprint('meals_admin', __name__)

@meals_admin_bp.route('/api/admin/meals', methods=['GET'])
def get_meals():
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        sport = request.args.get('sport', '')
        meal_time = request.args.get('meal_time', '')
        
        query = Meal.query
        if search:
            query = query.filter(Meal.Name.contains(search))
        if sport:
            query = query.filter(Meal.SuitableSports.contains(sport))
        if meal_time:
            query = query.filter(Meal.MealTime.contains(meal_time))
            
        query = query.order_by(Meal.Id.desc())
        
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        meals = [{
            'id': m.Id,
            'name': m.Name,
            'kcal': m.Kcal,
            'protein': m.Protein,
            'carb': m.Carb,
            'fat': m.Fat,
            'serving_size': m.ServingSize,
            'meal_time': m.MealTime,
            'suitable_sports': m.SuitableSports,
            'ingredients': m.Ingredients,
            'recipe': m.Recipe,
            'cooking_time_min': m.CookingTimeMin,
            'difficulty': m.Difficulty,
            'video_url': getattr(m, 'VideoUrl', None),
            'image': m.Image
        } for m in pagination.items]
        
        return jsonify({
            'success': True,
            'data': meals,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages
            }
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@meals_admin_bp.route('/api/admin/meals', methods=['POST'])
def create_meal():
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        data = request.get_json()
        
        new_meal = Meal(
            Name=data.get('name'),
            Kcal=data.get('kcal', 0),
            Protein=data.get('protein', 0),
            Carb=data.get('carb', 0),
            Fat=data.get('fat', 0),
            ServingSize=data.get('serving_size'),
            MealTime=data.get('meal_time'), # 'Breakfast', 'Lunch', 'Dinner'
            SuitableSports=data.get('suitable_sports', ''),
            Ingredients=data.get('ingredients', ''),
            Recipe=data.get('recipe', ''),
            CookingTimeMin=data.get('cooking_time_min', 0),
            Difficulty=data.get('difficulty', 'Medium'),
            VideoUrl=data.get('video_url'),
            Image=data.get('image', '')
        )
        
        db.session.add(new_meal)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Meal created', 'id': new_meal.Id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@meals_admin_bp.route('/api/admin/meals/<int:meal_id>', methods=['PUT'])
def update_meal(meal_id):
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        meal = Meal.query.get_or_404(meal_id)
        data = request.get_json()
        
        meal.Name = data.get('name', meal.Name)
        meal.Kcal = data.get('kcal', meal.Kcal)
        meal.Protein = data.get('protein', meal.Protein)
        meal.Carb = data.get('carb', meal.Carb)
        meal.Fat = data.get('fat', meal.Fat)
        meal.ServingSize = data.get('serving_size', meal.ServingSize)
        meal.MealTime = data.get('meal_time', meal.MealTime)
        meal.SuitableSports = data.get('suitable_sports', meal.SuitableSports)
        meal.Ingredients = data.get('ingredients', meal.Ingredients)
        meal.Recipe = data.get('recipe', meal.Recipe)
        meal.CookingTimeMin = data.get('cooking_time_min', meal.CookingTimeMin)
        meal.Difficulty = data.get('difficulty', meal.Difficulty)
        if 'video_url' in data:
            meal.VideoUrl = data.get('video_url')
        if 'image' in data:
            meal.Image = data.get('image')
        
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Meal updated'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@meals_admin_bp.route('/api/admin/meals/<int:meal_id>', methods=['DELETE'])
def delete_meal(meal_id):
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        meal = Meal.query.get_or_404(meal_id)
        db.session.delete(meal)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Meal deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@meals_admin_bp.route('/api/admin/meals/stats', methods=['GET'])
def get_meals_stats():
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        from sqlalchemy import func, or_
        
        total_meals = Meal.query.count()
        
        # Helper function to build filter
        def build_filter(keywords):
            conditions = []
            for kw in keywords:
                conditions.append(Meal.MealTime.ilike(f'%{kw}%'))
            return or_(*conditions)

        # 1. Breakfast Keywords
        breakfast_kw = ['Breakfast', 'Bữa Sáng', 'morning', 'sáng', 'Pre-Workout']
        breakfast = Meal.query.filter(build_filter(breakfast_kw)).count()
        
        # 2. Lunch Keywords
        lunch_kw = ['Lunch', 'Bữa Trưa', 'afternoon', 'trưa']
        lunch = Meal.query.filter(build_filter(lunch_kw)).count()
        
        # 3. Dinner Keywords
        dinner_kw = ['Dinner', 'Bữa Tối', 'evening', 'tối', 'Post-Workout']
        dinner = Meal.query.filter(build_filter(dinner_kw)).count()
        
        avg_kcal = db.session.query(func.avg(Meal.Kcal)).scalar() or 0
        avg_protein = db.session.query(func.avg(Meal.Protein)).scalar() or 0
        
        return jsonify({
            'success': True, 
            'data': {
                'total_meals': total_meals,
                'breakfast': breakfast,
                'lunch': lunch,
                'dinner': dinner,
                'avg_kcal': round(avg_kcal, 1),
                'avg_protein': round(avg_protein, 1)
            }
        }), 200
    except Exception as e:
        print(f"Error stats: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@meals_admin_bp.route('/api/admin/meals/filters/sports', methods=['GET'])
def get_meal_sports_filter():
    auth_error = require_admin()
    if auth_error:
        return auth_error
    try:
        sports = ['Bóng đá', 'Bóng rổ', 'Gym', 'Chạy bộ', 'Bơi lội', 'Yoga', 'Boxing', 'Đạp xe', 'Thể hình', 'Cardio']
        return jsonify({'success': True, 'data': sports}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@meals_admin_bp.route('/api/admin/meals/filters/meal-types', methods=['GET'])
def get_meal_types_filter():
    # Helper for frontend filters
    auth_error = require_admin()
    if auth_error:
        return auth_error
    try:
        types = ['Bữa Sáng', 'Bữa Trưa', 'Bữa Tối', 'Bữa Phụ', 'Trước Tập', 'Sau Tập']
        return jsonify({'success': True, 'data': types}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500