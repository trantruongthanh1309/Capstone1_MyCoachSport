import random
import json
import torch
import os
from datetime import datetime, timedelta
from sqlalchemy import func, cast, Date
from db import db
from models.log import Log
from models.user_plan import UserPlan
from models.user_schedule import UserSchedule
from models.meal import Meal
from models.workout import Workout
from chatbot_core.weather_handler import handle_weather_query
from chatbot_core.nltk_utils import bag_of_words, tokenize
from chatbot_core.model import NeuralNet

# Load model and data
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FILE = os.path.join(BASE_DIR, 'data.pth')
INTENTS_FILE = os.path.join(BASE_DIR, 'data', 'intents_mega.json')

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

model = None
all_words = []
tags = []
intents = {'intents': []}

# Try to load model
try:
    if os.path.exists(FILE):
        data = torch.load(FILE, map_location=device)
        input_size = data['input_size']
        hidden_size = data['hidden_size']
        output_size = data['output_size']
        all_words = data['all_words']
        tags = data['tags']
        model_state = data['model_state']
        
        model = NeuralNet(input_size, hidden_size, output_size).to(device)
        model.load_state_dict(model_state)
        model.eval()
        
        print(f"✅ Model loaded successfully")
    else:
        print(f"⚠️ Model file not found: {FILE}")
except Exception as e:
    print(f"❌ Error loading model: {e}")

# Load intents
try:
    if os.path.exists(INTENTS_FILE):
        with open(INTENTS_FILE, 'r', encoding='utf-8') as f:
            intents = json.load(f)
        print(f"✅ Intents loaded: {len(intents.get('intents', []))} intents")
    else:
        print(f"⚠️ Intents file not found: {INTENTS_FILE}")
except Exception as e:
    print(f"❌ Error loading intents: {e}")

def get_streak(user_id):
    # Simple streak logic: check consecutive days with logs
    try:
        # SQL Server fix: use cast(Log.CreatedAt, Date) instead of func.date()
        logs = db.session.query(
            cast(Log.CreatedAt, Date).label('log_date')
        ).filter(
             Log.User_id == user_id
        ).group_by(
            cast(Log.CreatedAt, Date)
        ).order_by(
            cast(Log.CreatedAt, Date).desc()
        ).limit(10).all()
        
        if not logs: return 0
        
        streak = 0
        today = datetime.now().date()
        
        # Check if trained today
        last_date = logs[0][0]
        # SQL Server might return date object directly, but keep string check just in case
        if isinstance(last_date, str): last_date = datetime.strptime(last_date, '%Y-%m-%d').date()
        
        if last_date == today:
            streak = 1
            current_check = today - timedelta(days=1)
        elif last_date == today - timedelta(days=1):
            streak = 1
            current_check = today - timedelta(days=1)
        else:
            return 0
            
        for i in range(1, len(logs)):
            date_val = logs[i][0]
            if isinstance(date_val, str): date_val = datetime.strptime(date_val, '%Y-%m-%d').date()
            
            if date_val == current_check:
                streak += 1
                current_check -= timedelta(days=1)
            else:
                break
        return streak
    except Exception as e:
        print(f"Streak error: {e}")
        return 0

def handle_greeting_smart(user_context):
    if not user_context or not user_context.get('id'):
        return "Chào bạn! Mình là AI Coach. Đăng nhập để mình hỗ trợ tốt hơn nhé! 👋"

    name = user_context['name']
    hour = datetime.now().hour
    streak = get_streak(user_context['id'])
    
    # Time based greeting
    if 5 <= hour < 12: sess = "Chào buổi sáng"
    elif 12 <= hour < 18: sess = "Chào buổi chiều"
    else: sess = "Chào buổi tối"
    
    # Check activity today
    # SQL Server fix: use cast instead of func.date
    today_count = Log.query.filter(
        Log.User_id == user_context['id'], 
        cast(Log.CreatedAt, Date) == datetime.now().date()
    ).count()
    
    msg = f"{sess}, {name}! 👋\n"
    
    if streak > 2:
        msg += f"🔥 Bạn đang có chuỗi {streak} ngày liên tiếp! Đừng để đứt chuỗi nha!\n"
    
    if today_count > 0:
        msg += "Hôm nay bạn đã hoàn thành bài tập rồi. Nghỉ ngơi tốt nhé! 🛌"
    else:
        msg += "Hôm nay chưa thấy bạn tập gì cả. Khởi động chút không? 💪"
        
    return msg

