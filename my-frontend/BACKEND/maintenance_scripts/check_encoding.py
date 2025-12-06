"""
Script để kiểm tra và sửa encoding tiếng Việt trong SQL Server
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
    
    cursor.execute("""
        SELECT DATABASEPROPERTYEX('MySportCoachAI', 'Collation') AS DatabaseCollation
    """)
    db_collation = cursor.fetchone()[0]
    print(f"📊 Database Collation: {db_collation}")
    
    cursor.execute("""
        SELECT 
            c.name AS ColumnName,
            c.collation_name AS Collation
        FROM sys.columns c
        INNER JOIN sys.tables t ON c.object_id = t.object_id
        WHERE t.name = 'SocialPosts'
        AND c.collation_name IS NOT NULL
    """)
    
    print("\n📋 Collation của các cột text trong SocialPosts:")
    for row in cursor.fetchall():
        print(f"  - {row.ColumnName}: {row.Collation}")
    
    print("\n💡 Để hỗ trợ tiếng Việt tốt nhất, nên dùng collation: Vietnamese_CI_AS")
    print("   Hoặc: SQL_Latin1_General_CP1_CI_AS")
    
    cursor.execute("SELECT TOP 3 Title, Content FROM SocialPosts WHERE Title IS NOT NULL")
    print("\n📝 Dữ liệu mẫu:")
    for row in cursor.fetchall():
        print(f"  Title: {row.Title}")
        print(f"  Content: {row.Content[:50] if row.Content else 'None'}...")
        print()
    
    conn.close()
    print("✅ Hoàn thành kiểm tra!")
    
except Exception as e:
    print(f"❌ Lỗi: {e}")
