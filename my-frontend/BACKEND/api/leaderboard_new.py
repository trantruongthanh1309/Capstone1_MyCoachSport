from flask import Blueprint, request, jsonify, session, current_app
from models.leaderboard_models import WorkoutLog, UserStats, Achievement, UserAchievement
from models.user_model import User
from db import db
from datetime import datetime, date
from sqlalchemy import text

leaderboard_bp = Blueprint('leaderboard_new', __name__, url_prefix='/api/leaderboard')

@leaderboard_bp.route('/log-workout', methods=['POST'])
def log_workout():
    """Ghi nhận bài tập đã hoàn thành"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Chưa đăng nhập'}), 401
    
    try:
        data = request.get_json()
        workout_name = data.get('workout_name')
        sport = data.get('sport')
        duration_minutes = data.get('duration_minutes', 30)
        calories_burned = data.get('calories_burned', 0)
        difficulty = data.get('difficulty', 'Medium')
        
        if not workout_name:
            return jsonify({'error': 'Thiếu tên bài tập'}), 400
        
        result = db.session.execute(
            text("DECLARE @points INT; EXEC @points = sp_CalculateWorkoutPoints :workout_name, :duration, :difficulty, :sport; SELECT @points AS points"),
            {
                'workout_name': workout_name,
                'duration': duration_minutes,
                'difficulty': difficulty,
                'sport': sport or 'General'
            }
        )
        points = result.scalar()
        
        workout_log = WorkoutLog(
            User_id=user_id,
            Workout_name=workout_name,
            Sport=sport,
            Duration_minutes=duration_minutes,
            Calories_burned=calories_burned,
            Difficulty=difficulty,
            Points_earned=points
        )
        db.session.add(workout_log)
        db.session.commit()
        
        check_and_unlock_achievements(user_id)
        
        return jsonify({
            'success': True,
            'message': f'Đã ghi nhận bài tập! +{points} điểm',
            'workout': workout_log.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error logging workout: {str(e)}")
        return jsonify({'error': 'Không thể ghi nhận bài tập'}), 500

@leaderboard_bp.route('/my-workouts', methods=['GET'])
def get_my_workouts():
    """Lấy lịch sử tập luyện của user"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Chưa đăng nhập'}), 401
    
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        workouts = WorkoutLog.query.filter_by(User_id=user_id)\
            .order_by(WorkoutLog.Completed_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'success': True,
            'workouts': [w.to_dict() for w in workouts.items],
            'total': workouts.total,
            'pages': workouts.pages
        })
    except Exception as e:
        current_app.logger.error(f"Error fetching workouts: {str(e)}")
        return jsonify({'error': 'Lỗi khi lấy dữ liệu'}), 500