def handle_motivation_smart(user_context):
    quotes = [
        "Đừng dừng lại khi mệt mỏi, hãy dừng lại khi đã xong!",
        "Kỷ luật là cầu nối giữa mục tiêu và thành tựu.",
        "Mỗi giọt mồ hôi rơi xuống là mỡ thừa đang khóc thét! 🔥",
        f"{user_context.get('name')} ơi, mục tiêu {user_context.get('goal', 'của bạn')} đang chờ phía trước!"
    ]
    return random.choice(quotes)

def handle_calc_bmi(user_context):
    h = user_context.get('height', 0)
    w = user_context.get('weight', 0)
    if not h or not w: return "Cập nhật chiều cao cân nặng trong hồ sơ để mình tính nhé!"
    bmi = round(w / ((h/100)**2), 1)
    return f"BMI của bạn là {bmi}. {'Chuẩn đẹp!' if 18.5 <= bmi <= 25 else 'Cần điều chỉnh xíu nha!'}"

def handle_calc_tdee(user_context):
    # Simplified TDEE response
    return "Tính TDEE: Bạn hãy vào phần Profile để xem chi tiết nhé, mình đã tính sẵn trong đó rồi! 📊"

def handle_schedule_query(user_context, filter_type=None):
    """
    Trả lời về lịch tập/ăn (KHÔNG bao gồm lịch bận)
    filter_type: None (tất cả), 'workout' (chỉ tập), 'meal' (chỉ ăn)
    """
    if not user_context or not user_context.get('id'):
        return "Bạn cần đăng nhập để mình xem lịch giúp nhé! 🔒"
    
    target_date = datetime.now().date()
    # Try querying UserPlan first (new system), if empty fallback to UserSchedule or just use UserPlan if that is the new standard.
    # Actually, looking at the previous file content, UserPlan seems to be what the user wants to use but they implemented it poorly.
    # However, to be "SMART", we should format it nicely.
    # Let's stick to UserPlan if that's where data is, but format it better.
    # Wait, the screenshot shows the "Planner" which likely uses UserPlan.
    # But previous working code used UserSchedule.
    # Let's check if UserPlan has data.
    # To be safe, let's query BOTH or stick to the one we know works.
    # The user's code in Step 270 used UserPlan. I will assume UserPlan is the source of truth for the new "Planner" shown in screenshot.
    
    user_id = user_context['id']
    
    try:
        # Check UserPlan
        plans = UserPlan.query.filter(
            UserPlan.UserId == user_id,
            UserPlan.Date == target_date
        ).all()
        
        if not plans:
             # Fallback to UserSchedule if UserPlan is empty (legacy support)
            schedules = UserSchedule.query.filter_by(
                User_id=user_id, 
                Date=target_date
            ).filter(
                (UserSchedule.WorkoutId.isnot(None)) | (UserSchedule.MealId.isnot(None))
            ).all()
            
            if not schedules:
                return f"Hôm nay {user_context['name']} chưa có lịch. Vào Planner tạo lịch ngay nhé! 📅"
            
            # ... process UserSchedule ...
            msg = f"📅 Lịch hôm nay của {user_context['name']} (UserSchedule):\n\n"
            for s in schedules:
                 time_str = s.Time.strftime('%H:%M') if s.Time else s.Period
                 if s.WorkoutId:
                     w = Workout.query.get(s.WorkoutId)
                     if w: msg += f"💪 {time_str}: Tập {w.Name}\n"
                 elif s.MealId:
                     m = Meal.query.get(s.MealId)
                     if m: msg += f"🥗 {time_str}: Ăn {m.Name} ({m.Kcal} kcal)\n"
            return msg


        # Filter plans based on filter_type
        if filter_type == 'workout':
            plans = [p for p in plans if p.Type == 'workout']
            msg_prefix = f"💪 **Lịch tập hôm nay của {user_context['name']}:**\n\n"
        elif filter_type == 'meal':
            plans = [p for p in plans if p.Type == 'meal']
            msg_prefix = f"🍽️ **Lịch ăn hôm nay của {user_context['name']}:**\n\n"
        else:
            msg_prefix = f"📅 **Lịch hôm nay của {user_context['name']}:**\n\n"
        
        if not plans:
            if filter_type == 'workout':
                return f"Hôm nay {user_context['name']} chưa có lịch tập. Vào Planner tạo lịch ngay nhé! 💪"
            elif filter_type == 'meal':
                return f"Hôm nay {user_context['name']} chưa có lịch ăn. Vào Planner tạo lịch ngay nhé! 🍽️"
            else:
                return f"Hôm nay {user_context['name']} chưa có lịch. Vào Planner tạo lịch ngay nhé! 📅"
        
        msg = msg_prefix
        slot_order = {'morning': 1, 'afternoon': 2, 'evening': 3}
        plans.sort(key=lambda x: slot_order.get(x.Slot, 4))

        slot_names = {
            'morning': '🌅 Buổi sáng',
            'afternoon': '☀️ Buổi trưa',
            'evening': '🌙 Buổi tối'
        }
        
        current_slot = None
        has_content = False
        for plan in plans:
            display_slot = slot_names.get(plan.Slot, plan.Slot)
            if plan.Slot != current_slot:
                msg += f"\n**{display_slot}**:\n"
                current_slot = plan.Slot
            
            if plan.Type == 'meal' and plan.MealId:
                meal = Meal.query.get(plan.MealId)
                if meal:
                    msg += f"   - 🍽️ {meal.Name} ({meal.Kcal} kcal)\n"
                    has_content = True
            elif plan.Type == 'workout' and plan.WorkoutId:
                workout = Workout.query.get(plan.WorkoutId)
                if workout:
                    msg += f"   - 💪 {workout.Name}\n"
                    has_content = True
        
        if not has_content:
            if filter_type == 'workout':
                return f"Hôm nay {user_context['name']} chưa có lịch tập. Vào Planner tạo lịch ngay nhé! 💪"
            elif filter_type == 'meal':
                return f"Hôm nay {user_context['name']} chưa có lịch ăn. Vào Planner tạo lịch ngay nhé! 🍽️"
        
        return msg
    except Exception as e:
        print(f"Error in handle_schedule_query: {e}")
        return "Có lỗi khi lấy lịch. Bạn thử lại sau nhé! ⚠️"

