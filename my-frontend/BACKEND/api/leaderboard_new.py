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
    """Đánh dấu hoàn thành item trong schedule (workout hoặc meal) - CHỈ MỘT ITEM"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Chưa đăng nhập'}), 401
    
    try:
        data = request.get_json()
        schedule_id = data.get('schedule_id')
        
        if not schedule_id:
            return jsonify({'error': 'Thiếu schedule_id'}), 400
        
        # Validate schedule_id là số
        try:
            schedule_id = int(schedule_id)
        except (ValueError, TypeError):
            return jsonify({'error': 'schedule_id không hợp lệ'}), 400
        
        # Kiểm tra xem item có tồn tại và thuộc về user này không
        check_query = text("""
            SELECT Id, UserId, Type, MealId, WorkoutId, Date, Slot, IsCompleted
            FROM UserPlans
            WHERE Id = :schedule_id
        """)
        existing_item = db.session.execute(check_query, {'schedule_id': schedule_id}).first()
        
        if not existing_item:
            return jsonify({'error': 'Không tìm thấy schedule item'}), 404
        
        # Kiểm tra user_id có khớp không
        if existing_item.UserId != user_id:
            return jsonify({'error': 'Không có quyền thực hiện hành động này'}), 403
        
        # Kiểm tra đã completed chưa (check cả True và 1)
        is_already_completed = existing_item.IsCompleted
        if isinstance(is_already_completed, bool) and is_already_completed:
            return jsonify({'success': True, 'message': 'Item đã được hoàn thành trước đó'}), 200
        elif isinstance(is_already_completed, (int, str)) and str(is_already_completed) in ['1', 'True', 'true']:
            return jsonify({'success': True, 'message': 'Item đã được hoàn thành trước đó'}), 200
        
        # UPDATE CHỈ MỘT RECORD - đảm bảo bằng cách check lại user_id
        # SQL Server dùng bit (0/1), không phải boolean
        # THÊM logging để debug
        print(f"🔍 [COMPLETE DEBUG] Attempting to complete schedule_id={schedule_id} for user_id={user_id}")
        print(f"🔍 [COMPLETE DEBUG] Existing item: Type={existing_item.Type}, Date={existing_item.Date}, Slot={existing_item.Slot}, IsCompleted={existing_item.IsCompleted}")
        
        update_query = text("""
            UPDATE UserPlans
            SET IsCompleted = 1
            WHERE Id = :schedule_id 
            AND UserId = :user_id 
            AND (IsCompleted = 0 OR IsCompleted IS NULL)
        """)
        
        result = db.session.execute(update_query, {
            'schedule_id': schedule_id,
            'user_id': user_id
        })
        db.session.commit()
        
        print(f"🔍 [COMPLETE DEBUG] Update result: rowcount={result.rowcount}")
        
        # Kiểm tra lại để đảm bảo chỉ update đúng 1 record
        if result.rowcount == 0:
            # Có thể đã bị completed bởi request khác, hoặc có vấn đề khác
            # Check lại để xem có phải đã completed không
            recheck_query = text("""
                SELECT IsCompleted FROM UserPlans WHERE Id = :schedule_id
            """)
            recheck = db.session.execute(recheck_query, {'schedule_id': schedule_id}).first()
            if recheck and (recheck.IsCompleted == 1 or recheck.IsCompleted == True):
                return jsonify({'success': True, 'message': 'Item đã được hoàn thành'}), 200
            return jsonify({'error': 'Không thể cập nhật item. Vui lòng thử lại.'}), 400
        elif result.rowcount > 1:
            # Điều này không nên xảy ra, nhưng nếu có thì rollback
            db.session.rollback()
            return jsonify({'error': 'Lỗi hệ thống: Nhiều records bị ảnh hưởng'}), 500
        
        print(f"✅ [COMPLETE] User {user_id} completed schedule item {schedule_id} (Type: {existing_item.Type}, Date: {existing_item.Date})")
        
        item_query = text("""
            SELECT Type, MealId, WorkoutId, Date, Slot
            FROM UserPlans
            WHERE Id = :schedule_id
        """)
        item = db.session.execute(item_query, {'schedule_id': schedule_id}).first()
        
        if not item:
            return jsonify({'error': 'Không tìm thấy schedule item'}), 404
        
        # Kiểm tra thời gian - cho phép đánh dấu hoàn thành cho ngày trong quá khứ hoặc hôm nay
        # Bỏ check thời gian cụ thể để user có thể hoàn thành sớm hoặc muộn
        from datetime import time as dt_time
        now = datetime.now()
        # item là Row object từ SQL query: (Type[0], MealId[1], WorkoutId[2], Date[3], Slot[4])
        item_date = item[3]  # Date ở index 3
        slot = item[4]  # Slot ở index 4
        
        # Chỉ chặn nếu ngày ở tương lai (chưa đến)
        # Cho phép complete cho ngày hôm nay hoặc quá khứ
        if item_date and now.date() < item_date:
            return jsonify({'error': 'Chưa đến ngày, không thể đánh dấu hoàn thành'}), 400
        
        points = 0
        
        # Access item fields by index: Type[0], MealId[1], WorkoutId[2], Date[3], Slot[4]
        item_type = item[0]
        
        if item_type == 'meal':
            meal_query = text("""
                SELECT Kcal, Protein FROM Meals WHERE Id = :meal_id
            """)
            meal = db.session.execute(meal_query, {'meal_id': item[1]}).first()
            
            if meal:
                calories = meal[0] or 0  # Kcal ở index 0
                protein = meal[1] or 0   # Protein ở index 1
                time_slot = slot
                
                time_multiplier = 1.2 if time_slot == 'morning' else (1.0 if time_slot == 'afternoon' else 0.9)
                
                protein_bonus = 10 if protein >= 30 else (5 if protein >= 20 else 0)
                
                points = int((calories / 10) * time_multiplier) + protein_bonus
                if points > 100:
                    points = 100
        
        elif item_type == 'workout':
            workout_query = text("""
                SELECT Duration_min, Sport FROM Workouts WHERE Id = :workout_id
            """)
            workout = db.session.execute(workout_query, {'workout_id': item[2]}).first()
            
            if workout:
                duration = workout[0] or 0  # Duration_min ở index 0
                sport = workout[1] or ''    # Sport ở index 1
                
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
        
        if item_type == 'workout':
            workout_log_query = text("""
                INSERT INTO WorkoutLogs (User_id, Workout_name, Sport, Duration_minutes, Difficulty, Points_earned, Completed_at)
                SELECT :user_id, w.Name, w.Sport, w.Duration_min, 'Medium', :points, GETDATE()
                FROM Workouts w
                WHERE w.Id = :workout_id
            """)
            db.session.execute(workout_log_query, {
                'user_id': user_id,
                'points': points,
                'workout_id': item[2]  # WorkoutId ở index 2
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
