from db import db
from datetime import datetime

class NotificationLog(db.Model):
    __tablename__ = 'NotificationLogs'
    
    Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    User_id = db.Column(db.Integer, db.ForeignKey('Users.Id'), nullable=False)
    Type = db.Column(db.String(50), nullable=False)
    ReferenceId = db.Column(db.Integer, nullable=True) # ID của UserSchedule hoặc Meal/Workout
    SentAt = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<NotificationLog {self.Type} User={self.User_id}>"
