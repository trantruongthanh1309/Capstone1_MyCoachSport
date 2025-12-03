import random
import json
import torch
import os
from datetime import datetime
from sqlalchemy import func

# Import models để truy vấn dữ liệu thật
# Lưu ý: Các import này hoạt động khi chạy từ app.py (root context)
try:
    from models.user_schedule import UserSchedule
    from models.workout import Workout
    from models.meal import Meal
    from models.log import Log
    from models.user_model import User
except ImportError:
    # Fallback cho trường hợp chạy test riêng lẻ
    pass

from .model import NeuralNet
from .nltk_utils import bag_of_words, tokenize

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Đường dẫn file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INTENTS_FILE = os.path.join(BASE_DIR, 'data', 'intents_mega.json')  # ✅ MEGA DATASET!
DATA_FILE = os.path.join(BASE_DIR, 'data.pth')

# Load dữ liệu model đã train
with open(INTENTS_FILE, 'r', encoding='utf-8') as f:
    intents = json.load(f)

if os.path.exists(DATA_FILE):
    data = torch.load(DATA_FILE)

    input_size = data["input_size"]
    hidden_size = data["hidden_size"]
    output_size = data["output_size"]
    all_words = data["all_words"]
    tags = data["tags"]
    model_state = data["model_state"]

    model = NeuralNet(input_size, hidden_size, output_size).to(device)
    model.load_state_dict(model_state)
    model.eval()
else:
    print("⚠️ Chưa tìm thấy file data.pth. Hãy chạy train.py trước!")
    model = None

# --- CÁC HÀM XỬ LÝ THÔNG MINH (DYNAMIC HANDLERS) ---

def handle_schedule_query(user_context):
    """Trả lời về lịch tập (Hỗ trợ hôm nay, ngày mai)"""
    if not user_context or not user_context.get('id'):
        return "Bạn cần đăng nhập để mình xem lịch giúp nhé! 🔒"
    
    # Mặc định là hôm nay
    target_date = datetime.now().date()
    date_str = "hôm nay"
    
    # Lấy DayOfWeek (mon, tue, wed, thu, fri, sat, sun)
    # FIX: Dữ liệu DB đang bị lệch 1 ngày (Mon trên UI = sun trong DB)
    # Python weekday: 0=Mon, 1=Tue, ..., 6=Sun
    # Mapping cần thiết: 0->sun, 1->mon, 2->tue...
    
    day_names = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
    
    # Logic cũ: day_of_week = day_names[target_date.weekday()] -> Sai với DB hiện tại
    
    # Logic mới: Shift lùi 1 ngày
    shifted_index = (target_date.weekday() - 1) % 7
    day_of_week = day_names[shifted_index]
    
    # DEBUG: Log để kiểm tra
    print(f"[DEBUG] Target date: {target_date}, Weekday: {target_date.weekday()}, Shifted Index: {shifted_index}, DayOfWeek (DB): {day_of_week}")
    
    # Query DB lấy lịch:
    # 1. Lịch theo ngày cụ thể (Date)
    daily_schedules = UserSchedule.query.filter_by(
        User_id=user_context['id'], 
        Date=target_date
    ).all()
    
    # 2. Lịch tuần lặp lại (DayOfWeek) - cho lịch bận
    weekly_schedules = UserSchedule.query.filter_by(
        User_id=user_context['id'],
        DayOfWeek=day_of_week
    ).filter(UserSchedule.Date.is_(None)).all()  # Chỉ lấy lịch tuần (Date = NULL)
    
    print(f"[DEBUG] Daily schedules: {len(daily_schedules)}, Weekly schedules: {len(weekly_schedules)}")
    for s in weekly_schedules:
        print(f"[DEBUG] Weekly: DayOfWeek={s.DayOfWeek}, Period={s.Period}, Note={s.Note}, WorkoutId={s.WorkoutId}, MealId={s.MealId}")
    
    # Merge cả 2 loại lịch
    all_schedules = daily_schedules + weekly_schedules
    
    if not all_schedules:
        return f"Hôm nay {user_context['name']} chưa có lịch nào cả. Bạn vào mục Planner để tạo lịch ngay nhé! 📅"
    
    msg = f"📅 Lịch {date_str} của {user_context['name']}:\n\n"
    
    # Tách lịch tập/ăn và lịch bận
    workouts_meals = []
    busy_slots = []
    
    for s in all_schedules:
        if s.WorkoutId:
            w = Workout.query.get(s.WorkoutId)
            if w:
                workouts_meals.append(f"💪 {s.Period}: Tập {w.Name}")
        elif s.MealId:
            m = Meal.query.get(s.MealId)
            if m:
                workouts_meals.append(f"🥗 {s.Period}: Ăn {m.Name}")
        elif s.Note:  # Lịch bận (có Note)
            busy_slots.append(f"🚫 {s.Period}: {s.Note}")
    
    # Hiển thị lịch tập/ăn
    if workouts_meals:
        msg += "✅ LỊCH TẬP & ĂN:\n"
        msg += "\n".join(workouts_meals) + "\n\n"
    
    # Hiển thị lịch bận
    if busy_slots:
        msg += "⏰ LỊCH BẬN:\n"
        msg += "\n".join(busy_slots) + "\n\n"
    
    if not workouts_meals and not busy_slots:
        return "Lịch trống trơn à! Vào Planner tạo lịch đi nào! 🚀"
    
    msg += "💡 Chúc bạn một ngày năng động!"
    return msg

