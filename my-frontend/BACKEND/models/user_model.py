# models/user_model.py
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
    
    # AI-related fields
    WorkSchedule = db.Column(db.Text)          # JSON string
    DislikedIngredients = db.Column(db.Text)   # JSON string
    
    # Settings fields
    Avatar = db.Column(db.Text)                # Base64 encoded image or URL
    Bio = db.Column(db.Text)                   # User bio/description
    Preferences = db.Column(db.Text)           # JSON: theme, language, notifications
    Privacy = db.Column(db.Text)               # JSON: privacy settings
    NotificationSettings = db.Column(db.Text)  # JSON: notification preferences
    
    # Timestamp for user growth tracking
    CreatedAt = db.Column(db.DateTime, default=db.func.current_timestamp())