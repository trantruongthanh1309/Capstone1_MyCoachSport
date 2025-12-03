"""
Script đơn giản để tạo social tables
Chỉ tạo nếu chưa tồn tại
"""
from app import app
from db import db
import sqlalchemy as sa

with app.app_context():
    # Lấy inspector để check tables
    inspector = sa.inspect(db.engine)
    existing_tables = inspector.get_table_names()
    
    print(f"📋 Tables hiện có: {existing_tables}")
    
    # Tạo từng table riêng lẻ
    from models.social_models import Post, Comment, Like, Share, Conversation, Message
    
    # Chỉ tạo tables chưa tồn tại
    tables_to_create = []
    
    if 'SocialPosts' not in existing_tables:
        tables_to_create.append(Post.__table__)
    if 'Comments' not in existing_tables:
        tables_to_create.append(Comment.__table__)
    if 'Likes' not in existing_tables:
        tables_to_create.append(Like.__table__)
    if 'Shares' not in existing_tables:
        tables_to_create.append(Share.__table__)
    if 'Conversations' not in existing_tables:
        tables_to_create.append(Conversation.__table__)
    if 'Messages' not in existing_tables:
        tables_to_create.append(Message.__table__)
    
    if tables_to_create:
        db.metadata.create_all(db.engine, tables=tables_to_create)
        print(f"✅ Đã tạo {len(tables_to_create)} tables mới!")
    else:
        print("ℹ️ Tất cả tables đã tồn tại!")
