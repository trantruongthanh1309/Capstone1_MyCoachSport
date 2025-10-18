# models/workout.py
from db import db

class Workout(db.Model):
    __tablename__ = 'Workouts'

    Id = db.Column(db.Integer, primary_key=True)
    Name = db.Column(db.String(200))
    Sport = db.Column(db.String(50))             # Môn thể thao (football, basketball...)
    Goal = db.Column(db.String(50))              # Mục tiêu (tăng cơ, giảm cân...)
    Duration_min = db.Column(db.Integer)         # Thời lượng bài tập (phút)
    Rpe = db.Column(db.Integer)                  # Cảm nhận cường độ (1–10)
    Tags = db.Column(db.String(200))             # Tag mô tả thêm (cardio, strength, flexibility...)

    # ✅ Các trường thêm mới để tương thích với AI Planner
    MuscleGroups = db.Column(db.String(200))     # Nhóm cơ tác động (legs, chest, arms,...)
    Intensity = db.Column(db.String(50))         # Cường độ (Low, Medium, High)
    Equipment = db.Column(db.String(100))        # Dụng cụ cần thiết (dumbbell, barbell, none)
