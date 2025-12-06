from db import db
from datetime import datetime

class UserPlan(db.Model):
    __tablename__ = 'UserPlans'

    Id = db.Column(db.Integer, primary_key=True)
    UserId = db.Column(db.Integer, db.ForeignKey('Users.Id'), nullable=False)
    Date = db.Column(db.Date, nullable=False)
    Slot = db.Column(db.String(50), nullable=False) # morning, afternoon, evening
    Type = db.Column(db.String(20), nullable=False) # meal, workout
    MealId = db.Column(db.Integer, db.ForeignKey('Meals.Id'), nullable=True)
    WorkoutId = db.Column(db.Integer, db.ForeignKey('Workouts.Id'), nullable=True)
    ProfileHash = db.Column(db.String(32), nullable=True)
    IsCompleted = db.Column(db.Boolean, default=False)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)

