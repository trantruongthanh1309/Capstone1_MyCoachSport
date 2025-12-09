from app import app, db
from sqlalchemy import text

def check_busy_format():
    with app.app_context():
        try:
            result = db.session.execute(text("SELECT Id, User_id, DayOfWeek, Period, Note FROM UserSchedule WHERE Note IS NOT NULL AND Note != ''")).fetchall()
            
            print("\n" + "="*100)
            print(f"BUSY SCHEDULES (Total: {len(result)})")
            print("="*100)
            
            for row in result:
                print(f"ID: {row[0]:4} | User: {row[1]:3} | DayOfWeek: {row[2]:10} | Period: {row[3]:15} | Note: {row[4]}")
            
            print("="*100 + "\n")
            
        except Exception as e:
            print(f"Error: {e}")
            import traceback
            traceback.print_exc()

if __name__ == '__main__':
    check_busy_format()
