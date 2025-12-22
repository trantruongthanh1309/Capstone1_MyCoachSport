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
        # Ensure all string values are properly encoded
        def ensure_unicode(value):
            if value is None:
                return None
            if isinstance(value, bytes):
                try:
                    return value.decode('utf-8', errors='replace')
                except:
                    return value.decode('latin-1', errors='replace')
            if isinstance(value, str):
                # Try to fix any encoding issues
                try:
                    # If it's already valid UTF-8, return as is
                    value.encode('utf-8')
                    return value
                except:
                    # If not, try to decode and re-encode
                    try:
                        return value.encode('latin-1').decode('utf-8', errors='replace')
                    except:
                        return value
            return str(value)
        
        return {
            'id': self.Id,
            'user_id': self.User_id,
            'user_name': ensure_unicode(self.user.Name) if self.user else 'Unknown',
            'user_email': ensure_unicode(self.user.Email) if self.user else 'Unknown',
            'type': ensure_unicode(self.Type),
            'title': ensure_unicode(self.Title),
            'message': ensure_unicode(self.Message),
            'status': ensure_unicode(self.Status),
            'priority': ensure_unicode(self.Priority),
            'response': ensure_unicode(self.Response),
            'created_at': self.CreatedAt.isoformat() if self.CreatedAt else None,
            'updated_at': self.UpdatedAt.isoformat() if self.UpdatedAt else None
        }
