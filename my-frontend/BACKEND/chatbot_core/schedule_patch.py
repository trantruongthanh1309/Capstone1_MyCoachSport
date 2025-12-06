# Patch for chat_service.py - Fix schedule query
from datetime import datetime

def handle_schedule_query_fixed(user_context):
    """Trả lời về lịch tập/ăn (KHÔNG bao gồm lịch bận)"""
    if not user_context or not user_context.get('id'):
        return "Bạn cần đăng nhập để mình xem lịch giúp nhé! 🔒"
    
    from models.user_schedule import UserSchedule
    from models.workout import Workout
    from models.meal import Meal
    
    # Lấy lịch hôm nay
    target_date = datetime.now().date()
    
    # Query DB lấy lịch tập/ăn hôm nay
    # Chỉ lấy những lịch có WorkoutId HOẶC MealId (không lấy lịch bận)
    schedules = UserSchedule.query.filter_by(
        User_id=user_context['id'], 
        Date=target_date
    ).filter(
        (UserSchedule.WorkoutId.isnot(None)) | (UserSchedule.MealId.isnot(None))
    ).all()
    
    print(f"[DEBUG] Found {len(schedules)} workout/meal schedules for user {user_context['id']} on {target_date}")
    
    if not schedules:
        return f"Hôm nay {user_context['name']} chưa có lịch tập hoặc ăn nào cả. Bạn vào mục Planner để AI tạo lịch ngay nhé! 📅"
    
    msg = f"📅 Lịch hôm nay của {user_context['name']}:\n\n"
    
    workouts = []
    meals = []
    
    for s in schedules:
        time_str = s.Time.strftime('%H:%M') if s.Time else s.Period
        
        if s.WorkoutId:
            w = Workout.query.get(s.WorkoutId)
            if w:
                workouts.append(f"💪 {time_str}: Tập {w.Name}")
        elif s.MealId:
            m = Meal.query.get(s.MealId)
            if m:
                meals.append(f"🥗 {time_str}: Ăn {m.Name} ({m.Calories} kcal)")
    
    # Hiển thị lịch tập
    if workouts:
        msg += "✅ LỊCH TẬP:\n"
        msg += "\n".join(workouts) + "\n\n"
    
    # Hiển thị lịch ăn
    if meals:
        msg += "🍽️ LỊCH ĂN:\n"
        msg += "\n".join(meals) + "\n\n"
    
    if not workouts and not meals:
        return "Lịch trống trơn à! Vào Planner tạo lịch đi nào! 🚀"
    
    msg += "💡 Chúc bạn một ngày năng động!"
    return msg

# Monkey patch
import chatbot_core.chat_service as chat_service
chat_service.handle_schedule_query = handle_schedule_query_fixed
chat_service.INTENT_HANDLERS['schedule'] = handle_schedule_query_fixed
chat_service.INTENT_HANDLERS['check_today_schedule'] = handle_schedule_query_fixed
chat_service.INTENT_HANDLERS['check_week_schedule'] = handle_schedule_query_fixed

print("✅ Chatbot schedule query patched!")
