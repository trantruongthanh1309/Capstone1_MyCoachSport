# -*- coding: utf-8 -*-
"""
Script để kiểm tra kiểu dữ liệu của các cột
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
    
    # Kiểm tra kiểu dữ liệu của các cột
    cursor.execute("""
        SELECT 
            c.name AS ColumnName,
            t.name AS DataType,
            c.max_length AS MaxLength,
            c.is_nullable AS IsNullable
        FROM sys.columns c
        INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
        INNER JOIN sys.tables tb ON c.object_id = tb.object_id
        WHERE tb.name = 'SocialPosts'
        AND c.name IN ('Title', 'Content', 'Sport', 'Topic')
        ORDER BY c.name
    """)
    
    print("\n📋 Kiểu dữ liệu của các cột text:")
    print("-" * 60)
    for row in cursor.fetchall():
        data_type = row.DataType
        if data_type == 'varchar':
            status = "❌ VARCHAR - KHÔNG hỗ trợ tiếng Việt đầy đủ!"
        elif data_type == 'nvarchar':
            status = "✅ NVARCHAR - Hỗ trợ Unicode/tiếng Việt"
        else:
            status = f"⚠️  {data_type}"
        
        print(f"{row.ColumnName:15} | {data_type:10} | Max: {row.MaxLength:5} | {status}")
    
    print("\n" + "=" * 60)
    print("💡 KẾT LUẬN:")
    print("   - Nếu thấy VARCHAR: CẦN CHUYỂN SANG NVARCHAR")
    print("   - Nếu thấy NVARCHAR: Encoding đã đúng, vấn đề ở code Python")
    
    conn.close()
    
except Exception as e:
    print(f"❌ Lỗi: {e}")
