"""
Dashboard Admin API
"""
from flask import Blueprint, request, jsonify
from .admin_middleware import require_admin
from models.user_model import User
from models.log import Log
from models.meal import Meal
from models.workout import Workout
from db import db
from sqlalchemy import func, desc
from datetime import datetime, timedelta

dashboard_bp = Blueprint('dashboard_admin', __name__)

@dashboard_bp.route('/api/admin/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """Thống kê tổng quan cho dashboard"""
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        # Tổng số user
        total_users = User.query.count()
        
        # User mới trong 7 ngày
        week_ago = datetime.now() - timedelta(days=7)
        new_users_week = User.query.count()  # TODO: Cần thêm field CreatedAt
        
        # User hoạt động hôm nay
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        active_users_today = db.session.query(func.count(func.distinct(Log.User_id)))\
            .filter(Log.Date >= today_start).scalar() or 0
        
        # Tổng số meals & workouts
        total_meals = Meal.query.count()
        total_workouts = Workout.query.count()
        
        # Tổng số logs
        total_logs = Log.query.count()
        logs_today = Log.query.filter(Log.Date >= today_start).count()
        
        # Thống kê theo môn thể thao
        sport_stats = db.session.query(
            User.Sport, 
            func.count(User.Id).label('count')
        ).filter(User.Sport.isnot(None))\
         .group_by(User.Sport)\
         .order_by(desc('count'))\
         .limit(10).all()
        
        sport_distribution = [{"sport": s[0], "count": s[1]} for s in sport_stats]
        
        # Thống kê theo mục tiêu
        goal_stats = db.session.query(
            User.Goal,
            func.count(User.Id).label('count')
        ).filter(User.Goal.isnot(None))\
         .group_by(User.Goal)\
         .order_by(desc('count')).all()
        
        goal_distribution = [{"goal": g[0], "count": g[1]} for g in goal_stats]
        
        return jsonify({
            "success": True,
            "data": {
                "total_users": total_users,
                "new_users_week": new_users_week,
                "active_users_today": active_users_today,
                "total_meals": total_meals,
                "total_workouts": total_workouts,
                "total_logs": total_logs,
                "logs_today": logs_today,
                "sport_distribution": sport_distribution,
                "goal_distribution": goal_distribution
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@dashboard_bp.route('/api/admin/dashboard/user-growth', methods=['GET'])
def get_user_growth():
    """Tăng trưởng user theo ngày (30 ngày gần nhất)"""
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        days = int(request.args.get('days', 30))
        start_date = datetime.now() - timedelta(days=days)
        
        # Mock data - TODO: Thêm field CreatedAt vào User
        result = [{"date": str(datetime.now().date()), "count": User.query.count()}]
        
        return jsonify({"success": True, "data": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500