def handle_schedule_query_smart(user_context, message=""):
    # Detect filter type from message
    message_lower = message.lower() if message else ""
    filter_type = None
    if "tập" in message_lower and "ăn" not in message_lower and "thực đơn" not in message_lower:
        filter_type = 'workout'
    elif ("ăn" in message_lower or "thực đơn" in message_lower or "bữa" in message_lower) and "tập" not in message_lower:
        filter_type = 'meal'
    
    # Reuse original logic but add advice
    base_msg = handle_schedule_query(user_context, filter_type=filter_type)
    if "Lịch trống" in base_msg or "chưa có" in base_msg or "đăng nhập" in base_msg or "Có lỗi" in base_msg or "lỗi" in base_msg.lower():
        return base_msg
        
    # Analyze for advice
    advice = "\n💡 **AI Advice:** "
    if "Cardio" in base_msg or "Chạy" in base_msg:
        advice += "Hôm nay có Cardio, nhớ uống đủ 2-3 lít nước và bổ sung điện giải nhé! 💧"
    elif "Leg" in base_msg or "Chân" in base_msg:
        advice += "Ngày tập chân (Leg Day) khá nặng, hãy ăn nhiều Carb vào bữa trưa để có sức! 🍚"
    elif "Yoga" in base_msg:
        advice += "Hôm nay nhẹ nhàng, hãy tập trung hít thở sâu và thư giãn tinh thần. 🧘‍♂️"
    else:
        advice += "Hãy khởi động kỹ 10 phút trước khi tập để tránh chấn thương nhé!"
        
    return base_msg + advice

