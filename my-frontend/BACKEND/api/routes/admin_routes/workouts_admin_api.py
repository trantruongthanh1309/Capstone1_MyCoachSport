from flask import Blueprint, request, jsonify
from .admin_middleware import require_admin
from models.workout import Workout
from db import db
from datetime import datetime

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
        is_active = request.args.get('is_active', None)
        
        query = Workout.query
        if search:
            query = query.filter(Workout.Name.contains(search))
        if sport:
            query = query.filter(
                db.or_(
                    Workout.Sport.contains(sport),
                    Workout.AITags.contains(sport)
                )
            )
        if difficulty:
            query = query.filter(Workout.Difficulty == difficulty)
        if is_active is not None:
            query = query.filter(Workout.IsActive == (is_active.lower() == 'true'))
            
        query = query.order_by(Workout.Id)
        
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        workouts = [w.to_admin_dict() for w in pagination.items]
        
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

@workouts_admin_bp.route('/api/admin/workouts/<int:workout_id>', methods=['GET'])
def get_workout(workout_id):
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        workout = Workout.query.get_or_404(workout_id)
        return jsonify({'success': True, 'data': workout.to_admin_dict()}), 200
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
            Sport=data.get('sport'),
            Duration_min=data.get('duration_min'),
            MuscleGroups=data.get('muscle_groups'),
            Intensity=data.get('intensity'),
            Equipment=data.get('equipment'),
            Difficulty=data.get('difficulty'),
            GoalFocus=data.get('goal_focus'),
            CalorieBurn=data.get('calorie_burn'),
            VideoUrl=data.get('video_url'),
            Sets=data.get('sets'),
            Reps=data.get('reps'),
            RestTime=data.get('rest_time'),
            Description=data.get('description'),
            Instructions=data.get('instructions'),
            SafetyNotes=data.get('safety_notes'),
            AITags=data.get('ai_tags'),
            Goals=data.get('goals'),
            ProgressionNotes=data.get('progression_notes'),
            RegressionNotes=data.get('regression_notes'),
            PrimaryMuscles=data.get('primary_muscles'),
            SecondaryMuscles=data.get('secondary_muscles'),
            Prerequisites=data.get('prerequisites'),
            IsActive=data.get('is_active', True),
            CreatedAt=datetime.utcnow(),
            UpdatedAt=datetime.utcnow()
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
        
        # Update all fields
        if 'name' in data: workout.Name = data['name']
        if 'sport' in data: workout.Sport = data['sport']
        if 'duration_min' in data: workout.Duration_min = data['duration_min']
        if 'muscle_groups' in data: workout.MuscleGroups = data['muscle_groups']
        if 'intensity' in data: workout.Intensity = data['intensity']
        if 'equipment' in data: workout.Equipment = data['equipment']
        if 'difficulty' in data: workout.Difficulty = data['difficulty']
        if 'goal_focus' in data: workout.GoalFocus = data['goal_focus']
        if 'calorie_burn' in data: workout.CalorieBurn = data['calorie_burn']
        if 'video_url' in data: workout.VideoUrl = data['video_url']
        if 'sets' in data: workout.Sets = data['sets']
        if 'reps' in data: workout.Reps = data['reps']
        if 'rest_time' in data: workout.RestTime = data['rest_time']
        if 'description' in data: workout.Description = data['description']
        if 'instructions' in data: workout.Instructions = data['instructions']
        if 'safety_notes' in data: workout.SafetyNotes = data['safety_notes']
        if 'ai_tags' in data: workout.AITags = data['ai_tags']
        if 'goals' in data: workout.Goals = data['goals']
        if 'progression_notes' in data: workout.ProgressionNotes = data['progression_notes']
        if 'regression_notes' in data: workout.RegressionNotes = data['regression_notes']
        if 'primary_muscles' in data: workout.PrimaryMuscles = data['primary_muscles']
        if 'secondary_muscles' in data: workout.SecondaryMuscles = data['secondary_muscles']
        if 'prerequisites' in data: workout.Prerequisites = data['prerequisites']
        if 'is_active' in data: workout.IsActive = data['is_active']
        
        workout.UpdatedAt = datetime.utcnow()
        
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
        # Soft delete instead of hard delete
        workout.IsActive = False
        workout.UpdatedAt = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Workout deactivated'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@workouts_admin_bp.route('/api/admin/workouts/<int:workout_id>/hard-delete', methods=['DELETE'])
def hard_delete_workout(workout_id):
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        workout = Workout.query.get_or_404(workout_id)
        db.session.delete(workout)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Workout permanently deleted'}), 200
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
        active = Workout.query.filter_by(IsActive=True).count()
        inactive = total - active
        
        # Stats by difficulty
        beginner = Workout.query.filter_by(Difficulty='Beginner', IsActive=True).count()
        intermediate = Workout.query.filter_by(Difficulty='Intermediate', IsActive=True).count()
        advanced = Workout.query.filter_by(Difficulty='Advanced', IsActive=True).count()
        
        # Stats by completeness
        with_description = Workout.query.filter(Workout.Description.isnot(None), Workout.IsActive==True).count()
        with_instructions = Workout.query.filter(Workout.Instructions.isnot(None), Workout.IsActive==True).count()
        with_progression = Workout.query.filter(Workout.ProgressionNotes.isnot(None), Workout.IsActive==True).count()
        
        return jsonify({
            'success': True,
            'total': total,
            'active': active,
            'inactive': inactive,
            'by_difficulty': {
                'beginner': beginner,
                'intermediate': intermediate,
                'advanced': advanced
            },
            'data_quality': {
                'with_description': with_description,
                'with_instructions': with_instructions,
                'with_progression': with_progression,
                'completeness_rate': round((with_description / active * 100) if active > 0 else 0, 1)
            }
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@workouts_admin_bp.route('/api/admin/workouts/filters/sports', methods=['GET'])
def get_workout_sports_filter():
    auth_error = require_admin()
    if auth_error:
        return auth_error
    try:
        # Get unique sports from database
        sports_query = db.session.query(Workout.Sport).distinct().filter(Workout.Sport.isnot(None)).all()
        sports = [s[0] for s in sports_query if s[0]]
        return jsonify(sports), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@workouts_admin_bp.route('/api/admin/workouts/filters/difficulties', methods=['GET'])
def get_workout_difficulties_filter():
    auth_error = require_admin()
    if auth_error:
        return auth_error
    try:
        difficulties = ['Beginner', 'Intermediate', 'Advanced']
        return jsonify(difficulties), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
