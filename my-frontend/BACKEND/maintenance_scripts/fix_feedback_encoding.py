"""
Script để fix Feedback table columns sang NVARCHAR để hỗ trợ tiếng Việt
Chạy script này để update các cột từ VARCHAR sang NVARCHAR
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
    # Set encoding for connection
    conn.setdecoding(pyodbc.SQL_CHAR, encoding='utf-8')
    conn.setdecoding(pyodbc.SQL_WCHAR, encoding='utf-8')
    conn.setencoding(encoding='utf-8')
    
    cursor = conn.cursor()
    
    print("✅ Kết nối thành công!")
    print("\n🔄 Bắt đầu migration Feedback table: VARCHAR → NVARCHAR...")
    
    migrations = [
        ("Type", "NVARCHAR(50) NOT NULL"),
        ("Title", "NVARCHAR(200) NOT NULL"),
        ("Message", "NVARCHAR(MAX) NOT NULL"),
        ("Status", "NVARCHAR(20)"),
        ("Priority", "NVARCHAR(20)"),
        ("Response", "NVARCHAR(MAX)")
    ]
    
    for column_name, new_type in migrations:
        try:
            sql = f"ALTER TABLE Feedbacks ALTER COLUMN {column_name} {new_type}"
            print(f"\n📝 {column_name}: VARCHAR → {new_type}")
            cursor.execute(sql)
            conn.commit()
            print(f"   ✅ Thành công!")
        except Exception as e:
            error_msg = str(e)
            if "does not exist" in error_msg or "Invalid column" in error_msg:
                print(f"   ⚠️  Cột chưa tồn tại hoặc đã đúng kiểu, bỏ qua...")
            else:
                print(f"   ❌ Lỗi: {error_msg}")
    
    print("\n" + "=" * 60)
    print("✅ HOÀN TẤT MIGRATION!")
    print("\n💡 Lưu ý:")
    print("   - Dữ liệu CŨ đã lưu sai encoding sẽ KHÔNG tự động sửa được")
    print("   - Cần XÓA các feedback cũ và gửi lại")
    print("   - Từ giờ, mọi feedback MỚI sẽ lưu tiếng Việt ĐÚNG")
    
    conn.close()
    
except Exception as e:
    print(f"\n❌ Lỗi kết nối: {e}")
    import traceback
    traceback.print_exc()















