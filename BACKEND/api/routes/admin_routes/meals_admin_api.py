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
        
        query = Meal.query
        if search:
            query = query.filter(Meal.Name.contains(search))
        
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        meals = [{
            'id': m.Id,
            'name': m.Name,
            'kcal': m.Kcal,
            'protein': m.Protein,
            'carb': m.Carb,
            'fat': m.Fat,
            'meal_type': m.MealType,
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
        total = Meal.query.count()
        return jsonify({'success': True, 'data': {'total': total}}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500