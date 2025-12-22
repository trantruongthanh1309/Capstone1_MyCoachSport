"""Run migration to fix Feedback encoding"""
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
    
    print("Ket noi thanh cong!")
    print("\nBat dau migration Feedbacks: VARCHAR -> NVARCHAR...")
    
    migrations = [
        ("Title", "NVARCHAR(200)"),
        ("Message", "NVARCHAR(MAX)"),
        ("Type", "NVARCHAR(50)"),
        ("Status", "NVARCHAR(20)"),
        ("Priority", "NVARCHAR(20)"),
        ("Response", "NVARCHAR(MAX)")
    ]
    
    for column_name, new_type in migrations:
        try:
            sql = f"ALTER TABLE Feedbacks ALTER COLUMN {column_name} {new_type}"
            print(f"\n{column_name}: VARCHAR -> {new_type}")
            cursor.execute(sql)
            conn.commit()
            print(f"   Thanh cong!")
        except Exception as e:
            if "does not exist" in str(e):
                print(f"   Cot chua ton tai, bo qua...")
            else:
                print(f"   Loi: {e}")
    
    print("\n" + "=" * 60)
    print("Hoan thanh migration!")
    print("\nLuu y:")
    print("   - Du lieu CU da luu sai encoding se KHONG tu dong sua duoc")
    print("   - Can XOA cac feedback cu va gui lai")
    print("   - Tu gio, moi feedback MOI se luu tieng Viet DUNG")
    
    conn.close()
    
except Exception as e:
    print(f"\nLoi ket noi: {e}")
    import traceback
    traceback.print_exc()

