from db import db
from datetime import datetime

class Feedback(db.Model):
    __tablename__ = 'Feedbacks'

    Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    User_id = db.Column(db.Integer, db.ForeignKey('Users.Id'), nullable=False)
    Type = db.Column(db.Unicode(50), nullable=False)
    Title = db.Column(db.Unicode(200), nullable=False)
    Message = db.Column(db.UnicodeText, nullable=False)
    Status = db.Column(db.Unicode(20), default='pending')
    Priority = db.Column(db.Unicode(20), default='low')
    Response = db.Column(db.UnicodeText, nullable=True)
    CreatedAt = db.Column(db.DateTime, default=datetime.now, nullable=False)
    UpdatedAt = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    user = db.relationship('User', backref='feedbacks')

    def to_dict(self):
        return {
            'id': self.Id,
            'user_id': self.User_id,
            'user_name': self.user.Name if self.user else 'Unknown',
            'user_email': self.user.Email if self.user else 'Unknown',
            'type': self.Type,
            'title': self.Title,
            'message': self.Message,
            'status': self.Status,
            'priority': self.Priority,
            'response': self.Response,
            'created_at': self.CreatedAt.isoformat() if self.CreatedAt else None,
            'updated_at': self.UpdatedAt.isoformat() if self.UpdatedAt else None
        }
