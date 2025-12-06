from flask import Blueprint, request, jsonify
from flask import Blueprint, request, jsonify
from .admin_middleware import require_admin
from models.workout import Workout
from db import db

workouts_admin_bp = Blueprint('workouts_admin', __name__)

@workouts_admin_bp.route('/api/admin/workouts', methods=['GET'])
def get_workouts():
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        sport = request.args.get('sport', '')
        difficulty = request.args.get('difficulty', '')
        
        query = Workout.query
        if search:
            query = query.filter(Workout.Name.contains(search))
        if sport:
            query = query.filter(Workout.SportTags.contains(sport))
        if difficulty:
            query = query.filter(Workout.Difficulty == difficulty)
            
        # Order by ID desc
        query = query.order_by(Workout.Id.desc())
        
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        workouts = [{
            'id': w.Id,
            'name': w.Name,
            'duration_min': w.Duration_min,
            'kcal': w.CalorieBurn,
            'difficulty': w.Difficulty,
            'sport_tags': w.SportTags,
            'equipment': w.Equipment,
            'tags': w.Tags
        } for w in pagination.items]
        
        return jsonify({
            'success': True,
            'data': workouts,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages
            }
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@workouts_admin_bp.route('/api/admin/workouts', methods=['POST'])
def create_workout():
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        data = request.get_json()
        
        new_workout = Workout(
            Name=data.get('name'),
            Duration_min=data.get('duration_min'),
            CalorieBurn=data.get('kcal'),
            Difficulty=data.get('difficulty'),
            SportTags=data.get('sport_tags', ''),
            Equipment=data.get('equipment', ''),
            Tags=data.get('tags', '')
        )
        
        db.session.add(new_workout)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Workout created', 'id': new_workout.Id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@workouts_admin_bp.route('/api/admin/workouts/<int:workout_id>', methods=['PUT'])
def update_workout(workout_id):
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        workout = Workout.query.get_or_404(workout_id)
        data = request.get_json()
        
        workout.Name = data.get('name', workout.Name)
        workout.Duration_min = data.get('duration_min', workout.Duration_min)
        workout.CalorieBurn = data.get('kcal', workout.CalorieBurn)
        workout.Difficulty = data.get('difficulty', workout.Difficulty)
        workout.SportTags = data.get('sport_tags', workout.SportTags)
        workout.Equipment = data.get('equipment', workout.Equipment)
        workout.Tags = data.get('tags', workout.Tags)
        
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Workout updated'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@workouts_admin_bp.route('/api/admin/workouts/<int:workout_id>', methods=['DELETE'])
def delete_workout(workout_id):
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        workout = Workout.query.get_or_404(workout_id)
        db.session.delete(workout)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Workout deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@workouts_admin_bp.route('/api/admin/workouts/stats', methods=['GET'])
def get_workouts_stats():
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        total = Workout.query.count()
        return jsonify({'success': True, 'total': total}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@workouts_admin_bp.route('/api/admin/workouts/filters/sports', methods=['GET'])
def get_workout_sports_filter():
    auth_error = require_admin()
    if auth_error:
        return auth_error
    try:
        sports = ['football', 'basketball', 'gym', 'running', 'swimming', 'yoga']
        return jsonify(sports), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@workouts_admin_bp.route('/api/admin/workouts/filters/difficulties', methods=['GET'])
def get_workout_difficulties_filter():
    auth_error = require_admin()
    if auth_error:
        return auth_error
    try:
        difficulties = ['easy', 'medium', 'hard']
        return jsonify(difficulties), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500