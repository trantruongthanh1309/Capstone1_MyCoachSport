"""
Migration script: Chuyển các cột VARCHAR sang NVARCHAR để hỗ trợ tiếng Việt
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
    print("\n🔄 Bắt đầu migration VARCHAR → NVARCHAR...")
    
    migrations = [
        ("Title", "NVARCHAR(255)"),
        ("Content", "NVARCHAR(MAX)"),
        ("Sport", "NVARCHAR(50)"),
        ("Topic", "NVARCHAR(50)"),
        ("ImageUrl", "NVARCHAR(MAX)")
    ]
    
    for column_name, new_type in migrations:
        try:
            sql = f"ALTER TABLE SocialPosts ALTER COLUMN {column_name} {new_type}"
            print(f"\n📝 {column_name}: VARCHAR → {new_type}")
            cursor.execute(sql)
            conn.commit()
            print(f"   ✅ Thành công!")
        except Exception as e:
            if "does not exist" in str(e):
                print(f"   ⚠️  Cột chưa tồn tại, bỏ qua...")
            else:
                print(f"   ❌ Lỗi: {e}")
    
    print("\n" + "=" * 60)
    print("✅ HOÀN TẤT MIGRATION!")
    print("\n💡 Lưu ý:")
    print("   - Dữ liệu CŨ đã lưu sai encoding sẽ KHÔNG tự động sửa được")
    print("   - Cần XÓA các bài post cũ và đăng lại")
    print("   - Từ giờ, mọi bài post MỚI sẽ lưu tiếng Việt ĐÚNG")
    
    conn.close()
    
except Exception as e:
    print(f"\n❌ Lỗi kết nối: {e}")
    import traceback
    traceback.print_exc()
