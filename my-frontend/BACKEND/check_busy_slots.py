from app import app, db
from models.user_schedule import UserSchedule

def check_busy_schedule():
    with app.app_context():
        try:
            # Get all user schedules
            schedules = UserSchedule.query.all()
            
            print(f"\n{'='*80}")
            print(f"TOTAL SCHEDULES: {len(schedules)}")
            print(f"{'='*80}\n")
            
            for s in schedules:
                print(f"ID: {s.Id} | User: {s.User_id} | Day: {s.DayOfWeek} | Period: {s.Period} | Note: {s.Note}")
            
            print(f"\n{'='*80}")
            
        except Exception as e:
            print(f"Error: {e}")

if __name__ == '__main__':
    check_busy_schedule()