def handle_busy_schedule(user_context):
    """Trả lời về lịch bận"""
    if not user_context or not user_context.get('id'):
        return "Bạn cần đăng nhập để mình xem lịch bận giúp nhé! 🔒"
    
    target_date = datetime.now().date()
    day_names = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
    
    # FIX: Shift lùi 1 ngày để khớp DB
    shifted_index = (target_date.weekday() - 1) % 7
    day_of_week = day_names[shifted_index]
    
    # Query lấy lịch bận (có Note và DayOfWeek)
    busy_schedules = UserSchedule.query.filter_by(
        User_id=user_context['id'], 
        DayOfWeek=day_of_week
    ).filter(
        UserSchedule.Note.isnot(None),
        UserSchedule.Date.is_(None)  # Chỉ lấy lịch tuần
    ).all()
    
    if not busy_schedules:
        return f"Hôm nay {user_context['name']} không có lịch bận nào. Bạn rảnh cả ngày, đi tập thôi! 💪"
    
    msg = f"⏰ Lịch bận hôm nay của {user_context['name']}:\n\n"
    
    for s in busy_schedules:
        msg += f"🚫 {s.Period}: {s.Note}\n"
    
    msg += "\n💡 Những khung giờ còn lại bạn có thể sắp xếp tập luyện nhé!"
    return msg


def handle_my_stats(user_context):
    """Trả lời về thống kê tập luyện"""
    if not user_context or not user_context.get('id'):
        return "Đăng nhập đi bạn ơi, mình mới đếm được chứ!"
        
    log_count = Log.query.filter_by(User_id=user_context['id']).count()
    
    return f"{user_context['name']} ơi, bạn đã hoàn thành tổng cộng {log_count} buổi tập/bữa ăn rồi! Quá dữ! 🔥 Tiếp tục phát huy nhé!"

def handle_my_info(user_context):
    """Trả lời thông tin cá nhân"""
    if not user_context or not user_context.get('id'):
        return "Bạn chưa đăng nhập. Hãy đăng nhập để mình biết bạn là ai nhé! 🔒"
    return f"Bạn là {user_context['name']}, {user_context.get('age', '?')} tuổi. Một {user_context.get('sex', 'người')} tràn đầy năng lượng! 🔥"

def handle_my_body(user_context):
    """Trả lời chỉ số cơ thể"""
    if not user_context or not user_context.get('id'): return "Đăng nhập đi bạn ơi!"
    h = user_context.get('height', 0)
    w = user_context.get('weight', 0)
    bmi = round(w / ((h/100)**2), 1) if h > 0 else 0
    return f"Chỉ số của bạn: Cao {h}cm, Nặng {w}kg. BMI khoảng {bmi}. { 'Body chuẩn rồi!' if 18.5 <= bmi <= 25 else 'Cố gắng tập luyện thêm nhé!' } 💪"

def handle_my_sport(user_context):
    """Trả lời về môn thể thao"""
    if not user_context or not user_context.get('id'): return "Đăng nhập đi nào!"
    return f"Môn sở trường của bạn là {user_context.get('sport', 'Chưa chọn')}. Mục tiêu hiện tại: {user_context.get('goal', 'Chưa rõ')}. 🏆"

def handle_current_date(user_context):
    """Trả lời ngày giờ"""
    now = datetime.now()
    days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"]
    return f"Hôm nay là {days[now.weekday()]}, ngày {now.strftime('%d/%m/%Y')}. Giờ đẹp để đi tập đấy! ⏰"

