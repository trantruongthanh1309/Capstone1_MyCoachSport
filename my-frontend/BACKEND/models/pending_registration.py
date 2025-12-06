from db import db
from datetime import datetime

class PendingRegistration(db.Model):
    __tablename__ = 'PendingRegistrations'
    
    Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Email = db.Column(db.String(100), nullable=False)
    Password = db.Column(db.String(255), nullable=False)
    Name = db.Column(db.String(100))
    OTP = db.Column(db.String(6))
    OTPExpiry = db.Column(db.DateTime)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<PendingRegistration {self.Email}>"
