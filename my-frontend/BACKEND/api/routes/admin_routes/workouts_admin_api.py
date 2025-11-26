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
        
        query = Workout.query
        if search:
            query = query.filter(Workout.Name.contains(search))
        
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        workouts = [{
            'id': w.Id,
            'name': w.Name,
            'duration_min': w.Duration_min,
            'sport': w.Sport,
            'intensity': w.Intensity,
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
            Sport=data.get('sport'),
            Intensity=data.get('intensity'),
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
        workout.Sport = data.get('sport', workout.Sport)
        workout.Intensity = data.get('intensity', workout.Intensity)
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
        return jsonify({'success': True, 'data': {'total': total}}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500