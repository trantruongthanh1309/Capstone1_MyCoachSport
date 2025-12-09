from db import db

class User(db.Model):
    __tablename__ = 'Users'
    __table_args__ = {'extend_existing': True}

    Id = db.Column(db.Integer, primary_key=True)
    Name = db.Column(db.Unicode(100))
    Email = db.Column(db.String(100), unique=True) # Email can stay String usually, but Unicode is safer if international emails. Let's keep String as emails are ascii usually. Actually, let's just make Name, Sex, Sport, Goal, Allergies, Bio, etc Unicode.
    Age = db.Column(db.Integer)
    Sex = db.Column(db.Unicode(10))
    Height_cm = db.Column(db.Integer)
    Weight_kg = db.Column(db.Integer)
    Sport = db.Column(db.Unicode(50))
    Goal = db.Column(db.Unicode(50))
    Sessions_per_week = db.Column(db.Integer)
    Allergies = db.Column(db.Unicode(500))
    
    WorkSchedule = db.Column(db.UnicodeText)
    DislikedIngredients = db.Column(db.UnicodeText)
    
    Avatar = db.Column(db.Text)
    Bio = db.Column(db.UnicodeText)
    Preferences = db.Column(db.Text)
    Privacy = db.Column(db.Text)
    NotificationSettings = db.Column(db.Text)
    
    CreatedAt = db.Column(db.DateTime, default=db.func.current_timestamp())