# models/leaderboard_models.py
from db import db
from datetime import datetime

class WorkoutLog(db.Model):
    __tablename__ = 'WorkoutLogs'
    
    Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    User_id = db.Column(db.Integer, db.ForeignKey('Users.Id'), nullable=False)
    Workout_name = db.Column(db.Unicode(255), nullable=False)
    Sport = db.Column(db.Unicode(50))
    Duration_minutes = db.Column(db.Integer)
    Calories_burned = db.Column(db.Integer)
    Difficulty = db.Column(db.Unicode(20))  # Easy, Medium, Hard, Expert
    Completed_at = db.Column(db.DateTime, default=datetime.utcnow)
    Points_earned = db.Column(db.Integer, default=0)
    
    def to_dict(self):
        return {
            'id': self.Id,
            'user_id': self.User_id,
            'workout_name': self.Workout_name,
            'sport': self.Sport,
            'duration_minutes': self.Duration_minutes,
            'calories_burned': self.Calories_burned,
            'difficulty': self.Difficulty,
            'completed_at': self.Completed_at.isoformat() if self.Completed_at else None,
            'points_earned': self.Points_earned
        }


class UserStats(db.Model):
    __tablename__ = 'UserStats'
    
    Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    User_id = db.Column(db.Integer, db.ForeignKey('Users.Id'), nullable=False, unique=True)
    Total_points = db.Column(db.Integer, default=0)
    Total_workouts = db.Column(db.Integer, default=0)
    Current_streak = db.Column(db.Integer, default=0)
    Longest_streak = db.Column(db.Integer, default=0)
    Last_workout_date = db.Column(db.Date)
    Level = db.Column(db.Integer, default=1)
    Experience = db.Column(db.Integer, default=0)
    Rank = db.Column(db.Integer)
    Updated_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'user_id': self.User_id,
            'total_points': self.Total_points,
            'total_workouts': self.Total_workouts,
            'current_streak': self.Current_streak,
            'longest_streak': self.Longest_streak,
            'last_workout_date': self.Last_workout_date.isoformat() if self.Last_workout_date else None,
            'level': self.Level,
            'experience': self.Experience,
            'rank': self.Rank
        }


class Achievement(db.Model):
    __tablename__ = 'Achievements'
    
    Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Name = db.Column(db.Unicode(100), nullable=False)
    Description = db.Column(db.Unicode(500))
    Icon = db.Column(db.Unicode(50))
    Points_reward = db.Column(db.Integer, default=0)
    Requirement_type = db.Column(db.Unicode(50))
    Requirement_value = db.Column(db.Integer)
    Created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.Id,
            'name': self.Name,
            'description': self.Description,
            'icon': self.Icon,
            'points_reward': self.Points_reward,
            'requirement_type': self.Requirement_type,
            'requirement_value': self.Requirement_value
        }


class UserAchievement(db.Model):
    __tablename__ = 'UserAchievements'
    
    Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    User_id = db.Column(db.Integer, db.ForeignKey('Users.Id'), nullable=False)
    Achievement_id = db.Column(db.Integer, db.ForeignKey('Achievements.Id'), nullable=False)
    Unlocked_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('User_id', 'Achievement_id', name='unique_user_achievement'),)
    
    def to_dict(self):
        return {
            'id': self.Id,
            'user_id': self.User_id,
            'achievement_id': self.Achievement_id,
            'unlocked_at': self.Unlocked_at.isoformat() if self.Unlocked_at else None
        }
