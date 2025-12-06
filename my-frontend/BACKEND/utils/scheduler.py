from datetime import datetime
from db import db
from models.user_schedule import UserSchedule

def get_free_time_slots(work_schedule: dict, target_date: str, user_id: int):
    """
    Trả về danh sách khung giờ rảnh trong ngày
    work_schedule: {"mon": ["08-12", "14-18"], ...}
    user_id: ID người dùng → để tra bảng UserSchedule
    """
    dt = datetime.strptime(target_date, "%Y-%m-%d")
    day_map = {
        0: "mon", 1: "tue", 2: "wed", 3: "thu",
        4: "fri", 5: "sat", 6: "sun"
    }
    weekday_key = day_map[dt.weekday()]

    busy_slots = UserSchedule.query.filter_by(
        User_id=user_id,
        DayOfWeek=weekday_key
    ).all()

    busy_periods = set()
    for slot in busy_slots:
        if slot.Period:
            busy_periods.add(slot.Period)

    all_periods = ["sáng", "trưa", "tối"]
    free_periods = [p for p in all_periods if p not in busy_periods]
    
    time_map = {
        "sáng": "06:00-09:00",
        "trưa": "12:00-14:00",
        "tối": "18:00-21:00"
    }
    return [time_map[p] for p in free_periods]