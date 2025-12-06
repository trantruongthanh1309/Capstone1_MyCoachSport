from db import db

class User(db.Model):
    __tablename__ = 'Users'
    __table_args__ = {'extend_existing': True}

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
    
    WorkSchedule = db.Column(db.Text)
    DislikedIngredients = db.Column(db.Text)
    
    Avatar = db.Column(db.Text)
    Bio = db.Column(db.Text)
    Preferences = db.Column(db.Text)
    Privacy = db.Column(db.Text)
    NotificationSettings = db.Column(db.Text)
    
    CreatedAt = db.Column(db.DateTime, default=db.func.current_timestamp())