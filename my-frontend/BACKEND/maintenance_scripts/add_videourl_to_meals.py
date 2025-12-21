# -*- coding: utf-8 -*-
"""
Script to add VideoUrl column to Meals table
"""
import pyodbc
import sys
import io

# Set UTF-8 encoding for console output
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

conn_str = (
    'DRIVER={ODBC Driver 17 for SQL Server};'
    'SERVER=MSI\\SQLEXPRESS01;'
    'DATABASE=MySportCoachAI;'
    'UID=sa;'
    'PWD=123'
)

try:
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    
    print("✅ Kết nối thành công!")
    print("\n🔄 Bắt đầu thêm cột VideoUrl vào bảng Meals...")
    
    # Check if column exists
    cursor.execute("""
        SELECT COUNT(*) 
        FROM sys.columns 
        WHERE object_id = OBJECT_ID(N'[dbo].[Meals]') 
        AND name = 'VideoUrl'
    """)
    
    if cursor.fetchone()[0] > 0:
        print("⚠️ Cột VideoUrl đã tồn tại trong bảng Meals, bỏ qua...")
    else:
        # Add the column
        print("📝 Thêm cột VideoUrl...")
        cursor.execute("""
            ALTER TABLE [dbo].[Meals]
            ADD [VideoUrl] NVARCHAR(500) NULL
        """)
        conn.commit()
        print("   ✅ Đã thêm cột VideoUrl vào bảng Meals thành công!")
    
    print("\n" + "=" * 60)
    print("✅ HOÀN TẤT MIGRATION!")
    
    conn.close()
    
except Exception as e:
    print(f"\n❌ Lỗi: {e}")
    import traceback
    traceback.print_exc()

