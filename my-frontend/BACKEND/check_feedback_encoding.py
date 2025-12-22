"""Check Feedback table column types"""
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
    
    cursor.execute("""
        SELECT 
            c.name AS ColumnName,
            t.name AS DataType,
            c.max_length AS MaxLength
        FROM sys.columns c
        INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
        INNER JOIN sys.tables tb ON c.object_id = tb.object_id
        WHERE tb.name = 'Feedbacks'
        AND c.name IN ('Title', 'Message', 'Type', 'Status', 'Priority')
        ORDER BY c.name
    """)
    
    print("\nKieu du lieu cua cac cot trong Feedbacks:")
    print("-" * 60)
    for row in cursor.fetchall():
        data_type = row.DataType
        if data_type == 'varchar':
            status = "VARCHAR - KHONG ho tro tieng Viet!"
        elif data_type == 'nvarchar':
            status = "NVARCHAR - Ho tro Unicode/tieng Viet"
        else:
            status = f"{data_type}"
        
        print(f"{row.ColumnName:15} | {data_type:10} | Max: {row.MaxLength:5} | {status}")
    
    # Check sample data
    cursor.execute("SELECT TOP 1 Title, Message FROM Feedbacks ORDER BY Id DESC")
    sample = cursor.fetchone()
    if sample:
        print(f"\nDu lieu mau (moi nhat):")
        print(f"   Title: {sample.Title}")
        print(f"   Message: {sample.Message[:50] if sample.Message else 'None'}...")
        if sample.Title and '?' in str(sample.Title):
            print("   PHAT HIEN DAU '?' - CO LOI ENCODING!")
    
    conn.close()
    print("\nHoan thanh kiem tra!")
    
except Exception as e:
    print(f"Loi: {e}")
    import traceback
    traceback.print_exc()

