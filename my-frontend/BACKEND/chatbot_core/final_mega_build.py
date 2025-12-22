"""
FINAL MEGA BUILD - 500,000+ Patterns
Thêm TẤT CẢ môn thể thao và kiến thức cực kỳ toàn diện
"""
import json
import os

current_file = 'data/intents_mega.json'
print("🚀 FINAL MEGA BUILD - Gấp 10 lần thông minh hơn!")
print("=" * 70)

with open(current_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

intents = {intent['tag']: intent for intent in data.get('intents', [])}
print(f"📂 Đã đọc {len(intents)} intents")

def mega_expand(bases, target=3000):
    """Tạo cực nhiều biến thể"""
    patterns = []
    prefixes = ["", "Cho tôi biết ", "Hướng dẫn ", "Giải thích ", "Tư vấn ", "Làm sao ", "Cách nào ", "Bạn có thể ", "Mình muốn biết ", "Tôi cần ", "Giúp tôi ", "Có thể ", "Làm thế nào ", "Như thế nào ", "Vì sao ", "Tại sao ", "Khi nào ", "Ở đâu ", "Xin hỏi ", "Làm ơn ", "Cho mình hỏi ", "Tôi muốn biết ", "Bạn biết gì về ", "Kể cho tôi về ", "Nói về ", "Giới thiệu về ", "Hãy giải thích ", "Có thể giải thích ", "Làm ơn giải thích ", "Tôi muốn hỏi về ", "Bạn có biết về "]
    suffixes = ["", " được không", " đi", " nhé", " cho tôi", " giúp tôi", " cho mình", " nào", " không", "?", " nhé bạn", " được chứ", " thế nào", " như thế nào", " ra sao", " như nào", " là gì", " như thế nào", " hoạt động ra sao", " có nghĩa là gì", " được thực hiện như thế nào", " được làm như thế nào"]
    
    for base in bases:
        patterns.append(base)
        for p in prefixes[:25]:
            for s in suffixes[:20]:
                if p or s:
                    patterns.append(f"{p}{base}{s}")
        # Câu hỏi
        for q in [" là gì", " là như thế nào", " hoạt động ra sao", " có nghĩa là gì"]:
            patterns.append(f"{base}{q}")
            patterns.append(f"{base}{q}?")
    
    return list(set(patterns))[:target]

def add(tag, bases, responses, target=3000):
    """Thêm intent với cực nhiều patterns"""
    patterns = mega_expand(bases, target)
    if tag in intents:
        old = intents[tag]
        old['patterns'] = list(set(old.get('patterns', []) + patterns))
        old['responses'] = list(set(old.get('responses', []) + responses))
        print(f"  🔄 {tag}: {len(old['patterns']):,} patterns")
    else:
        intents[tag] = {"tag": tag, "patterns": patterns, "responses": responses}
        print(f"  ✅ {tag}: {len(patterns):,} patterns")

print("\n📝 Đang thêm TẤT CẢ môn thể thao...")

# BÓNG CHUYỀN
print("\n🏐 Bóng chuyền...")
add("volleyball_rules", 
    ["Luật bóng chuyền", "Bóng chuyền chơi mấy người", "Luật chạm lưới", "Luật rotation", "Luật libero", "Luật service", "Luật block", "Luật attack", "Bóng chuyền có bao nhiêu người", "Đội bóng chuyền có mấy người", "Luật 4 chạm", "Luật double touch"] * 100,
    ["Bóng chuyền: Mỗi đội có 6 người trên sân. Có thể có thêm 1 Libero (chuyên phòng thủ). Tổng cộng tối đa 14 người trong đội (6 chính + 6 dự bị + 2 Libero). 🏐",
     "Luật Rotation: Sau mỗi lần giành quyền giao bóng, các cầu thủ phải xoay vị trí theo chiều kim đồng hồ. Quan trọng để đảm bảo công bằng! 🔄"],
    3000)

add("volleyball_techniques",
    ["Kỹ thuật bóng chuyền", "Kỹ thuật đệm bóng", "Kỹ thuật búng bóng", "Kỹ thuật đập bóng", "Kỹ thuật chắn bóng", "Kỹ thuật giao bóng", "Cách đệm bóng", "Cách búng bóng", "Cách đập bóng", "Cách chắn bóng"] * 100,
    ["Đệm bóng: Hai tay đan vào nhau, tạo bàn tay phẳng, đệm bóng bằng cẳng tay. Quan trọng: Gập gối, di chuyển đến bóng, đệm bóng lên cao về phía setter! 🏐",
     "Đập bóng (Spike): Nhảy cao, đập bóng mạnh xuống sân đối phương. Quan trọng: Approach (3 bước), timing, vị trí tay, follow-through! 💥"],
    3000)

# CẦU LÔNG
print("\n🏸 Cầu lông...")
add("badminton_rules",
    ["Luật cầu lông", "Cầu lông chơi mấy người", "Luật giao cầu", "Luật tính điểm", "Luật đổi sân", "Luật lỗi cầu lông", "Cầu lông đánh mấy người", "Cầu lông đơn", "Cầu lông đôi"] * 100,
    ["Cầu lông: Có thể chơi đơn (1 vs 1) hoặc đôi (2 vs 2). Mỗi bên tối đa 2 người. 🏸",
     "Tính điểm: Mỗi điểm được tính khi đối phương phạm lỗi hoặc cầu rơi trong sân. Thắng 21 điểm trước (cách biệt 2 điểm) hoặc 30 điểm là thắng set! 📊"],
    3000)

add("badminton_techniques",
    ["Kỹ thuật cầu lông", "Kỹ thuật smash", "Kỹ thuật drop shot", "Kỹ thuật clear", "Kỹ thuật net shot", "Kỹ thuật drive", "Kỹ thuật giao cầu", "Footwork cầu lông", "Cách đánh smash", "Cách đánh drop", "Cách di chuyển cầu lông"] * 100,
    ["Smash: Đánh cầu từ trên cao xuống mạnh và nhanh. Quan trọng: Vị trí, timing, sức mạnh cổ tay, follow-through. Lin Dan và Lee Chong Wei là bậc thầy! 💥",
     "Drop Shot: Đánh cầu nhẹ, rơi gần lưới. Quan trọng: Giả vờ smash, đánh nhẹ, độ chính xác. Lừa đối phương! 🎯"],
    3000)

# TENNIS
print("\n🎾 Tennis...")
add("tennis_rules",
    ["Luật tennis", "Tennis chơi mấy người", "Luật tính điểm tennis", "Luật giao bóng tennis", "Luật deuce", "Luật tiebreak", "Tennis đơn", "Tennis đôi"] * 100,
    ["Tennis: Có thể chơi đơn (1 vs 1) hoặc đôi (2 vs 2). Mỗi bên tối đa 2 người. 🎾",
     "Tính điểm: 0 (Love), 15, 30, 40, Game. Phải thắng với cách biệt 2 điểm. Deuce khi 40-40, phải thắng 2 điểm liên tiếp! 📊"],
    3000)

add("tennis_techniques",
    ["Kỹ thuật tennis", "Kỹ thuật forehand", "Kỹ thuật backhand", "Kỹ thuật serve", "Kỹ thuật volley", "Kỹ thuật smash tennis", "Kỹ thuật slice", "Kỹ thuật topspin"] * 100,
    ["Forehand: Cú đánh thuận tay. Quan trọng: Grip đúng, backswing, contact point, follow-through. Federer là bậc thầy! 🎾",
     "Backhand: Cú đánh trái tay. Có thể 1 tay hoặc 2 tay. Quan trọng: Grip, rotation, timing. Djokovic backhand 2 tay rất mạnh! 💪"],
    3000)

# BÓNG RỔ
print("\n🏀 Bóng rổ...")
add("basketball_rules",
    ["Luật bóng rổ", "Bóng rổ chơi mấy người", "Luật 24 giây", "Luật 3 giây", "Luật 8 giây", "Luật 5 giây", "Luật traveling", "Luật double dribble", "Luật foul", "Luật free throw", "Bóng rổ có bao nhiêu người"] * 100,
    ["Bóng rổ: Mỗi đội có 5 người trên sân. Tổng cộng 12 người trong đội (5 chính + 7 dự bị). 🏀",
     "Luật 24 giây: Phải ném bóng trong vòng 24 giây. Nếu không = mất quyền sở hữu bóng! ⏱️"],
    3000)

add("basketball_techniques",
    ["Kỹ thuật bóng rổ", "Kỹ thuật ném bóng", "Kỹ thuật dribble", "Kỹ thuật pass", "Kỹ thuật layup", "Kỹ thuật dunk", "Kỹ thuật crossover", "Kỹ thuật fadeaway"] * 100,
    ["Ném bóng: Tư thế đúng, nhắm mục tiêu, follow-through. Quan trọng: Arc (độ cong), backspin, consistency. Curry là bậc thầy 3-point! 🎯"],
    3000)

# BOXING
print("\n🥊 Boxing...")
add("boxing_techniques",
    ["Kỹ thuật boxing", "Kỹ thuật đấm", "Jab", "Cross", "Hook", "Uppercut", "Kỹ thuật phòng thủ boxing", "Kỹ thuật dodge", "Kỹ thuật block", "Footwork boxing", "Kỹ thuật combo"] * 100,
    ["Jab: Cú đấm thẳng bằng tay trước. Quan trọng: Tốc độ, độ chính xác, giữ khoảng cách. Cú đấm cơ bản nhất! 👊",
     "Cross: Cú đấm thẳng bằng tay sau. Quan trọng: Sức mạnh, rotation hông, follow-through. Cú đấm mạnh nhất! 💥"],
    3000)

# VÕ THUẬT
print("\n🥋 Võ thuật...")
add("martial_arts",
    ["Võ thuật", "Kỹ thuật võ", "Muay Thai", "Kickboxing", "Karate", "Taekwondo", "Judo", "BJJ", "Brazilian Jiu-Jitsu", "Wrestling", "MMA"] * 100,
    ["Muay Thai: Võ thuật Thái Lan, sử dụng 8 điểm (nắm đấm, khuỷu tay, đầu gối, cẳng chân). Quan trọng: Clinch, knee strikes, elbow strikes! 🥊",
     "BJJ: Brazilian Jiu-Jitsu, tập trung vào ground fighting và submissions. Quan trọng: Position, leverage, submissions (armbar, triangle, kimura)! 🥋"],
    3000)

# BÓNG ĐÁ - MỞ RỘNG THÊM
print("\n⚽ Bóng đá - Mở rộng thêm...")
add("football_tactics",
    ["Tiki-taka", "Gegenpressing", "False 9", "Sơ đồ 4-3-3", "Sơ đồ 4-4-2", "Sơ đồ 3-5-2", "Pressing cao", "Phòng ngự phản công", "Total football", "Chiến thuật bóng đá", "Chiến thuật Barcelona", "Chiến thuật Liverpool"] * 100,
    ["Tiki-taka: Phong cách chơi bóng ngắn, kiểm soát bóng, di chuyển liên tục. Barcelona 2008-2012 là ví dụ điển hình. Yêu cầu kỹ thuật cao và thể lực tốt! ⚽",
     "Gegenpressing: Mất bóng lập tức pressing để giành lại. Liverpool của Klopp sử dụng rất hiệu quả. Cần thể lực cực tốt! 🔥"],
    5000)

add("football_techniques",
    ["Kỹ thuật rê bóng", "La Croqueta", "Elastico", "Kỹ thuật sút bóng", "Curve ball", "First touch", "Kỹ thuật chuyền", "Kỹ thuật Messi", "Kỹ thuật Ronaldo"] * 100,
    ["La Croqueta: Đẩy bóng sang một bên bằng chân này, rồi nhanh chóng đẩy sang bên kia bằng chân kia. Messi làm điều này hoàn hảo! Yêu cầu tốc độ và sự khéo léo! ⚽"],
    5000)

add("football_rules",
    ["Luật việt vị", "Luật offside", "Luật penalty", "Thẻ vàng", "Thẻ đỏ", "Luật handball", "Luật VAR", "Việt vị là gì"] * 100,
    ["Việt vị: Cầu thủ tấn công đứng gần khung thành đối phương hơn bóng và cầu thủ phòng ngự thứ 2 (trừ thủ môn) khi bóng được chuyền. Phải có 2 điều kiện: 1) Ở phần sân đối phương, 2) Tham gia tình huống tấn công! ⚽"],
    3000)

# GYM - MỞ RỘNG THÊM
print("\n🏋️ Gym - Mở rộng thêm...")
add("gym_progressive_overload",
    ["Progressive overload", "Tăng tạ", "Làm sao tăng cơ", "Plateau", "Vượt qua plateau"] * 100,
    ["Progressive Overload: Nguyên tắc vàng của tăng cơ! Phải liên tục tăng khối lượng tạ, số rep, hoặc volume theo thời gian. Cơ thể thích nghi nhanh, phải ép nó! 💪"],
    5000)

add("gym_exercises",
    ["Cách squat đúng", "Cách deadlift đúng", "Cách bench press đúng", "Form squat", "Form deadlift", "Kỹ thuật squat", "Kỹ thuật deadlift"] * 100,
    ["Squat đúng: Chân rộng bằng vai, mũi chân hơi xoay ra, gập hông trước rồi gập gối, gối không vượt mũi chân, lưng thẳng, xuống sâu (thighs parallel), đẩy gót chân lên! 🦵"],
    5000)

# CHẠY BỘ - MỞ RỘNG THÊM
print("\n🏃 Chạy bộ - Mở rộng thêm...")
add("running_technique",
    ["Pose method", "Kỹ thuật chạy", "Foot strike", "Cadence", "Cách chạy đúng", "Cách chạy nhanh", "Cách chạy bền"] * 100,
    ["Pose Method: Chạy bằng cách 'rơi' về phía trước, tiếp đất bằng midfoot, nhấc chân lên nhanh (high cadence 180 bước/phút). Hiệu quả và ít chấn thương! 🏃"],
    5000)

# DINH DƯỠNG - MỞ RỘNG THÊM
print("\n🥗 Dinh dưỡng - Mở rộng thêm...")
add("nutrition_macros",
    ["Macro là gì", "Protein", "Carb", "Fat", "Tính macro", "Macro cho tăng cơ", "Macro cho giảm cân", "BMR", "TDEE"] * 100,
    ["Macros: Protein (4 cal/g) - xây cơ, Carb (4 cal/g) - năng lượng, Fat (9 cal/g) - hormone và hấp thụ vitamin. Cân bằng cả 3! 🥗"],
    5000)

# THỜI TIẾT - MỞ RỘNG
print("\n🌤️ Thời tiết - Mở rộng...")
add("weather_query",
    ["Thời tiết", "Thời tiết hôm nay", "Thời tiết Hà Nội", "Thời tiết HCM", "Thời tiết Đà Nẵng", "Thời tiết Huế", "Thời tiết Nha Trang", "Đà Nẵng có mưa không", "Hà Nội có mưa không"] * 100,
    ["[HANDLER: handle_weather_query]"],
    3000)

# Lưu file
print("\n💾 Đang lưu file...")
output = {"intents": list(intents.values())}
with open(current_file, 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

total = sum(len(i.get('patterns', [])) for i in output['intents'])
print(f"\n✅ HOÀN TẤT!")
print(f"📊 Intents: {len(output['intents'])}")
print(f"📝 Patterns: {total:,}")
print(f"\n🎯 Bước tiếp theo: Chạy python train_mega_expert.py")

















