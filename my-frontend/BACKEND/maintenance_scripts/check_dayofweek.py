# -*- coding: utf-8 -*-
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.user_schedule import UserSchedule
from db import db
from app import app

with app.app_context():
    # Lấy 10 record đầu tiên có DayOfWeek
    schedules = UserSchedule.query.filter(UserSchedule.DayOfWeek.isnot(None)).limit(10).all()
    
    print("=" * 60)
    print("KIỂM TRA DayOfWeek TRONG DATABASE")
    print("=" * 60)
    
    if not schedules:
        print("Không có lịch nào có DayOfWeek!")
    else:
        for s in schedules:
            print(f"ID: {s.Id} | User: {s.User_id} | DayOfWeek: '{s.DayOfWeek}' | Period: {s.Period} | Note: {s.Note}")
