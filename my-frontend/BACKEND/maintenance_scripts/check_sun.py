# -*- coding: utf-8 -*-
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.user_schedule import UserSchedule
from app import app

with app.app_context():
    # Query lịch của Chủ Nhật (sun)
    sun_schedules = UserSchedule.query.filter_by(DayOfWeek='sun').all()
    print("=" * 60)
    print("LỊCH CHỦ NHẬT (sun)")
    print("=" * 60)
    for s in sun_schedules:
        print(f"User: {s.User_id} | Note: {s.Note}")
