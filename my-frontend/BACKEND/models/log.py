from db import db
from datetime import datetime

class Log(db.Model):
    __tablename__ = 'Logs'

    Id = db.Column(db.Integer, primary_key=True)
    User_id = db.Column(db.Integer, db.ForeignKey('Users.Id'), nullable=False)
    Day = db.Column(db.Date, nullable=False)
    Meal_id = db.Column(db.Integer, db.ForeignKey('Meals.Id'), nullable=False)
    Workout_id = db.Column(db.Integer, db.ForeignKey('Workouts.Id'), nullable=False)
    Notes = db.Column(db.String(500))        
    RPE = db.Column(db.Integer)              
    Rating = db.Column(db.Integer, db.CheckConstraint('Rating BETWEEN 1 AND 5'))
    FeedbackType = db.Column(db.String(20))
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Log {self.Id}: User {self.User_id}>"
