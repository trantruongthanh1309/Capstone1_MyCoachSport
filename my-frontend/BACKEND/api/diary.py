from flask import Blueprint, request, jsonify, session
from db import db
from models import UserPlan, Log, Meal, Workout
from sqlalchemy import text
from datetime import datetime, timedelta

diary_bp = Blueprint('diary', __name__)

@diary_bp.route('/history', methods=['GET'])
def get_history():
    """Lấy lịch sử hoạt động trong khoảng thời gian"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Chưa đăng nhập'}), 401
        
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    if not start_date or not end_date:
        end = datetime.now().date()
        start = end - timedelta(days=6)
        start_date = start.strftime('%Y-%m-%d')
        end_date = end.strftime('%Y-%m-%d')
        
    try:
        query = text("""
            SELECT 
                up.Id, up.Date, up.Slot, up.Type, up.IsCompleted,
                m.Id as MealId, m.Name as MealName, m.Kcal, m.Image as MealImage,
                w.Id as WorkoutId, w.Name as WorkoutName, w.Duration_min, w.Sport
            FROM UserPlans up
            LEFT JOIN Meals m ON up.MealId = m.Id
            LEFT JOIN Workouts w ON up.WorkoutId = w.Id
            WHERE up.UserId = :user_id 
            AND up.Date >= :start_date 
            AND up.Date <= :end_date
            ORDER BY up.Date DESC, 
                CASE 
                    WHEN up.Slot = 'morning' THEN 1
                    WHEN up.Slot = 'afternoon' THEN 2
                    WHEN up.Slot = 'evening' THEN 3
                    ELSE 4
                END
        """)
        
        result = db.session.execute(query, {
            'user_id': user_id,
            'start_date': start_date,
            'end_date': end_date
        }).fetchall()
        
        history = {}
        for row in result:
            date_str = row.Date.strftime('%Y-%m-%d')
            if date_str not in history:
                history[date_str] = []
                
            item = {
                'id': row.Id,
                'slot': row.Slot,
                'type': row.Type,
                'is_completed': bool(row.IsCompleted),
                'details': {}
            }
            
            if row.Type == 'meal':
                item['details'] = {
                    'id': row.MealId,
                    'name': row.MealName,
                    'kcal': row.Kcal,
                    'image': row.MealImage
                }
            elif row.Type == 'workout':
                item['details'] = {
                    'id': row.WorkoutId,
                    'name': row.WorkoutName,
                    'duration': row.Duration_min,
                    'sport': row.Sport
                }
                
            history[date_str].append(item)
            
        return jsonify({
            'start_date': start_date,
            'end_date': end_date,
            'history': history
        })
        
    except Exception as e:
        print(f"Error fetching history: {str(e)}")
        return jsonify({'error': 'Lỗi hệ thống'}), 500

@diary_bp.route('/preferences', methods=['GET'])
def get_preferences():
    """Lấy danh sách Like/Dislike"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Chưa đăng nhập'}), 401
        
    try:
        logs = Log.query.filter_by(User_id=user_id).all()
        
        preferences = {
            'liked_meals': [],
            'disliked_meals': [],
            'liked_workouts': [],
            'disliked_workouts': []
        }
        
        meal_cache = {}
        workout_cache = {}
        
        for log in logs:
            if not log.FeedbackType: continue
            
            if log.Meal_id:
                if log.Meal_id not in meal_cache:
                    m = Meal.query.get(log.Meal_id)
                    if m: meal_cache[log.Meal_id] = {'id': m.Id, 'name': m.Name, 'image': getattr(m, 'Image', None)}
                
                if log.Meal_id in meal_cache:
                    item = meal_cache[log.Meal_id]
                    if log.FeedbackType == 'liked':
                        preferences['liked_meals'].append(item)
                    elif log.FeedbackType == 'disliked':
                        preferences['disliked_meals'].append(item)
                        
            elif log.Workout_id:
                if log.Workout_id not in workout_cache:
                    w = Workout.query.get(log.Workout_id)
                    if w: workout_cache[log.Workout_id] = {'id': w.Id, 'name': w.Name, 'sport': w.Sport}
                
                if log.Workout_id in workout_cache:
                    item = workout_cache[log.Workout_id]
                    if log.FeedbackType == 'liked':
                        preferences['liked_workouts'].append(item)
                    elif log.FeedbackType == 'disliked':
                        preferences['disliked_workouts'].append(item)
                        
        for key in preferences:
            preferences[key] = [dict(t) for t in {tuple(d.items()) for d in preferences[key]}]
            
        return jsonify(preferences)
        
    except Exception as e:
        print(f"Error fetching preferences: {str(e)}")
        return jsonify({'error': 'Lỗi hệ thống'}), 500

@diary_bp.route('/remove-preference', methods=['POST'])
def remove_preference():
    """Xóa một like/dislike (Undo)"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Chưa đăng nhập'}), 401
        
    data = request.json
    item_id = data.get('item_id')
    item_type = data.get('type') # 'meal' or 'workout'
    
    try:
        query = Log.query.filter_by(User_id=user_id)
        
        if item_type == 'meal':
            query = query.filter_by(Meal_id=item_id)
        elif item_type == 'workout':
            query = query.filter_by(Workout_id=item_id)
            
        logs = query.all()
        for log in logs:
            db.session.delete(log)
            
        db.session.commit()
        return jsonify({'success': True, 'message': 'Đã xóa sở thích'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
