"""
Cải thiện chatbot - Tăng thông minh lên nhiều lần
Tạo data tốt hơn và train model mạnh hơn
"""
import json
import os
import subprocess
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INTENTS_FILE = os.path.join(BASE_DIR, 'data', 'intents_mega.json')

print("=" * 70)
print("CAI THIEN CHATBOT - TANG THONG MINH LEN NHIEU LAN")
print("=" * 70)

# Đọc data hiện tại
print("\n1. Dang doc data hien tai...")
if os.path.exists(INTENTS_FILE):
    with open(INTENTS_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    intents_dict = {intent['tag']: intent for intent in data.get('intents', [])}
    print(f"   Da doc {len(intents_dict)} intents")
else:
    intents_dict = {}
    print("   Tao moi")

def expand_patterns(bases, target=5000):
    """Tạo rất nhiều patterns tự nhiên"""
    patterns = []
    prefixes = [
        "", "Cho tôi biết ", "Hướng dẫn ", "Giải thích ", "Tư vấn ", 
        "Làm sao ", "Cách nào ", "Bạn có thể ", "Mình muốn biết ", 
        "Tôi cần ", "Giúp tôi ", "Có thể ", "Làm thế nào ", 
        "Như thế nào ", "Vì sao ", "Tại sao ", "Khi nào ", "Ở đâu ",
        "Xin hỏi ", "Làm ơn ", "Cho mình hỏi ", "Tôi muốn biết ",
        "Bạn biết gì về ", "Kể cho tôi về ", "Nói về ", "Giới thiệu về ",
        "Hãy giải thích ", "Có thể giải thích ", "Làm ơn giải thích ",
        "Tôi muốn hỏi về ", "Bạn có biết về ", "Mình cần biết về ",
        "Giúp mình hiểu về ", "Có thể nói về ", "Nói cho tôi biết về "
    ]
    
    suffixes = [
        "", " được không", " đi", " nhé", " cho tôi", " giúp tôi", 
        " cho mình", " nào", " không", "?", " nhé bạn", " được chứ",
        " thế nào", " như thế nào", " ra sao", " như nào", " là gì",
        " có nghĩa là gì", " được thực hiện như thế nào"
    ]
    
    for base in bases:
        patterns.append(base)
        for p in prefixes[:30]:
            for s in suffixes[:18]:
                if p or s:
                    patterns.append(f"{p}{base}{s}")
        # Thêm dạng câu hỏi khác
        for q in [" là gì", " là như thế nào", " hoạt động ra sao", " có nghĩa là gì"]:
            patterns.append(f"{base}{q}")
            patterns.append(f"{base}{q}?")
    
    return list(set(patterns))[:target]

def add_intent(tag, bases, responses, min_patterns=5000):
    """Thêm intent với nhiều patterns và responses tốt hơn"""
    patterns = expand_patterns(bases, min_patterns)
    
    if tag in intents_dict:
        old = intents_dict[tag]
        old['patterns'] = list(set(old.get('patterns', []) + patterns))
        old['responses'] = list(set(old.get('responses', []) + responses))
        print(f"   Cap nhat: {tag} - {len(old['patterns']):,} patterns")
    else:
        intents_dict[tag] = {
            "tag": tag,
            "patterns": patterns,
            "responses": responses
        }
        print(f"   Them moi: {tag} - {len(patterns):,} patterns")

print("\n2. Dang cai thien training data...")

# BÓNG ĐÁ - Cải thiện responses
add_intent("football_rules",
    ["Việt vị", "Luật việt vị", "Offside", "Luật offside", "Việt vị là gì", 
     "Luật penalty", "Thẻ vàng", "Thẻ đỏ", "Luật handball", "Luật VAR"] * 200,
    [
        "Việt vị (Offside) là lỗi xảy ra khi cầu thủ tấn công đứng gần khung thành đối phương hơn cả bóng và cầu thủ phòng ngự thứ hai (trừ thủ môn) khi bóng được chuyền. Điều kiện: 1) Cầu thủ ở phần sân đối phương, 2) Tham gia tích cực vào tình huống tấn công. ⚽",
        "Thẻ vàng là hình thức cảnh cáo dành cho các hành vi phi thể thao, phản đối, cố ý trì hoãn trận đấu. Nhận 2 thẻ vàng sẽ bị thẻ đỏ và đuổi khỏi sân! ⚠️",
        "Thẻ đỏ được sử dụng khi cầu thủ phạm lỗi nghiêm trọng, bạo lực, cố ý phạm lỗi ngăn cản bàn thắng rõ ràng, hoặc có hành vi/lời nói xúc phạm. Sẽ bị đuổi khỏi sân ngay lập tức! ⛔"
    ],
    10000)

add_intent("football_tactics",
    ["Tiki-taka", "Gegenpressing", "False 9", "Sơ đồ 4-3-3", "Chiến thuật bóng đá",
     "Pressing cao", "Phòng ngự phản công", "Total football"] * 200,
    [
        "Tiki-taka là phong cách chơi bóng ngắn, kiểm soát bóng cao, di chuyển liên tục để tạo tam giác chuyền bóng. Barcelona 2008-2012 là ví dụ điển hình với tỷ lệ kiểm soát bóng trên 70%. Yêu cầu kỹ thuật cao và thể lực tốt! ⚽",
        "Gegenpressing (phản công tức thì) là chiến thuật mất bóng lập tức pressing để giành lại trong vòng 5-6 giây. Liverpool của Klopp sử dụng rất hiệu quả. Cần thể lực cực tốt và sự phối hợp nhịp nhàng! 🔥",
        "Sơ đồ 4-3-3 là đội hình phổ biến nhất với 4 hậu vệ, 3 tiền vệ (1 phòng ngự + 2 box-to-box), 3 tiền đạo (2 cánh + 1 trung tâm). Cân bằng tốt giữa tấn công và phòng ngự! 📐"
    ],
    10000)

# BÓNG CHUYỀN
add_intent("volleyball_rules",
    ["Bóng chuyền chơi mấy người", "Luật bóng chuyền", "Luật rotation", 
     "Luật libero", "Luật 4 chạm"] * 200,
    [
        "Bóng chuyền mỗi đội có 6 người trên sân. Có thể có thêm 1 Libero (chuyên phòng thủ, mặc áo khác màu). Tổng cộng tối đa 14 người trong đội (6 chính + 6 dự bị + 2 Libero). 🏐",
        "Luật Rotation: Sau mỗi lần giành quyền giao bóng, các cầu thủ phải xoay vị trí theo chiều kim đồng hồ. Đảm bảo mọi người đều chơi ở mọi vị trí! 🔄",
        "Luật 4 chạm: Mỗi đội chỉ được chạm bóng tối đa 3 lần trước khi đưa bóng sang sân đối phương. Chạm lần thứ 4 sẽ bị phạm lỗi! ⚠️"
    ],
    8000)

# CẦU LÔNG
add_intent("badminton_rules",
    ["Cầu lông chơi mấy người", "Luật cầu lông", "Cầu lông đơn", "Cầu lông đôi"] * 200,
    [
        "Cầu lông có thể chơi đơn (1 vs 1) hoặc đôi (2 vs 2). Mỗi bên tối đa 2 người. Tính điểm: Thắng 21 điểm trước (cách biệt 2 điểm) hoặc 30 điểm là thắng set. 🏸",
        "Cầu lông đơn: Mỗi bên 1 người. Sân nhỏ hơn đôi. Tập trung vào di chuyển và độ chính xác! 🏸",
        "Cầu lông đôi: Mỗi bên 2 người. Sân rộng hơn. Cần phối hợp tốt và chiến thuật! 🏸"
    ],
    8000)

# THỜI TIẾT
add_intent("weather_query",
    ["Thời tiết", "Thời tiết hôm nay", "Thời tiết Hà Nội", "Thời tiết Đà Nẵng",
     "Thời tiết HCM", "Đà Nẵng có mưa không", "Hà Nội có mưa không"] * 200,
    ["[HANDLER: handle_weather_query]"],
    8000)

# GYM
add_intent("gym_exercises",
    ["Cách squat đúng", "Cách deadlift đúng", "Cách bench press đúng",
     "Form squat", "Form deadlift", "Kỹ thuật squat"] * 200,
    [
        "Squat đúng: Chân rộng bằng vai, mũi chân hơi xoay ra ngoài. Gập hông trước rồi gập gối, gối không vượt quá mũi chân. Lưng thẳng, xuống sâu đến khi đùi song song với sàn (thighs parallel), sau đó đẩy gót chân lên. Quan trọng: Giữ core căng, đầu ngẩng cao! 🦵",
        "Deadlift đúng: Chân rộng bằng hông, bàn chân dưới thanh tạ. Nắm tay rộng bằng vai, lưng thẳng từ đầu đến cuối. Gồng core, kéo thanh tạ sát người, đẩy hông về phía trước khi đứng lên. Quan trọng: Không cong lưng, thanh tạ luôn sát người! 💪",
        "Bench Press đúng: Nằm trên bench, chân đặt vững trên sàn. Nắm tay rộng hơn vai một chút. Hạ tạ chậm đến ngực (không nảy bóng), sau đó đẩy lên mạnh. Quan trọng: Giữ vai và lưng ổn định, không nhấc chân! 🏋️"
    ],
    10000)

# DINH DƯỠNG
add_intent("nutrition_macros",
    ["Macro là gì", "Protein", "Carb", "Fat", "Tính macro", 
     "Macro cho tăng cơ", "Macro cho giảm cân"] * 200,
    [
        "Macros là 3 chất dinh dưỡng đa lượng: Protein (4 cal/g) - xây dựng cơ bắp, Carb (4 cal/g) - năng lượng chính, Fat (9 cal/g) - hormone và hấp thụ vitamin. Cân bằng cả 3 rất quan trọng! 🥗",
        "Tăng cơ: Protein 2-2.5g/kg thể trọng, Carb 4-6g/kg, Fat 0.8-1g/kg. Calorie surplus 300-500 cal/ngày. Quan trọng: Protein đủ + training đúng! 💪",
        "Giảm cân: Protein 2-2.5g/kg (giữ cơ), Carb 2-3g/kg, Fat 0.6-0.8g/kg. Calorie deficit 500 cal/ngày. Không được cắt protein vì sẽ mất cơ! 🔥"
    ],
    10000)

print("\n3. Dang luu data...")
output = {"intents": list(intents_dict.values())}
with open(INTENTS_FILE, 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

total_patterns = sum(len(i.get('patterns', [])) for i in output['intents'])
print(f"   Tong so patterns: {total_patterns:,}")
print(f"   Tong so intents: {len(output['intents'])}")

print("\n4. Dang train model voi cau hinh manh hon...")
print("   Hidden size: 3072 neurons (tang len)")
print("   Epochs: 400 (tang len)")
print("   Batch size: 512 (tang len)")

print("\n" + "=" * 70)
print("BAT DAU TRAINING...")
print("Qua trinh nay co the mat 20-40 phut...")
print("=" * 70)

# Chạy training trực tiếp (không background để thấy progress)
train_script = os.path.join(BASE_DIR, 'train_super.py')
subprocess.run([sys.executable, train_script], cwd=BASE_DIR)

print("\n" + "=" * 70)
print("TRAINING HOAN TAT!")
print("=" * 70)