def handle_calc_tdee(user_context):
    """Tính toán TDEE và Macro"""
    if not user_context or not user_context.get('id'):
        return "Bạn cần đăng nhập để mình tính TDEE chính xác nhé! 🔒"
    
    w = user_context.get('weight', 0)
    h = user_context.get('height', 0)
    age = user_context.get('age', 25)
    sex = user_context.get('sex', 'Male')
    
    if not w or not h:
        return "Bạn chưa cập nhật chiều cao cân nặng trong hồ sơ. Hãy vào Profile cập nhật đi nhé! 📝"

    # Mifflin-St Jeor Equation
    bmr = 10 * w + 6.25 * h - 5 * age
    if sex == 'Male' or sex == 'Nam': bmr += 5
    else: bmr -= 161
    
    # Giả sử activity level trung bình (1.55) - Có thể lấy từ DB nếu có
    tdee = int(bmr * 1.55)
    
    return f"""📊 Phân tích dinh dưỡng cho {user_context['name']}:
- BMR (Năng lượng nền): {int(bmr)} calo
- TDEE (Tiêu thụ hàng ngày): {tdee} calo

💡 Lời khuyên:
- Giữ cân: Ăn ~{tdee} calo
- Giảm cân: Ăn ~{tdee - 500} calo
- Tăng cân: Ăn ~{tdee + 500} calo

🍗 Macro gợi ý (Tăng cơ):
- Protein: {int(w * 2.2)}g
- Carb: {int((tdee * 0.4)/4)}g
- Fat: {int((tdee * 0.25)/9)}g"""

def handle_calc_bmi(user_context):
    """Phân tích BMI chi tiết"""
    if not user_context or not user_context.get('id'): return "Đăng nhập đi bạn ơi!"
    h = user_context.get('height', 0)
    w = user_context.get('weight', 0)
    
    if not h or not w: return "Chưa có chỉ số chiều cao cân nặng!"
    
    bmi = round(w / ((h/100)**2), 1)
    status = ""
    advice = ""
    
    if bmi < 18.5:
        status = "Thiếu cân"
        advice = "Bạn cần ăn nhiều hơn (Surplus Calorie) và tập tạ nặng để tăng cơ."
    elif 18.5 <= bmi <= 24.9:
        status = "Bình thường"
        advice = "Tuyệt vời! Hãy duy trì chế độ ăn uống và tập luyện hiện tại."
    elif 25 <= bmi <= 29.9:
        status = "Thừa cân"
        advice = "Hãy cắt giảm tinh bột, đường và tăng cường Cardio nhé."
    else:
        status = "Béo phì"
        advice = "Cần nghiêm túc giảm cân ngay để bảo vệ sức khỏe tim mạch."
        
    return f"Chỉ số BMI của bạn là: {bmi} ({status}).\n💡 {advice}"

def handle_greeting(user_context):
    """Chào hỏi cá nhân hóa"""
    if user_context and user_context.get('name'):
        return f"Chào {user_context['name']}! Rất vui được gặp lại bạn. Hôm nay bạn thấy trong người thế nào? 💪"
    return "Chào bạn! Tôi là MySportCoach AI. Tôi có thể giúp gì cho bạn hôm nay?"

def handle_weather(user_context):
    """Trả lời về thời tiết (Fake thông minh)"""
    responses = [
        "Dự báo thời tiết hôm nay rất đẹp để đi tập! 🌤️ Đừng lười biếng nhé!",
        "Trời có thể mưa, nhưng tinh thần tập luyện thì không được ướt! ☔ Phòng gym luôn mở cửa.",
        "Thời tiết này mà chạy bộ thì tuyệt vời. Nhớ mang giày êm nhé! 🏃‍♂️",
        "Hôm nay trời hơi nóng, nhớ uống đủ nước khi tập nhé! 💧"
    ]
    return random.choice(responses)

def handle_motivation(user_context):
    """Động viên tinh thần"""
    quotes = [
        "Đừng dừng lại khi mệt mỏi, hãy dừng lại khi đã xong! 💪",
        "Cơ bắp được sinh ra trong những rep cuối cùng. Cố lên!",
        "Hôm nay đau đớn, ngày mai mạnh mẽ. No Pain No Gain! 🔥",
        "Bạn không cần phải tuyệt vời để bắt đầu, nhưng bạn phải bắt đầu để trở nên tuyệt vời. 🚀",
        f"{user_context.get('name', 'Bạn')} ơi, hãy nhớ lý do bạn bắt đầu hành trình này!"
    ]
    return random.choice(quotes)

def handle_small_talk(user_context):
    """Giao tiếp xã giao"""
    responses = [
        f"Mình vẫn đang trực chiến 24/7 để hỗ trợ {user_context.get('name', 'bạn')} đây! ⚡",
        "Mình là AI nên không biết mệt, chỉ sợ bạn tập mệt thôi! 😆",
        "Hôm nay bạn có chuyện gì vui không? Kể mình nghe với!",
        "Mình đang học thêm nhiều bài tập mới để chỉ cho bạn nè. 📚"
    ]
    return random.choice(responses)

