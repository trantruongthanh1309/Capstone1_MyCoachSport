"""
Script to fix Feedback table columns to support Unicode (Vietnamese characters)
Run this script to update existing Feedback table columns from VARCHAR to NVARCHAR
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app, db
from sqlalchemy import text

def fix_feedback_unicode():
    """Update Feedback table columns to NVARCHAR for Unicode support"""
    with app.app_context():
        try:
            print("🔄 Đang cập nhật bảng Feedbacks để hỗ trợ Unicode...")
            
            # Check if table exists
            result = db.session.execute(text("""
                SELECT COUNT(*) as count 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_NAME = 'Feedbacks'
            """))
            table_exists = result.fetchone()[0] > 0
            
            if not table_exists:
                print("⚠️ Bảng Feedbacks chưa tồn tại. Nó sẽ được tạo với Unicode khi model được sử dụng.")
                return
            
            # Update Type column
            try:
                db.session.execute(text("""
                    ALTER TABLE Feedbacks 
                    ALTER COLUMN Type NVARCHAR(50) NOT NULL
                """))
                print("✅ Đã cập nhật cột Type")
            except Exception as e:
                print(f"⚠️ Lỗi khi cập nhật Type: {e}")
            
            # Update Title column
            try:
                db.session.execute(text("""
                    ALTER TABLE Feedbacks 
                    ALTER COLUMN Title NVARCHAR(200) NOT NULL
                """))
                print("✅ Đã cập nhật cột Title")
            except Exception as e:
                print(f"⚠️ Lỗi khi cập nhật Title: {e}")
            
            # Update Message column
            try:
                db.session.execute(text("""
                    ALTER TABLE Feedbacks 
                    ALTER COLUMN Message NVARCHAR(MAX) NOT NULL
                """))
                print("✅ Đã cập nhật cột Message")
            except Exception as e:
                print(f"⚠️ Lỗi khi cập nhật Message: {e}")
            
            # Update Status column
            try:
                db.session.execute(text("""
                    ALTER TABLE Feedbacks 
                    ALTER COLUMN Status NVARCHAR(20)
                """))
                print("✅ Đã cập nhật cột Status")
            except Exception as e:
                print(f"⚠️ Lỗi khi cập nhật Status: {e}")
            
            # Update Priority column
            try:
                db.session.execute(text("""
                    ALTER TABLE Feedbacks 
                    ALTER COLUMN Priority NVARCHAR(20)
                """))
                print("✅ Đã cập nhật cột Priority")
            except Exception as e:
                print(f"⚠️ Lỗi khi cập nhật Priority: {e}")
            
            # Update Response column
            try:
                db.session.execute(text("""
                    ALTER TABLE Feedbacks 
                    ALTER COLUMN Response NVARCHAR(MAX)
                """))
                print("✅ Đã cập nhật cột Response")
            except Exception as e:
                print(f"⚠️ Lỗi khi cập nhật Response: {e}")
            
            db.session.commit()
            print("\n✅ Hoàn thành! Bảng Feedbacks đã được cập nhật để hỗ trợ Unicode.")
            print("📝 Bây giờ bạn có thể lưu và hiển thị tiếng Việt đúng cách.")
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Lỗi: {e}")
            import traceback
            traceback.print_exc()

if __name__ == '__main__':
    fix_feedback_unicode()

