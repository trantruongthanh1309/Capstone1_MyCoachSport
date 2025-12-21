from flask import Blueprint, jsonify, session
from models.user_schedule import UserSchedule
from models.user_plan import UserPlan
from models.workout import Workout
from models.meal import Meal
from datetime import datetime, timedelta

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/', methods=['GET'])
def get_notifications():
    user_id = session.get('user_id')
    if not user_id:
        print("⚠️ No user_id in session")
        return jsonify([])

    now = datetime.now()
    today = now.date()
    
    print(f"🔔 Fetching notifications for user_id={user_id}, date={today}")
    
    notifs = []
    
    # Lấy từ UserPlans (lịch từ Planner)
    try:
        plans = UserPlan.query.filter(
            UserPlan.UserId == user_id,
            UserPlan.Date == today
        ).all()
        print(f"📅 Found {len(plans)} plan items for today")
        
        for plan in plans:
            sched_time = None
            item_type = plan.Type  # "meal" or "workout"
            name = ""
            
            # Tính thời gian dựa trên Slot
            slot_times = {
                'morning': (7, 0) if item_type == 'meal' else (6, 30),
                'afternoon': (12, 0) if item_type == 'meal' else (16, 30),
                'evening': (19, 0) if item_type == 'meal' else (20, 0)
            }
            
            if plan.Slot in slot_times:
                h, m = slot_times[plan.Slot]
                sched_time = datetime.combine(today, datetime.strptime(f"{h}:{m}", "%H:%M").time())
            
            if plan.Type == 'meal' and plan.MealId:
                m = Meal.query.get(plan.MealId)
                if m:
                    name = m.Name
            elif plan.Type == 'workout' and plan.WorkoutId:
                w = Workout.query.get(plan.WorkoutId)
                if w:
                    name = w.Name
            
            if name and sched_time:
                diff = sched_time - now
                minutes_diff = int(diff.total_seconds() / 60)
                
                if minutes_diff > -180:  # Chỉ hiển thị trong vòng 3 giờ (quá khứ hoặc tương lai)
                    if minutes_diff < 0:
                        title = f"Bạn đã lỡ { 'bài tập' if item_type == 'workout' else 'bữa ăn' }?"
                        msg = f"{name} (lúc {sched_time.strftime('%H:%M')})"
                    elif minutes_diff <= 30:
                        title = f"Sắp đến giờ { 'tập' if item_type == 'workout' else 'ăn' }!"
                        msg = f"Chuẩn bị: {name} ({minutes_diff} phút nữa)"
                    else:
                        title = f"Lịch { 'tập' if item_type == 'workout' else 'ăn' } sắp tới"
                        msg = f"{name} vào lúc {sched_time.strftime('%H:%M')}"
                    
                    notifs.append({
                        "id": plan.Id,
                        "time": sched_time.strftime("%H:%M"),
                        "minutes_diff": minutes_diff,
                        "type": item_type,
                        "title": title,
                        "message": msg
                    })
    except Exception as e:
        print(f"❌ Error fetching UserPlans: {e}")
    
    # Lấy từ UserSchedule (lịch bận có MealId/WorkoutId)
    try:
        schedules = UserSchedule.query.filter(
            UserSchedule.User_id == user_id,
            UserSchedule.Date == today
        ).all()
        print(f"📅 Found {len(schedules)} schedule items for today")
        
        DEFAULT_TIMES = {
            'meal_morning': (7, 0),
            'workout_morning': (6, 30),
            'meal_afternoon': (12, 0),
            'workout_afternoon': (16, 30),
            'meal_evening': (19, 0),
            'workout_evening': (20, 0)
        }

        for idx, s in enumerate(schedules):
            # Chỉ xử lý nếu có MealId hoặc WorkoutId (không phải lịch bận thông thường)
            if not s.MealId and not s.WorkoutId:
                continue
                
            print(f"\n  Item {idx+1}: MealId={s.MealId}, WorkoutId={s.WorkoutId}, Time={s.Time}, Period={s.Period}")
            
            sched_time = None
            item_type = ""
            name = ""
            
            if s.Time:
                sched_time = datetime.combine(today, s.Time)
                print(f"    ✅ Has specific time: {sched_time}")
                
            if s.WorkoutId:
                item_type = "workout"
                w = Workout.query.get(s.WorkoutId)
                if w:
                    name = w.Name
                    print(f"    🏋️ Workout: {name}")
                    if not sched_time:
                        h, m = DEFAULT_TIMES.get('workout_afternoon', (16, 30))
                        sched_time = datetime.combine(today, datetime.strptime(f"{h}:{m}", "%H:%M").time())
                        print(f"    ⏰ Inferred time: {sched_time}")

            elif s.MealId:
                item_type = "meal"
                m = Meal.query.get(s.MealId)
                if m:
                    name = m.Name
                    meal_type = (m.MealTime or '').lower() if m.MealTime else 'lunch'
                    print(f"    🍽️ Meal: {name}, MealTime: {meal_type}")
                    
                    if not sched_time:
                        if 'morning' in meal_type or 'breakfast' in meal_type or 'sáng' in meal_type: 
                            key = 'meal_morning'
                        elif 'evening' in meal_type or 'dinner' in meal_type or 'tối' in meal_type: 
                            key = 'meal_evening'
                        else: 
                            key = 'meal_afternoon'
                        
                        h, m = DEFAULT_TIMES.get(key, (12, 0))
                        sched_time = datetime.combine(today, datetime.strptime(f"{h}:{m}", "%H:%M").time())
                        print(f"    ⏰ Inferred time from MealTime: {sched_time}")

            if not name:
                print(f"    ⚠️ Skipping - no name found")
                continue
                
            if not sched_time:
                sched_time = now + timedelta(hours=1)
                print(f"    ⚠️ No time info, using fallback: {sched_time}")
                
            diff = sched_time - now
            minutes_diff = int(diff.total_seconds() / 60)
            
            print(f"    📊 Time diff: {minutes_diff} minutes")
            
            if minutes_diff > -180:
                if minutes_diff < 0:
                    title = f"Bạn đã lỡ { 'bài tập' if item_type == 'workout' else 'bữa ăn' }?"
                    msg = f"{name} (lúc {sched_time.strftime('%H:%M')})"
                elif minutes_diff <= 30:
                    title = f"Sắp đến giờ { 'tập' if item_type == 'workout' else 'ăn' }!"
                    msg = f"Chuẩn bị: {name} ({minutes_diff} phút nữa)"
                else:
                    title = f"Lịch { 'tập' if item_type == 'workout' else 'ăn' } sắp tới"
                    msg = f"{name} vào lúc {sched_time.strftime('%H:%M')}"
                    
                notifs.append({
                    "id": s.Id,
                    "time": sched_time.strftime("%H:%M"),
                    "minutes_diff": minutes_diff,
                    "type": item_type,
                    "title": title,
                    "message": msg
                })
                print(f"    ✅ Added to notifications")
            else:
                print(f"    ⏭️ Skipped - too far in the past")
    except Exception as e:
        print(f"❌ Error fetching UserSchedule: {e}")
            
    notifs.sort(key=lambda x: x['minutes_diff'])
    
    print(f"\n🎉 Total notifications: {len(notifs)}")
    return jsonify(notifs)
