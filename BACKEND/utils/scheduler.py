# utils/scheduler.py
from datetime import datetime

def get_free_time_slots(work_schedule: dict, target_date: str) -> list:
    """
    Trả về danh sách khung giờ rảnh trong ngày
    work_schedule: { "mon": ["09-12", "14-18"], ... }
    target_date: "2025-10-18"
    """
    # Chuyển ngày thành thứ (mon, tue, wed...)
    dt = datetime.strptime(target_date, "%Y-%m-%d")
    day_name = dt.strftime("%a").lower()[:3]  # mon, tue, wed...

    busy_slots = work_schedule.get(day_name, [])

    # Tạo tất cả slot từ 6h đến 22h (mỗi slot 1 tiếng)
    all_slots = [f"{h:02d}:00-{h+1:02d}:00" for h in range(6, 22)]

    # Lọc các slot không trùng với lịch làm việc
    free_slots = []
    for slot in all_slots:
        start_h, end_h = map(int, slot.split('-')[0].split(':'))
        slot_start = start_h
        slot_end = end_h

        is_busy = False
        for busy in busy_slots:
            if '-' in busy:
                b_start, b_end = map(int, busy.split('-'))
                if max(slot_start, b_start) < min(slot_end, b_end):
                    is_busy = True
                    break

        if not is_busy:
            free_slots.append(slot)

    return free_slots[:3]  # chỉ lấy tối đa 3 slot