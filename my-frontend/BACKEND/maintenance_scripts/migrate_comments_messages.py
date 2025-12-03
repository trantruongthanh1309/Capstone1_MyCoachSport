# -*- coding: utf-8 -*-
"""
Migration script: Chuyển cột Content của Comments và Messages sang NVARCHAR
"""
import pyodbc

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
    print("\n🔄 Bắt đầu migration VARCHAR → NVARCHAR cho Comments và Messages...")
    
    # Danh sách các cột cần chuyển đổi
    migrations = [
        ("Comments", "Content", "NVARCHAR(MAX)"),
        ("Messages", "Content", "NVARCHAR(MAX)")
    ]
    
    for table, column, new_type in migrations:
        try:
            sql = f"ALTER TABLE {table} ALTER COLUMN {column} {new_type}"
            print(f"\n📝 {table}.{column}: VARCHAR → {new_type}")
            cursor.execute(sql)
            conn.commit()
            print(f"   ✅ Thành công!")
        except Exception as e:
            if "does not exist" in str(e):
                print(f"   ⚠️  Bảng hoặc cột chưa tồn tại, bỏ qua...")
            else:
                print(f"   ❌ Lỗi: {e}")
    
    print("\n" + "=" * 60)
    print("✅ HOÀN TẤT MIGRATION!")
    
    conn.close()
    
except Exception as e:
    print(f"\n❌ Lỗi kết nối: {e}")
    import traceback
    traceback.print_exc()
