from db import db
from datetime import datetime

class Post(db.Model):
    __tablename__ = 'SocialPosts'
    
    Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    User_id = db.Column(db.Integer, db.ForeignKey('Users.Id'), nullable=False)
    Content = db.Column(db.UnicodeText, nullable=False)
    Title = db.Column(db.Unicode(255))
    Sport = db.Column(db.Unicode(50))
    Topic = db.Column(db.Unicode(50))
    ImageUrl = db.Column(db.UnicodeText) # ✅ NVARCHAR(MAX) - URL hoặc base64 của ảnh
    Status = db.Column(db.Unicode(20), nullable=False, default='Pending')
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    UpdatedAt = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = db.relationship('User', backref=db.backref('social_posts', lazy=True))
    comments = db.relationship('Comment', backref='post', lazy=True, cascade='all, delete-orphan')
    likes = db.relationship('Like', backref='post', lazy=True, cascade='all, delete-orphan')
    shares = db.relationship('Share', backref='post', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self, current_user_id=None):
        return {
            'id': self.Id,
            'user_id': self.User_id,
            'user_name': self.user.Name if self.user else 'Unknown',
            'user_avatar': self.user.Avatar if self.user else None,
            'title': self.Title,
            'sport': self.Sport,
            'topic': self.Topic,
            'content': self.Content,
            'image_url': self.ImageUrl,
            'created_at': self.CreatedAt.isoformat() if self.CreatedAt else None,
            'likes_count': len(self.likes),
            'comments_count': len(self.comments),
            'shares_count': len(self.shares),
            'is_liked': any(like.User_id == current_user_id for like in self.likes) if current_user_id else False
        }

class Comment(db.Model):
    __tablename__ = 'Comments'
    
    Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Post_id = db.Column(db.Integer, db.ForeignKey('SocialPosts.Id'), nullable=False)
    User_id = db.Column(db.Integer, db.ForeignKey('Users.Id'), nullable=False)
    Content = db.Column(db.UnicodeText, nullable=False)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    user = db.relationship('User', backref=db.backref('comments', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.Id,
            'post_id': self.Post_id,
            'user_id': self.User_id,
            'user_name': self.user.Name if self.user else 'Unknown',
            'user_avatar': self.user.Avatar if self.user else None,
            'content': self.Content,
            'created_at': self.CreatedAt.isoformat() if self.CreatedAt else None
        }

class Like(db.Model):
    __tablename__ = 'Likes'
    
    Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Post_id = db.Column(db.Integer, db.ForeignKey('SocialPosts.Id'), nullable=False)
    User_id = db.Column(db.Integer, db.ForeignKey('Users.Id'), nullable=False)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    __table_args__ = (db.UniqueConstraint('Post_id', 'User_id', name='unique_post_user_like'),)
    
    user = db.relationship('User', backref=db.backref('likes', lazy=True))

class Share(db.Model):
    __tablename__ = 'Shares'
    
    Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Post_id = db.Column(db.Integer, db.ForeignKey('SocialPosts.Id'), nullable=False)
    User_id = db.Column(db.Integer, db.ForeignKey('Users.Id'), nullable=False)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    user = db.relationship('User', backref=db.backref('shares', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.Id,
            'post_id': self.Post_id,
            'user_id': self.User_id,
            'user_name': self.user.Name if self.user else 'Unknown',
            'created_at': self.CreatedAt.isoformat() if self.CreatedAt else None
        }

class Conversation(db.Model):
    __tablename__ = 'Conversations'
    
    Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    User1_id = db.Column(db.Integer, db.ForeignKey('Users.Id'), nullable=False)
    User2_id = db.Column(db.Integer, db.ForeignKey('Users.Id'), nullable=False)
    LastMessageAt = db.Column(db.DateTime, default=datetime.utcnow)
    
    messages = db.relationship('Message', backref='conversation', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self, current_user_id):
        other_user_id = self.User2_id if self.User1_id == current_user_id else self.User1_id
        from models.user_model import User
        other_user = User.query.get(other_user_id)
        
        last_message = db.session.query(Message).filter_by(Conversation_id=self.Id)\
            .order_by(Message.CreatedAt.desc()).first()
        
        return {
            'id': self.Id,
            'other_user': {
                'id': other_user.Id,
                'name': other_user.Name,
                'avatar': other_user.Avatar
            } if other_user else None,
            'last_message': last_message.to_dict() if last_message else None,
            'last_message_at': self.LastMessageAt.isoformat() if self.LastMessageAt else None
        }

class Message(db.Model):
    __tablename__ = 'Messages'
    
    Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Conversation_id = db.Column(db.Integer, db.ForeignKey('Conversations.Id'), nullable=False)
    Sender_id = db.Column(db.Integer, db.ForeignKey('Users.Id'), nullable=False)
    Content = db.Column(db.UnicodeText, nullable=False)
    IsRead = db.Column(db.Boolean, default=False)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    sender = db.relationship('User', backref=db.backref('sent_messages', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.Id,
            'conversation_id': self.Conversation_id,
            'sender_id': self.Sender_id,
            'sender_name': self.sender.Name if self.sender else 'Unknown',
            'content': self.Content,
            'is_read': self.IsRead,
            'created_at': self.CreatedAt.isoformat() if self.CreatedAt else None
        }
