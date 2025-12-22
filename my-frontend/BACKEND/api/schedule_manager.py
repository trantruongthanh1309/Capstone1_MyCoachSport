from flask import Blueprint, request, jsonify, session
from db import db
from models.user_schedule import UserSchedule
from models import UserPlan
from datetime import datetime, timedelta

schedule_bp = Blueprint('schedule', __name__, url_prefix='/api/schedule')

@schedule_bp.route('/busy', methods=['GET'])
def get_busy_slots():
    if 'user_id' not in session:
        return jsonify({"error": "Chưa đăng nhập"}), 401
    
    user_id = session['user_id']
    slots = UserSchedule.query.filter_by(User_id=user_id).all()
    
    schedule = {
        "mon": {"morning": None, "afternoon": None, "evening": None},
        "tue": {"morning": None, "afternoon": None, "evening": None},
        "wed": {"morning": None, "afternoon": None, "evening": None},
        "thu": {"morning": None, "afternoon": None, "evening": None},
        "fri": {"morning": None, "afternoon": None, "evening": None},
        "sat": {"morning": None, "afternoon": None, "evening": None},
        "sun": {"morning": None, "afternoon": None, "evening": None}
    }
    
    for slot in slots:
        if slot.DayOfWeek in schedule and slot.Period in schedule[slot.DayOfWeek]:
            schedule[slot.DayOfWeek][slot.Period] = slot.Note
    
    return jsonify(schedule)

@schedule_bp.route('/busy', methods=['POST'])
def save_busy_slots():
    if 'user_id' not in session:
        return jsonify({"error": "Chưa đăng nhập"}), 401
    
    user_id = session['user_id']
    data = request.json
    
    # Lấy busy slots CŨ trước khi xóa (để so sánh)
    old_schedule_all = UserSchedule.query.filter_by(User_id=user_id).all()
    old_busy_by_day = {}
    for old_slot in old_schedule_all:
        if old_slot.DayOfWeek not in old_busy_by_day:
            old_busy_by_day[old_slot.DayOfWeek] = set()
        old_busy_by_day[old_slot.DayOfWeek].add(old_slot.Period)
    
    UserSchedule.query.filter_by(User_id=user_id).delete()
    
    for day, periods in data.items():
        for period, note in periods.items():
            if note and isinstance(note, str) and note.strip():
                new_slot = UserSchedule(
                    User_id=user_id,
                    DayOfWeek=day,
                    Period=period,
                    Note=note.strip()
                )
                db.session.add(new_slot)
    
    db.session.commit()
    
    # Mapping period names
    period_map = {
        "morning": "morning",
        "sáng": "morning",
        "buổi sáng": "morning",
        "afternoon": "afternoon",
        "trưa": "afternoon",
        "buổi trưa": "afternoon",
        "evening": "evening",
        "tối": "evening",
        "buổi tối": "evening"
    }
    
    # Xóa items chưa completed ở busy slots và invalidate hash để regenerate cho slots được giải phóng
    today = datetime.now().date()
    week_start = today - timedelta(days=today.weekday())
    
    day_map = {"mon": 0, "tue": 1, "wed": 2, "thu": 3, "fri": 4, "sat": 5, "sun": 6}
    
    deleted_count = 0
    invalidated_dates = set()  # Track các ngày cần regenerate
    
    # Xử lý 2 tuần (tuần này và tuần sau)
    for week_offset in range(2):
        week_start_date = week_start + timedelta(days=week_offset * 7)
        
        for day, periods in data.items():
            day_offset = day_map.get(day, 0)
            target_date = week_start_date + timedelta(days=day_offset)
            
            # Lấy busy periods cho ngày này từ request
            busy_periods_new = set()
            for period, note in periods.items():
                if note and isinstance(note, str) and note.strip():
                    normalized_period = period_map.get(period.lower(), period.lower())
                    busy_periods_new.add(normalized_period)
            
            # Lấy busy slots CŨ cho ngày này (đã lấy trước khi xóa)
            old_busy_slots = set()
            if day in old_busy_by_day:
                for old_period in old_busy_by_day[day]:
                    normalized_old_period = period_map.get(old_period.lower(), old_period.lower())
                    old_busy_slots.add(normalized_old_period)
            
            # Đơn giản: Xóa TẤT CẢ UserPlan items (chưa completed) ở busy slots
            if busy_periods_new:
                # Normalize slot mapping
                slot_normalize = {
                    "sáng": "morning", "buổi sáng": "morning",
                    "trưa": "afternoon", "buổi trưa": "afternoon",
                    "tối": "evening", "buổi tối": "evening"
                }
                
                # Query tất cả items chưa completed
                plans_to_delete = UserPlan.query.filter_by(
                    UserId=user_id,
                    Date=target_date
                ).filter(
                    UserPlan.IsCompleted != True
                ).all()
                
                # Filter và xóa items ở busy slots
                for plan in plans_to_delete:
                    if not plan.Slot:
                        continue
                    
                    plan_slot_lower = plan.Slot.lower().strip()
                    normalized_slot = slot_normalize.get(plan_slot_lower, plan_slot_lower)
                    
                    # Check nếu slot match với busy period
                    is_busy = False
                    for busy_period in busy_periods_new:
                        busy_normalized = busy_period.lower().strip()
                        if normalized_slot == busy_normalized or plan_slot_lower == busy_normalized:
                            is_busy = True
                            break
                    
                    if is_busy:
                        print(f"   🗑️ Deleting {plan.Type} at {plan.Slot} (busy slot)")
                        db.session.delete(plan)
                        deleted_count += 1
            
            # Đơn giản: Invalidate ProfileHash cho TẤT CẢ items chưa completed trong ngày
            # Để trigger regenerate khi load lại
            existing_plans = UserPlan.query.filter_by(
                UserId=user_id,
                Date=target_date
            ).all()
            
            if existing_plans:
                invalidated_count = 0
                for plan in existing_plans:
                    is_completed = getattr(plan, 'IsCompleted', False)
                    if not is_completed and plan.ProfileHash:
                        plan.ProfileHash = None
                        invalidated_count += 1
                
                if invalidated_count > 0:
                    invalidated_dates.add(target_date.strftime('%Y-%m-%d'))
                    print(f"🔄 Invalidated ProfileHash for {invalidated_count} incomplete items on {target_date} (busy slots changed)")
    
    # Commit ngay sau khi xóa items để đảm bảo database được cập nhật
    if deleted_count > 0:
        db.session.commit()
        print(f"🗑️ Deleted {deleted_count} incomplete items from busy slots")
    
    # Commit lại nếu có invalidate
    if invalidated_dates:
        db.session.commit()
        print(f"🔄 Invalidated {len(invalidated_dates)} dates for regeneration: {invalidated_dates}")
    
    return jsonify({
        "message": "Lưu lịch làm việc thành công!",
        "deleted_items": deleted_count,
        "invalidated_dates": len(invalidated_dates),
        "regenerate_needed": True  # Thông báo cho frontend cần reload
    })