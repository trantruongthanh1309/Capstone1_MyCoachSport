from db import db
from datetime import datetime

class ChatHistory(db.Model):
    __tablename__ = 'ChatHistory'
    
    Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    User_id = db.Column(db.Integer, db.ForeignKey('Users.Id'), nullable=False)
    Message = db.Column(db.Text, nullable=False)
    Response = db.Column(db.Text, nullable=False)
    Timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    user = db.relationship('User', backref=db.backref('chat_history', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.Id,
            'user_id': self.User_id,
            'message': self.Message,
            'response': self.Response,
            'timestamp': self.Timestamp.isoformat() if self.Timestamp else None
        }
