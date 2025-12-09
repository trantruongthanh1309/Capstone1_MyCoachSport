from db import db
from datetime import datetime

class Workout(db.Model):
    __tablename__ = 'Workouts'

    # Core Info (11 columns)
    Id = db.Column(db.Integer, primary_key=True)
    Name = db.Column(db.String(255))
    Sport = db.Column(db.String(50))
    Duration_min = db.Column(db.Integer)
    MuscleGroups = db.Column(db.String(255))
    Intensity = db.Column(db.String(50))
    Equipment = db.Column(db.String(100))
    Difficulty = db.Column(db.String(50))
    GoalFocus = db.Column(db.String(100))
    CalorieBurn = db.Column(db.Integer)
    VideoUrl = db.Column(db.String(500))

    # Workout Details (3 columns)
    Sets = db.Column(db.String(20))
    Reps = db.Column(db.String(50))
    RestTime = db.Column(db.Integer)

    # Descriptions (3 columns)
    Description = db.Column(db.Text)
    Instructions = db.Column(db.Text)
    SafetyNotes = db.Column(db.Text)

    # AI & Goals (2 columns)
    AITags = db.Column(db.Text)
    Goals = db.Column(db.String(100))

    # Metadata (3 columns)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)
    UpdatedAt = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    IsActive = db.Column(db.Boolean, default=True)

    # Progression (2 columns)
    ProgressionNotes = db.Column(db.String(500))
    RegressionNotes = db.Column(db.String(500))

    # Muscle Details (2 columns)
    PrimaryMuscles = db.Column(db.String(200))
    SecondaryMuscles = db.Column(db.String(200))

    # Prerequisites (1 column)
    Prerequisites = db.Column(db.String(500))

    def to_dict(self):
        """Convert workout to dictionary for API responses"""
        return {
            'Id': self.Id,
            'Name': self.Name,
            'Sport': self.Sport,
            'Duration_min': self.Duration_min,
            'MuscleGroups': self.MuscleGroups,
            'Intensity': self.Intensity,
            'Equipment': self.Equipment,
            'Difficulty': self.Difficulty,
            'GoalFocus': self.GoalFocus,
            'CalorieBurn': self.CalorieBurn,
            'VideoUrl': self.VideoUrl,
            'Sets': self.Sets,
            'Reps': self.Reps,
            'RestTime': self.RestTime,
            'Description': self.Description,
            'Instructions': self.Instructions,
            'SafetyNotes': self.SafetyNotes,
            'AITags': self.AITags,
            'Goals': self.Goals,
            'CreatedAt': self.CreatedAt.isoformat() if self.CreatedAt else None,
            'UpdatedAt': self.UpdatedAt.isoformat() if self.UpdatedAt else None,
            'IsActive': self.IsActive,
            'ProgressionNotes': self.ProgressionNotes,
            'RegressionNotes': self.RegressionNotes,
            'PrimaryMuscles': self.PrimaryMuscles,
            'SecondaryMuscles': self.SecondaryMuscles,
            'Prerequisites': self.Prerequisites
        }

    def to_simple_dict(self):
        """Convert workout to simple dictionary for schedule display"""
        return {
            'Id': self.Id,
            'Name': self.Name,
            'Sport': self.Sport,
            'Intensity': self.Intensity,
            'Duration_min': self.Duration_min,
            'VideoUrl': self.VideoUrl,
            'Description': self.Description,
            'Sets': self.Sets,
            'Reps': self.Reps,
            'RestTime': self.RestTime,
            'Equipment': self.Equipment,
            'Difficulty': self.Difficulty,
            'CalorieBurn': self.CalorieBurn,
            'PrimaryMuscles': self.PrimaryMuscles,
            'SafetyNotes': self.SafetyNotes
        }

    def to_admin_dict(self):
        """Convert workout to dictionary for admin panel"""
        return {
            **self.to_dict(),
            'TotalFields': 26,
            'HasDescription': bool(self.Description),
            'HasInstructions': bool(self.Instructions),
            'HasProgression': bool(self.ProgressionNotes),
            'HasRegression': bool(self.RegressionNotes),
            'DataCompleteness': self._calculate_completeness()
        }

    def _calculate_completeness(self):
        """Calculate data completeness percentage"""
        total_fields = 26
        filled_fields = sum([
            bool(self.Name),
            bool(self.Sport),
            bool(self.Duration_min),
            bool(self.MuscleGroups),
            bool(self.Intensity),
            bool(self.Equipment),
            bool(self.Difficulty),
            bool(self.GoalFocus),
            bool(self.CalorieBurn),
            bool(self.VideoUrl),
            bool(self.Sets),
            bool(self.Reps),
            bool(self.RestTime),
            bool(self.Description),
            bool(self.Instructions),
            bool(self.SafetyNotes),
            bool(self.AITags),
            bool(self.Goals),
            bool(self.CreatedAt),
            bool(self.UpdatedAt),
            self.IsActive is not None,
            bool(self.ProgressionNotes),
            bool(self.RegressionNotes),
            bool(self.PrimaryMuscles),
            bool(self.SecondaryMuscles),
            bool(self.Prerequisites)
        ])
        return round((filled_fields / total_fields) * 100, 1)

