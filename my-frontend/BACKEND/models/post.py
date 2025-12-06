from db import db
from datetime import datetime

class Post(db.Model):
    __tablename__ = 'Posts'

    Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    User_id = db.Column(db.Integer, db.ForeignKey('Users.Id'), nullable=False)
    Content = db.Column(db.Text, nullable=False)
    Image = db.Column(db.String(500), nullable=True)
    Status = db.Column(db.String(20), default='pending')
    ApprovedBy = db.Column(db.Integer, db.ForeignKey('Users.Id'), nullable=True)
    ApprovedAt = db.Column(db.DateTime, nullable=True)
    RejectionReason = db.Column(db.Text, nullable=True)
    CreatedAt = db.Column(db.DateTime, default=datetime.now, nullable=False)
    UpdatedAt = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    Likes = db.Column(db.Integer, default=0)
    Comments = db.Column(db.Integer, default=0)
    
    user = db.relationship('User', foreign_keys=[User_id], backref='posts')
    approver = db.relationship('User', foreign_keys=[ApprovedBy])

    def to_dict(self):
        return {
            'id': self.Id,
            'user_id': self.User_id,
            'user_name': self.user.Name if self.user else 'Unknown',
            'content': self.Content,
            'image': self.Image,
            'status': self.Status,
            'approved_by': self.ApprovedBy,
            'approved_at': self.ApprovedAt.isoformat() if self.ApprovedAt else None,
            'rejection_reason': self.RejectionReason,
            'created_at': self.CreatedAt.isoformat() if self.CreatedAt else None,
            'updated_at': self.UpdatedAt.isoformat() if self.UpdatedAt else None,
            'likes': self.Likes,
            'comments': self.Comments
        }

class AdminLog(db.Model):
    __tablename__ = 'AdminLogs'

    Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Admin_id = db.Column(db.Integer, db.ForeignKey('Users.Id'), nullable=False)
    Action = db.Column(db.String(100), nullable=False)
    TargetType = db.Column(db.String(50), nullable=False)
    TargetId = db.Column(db.Integer, nullable=False)
    Details = db.Column(db.Text, nullable=True)
    Timestamp = db.Column(db.DateTime, default=datetime.now, nullable=False)
    
    admin = db.relationship('User', backref='admin_logs')

    def to_dict(self):
        return {
            'id': self.Id,
            'admin_id': self.Admin_id,
            'admin_name': self.admin.Name if self.admin else 'Unknown',
            'action': self.Action,
            'target_type': self.TargetType,
            'target_id': self.TargetId,
            'details': self.Details,
            'timestamp': self.Timestamp.isoformat() if self.Timestamp else None
        }