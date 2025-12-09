from db import db

class UserSchedule(db.Model):
    __tablename__ = 'UserSchedule'

    Id = db.Column(db.Integer, primary_key=True)
    User_id = db.Column(db.Integer, db.ForeignKey('Users.Id'), nullable=False)
    
    DayOfWeek = db.Column(db.Unicode(10))
    Period = db.Column(db.Unicode(10))
    Note = db.Column(db.Unicode(200))
    
    Date = db.Column(db.Date)
    MealId = db.Column(db.Integer, db.ForeignKey('Meals.Id'))
    WorkoutId = db.Column(db.Integer, db.ForeignKey('Workouts.Id'))
    
    Time = db.Column(db.Time)
    IsNotified = db.Column(db.Boolean, default=False)
    
    CreatedAt = db.Column(db.DateTime, default=db.func.now())