from db import db
from datetime import datetime

class Account(db.Model):
    __tablename__ = 'accounts'

    Id = db.Column(db.Integer, primary_key=True)
    Email = db.Column(db.String(100), nullable=False, unique=True)
    Password = db.Column(db.String(100), nullable=False)
    Role = db.Column(db.String(20), default='user')
    User_id = db.Column(db.Integer, db.ForeignKey('Users.Id'))
    
    ResetToken = db.Column(db.String(6))
    ResetTokenExpiry = db.Column(db.DateTime)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)