def handle_my_stats(user_context):
    if not user_context or not user_context.get('id'):
        return "Đăng nhập đi bạn ơi, mình mới đếm được chứ!"
    
    # Calculate weekly stats
    today = datetime.now().date()
    start_of_week = today - timedelta(days=today.weekday())
    end_of_week = start_of_week + timedelta(days=6)
    
    # Count completed workouts this week (from Log)
    completed_logs = Log.query.filter(
        Log.User_id == user_context['id'],
        Log.Workout_id.isnot(None),
        Log.CreatedAt >= start_of_week
    ).count()
    
    # Count planned workouts this week (from Schedule)
    planned_workouts = UserSchedule.query.filter(
        UserSchedule.User_id == user_context['id'],
        UserSchedule.Date >= start_of_week,
        UserSchedule.Date <= end_of_week,
        UserSchedule.WorkoutId.isnot(None)
    ).count()
    
    total_logs = Log.query.filter_by(User_id=user_context['id']).count()
    
    msg = f"📊 Thống kê của {user_context['name']}:\n"
    msg += f"🔥 Tổng tích lũy: {total_logs} hoạt động.\n"
    
    if planned_workouts > 0:
        progress = int((completed_logs / planned_workouts) * 100)
        msg += f"📅 Tuần này: Hoàn thành {completed_logs}/{planned_workouts} bài tập ({progress}%).\n"
        if progress >= 100:
            msg += "🏆 Xuất sắc! Bạn đã hoàn thành mục tiêu tuần này!"
        elif progress >= 50:
            msg += "⚡ Cố lên! Bạn đang đi đúng hướng."
        else:
            msg += "⚠️ Cần chăm chỉ hơn nhé!"
    else:
        msg += f"📅 Tuần này bạn đã tập {completed_logs} buổi. Hãy vào Planner tạo lịch để có mục tiêu cụ thể nhé!"
        
    return msg

def handle_suggest_meal(user_context):
    now = datetime.now()
    hour = now.hour
    
    # Determine meal time
    if 5 <= hour < 10:
        period = "Breakfast"
        period_vi = "Bữa sáng"
    elif 10 <= hour < 14:
        period = "Lunch"
        period_vi = "Bữa trưa"
    elif 14 <= hour < 18:
        period = "Snack"
        period_vi = "Bữa phụ"
    else:
        period = "Dinner"
        period_vi = "Bữa tối"

    # Default query
    query = Meal.query
    
    # Filter by time if possible (fuzzy match)
    query = query.filter(Meal.MealTime.ilike(f"%{period}%"))

    # Filter by Goal
    goal = user_context.get('goal', '')
    if goal:
        if 'Loss' in goal or 'Giảm' in goal or 'giam' in goal:
            # Low calorie, high protein
            query = query.filter(Meal.Kcal < 600).order_by(Meal.Protein.desc())
        elif 'Gain' in goal or 'Tăng' in goal or 'tang' in goal:
            # High calorie
            query = query.filter(Meal.Kcal > 500).order_by(Meal.Kcal.desc())
            
    # Get results
    meals = query.limit(30).all()
    
    if not meals:
        # Fallback if no specific time match, try any meal
        meals = Meal.query.limit(20).all()

    if not meals:
        return "Hiện tại tôi chưa tìm thấy món ăn nào phù hợp trong thực đơn. Bạn hãy thử lại sau nhé! 🍳"

    # SMART FEATURE: Avoid recently eaten meals
    try:
        recent_logs = Log.query.filter(
            Log.User_id == user_context.get('id'),
            Log.Meal_id.isnot(None)
        ).order_by(Log.CreatedAt.desc()).limit(5).all()
        
        recent_meal_ids = [log.Meal_id for log in recent_logs]
        
        # Filter out recent meals
        fresh_meals = [m for m in meals if m.Id not in recent_meal_ids]
        
        # If we have fresh options, use them. Otherwise stick to original list.
        if fresh_meals:
            meals = fresh_meals
            print(f"Smart Suggest: Filtered out {len(recent_meal_ids)} recent meals.")
    except Exception as e:
        print(f"Error checking recent meals: {e}")

    selected_meal = random.choice(meals)
    
    msg = f"💡 AI Smart Suggest ({period_vi}) cho {user_context.get('name', 'bạn')}:\n"
    msg += f"🍱 Món: {selected_meal.Name}\n"
    msg += f"🔥 Năng lượng: {selected_meal.Kcal} kcal\n"
    msg += f"💪 Protein: {selected_meal.Protein}g | Carb: {selected_meal.Carb}g | Fat: {selected_meal.Fat}g\n"
    msg += f"📋 Mẹo: Món này rất phù hợp với mục tiêu {goal} của bạn!"
    
    return msg

