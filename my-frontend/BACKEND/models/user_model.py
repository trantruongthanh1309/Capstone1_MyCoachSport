# models/user_model.py
from db import db

class User(db.Model):
    __tablename__ = 'Users'

    Id = db.Column(db.Integer, primary_key=True)
    Name = db.Column(db.String(100))
    Email = db.Column(db.String(100), unique=True)
    Age = db.Column(db.Integer)
    Sex = db.Column(db.String(10))
    Height_cm = db.Column(db.Integer)
    Weight_kg = db.Column(db.Integer)
    Sport = db.Column(db.String(50))
    Goal = db.Column(db.String(50))
    Sessions_per_week = db.Column(db.Integer)
    Allergies = db.Column(db.String(500))
    # Thêm 2 cột mới cho AI
    WorkSchedule = db.Column(db.Text)          # JSON string
    DislikedIngredients = db.Column(db.Text)   # JSON string