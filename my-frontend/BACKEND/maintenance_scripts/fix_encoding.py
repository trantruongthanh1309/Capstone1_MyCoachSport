"""
Script để sửa dữ liệu tiếng Việt bị lỗi encoding trong database
"""
import pyodbc

conn_str = (
    'DRIVER={ODBC Driver 17 for SQL Server};'
    'SERVER=MSI\\SQLEXPRESS01;'
    'DATABASE=MySportCoachAI;'
    'UID=sa;'
    'PWD=123;'
    'CHARSET=UTF8;'
)

try:
    conn = pyodbc.connect(conn_str)
    conn.setdecoding(pyodbc.SQL_CHAR, encoding='utf-8')
    conn.setdecoding(pyodbc.SQL_WCHAR, encoding='utf-8')
    conn.setencoding(encoding='utf-8')
    
    cursor = conn.cursor()
    
    print("✅ Kết nối thành công với UTF-8 encoding!")
    
    cursor.execute("""
        SELECT Id, Title, Content, Sport, Topic 
        FROM SocialPosts 
        WHERE Title LIKE '%?%' OR Content LIKE '%?%' OR Sport LIKE '%?%' OR Topic LIKE '%?%'
    """)
    
    broken_posts = cursor.fetchall()
    print(f"\n📊 Tìm thấy {len(broken_posts)} bài post có ký tự lỗi")
    
    if len(broken_posts) > 0:
        print("\n⚠️  CẢNH BÁO: Dữ liệu đã bị lưu sai encoding vào database.")
        print("   Giải pháp: Xóa các bài post lỗi và đăng lại với encoding đúng.")
        print("\n   Các bài post bị lỗi:")
        for post in broken_posts[:5]:
            print(f"   - ID {post.Id}: {post.Title}")
    
    test_title = "Bài test tiếng Việt: Lịch tập luyện"
    test_content = "Hôm nay tôi đã tập gym rất vui. Sức khỏe tốt!"
    
    cursor.execute("""
        INSERT INTO SocialPosts (User_id, Title, Content, Sport, Topic, CreatedAt)
        VALUES (?, ?, ?, ?, ?, GETDATE())
    """, (1, test_title, test_content, "Gym", "Tập luyện"))
    
    conn.commit()
    print(f"\n✅ Đã insert test post: '{test_title}'")
    
    cursor.execute("SELECT TOP 1 Title, Content FROM SocialPosts ORDER BY Id DESC")
    result = cursor.fetchone()
    print(f"✅ Đọc lại: Title = '{result.Title}'")
    print(f"           Content = '{result.Content}'")
    
    if "?" in result.Title or "?" in result.Content:
        print("\n❌ VẪN CÒN LỖI ENCODING!")
        print("   Nguyên nhân: SQL Server hoặc ODBC Driver không hỗ trợ UTF-8 đúng cách")
        print("   Giải pháp: Cần thay đổi collation của database hoặc dùng NVARCHAR thay vì VARCHAR")
    else:
        print("\n✅ ENCODING HOẠT ĐỘNG ĐÚNG!")
    
    conn.close()
    
except Exception as e:
    print(f"❌ Lỗi: {e}")
    import traceback
    traceback.print_exc()
