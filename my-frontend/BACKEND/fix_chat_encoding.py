from app import app, db
from sqlalchemy import text

with app.app_context():
    try:
        # Xóa toàn bộ lịch sử chat cũ (bị lỗi encoding)
        db.session.execute(text("DELETE FROM ChatHistory"))
        db.session.commit()
        print("✅ Đã xóa lịch sử chat cũ!")
        
        # Alter columns to NVARCHAR with Vietnamese collation
        db.session.execute(text("""
            ALTER TABLE ChatHistory
            ALTER COLUMN Message NVARCHAR(MAX) COLLATE Vietnamese_CI_AS
        """))
        
        db.session.execute(text("""
            ALTER TABLE ChatHistory
            ALTER COLUMN Response NVARCHAR(MAX) COLLATE Vietnamese_CI_AS
        """))
        
        db.session.commit()
        print("✅ Đã sửa encoding cho bảng ChatHistory!")
        
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        db.session.rollback()
