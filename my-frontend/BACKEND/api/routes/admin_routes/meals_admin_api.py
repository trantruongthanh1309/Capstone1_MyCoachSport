from flask import Blueprint, request, jsonify
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
        meal_type = request.args.get('meal_type', '')
        
        query = Meal.query
        if search:
            query = query.filter(Meal.Name.contains(search))
        if sport:
            query = query.filter(Meal.SportTags.contains(sport))
        if meal_type:
            query = query.filter(Meal.MealType == meal_type)
            
        # Order by ID desc
        query = query.order_by(Meal.Id.desc())
        
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        meals = [{
            'id': m.Id,
            'name': m.Name,
            'kcal': m.Kcal,
            'protein': m.Protein,
            'carb': m.Carb,
            'fat': m.Fat,
            'meal_type': m.MealType,
            'sport_tags': m.SportTags,
            'ingredient_tags': m.IngredientTags,
            'tags': m.Tags
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
            MealType=data.get('meal_type'),
            SportTags=data.get('sport_tags', ''),
            IngredientTags=data.get('ingredient_tags', ''),
            Tags=data.get('tags', '')
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
        meal.MealType = data.get('meal_type', meal.MealType)
        meal.SportTags = data.get('sport_tags', meal.SportTags)
        meal.IngredientTags = data.get('ingredient_tags', meal.IngredientTags)
        meal.Tags = data.get('tags', meal.Tags)
        
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
        from sqlalchemy import func
        
        total_meals = Meal.query.count()
        breakfast = Meal.query.filter_by(MealType='breakfast').count()
        lunch = Meal.query.filter_by(MealType='lunch').count()
        dinner = Meal.query.filter_by(MealType='dinner').count()
        
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
        return jsonify({'success': False, 'error': str(e)}), 500

@meals_admin_bp.route('/api/admin/meals/filters/sports', methods=['GET'])
def get_meal_sports_filter():
    auth_error = require_admin()
    if auth_error:
        return auth_error
    try:
        # Mock sports list or extract from tags if possible. 
        # Since SportTags is comma separated string, it's hard to distinct efficiently in SQL.
        # We'll return a static list or common sports for now.
        sports = ['football', 'basketball', 'gym', 'running', 'swimming', 'yoga']
        return jsonify({'success': True, 'data': sports}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@meals_admin_bp.route('/api/admin/meals/filters/meal-types', methods=['GET'])
def get_meal_types_filter():
    auth_error = require_admin()
    if auth_error:
        return auth_error
    try:
        types = ['breakfast', 'lunch', 'dinner', 'snack']
        return jsonify({'success': True, 'data': types}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500