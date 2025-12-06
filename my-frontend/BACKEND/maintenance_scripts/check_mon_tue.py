import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.user_schedule import UserSchedule
from app import app

with app.app_context():
    mon_schedules = UserSchedule.query.filter_by(DayOfWeek='mon').all()
    print("=" * 60)
    print("LỊCH THỨ 2 (mon)")
    print("=" * 60)
    for s in mon_schedules:
        print(f"User: {s.User_id} | Note: {s.Note}")

    tue_schedules = UserSchedule.query.filter_by(DayOfWeek='tue').all()
    print("\n" + "=" * 60)
    print("LỊCH THỨ 3 (tue)")
    print("=" * 60)
    for s in tue_schedules:
        print(f"User: {s.User_id} | Note: {s.Note}")
