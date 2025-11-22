from flask import Blueprint, jsonify
from sqlalchemy import text
from db import db
from datetime import datetime

leaderboard_bp = Blueprint('leaderboard', __name__)

@leaderboard_bp.route('/', methods=['GET'])
def get_leaderboard():
    """
    Get leaderboard data with user statistics
    Returns top users by points, workouts, and activity
    """
    try:
        # Get top users by total points/activity
        # Join Users table with Leaderboard based on User_id
        query = text("""
            SELECT TOP 50
                u.Id as UserID,
                u.Name,
                u.Email,
                u.Sport as PreferredSport,
                u.Goal as FitnessGoal,
                COALESCE(l.TotalPoints, 0) as TotalPoints,
                COALESCE(l.WorkoutsCompleted, 0) as WorkoutsCompleted,
                COALESCE(l.ChallengesCompleted, 0) as ChallengesCompleted,
                GETDATE() as CreatedAt
            FROM dbo.Users u
            LEFT JOIN (
                SELECT 
                    User_id,
                    SUM(Points) as TotalPoints,
                    COUNT(DISTINCT CASE WHEN Challenge_name LIKE '%Workout%' OR Challenge_name LIKE '%workout%' THEN Id END) as WorkoutsCompleted,
                    COUNT(DISTINCT Id) as ChallengesCompleted
                FROM dbo.Leaderboard
                WHERE User_id IS NOT NULL
                GROUP BY User_id
            ) l ON u.Id = l.User_id
            ORDER BY COALESCE(l.TotalPoints, 0) DESC, u.Name ASC
        """)
        
        leaderboard_data = db.session.execute(query).fetchall()
        
        leaderboard_list = []
        for idx, entry in enumerate(leaderboard_data, 1):
            # Determine badge based on rank
            badge = "🥇" if idx == 1 else "🥈" if idx == 2 else "🥉" if idx == 3 else ""
            
            # Determine level based on points
            points = entry[5]
            if points >= 1000:
                level = "Legend"
                level_color = "gold"
            elif points >= 500:
                level = "Master"
                level_color = "purple"
            elif points >= 200:
                level = "Expert"
                level_color = "blue"
            elif points >= 100:
                level = "Advanced"
                level_color = "green"
            else:
                level = "Beginner"
                level_color = "gray"
            
            leaderboard_list.append({
                "rank": idx,
                "userId": entry[0],
                "name": entry[1],
                "email": entry[2],
                "sport": entry[3] or "General",
                "goal": entry[4] or "Fitness",
                "totalPoints": entry[5],
                "workoutsCompleted": entry[6],
                "challengesCompleted": entry[7],
                "joinedDate": entry[8].strftime("%Y-%m-%d") if entry[8] else None,
                "badge": badge,
                "level": level,
                "levelColor": level_color
            })
        
        return jsonify({
            "success": True,
            "data": leaderboard_list,
            "total": len(leaderboard_list)
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