@leaderboard_bp.route('/complete-schedule-item', methods=['POST'])
def complete_schedule_item():
    """Đánh dấu hoàn thành item trong schedule (workout hoặc meal)"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Chưa đăng nhập'}), 401
    
    try:
        data = request.get_json()
        schedule_id = data.get('schedule_id')
        
        if not schedule_id:
            return jsonify({'error': 'Thiếu schedule_id'}), 400
        
        update_query = text("""
            UPDATE UserPlans
            SET IsCompleted = 1
            WHERE Id = :schedule_id AND UserId = :user_id AND (IsCompleted = 0 OR IsCompleted IS NULL)
        """)
        
        result = db.session.execute(update_query, {
            'schedule_id': schedule_id,
            'user_id': user_id
        })
        db.session.commit()
        
        if result.rowcount == 0:
            return jsonify({'error': 'Không tìm thấy schedule item hoặc đã hoàn thành rồi'}), 404
        
        item_query = text("""
            SELECT Type, MealId, WorkoutId, Date, Slot
            FROM UserPlans
            WHERE Id = :schedule_id
        """)
        item = db.session.execute(item_query, {'schedule_id': schedule_id}).first()
        
        points = 0
        
        if item.Type == 'meal':
            meal_query = text("""
                SELECT Kcal, Protein FROM Meals WHERE Id = :meal_id
            """)
            meal = db.session.execute(meal_query, {'meal_id': item.MealId}).first()
            
            if meal:
                calories = meal.Kcal or 0
                protein = meal.Protein or 0
                time_slot = item.Slot
                
                time_multiplier = 1.2 if time_slot == 'morning' else (1.0 if time_slot == 'afternoon' else 0.9)
                
                protein_bonus = 10 if protein >= 30 else (5 if protein >= 20 else 0)
                
                points = int((calories / 10) * time_multiplier) + protein_bonus
                if points > 100:
                    points = 100
        
        elif item.Type == 'workout':
            workout_query = text("""
                SELECT Duration_min, Sport FROM Workouts WHERE Id = :workout_id
            """)
            workout = db.session.execute(workout_query, {'workout_id': item.WorkoutId}).first()
            
            if workout:
                duration = workout.Duration_min or 0
                sport = workout.Sport or ''
                
                sport_multiplier = {
                    'Yoga': 0.8,
                    'Chạy bộ': 1.0,
                    'Cầu lông': 1.1,
                    'Bóng đá': 1.2,
                    'Bóng rổ': 1.2,
                    'Gym': 1.3,
                    'Bơi lội': 1.5
                }.get(sport, 1.0)
                
                difficulty_multiplier = 1.5
                
                points = int(duration * difficulty_multiplier * sport_multiplier)
        
        if item.Type == 'workout':
            workout_log_query = text("""
                INSERT INTO WorkoutLogs (User_id, Workout_name, Sport, Duration_minutes, Difficulty, Points_earned, Completed_at)
                SELECT :user_id, w.Name, w.Sport, w.Duration_min, 'Medium', :points, GETDATE()
                FROM Workouts w
                WHERE w.Id = :workout_id
            """)
            db.session.execute(workout_log_query, {
                'user_id': user_id,
                'points': points,
                'workout_id': item.WorkoutId
            })
            db.session.commit()
        
        stats_query = text("""
            IF NOT EXISTS (SELECT 1 FROM UserStats WHERE User_id = :user_id)
            BEGIN
                INSERT INTO UserStats (User_id, Total_points, Total_workouts, Current_streak, Level, Experience)
                VALUES (:user_id, :points, 1, 1, 1, :points)
            END
            ELSE
            BEGIN
                UPDATE UserStats
                SET Total_points = Total_points + :points,
                    Total_workouts = Total_workouts + 1,
                    Level = ((Total_points + :points) / 1000) + 1,
                    Experience = (Total_points + :points) % 1000,
                    Updated_at = GETDATE()
                WHERE User_id = :user_id
            END
        """)
        db.session.execute(stats_query, {'user_id': user_id, 'points': points})
        db.session.commit()
        
        check_and_unlock_achievements(user_id)
        
        return jsonify({
            'success': True,
            'message': f'Hoàn thành! +{points} điểm',
            'points_earned': points
        })
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error completing schedule item: {str(e)}")
        return jsonify({'error': 'Không thể hoàn thành'}), 500

@leaderboard_bp.route('/rankings', methods=['GET'])
def get_rankings():
    """Lấy bảng xếp hạng"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        sport_filter = request.args.get('sport')
        
        query = text("""
            SELECT * FROM vw_Leaderboard
            ORDER BY Total_points DESC
            OFFSET :offset ROWS
            FETCH NEXT :limit ROWS ONLY
        """)
        
        offset = (page - 1) * per_page
        result = db.session.execute(query, {'offset': offset, 'limit': per_page})
        
        rankings = []
        for row in result:
            rankings.append({
                'rank': row.Rank,
                'user_id': row.User_id,
                'user_name': row.User_name,
                'avatar': row.Avatar,
                'sport': row.Sport,
                'total_points': row.Total_points,
                'total_workouts': row.Total_workouts,
                'current_streak': row.Current_streak,
                'longest_streak': row.Longest_streak,
                'level': row.Level,
                'experience': row.Experience,
                'achievements_count': row.Achievements_count
            })
        
        return jsonify({
            'success': True,
            'rankings': rankings,
            'page': page
        })
        
    except Exception as e:
        current_app.logger.error(f"Error fetching rankings: {str(e)}")
        return jsonify({'error': 'Lỗi khi lấy bảng xếp hạng'}), 500

