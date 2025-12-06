from db import db
from datetime import datetime

class Feedback(db.Model):
    __tablename__ = 'Feedbacks'

    Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    User_id = db.Column(db.Integer, db.ForeignKey('Users.Id'), nullable=False)
    Type = db.Column(db.String(50), nullable=False)  # bug, feature, general
    Title = db.Column(db.String(200), nullable=False)
    Message = db.Column(db.Text, nullable=False)
    Status = db.Column(db.String(20), default='pending')  # pending, resolved
    Priority = db.Column(db.String(20), default='low')  # low, medium, high
    Response = db.Column(db.Text, nullable=True)
    CreatedAt = db.Column(db.DateTime, default=datetime.now, nullable=False)
    UpdatedAt = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    # Relationship
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
