"""
Migration script: Them cot SharedPostId vao bang Messages
"""
# -*- coding: utf-8 -*-
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
    
    print("Ket noi thanh cong!")
    print("\nBat dau them cot SharedPostId vao bang Messages...")
    
    # Kiem tra xem cot da ton tai chua
    cursor.execute("""
        SELECT COUNT(*) 
        FROM sys.columns 
        WHERE object_id = OBJECT_ID(N'[dbo].[Messages]') 
        AND name = 'SharedPostId'
    """)
    
    if cursor.fetchone()[0] > 0:
        print("Cot SharedPostId da ton tai, bo qua...")
    else:
        # Them cot
        print("Them cot SharedPostId...")
        cursor.execute("""
            ALTER TABLE [dbo].[Messages]
            ADD [SharedPostId] INT NULL
        """)
        conn.commit()
        print("   Da them cot SharedPostId")
        
        # Them foreign key constraint
        print("Them foreign key constraint...")
        try:
            cursor.execute("""
                ALTER TABLE [dbo].[Messages]
                ADD CONSTRAINT FK_Messages_SharedPost 
                FOREIGN KEY ([SharedPostId]) 
                REFERENCES [dbo].[SocialPosts](Id) 
                ON DELETE SET NULL
            """)
            conn.commit()
            print("   Da them foreign key constraint")
        except Exception as fk_error:
            print(f"   Loi khi them foreign key (co the da ton tai): {fk_error}")
    
    print("\n" + "=" * 60)
    print("HOAN TAT MIGRATION!")
    
    conn.close()
    
except Exception as e:
    print(f"\nLoi ket noi: {e}")
    import traceback
    traceback.print_exc()

