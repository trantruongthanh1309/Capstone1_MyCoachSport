from db import db

class Workout(db.Model):
    __tablename__ = 'Workouts'

    Id = db.Column(db.Integer, primary_key=True)
    Name = db.Column(db.String(200))
    Sport = db.Column(db.String(50))
    Goal = db.Column(db.String(50))
    Duration_min = db.Column(db.Integer)
    Rpe = db.Column(db.Integer)
    Tags = db.Column(db.String(200))
    MuscleGroups = db.Column(db.String(200))
    Intensity = db.Column(db.String(50))
    Equipment = db.Column(db.String(255))
    VideoUrl = db.Column(db.String(500))
    SportTags = db.Column(db.String(500))
    
    # New AI fields
    Difficulty = db.Column(db.String(50))
    GoalFocus = db.Column(db.String(100))
    CalorieBurn = db.Column(db.Integer)
