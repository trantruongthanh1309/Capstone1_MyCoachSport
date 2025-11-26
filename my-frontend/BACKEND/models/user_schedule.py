# models/user_schedule.py
from db import db

class UserSchedule(db.Model):
    __tablename__ = 'UserSchedule'

    Id = db.Column(db.Integer, primary_key=True)
    User_id = db.Column(db.Integer, db.ForeignKey('Users.Id'), nullable=False)
    
    # Cho lịch BẬN hàng tuần (Weekly busy schedule)
    DayOfWeek = db.Column(db.String(10))  # "mon", "tue", ... (nullable cho daily schedule)
    Period = db.Column(db.String(10))     # "morning", "afternoon", "evening"
    Note = db.Column(db.String(200))      # Ghi chú lịch bận
    
    # Cho lịch ĂN/TẬP hàng ngày (Daily meal/workout schedule)
    Date = db.Column(db.Date)             # Ngày cụ thể (nullable cho weekly schedule)
    MealId = db.Column(db.Integer, db.ForeignKey('Meals.Id'))
    WorkoutId = db.Column(db.Integer, db.ForeignKey('Workouts.Id'))
    
    # Cột mới cho tính năng Thông báo
    Time = db.Column(db.Time)             # Giờ cụ thể
    IsNotified = db.Column(db.Boolean, default=False)
    
    CreatedAt = db.Column(db.DateTime, default=db.func.now())