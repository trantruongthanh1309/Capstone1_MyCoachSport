from db import db
from datetime import datetime

class SystemSetting(db.Model):
    __tablename__ = 'SystemSettings'

    Key = db.Column(db.String(100), primary_key=True)
    Value = db.Column(db.Text, nullable=True)
    Description = db.Column(db.String(255), nullable=True)
    UpdatedAt = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    def to_dict(self):
        return {
            'key': self.Key,
            'value': self.Value,
            'description': self.Description,
            'updated_at': self.UpdatedAt.isoformat() if self.UpdatedAt else None
        }
