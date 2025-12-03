# -*- coding: utf-8 -*-
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.user_schedule import UserSchedule
from app import app

with app.app_context():
    # Lấy tất cả lịch tuần của user 18 (User trong log trước)
    # Nếu không biết user id, lấy hết
    schedules = UserSchedule.query.filter(UserSchedule.DayOfWeek.isnot(None)).all()
    
    print("=" * 60)
    print("KIỂM TRA TOÀN BỘ LỊCH TUẦN")
    print("=" * 60)
    
    for s in schedules:
        print(f"User: {s.User_id} | Day: '{s.DayOfWeek}' | Period: {s.Period} | Note: {s.Note}")
