"""
Migration script để thêm cột ProfileHash vào bảng UserPlans
Chạy script này để cập nhật database
"""

from sqlalchemy import create_engine, text

db_url = 'mssql+pyodbc://sa:123@MSI\\SQLEXPRESS01/MySportCoachAI?driver=ODBC+Driver+17+for+SQL+Server'
engine = create_engine(db_url)

try:
    with engine.connect() as conn:
        check_query = text("""
            SELECT COUNT(*) as col_count
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'UserPlans' AND COLUMN_NAME = 'ProfileHash'
        """)
        
        result = conn.execute(check_query).fetchone()
        
        if result[0] == 0:
            alter_query = text("""
                ALTER TABLE UserPlans
                ADD ProfileHash VARCHAR(32) NULL
            """)
            
            conn.execute(alter_query)
            conn.commit()
            print("✅ Đã thêm cột ProfileHash vào bảng UserPlans thành công!")
        else:
            print("ℹ️ Cột ProfileHash đã tồn tại, không cần migration")
            
except Exception as e:
    print(f"❌ Lỗi khi migration: {e}")