def handle_suggest_workout(user_context):
    query = Workout.query
    
    sport = user_context.get('sport', '')
    goal = user_context.get('goal', '')
    
    # Filter by sport if user has one
    if sport and sport != 'None':
        query = query.filter(Workout.Sport.ilike(f"%{sport}%"))
        
    # Filter by goal
    if goal and goal != 'None':
        if 'Loss' in goal or 'Giảm' in goal:
            query = query.filter(Workout.CalorieBurn > 300)
        elif 'Muscle' in goal or 'Cơ' in goal:
            query = query.filter((Workout.Difficulty == 'Hard') | (Workout.Intensity == 'High'))
            
    workouts = query.limit(10).all()
    
    # Fallback
    if not workouts:
        workouts = Workout.query.limit(10).all()
        
    if not workouts:
         return "Hiện tại chưa có bài tập nào phù hợp. Bạn hãy thử cập nhật lại Sport trong Profile nhé! 🏋️‍♂️"
         
    w = random.choice(workouts)
    
    msg = f"🏋️‍♂️ Bài tập gợi ý hôm nay: {w.Name}\n"
    msg += f"⏱️ Thời gian: {w.Duration_min} phút | 🔥 Đốt: {w.CalorieBurn} kcal\n"
    msg += f"🎯 Tác động: {w.MuscleGroups}"
    
    return msg

def handle_busy_schedule(user_context):
    """Trả lời về lịch bận"""
    if not user_context or not user_context.get('id'):
        return "Bạn cần đăng nhập để mình xem lịch bận giúp nhé! 🔒"
    
    target_date = datetime.now().date()
    day_names = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
    
    # Restore legacy logic for day mapping to maintain consistency
    shifted_index = (target_date.weekday() - 1) % 7
    day_of_week = day_names[shifted_index]
    
    try:
        busy_schedules = UserSchedule.query.filter_by(
            User_id=user_context['id'], 
            DayOfWeek=day_of_week
        ).filter(
            UserSchedule.Note.isnot(None),
            UserSchedule.Date.is_(None)
        ).all()
        
        if not busy_schedules:
            return f"Hôm nay {user_context['name']} không có lịch bận nào. Bạn rảnh cả ngày, đi tập thôi! 💪"
        
        msg = f"⏰ Lịch bận hôm nay của {user_context['name']}:\n\n"
        for s in busy_schedules:
            msg += f"🚫 {s.Period}: {s.Note}\n"
        
        msg += "\n💡 Những khung giờ còn lại bạn có thể sắp xếp tập luyện nhé!"
        return msg
    except Exception as e:
        print(f"Error busy schedule: {e}")
        return "Lỗi khi xem lịch bận."

INTENT_HANDLERS = {
    "schedule": handle_schedule_query_smart,
    "check_today_schedule": handle_schedule_query_smart,
    "check_week_schedule": handle_schedule_query_smart,
    "busy_schedule": handle_busy_schedule,
    "stats": handle_my_stats,
    "suggest_meal": handle_suggest_meal,
    "suggest_workout": handle_suggest_workout,
    "weather_query": lambda user_context: "Bạn muốn kiểm tra thời tiết ở đâu?",
    "greeting": handle_greeting_smart,
    "motivation": handle_motivation_smart,
    "calc_bmi": handle_calc_bmi,
    "calc_tdee": handle_calc_tdee,
    "my_info": lambda ctx: f"Bạn là {ctx.get('name')}, chiến binh {ctx.get('sport')}! 🏅",
    "my_body": handle_calc_bmi
}

def get_response(msg, user_context=None):
    if not model:
        return "Hệ thống đang bảo trì (Chưa train model)."

    sentence = tokenize(msg)
    X = bag_of_words(sentence, all_words)
    X = X.reshape(1, X.shape[0])
    X = torch.from_numpy(X).to(device)

    output = model(X)
    _, predicted = torch.max(output, dim=1)
    tag = tags[predicted.item()]

    probs = torch.softmax(output, dim=1)
    prob = probs[0][predicted.item()]
    
    if prob.item() > 0.75 and tag == "weather_query":
        return handle_weather_query(user_context, msg)

    if prob.item() > 0.75:
        if tag in INTENT_HANDLERS and user_context:
            handler = INTENT_HANDLERS[tag]
            # Pass message to schedule handlers for context
            if tag in ["schedule", "check_today_schedule", "check_week_schedule"]:
                return handler(user_context, msg)
            return handler(user_context)
            
        for intent in intents['intents']:
            if tag == intent['tag']:
                response = random.choice(intent['responses'])
                if user_context and "{name}" in response:
                    response = response.replace("{name}", user_context['name'])
                return response
    
    return "Xin lỗi, tôi chưa hiểu ý bạn lắm. Bạn thử hỏi về lịch tập, dinh dưỡng xem sao nhé!"