@leaderboard_bp.route('/my-stats', methods=['GET'])
def get_my_stats():
    """Lấy thống kê cá nhân"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Chưa đăng nhập'}), 401
    
    try:
        stats = UserStats.query.filter_by(User_id=user_id).first()
        
        if not stats:
            stats = UserStats(User_id=user_id)
            db.session.add(stats)
            db.session.commit()
        
        rank_query = text("""
            SELECT Rank FROM vw_Leaderboard WHERE User_id = :user_id
        """)
        rank_result = db.session.execute(rank_query, {'user_id': user_id}).scalar()
        
        achievements = db.session.query(Achievement)\
            .join(UserAchievement, Achievement.Id == UserAchievement.Achievement_id)\
            .filter(UserAchievement.User_id == user_id)\
            .all()
        
        return jsonify({
            'success': True,
            'stats': stats.to_dict(),
            'rank': rank_result or 0,
            'achievements': [a.to_dict() for a in achievements]
        })
        
    except Exception as e:
        current_app.logger.error(f"Error fetching stats: {str(e)}")
        return jsonify({'error': 'Lỗi khi lấy thống kê'}), 500

@leaderboard_bp.route('/achievements', methods=['GET'])
def get_all_achievements():
    """Lấy tất cả achievements"""
    try:
        user_id = session.get('user_id')
        achievements = Achievement.query.all()
        
        result = []
        for achievement in achievements:
            ach_dict = achievement.to_dict()
            
            if user_id:
                unlocked = UserAchievement.query.filter_by(
                    User_id=user_id,
                    Achievement_id=achievement.Id
                ).first()
                ach_dict['unlocked'] = unlocked is not None
                ach_dict['unlocked_at'] = unlocked.Unlocked_at.isoformat() if unlocked else None
            else:
                ach_dict['unlocked'] = False
            
            result.append(ach_dict)
        
        return jsonify({
            'success': True,
            'achievements': result
        })
        
    except Exception as e:
        current_app.logger.error(f"Error fetching achievements: {str(e)}")
        return jsonify({'error': 'Lỗi khi lấy thành tựu'}), 500

def check_and_unlock_achievements(user_id):
    """Kiểm tra và mở khóa achievements tự động"""
    try:
        stats = UserStats.query.filter_by(User_id=user_id).first()
        if not stats:
            return
        
        unlocked_ids = db.session.query(UserAchievement.Achievement_id)\
            .filter_by(User_id=user_id).all()
        unlocked_ids = [id[0] for id in unlocked_ids]
        
        achievements = Achievement.query.filter(
            Achievement.Id.notin_(unlocked_ids)
        ).all()
        
        for achievement in achievements:
            should_unlock = False
            
            if achievement.Requirement_type == 'workouts':
                should_unlock = stats.Total_workouts >= achievement.Requirement_value
            elif achievement.Requirement_type == 'streak':
                should_unlock = stats.Current_streak >= achievement.Requirement_value
            elif achievement.Requirement_type == 'points':
                should_unlock = stats.Total_points >= achievement.Requirement_value
            
            if should_unlock:
                user_achievement = UserAchievement(
                    User_id=user_id,
                    Achievement_id=achievement.Id
                )
                db.session.add(user_achievement)
                
                stats.Total_points += achievement.Points_reward
        
        db.session.commit()
        
    except Exception as e:
        current_app.logger.error(f"Error checking achievements: {str(e)}")
        db.session.rollback()

@leaderboard_bp.route('/stats/overview', methods=['GET'])
def get_stats_overview():
    """Lấy tổng quan thống kê hệ thống"""
    try:
        total_users = db.session.query(UserStats).count()
        total_workouts = db.session.query(db.func.sum(UserStats.Total_workouts)).scalar() or 0
        total_points = db.session.query(db.func.sum(UserStats.Total_points)).scalar() or 0
        
        top_users = db.session.execute(text("""
            SELECT TOP 3 * FROM vw_Leaderboard ORDER BY Total_points DESC
        """))
        
        top_users_list = []
        for row in top_users:
            top_users_list.append({
                'rank': row.Rank,
                'user_name': row.User_name,
                'avatar': row.Avatar,
                'total_points': row.Total_points
            })
        
        return jsonify({
            'success': True,
            'overview': {
                'total_users': total_users,
                'total_workouts': total_workouts,
                'total_points': total_points,
                'top_users': top_users_list
            }
        })
        
    except Exception as e:
        current_app.logger.error(f"Error fetching overview: {str(e)}")
        return jsonify({'error': 'Lỗi khi lấy tổng quan'}), 500
