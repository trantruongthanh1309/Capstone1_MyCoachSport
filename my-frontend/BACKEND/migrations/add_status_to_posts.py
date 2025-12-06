# Migration: Add Status column to SocialPosts table
# Run this script ONCE to add the Status field

from db import db
from app import app

def add_status_column():
    with app.app_context():
        try:
            # Add Status column với giá trị mặc định 'Approved' cho bài cũ
            db.engine.execute("""
                IF NOT EXISTS (
                    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = 'SocialPosts' AND COLUMN_NAME = 'Status'
                )
                BEGIN
                    ALTER TABLE SocialPosts
                    ADD Status NVARCHAR(20) NOT NULL DEFAULT 'Approved'
                END
            """)
            print("✅ Successfully added Status column to SocialPosts!")
            print("   - Existing posts: Status = 'Approved'")
            print("   - New posts: Status = 'Pending' (default in code)")
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == '__main__':
    add_status_column()