def handle_suggest_meal(user_context):
    """Gợi ý món ăn thông minh theo buổi"""
    now = datetime.now()
    hour = now.hour
    
    if 5 <= hour < 10:
        period = "Bữa sáng"
        options = [
            "Yến mạch ngâm qua đêm (Overnight Oats) với chuối và hạt chia. 🥣",
            "Trứng ốp la + Bánh mì đen + 1 ly sữa không đường. 🍳",
            "Phở bò (ít bánh, nhiều thịt, không nước béo). 🍜",
            "Sinh tố bơ chuối + Whey Protein. Nhanh gọn lẹ! 🥤"
        ]
    elif 10 <= hour < 14:
        period = "Bữa trưa"
        options = [
            "Cơm gạo lứt + Ức gà xào nấm + Canh rau ngót. 🍚",
            "Bún lứt trộn thịt bò + Rau sống. 🥗",
            "Cá thu kho tộ + Cơm trắng + Dưa leo. 🐟",
            "Sandwich ức gà + Salad. 🥪"
        ]
    elif 14 <= hour < 18:
        period = "Bữa phụ chiều"
        options = [
            "1 hộp sữa chua Hy Lạp + Hạnh nhân. 🥛",
            "1 quả táo + Bơ đậu phộng. 🍎",
            "1 thanh Protein Bar. 🍫",
            "1 quả chuối luộc. 🍌"
        ]
    else:
        period = "Bữa tối"
        options = [
            "Salad cá ngừ + Trứng luộc. Nhẹ bụng dễ ngủ! 🥗",
            "Thịt heo luộc cuốn bánh tráng (nhiều rau). 🌯",
            "Ức gà nướng mật ong + Súp lơ luộc. 🍗",
            "Canh bí đỏ thịt bằm. 🎃"
        ]
        
    suggestion = random.choice(options)
    return f"💡 Gợi ý {period} cho {user_context.get('name', 'bạn')}: {suggestion} Chúc ngon miệng!"

def handle_suggest_workout(user_context):
    """Gợi ý bài tập ngẫu nhiên"""
    workouts = [
        "🔥 Cardio đốt mỡ: Nhảy dây 10 phút + Burpees 3 hiệp (10 cái/hiệp).",
        "🦵 Leg Day: Squat 4x12, Lunges 3x12, Calf Raise 4x15.",
        "💪 Chest Day: Push-up 4xMax, Bench Press 4x10, Fly 3x12.",
        "🐢 Active Recovery: Yoga 30 phút hoặc đi bộ nhẹ nhàng.",
        "🍫 Abs Workout: Plank 3x1p, Crunch 3x20, Leg Raise 3x15."
    ]
    return f"Hôm nay thử bài này xem: {random.choice(workouts)} Cố lên! 💪"

# Map Intent Tag -> Handler Function
INTENT_HANDLERS = {
    "schedule": handle_schedule_query,
    "busy_schedule": handle_busy_schedule,
    "stats": handle_my_stats,
    "greeting": handle_greeting,
    "my_info": handle_my_info,
    "my_body": handle_my_body,
    "my_sport": handle_my_sport,
    "current_date": handle_current_date,
    "identity": handle_my_info,
    "calc_tdee": handle_calc_tdee,
    "calc_bmi": handle_calc_bmi,
    "weather": handle_weather,
    "motivation": handle_motivation,
    "small_talk": handle_small_talk,
    "love": handle_small_talk,
    "funny": handle_small_talk,
    "suggest_meal": handle_suggest_meal,
    "suggest_workout": handle_suggest_workout
}

def get_response(msg, user_context=None):
    if not model:
        return "Hệ thống đang bảo trì (Chưa train model)."

    # 1. Dự đoán Intent
    sentence = tokenize(msg)
    X = bag_of_words(sentence, all_words)
    X = X.reshape(1, X.shape[0])
    X = torch.from_numpy(X).to(device)

    output = model(X)
    _, predicted = torch.max(output, dim=1)
    tag = tags[predicted.item()]

    # Tính độ tin cậy
    probs = torch.softmax(output, dim=1)
    prob = probs[0][predicted.item()]
    
    # Ngưỡng tin cậy (Threshold)
    if prob.item() > 0.75:
        # 2. Kiểm tra xem có Handler thông minh cho Intent này không
        if tag in INTENT_HANDLERS and user_context:
            return INTENT_HANDLERS[tag](user_context)
            
        # 3. Nếu không, trả lời theo câu mẫu (Random response)
        for intent in intents['intents']:
            if tag == intent['tag']:
                response = random.choice(intent['responses'])
                # Thay thế placeholder {name} nếu có
                if user_context and "{name}" in response:
                    response = response.replace("{name}", user_context['name'])
                return response
    
    return "Xin lỗi, tôi chưa hiểu ý bạn lắm. Bạn thử hỏi về lịch tập, dinh dưỡng xem sao nhé!"
