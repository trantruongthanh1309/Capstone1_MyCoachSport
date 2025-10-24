# models/user_schedule.py
from db import db

class UserSchedule(db.Model):
    __tablename__ = 'UserSchedule'

    Id = db.Column(db.Integer, primary_key=True)
    User_id = db.Column(db.Integer, db.ForeignKey('Users.Id'), nullable=False)
    DayOfWeek = db.Column(db.String(10), nullable=False)  # "mon", "tue", ...
    Period = db.Column(db.String(10), nullable=False)     # "sáng", "trưa", "tối"
    Note = db.Column(db.String(200))
    CreatedAt = db.Column(db.DateTime, default=db.func.now())