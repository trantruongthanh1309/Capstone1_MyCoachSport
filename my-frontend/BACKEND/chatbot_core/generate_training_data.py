import json
import random

sports_intents = []

football_patterns = [
    "Cách sút bóng mạnh", "Kỹ thuật sút penalty", "Cách chuyền bóng chính xác",
    "Kỹ thuật đỡ bóng", "Cách đánh đầu", "Kỹ thuật rê bóng",
    "Cách phòng thủ trong bóng đá", "Kỹ thuật cắt bóng", "Cách đá phạt trực tiếp",
    "Kỹ thuật đá corner", "Cách làm thủ môn", "Kỹ thuật bắt bóng thủ môn",
    
    "Sơ đồ 4-3-3 là gì", "Chiến thuật pressing", "Cách phản công nhanh",
    "Sơ đồ 4-4-2", "Chiến thuật tiki-taka", "Cách đá phòng ngự phản công",
    "Sơ đồ 3-5-2", "Chiến thuật catenaccio", "Cách chơi wing back",
    
    "Bài tập thể lực cho cầu thủ", "Cách tăng tốc độ chạy", "Bài tập tăng sức bền",
    "Cách tăng sức bật", "Bài tập plyometric cho bóng đá", "Cách tăng sức mạnh chân",
    "Bài tập HIIT cho cầu thủ", "Cách cải thiện thể lực", "Bài tập sprint",
    
    "Cầu thủ nên ăn gì", "Chế độ ăn trước trận", "Ăn gì sau khi đá bóng",
    "Nước uống cho cầu thủ", "Carb loading là gì", "Protein cho cầu thủ",
]

for i in range(50):
    football_patterns.extend([
        f"Cách rê bóng qua đối thủ kiểu {i+1}",
        f"Kỹ thuật sút xa {i+1}m",
        f"Bài tập thể lực tuần {i+1}",
        f"Chiến thuật tấn công số {i+1}",
        f"Cách phòng thủ vị trí {i+1}",
        f"Kỹ năng cầu thủ level {i+1}",
        f"Bài tập tăng tốc độ ngày {i+1}",
        f"Chế độ ăn cho cầu thủ tuần {i+1}",
    ])

sports_intents.append({
    "tag": "football_detailed",
    "patterns": football_patterns[:500],
    "responses": [
        "Bóng đá đòi hỏi sự kết hợp giữa kỹ thuật, chiến thuật và thể lực. Hãy tập luyện đều đặn các kỹ năng cơ bản như chuyền, sút, rê bóng.",
        "Để chơi bóng đá tốt, bạn cần: 1) Kỹ thuật cá nhân vững (first touch, passing, shooting), 2) Thể lực tốt (stamina, speed, agility), 3) Hiểu biết chiến thuật.",
        "Cầu thủ chuyên nghiệp tập luyện 5-6 ngày/tuần, kết hợp kỹ thuật, thể lực và chiến thuật. Dinh dưỡng và nghỉ ngơi cũng quan trọng như tập luyện."
    ]
})

basketball_patterns = [
    "Cách ném rổ chuẩn", "Kỹ thuật layup", "Cách dribble hiệu quả",
    "Kỹ thuật crossover", "Cách phòng thủ man-to-man", "Kỹ thuật rebound",
    "Cách chuyền bóng nhanh", "Kỹ thuật pick and roll", "Cách ném 3 điểm",
    "Kỹ thuật fadeaway", "Cách phòng thủ zone", "Kỹ thuật post up",
]

for i in range(50):
    basketball_patterns.extend([
        f"Bài tập dribbling level {i+1}",
        f"Kỹ thuật shooting từ vị trí {i+1}",
        f"Chiến thuật tấn công số {i+1}",
        f"Bài tập tăng chiều cao nhảy ngày {i+1}",
        f"Kỹ năng phòng thủ tuần {i+1}",
        f"Bài tập thể lực bóng rổ {i+1}",
        f"Chế độ ăn cho cầu thủ bóng rổ tuần {i+1}",
        f"Kỹ thuật chuyền bóng kiểu {i+1}",
    ])

sports_intents.append({
    "tag": "basketball_detailed",
    "patterns": basketball_patterns[:500],
    "responses": [
        "Bóng rổ cần sự kết hợp giữa kỹ thuật cá nhân (shooting, dribbling, passing) và làm việc nhóm. Hãy tập luyện shooting form đúng chuẩn từ đầu.",
        "Để chơi bóng rổ giỏi: 1) Tập shooting mỗi ngày (100-200 lần ném), 2) Luyện dribbling 2 tay, 3) Tăng sức bật (plyometrics), 4) Cải thiện thể lực (HIIT).",
        "Cầu thủ bóng rổ cần thể lực tốt, sức bật cao và kỹ thuật vững. Tập gym để tăng sức mạnh chân (squat, deadlift) và core stability."
    ]
})

badminton_patterns = [
    "Cách cầm vợt cầu lông", "Kỹ thuật smash", "Cách đánh cầu cao",
    "Kỹ thuật drop shot", "Cách di chuyển sân cầu", "Kỹ thuật phát cầu",
    "Cách đánh cầu lưới", "Kỹ thuật clear", "Cách đánh backhand",
]

for i in range(30):
    badminton_patterns.extend([
        f"Bài tập footwork cầu lông ngày {i+1}",
        f"Kỹ thuật smash level {i+1}",
        f"Bài tập tăng tốc độ tay {i+1}",
        f"Chiến thuật đơn nam tuần {i+1}",
        f"Kỹ năng đánh đôi {i+1}",
        f"Bài tập thể lực cầu lông {i+1}",
        f"Chế độ ăn cho vận động viên cầu lông {i+1}",
        f"Kỹ thuật phòng thủ kiểu {i+1}",
    ])

sports_intents.append({
    "tag": "badminton_detailed",
    "patterns": badminton_patterns[:300],
    "responses": [
        "Cầu lông đòi hỏi tốc độ, sự nhanh nhẹn và kỹ thuật tay tinh tế. Footwork (di chuyển chân) là nền tảng quan trọng nhất.",
        "Để chơi cầu lông tốt: 1) Luyện footwork mỗi ngày, 2) Tập smash và clear, 3) Cải thiện phản xạ, 4) Tăng sức bền (chạy bộ, nhảy dây).",
        "Vận động viên cầu lông cần thể lực tốt, đặc biệt là sức bền và tốc độ. Tập HIIT và plyometrics để cải thiện."
    ]
})

swimming_patterns = [
    "Cách bơi sải", "Kỹ thuật bơi ếch", "Cách bơi ngửa",
    "Kỹ thuật bơi bướm", "Cách thở khi bơi", "Kỹ thuật lật người",
    "Cách tăng tốc độ bơi", "Kỹ thuật xuất phát", "Cách bơi lâu không mệt",
]

for i in range(30):
    swimming_patterns.extend([
        f"Bài tập kỹ thuật bơi ngày {i+1}",
        f"Kỹ thuật breathing level {i+1}",
        f"Bài tập tăng sức mạnh cho bơi lội {i+1}",
        f"Chương trình tập bơi tuần {i+1}",
        f"Kỹ năng bơi đường dài {i+1}",
        f"Bài tập thể lực bơi lội {i+1}",
        f"Chế độ ăn cho vận động viên bơi {i+1}",
        f"Kỹ thuật turn kiểu {i+1}",
    ])

sports_intents.append({
    "tag": "swimming_detailed",
    "patterns": swimming_patterns[:300],
    "responses": [
        "Bơi lội là môn thể thao toàn diện, tốt cho tim mạch và không gây chấn thương khớp. Kỹ thuật thở đúng là quan trọng nhất.",
        "Để bơi tốt: 1) Học kỹ thuật đúng từ đầu, 2) Tập thở đều đặn, 3) Tăng sức mạnh vai và lưng (gym), 4) Luyện sức bền (bơi đường dài).",
        "Vận động viên bơi lội cần vai rộng, lưng khỏe và sức bền tốt. Tập pull-up, lat pulldown và core exercises."
    ]
})

running_patterns = [
    "Cách chạy bộ đúng tư thế", "Kỹ thuật chạy marathon", "Cách tăng tốc độ chạy",
    "Kỹ thuật hít thở khi chạy", "Cách chạy không bị đau đầu gối", "Kỹ thuật sprint",
    "Cách chạy đường dài", "Kỹ thuật interval training", "Cách chọn giày chạy bộ",
]

for i in range(30):
    running_patterns.extend([
        f"Chương trình chạy bộ tuần {i+1}",
        f"Kỹ thuật chạy level {i+1}",
        f"Bài tập tăng tốc độ ngày {i+1}",
        f"Chế độ tập marathon tuần {i+1}",
        f"Kỹ năng chạy địa hình {i+1}",
        f"Bài tập thể lực cho runner {i+1}",
        f"Chế độ ăn cho vận động viên chạy bộ {i+1}",
        f"Kỹ thuật recovery sau chạy {i+1}",
    ])

sports_intents.append({
    "tag": "running_detailed",
    "patterns": running_patterns[:300],
    "responses": [
        "Chạy bộ là môn thể thao đơn giản nhưng hiệu quả. Tư thế chạy đúng giúp tránh chấn thương: thân hơi nghiêng về trước, chân đáp nhẹ nhàng.",
        "Để chạy tốt: 1) Khởi động kỹ, 2) Tăng quãng đường dần dần (10% mỗi tuần), 3) Kết hợp chạy nhanh và chậm (interval), 4) Nghỉ ngơi đủ.",
        "Runner cần chân khỏe và sức bền tốt. Tập squat, lunge, calf raise để tăng sức mạnh chân và tránh chấn thương."
    ]
})

gym_patterns = [
    "Cách tập ngực to", "Kỹ thuật bench press", "Cách tập lưng xô",
    "Kỹ thuật deadlift", "Cách tập chân to", "Kỹ thuật squat",
    "Cách tập vai rộng", "Kỹ thuật overhead press", "Cách tập tay to",
    "Kỹ thuật barbell curl", "Cách tập bụng 6 múi", "Kỹ thuật plank",
]

for i in range(50):
    gym_patterns.extend([
        f"Bài tập ngực ngày {i+1}",
        f"Kỹ thuật squat level {i+1}",
        f"Chương trình tập gym tuần {i+1}",
        f"Bài tập lưng {i+1}",
        f"Kỹ năng tập chân {i+1}",
        f"Bài tập vai {i+1}",
        f"Chế độ ăn tăng cơ tuần {i+1}",
        f"Kỹ thuật tập tay {i+1}",
    ])

sports_intents.append({
    "tag": "gym_detailed",
    "patterns": gym_patterns[:500],
    "responses": [
        "Gym/Bodybuilding tập trung vào phát triển cơ bắp. 3 bài tập vàng: Squat (chân), Bench Press (ngực), Deadlift (lưng).",
        "Để tăng cơ hiệu quả: 1) Tập nặng 8-12 reps, 2) Ăn dư calo 300-500 kcal/ngày, 3) Nạp 2g protein/kg cơ thể, 4) Ngủ đủ 8 tiếng.",
        "Progressive Overload là chìa khóa: tăng tạ dần dần mỗi tuần. Cơ bắp chỉ phát triển khi bạn thách thức nó với tạ nặng hơn."
    ]
})

martial_arts_patterns = [
    "Cách đấm boxing", "Kỹ thuật jab", "Cách đá Muay Thai",
    "Kỹ thuật low kick", "Cách vật judo", "Kỹ thuật throw",
    "Cách đá taekwondo", "Kỹ thuật roundhouse kick", "Cách phòng thủ MMA",
]

for i in range(30):
    martial_arts_patterns.extend([
        f"Bài tập boxing ngày {i+1}",
        f"Kỹ thuật đá level {i+1}",
        f"Chương trình tập võ tuần {i+1}",
        f"Bài tập thể lực võ sĩ {i+1}",
        f"Kỹ năng phòng thủ {i+1}",
        f"Bài tập tăng sức mạnh đấm {i+1}",
        f"Chế độ ăn cho võ sĩ tuần {i+1}",
        f"Kỹ thuật combo {i+1}",
    ])

sports_intents.append({
    "tag": "martial_arts_detailed",
    "patterns": martial_arts_patterns[:300],
    "responses": [
        "Võ thuật kết hợp kỹ thuật, tốc độ và sức mạnh. Boxing tập trung vào tay, Muay Thai dùng cả tay chân khuỷu gối, MMA kết hợp đấm đá và vật.",
        "Để tập võ tốt: 1) Học kỹ thuật cơ bản vững, 2) Tập thể lực (HIIT, cardio), 3) Tăng sức mạnh (gym), 4) Luyện phản xạ (sparring).",
        "Võ sĩ cần thể lực tốt, sức mạnh nổ và sức bền. Tập plyometrics, heavy bag work và shadow boxing mỗi ngày."
    ]
})

yoga_patterns = [
    "Tư thế yoga cơ bản", "Cách tập downward dog", "Kỹ thuật warrior pose",
    "Cách tập tree pose", "Kỹ thuật sun salutation", "Cách tập child pose",
    "Kỹ thuật cobra pose", "Cách tập pigeon pose", "Kỹ thuật meditation",
]

for i in range(20):
    yoga_patterns.extend([
        f"Bài tập yoga buổi sáng {i+1}",
        f"Tư thế yoga level {i+1}",
        f"Chương trình yoga tuần {i+1}",
        f"Bài tập pilates {i+1}",
        f"Kỹ năng thở yoga {i+1}",
        f"Bài tập giãn cơ {i+1}",
        f"Chế độ ăn cho người tập yoga {i+1}",
        f"Kỹ thuật meditation {i+1}",
    ])

sports_intents.append({
    "tag": "yoga_detailed",
    "patterns": yoga_patterns[:200],
    "responses": [
        "Yoga cải thiện độ dẻo dai, thăng bằng và sức khỏe tinh thần. Hãy tập đều đặn mỗi sáng 15-30 phút.",
        "Để tập yoga hiệu quả: 1) Thở đúng cách (deep breathing), 2) Giữ tư thế 30-60 giây, 3) Không ép quá sức, 4) Tập đều đặn.",
        "Yoga không chỉ dành cho nữ. Nhiều vận động viên nam tập yoga để tăng flexibility và phòng tránh chấn thương."
    ]
})

food_intents = []

protein_patterns = [
    "Ức gà có bao nhiêu protein", "Thịt bò protein", "Cá hồi dinh dưỡng",
    "Trứng gà protein", "Tôm protein", "Sữa whey protein",
    "Đậu phụ protein", "Cá ngừ protein", "Thịt lợn protein",
]

for i in range(50):
    protein_patterns.extend([
        f"Món ăn giàu protein {i+1}",
        f"Công thức nấu ức gà {i+1}",
        f"Cách chế biến cá {i+1}",
        f"Món trứng protein cao {i+1}",
        f"Thực đơn protein ngày {i+1}",
        f"Cách nấu thịt bò {i+1}",
        f"Món tôm protein {i+1}",
        f"Cách ăn đậu phụ {i+1}",
    ])

food_intents.append({
    "tag": "protein_foods",
    "patterns": protein_patterns[:500],
    "responses": [
        "Protein là chất dinh dưỡng quan trọng nhất để xây dựng cơ bắp. Nguồn protein tốt: Ức gà (31g/100g), Cá hồi (25g/100g), Trứng (13g/100g), Whey (80g/100g).",
        "Để tăng cơ, hãy nạp 1.6-2.2g protein/kg cơ thể mỗi ngày. Chia đều protein qua các bữa ăn (mỗi bữa 20-40g).",
        "Các món ăn giàu protein: Ức gà nướng, Cá hồi áp chảo, Trứng luộc, Bò xào, Tôm hấp, Đậu phụ chiên. Kết hợp với rau xanh và tinh bột phức."
    ]
})

carb_patterns = [
    "Cơm trắng bao nhiêu calo", "Khoai lang dinh dưỡng", "Yến mạch calo",
    "Bánh mì calo", "Mì ý calo", "Khoai tây calo",
    "Chuối calo", "Gạo lứt dinh dưỡng", "Bột yến mạch protein",
]

for i in range(50):
    carb_patterns.extend([
        f"Món ăn giàu carb {i+1}",
        f"Công thức nấu khoai lang {i+1}",
        f"Cách chế biến yến mạch {i+1}",
        f"Món cơm dinh dưỡng {i+1}",
        f"Thực đơn carb ngày {i+1}",
        f"Cách nấu gạo lứt {i+1}",
        f"Món khoai tây {i+1}",
        f"Cách ăn chuối {i+1}",
    ])

food_intents.append({
    "tag": "carb_foods",
    "patterns": carb_patterns[:500],
    "responses": [
        "Carbohydrate cung cấp năng lượng cho tập luyện. Nguồn carb tốt: Cơm trắng (130 kcal/100g), Khoai lang (90 kcal/100g), Yến mạch (389 kcal/100g), Chuối (89 kcal/100g).",
        "Carb phức (complex carbs) tốt hơn carb đơn (simple carbs). Ưu tiên: Gạo lứt, Khoai lang, Yến mạch, Bánh mì nguyên cám thay vì Cơm trắng, Bánh ngọt.",
        "Thời điểm ăn carb tốt nhất: Trước tập (1-2 tiếng) để có năng lượng, và Sau tập (30 phút) để phục hồi glycogen cơ bắp."
    ]
})

fat_patterns = [
    "Bơ dinh dưỡng", "Hạt hạnh nhân calo", "Dầu olive tác dụng",
    "Cá hồi omega 3", "Trứng gà chất béo", "Hạt óc chó dinh dưỡng",
    "Dầu dừa tác dụng", "Bơ đậu phộng protein", "Hạt chia dinh dưỡng",
]

for i in range(30):
    fat_patterns.extend([
        f"Món ăn chất béo lành mạnh {i+1}",
        f"Công thức với bơ {i+1}",
        f"Cách ăn hạt {i+1}",
        f"Món dầu olive {i+1}",
        f"Thực đơn healthy fat ngày {i+1}",
        f"Cách chế biến cá hồi {i+1}",
        f"Món hạt dinh dưỡng {i+1}",
        f"Cách dùng dầu dừa {i+1}",
    ])

food_intents.append({
    "tag": "healthy_fats",
    "patterns": fat_patterns[:300],
    "responses": [
        "Chất béo lành mạnh (healthy fats) quan trọng cho hormone và sức khỏe tim mạch. Nguồn tốt: Bơ, Hạt (hạnh nhân, óc chó), Dầu olive, Cá hồi (omega-3).",
        "Không phải mọi chất béo đều xấu. Omega-3 (từ cá), Omega-9 (từ dầu olive) rất tốt. Tránh trans fat (đồ chiên rán, bánh ngọt công nghiệp).",
        "Nạp 0.8-1g chất béo/kg cơ thể mỗi ngày. Ưu tiên nguồn tự nhiên: Cá, Hạt, Bơ, Dầu olive. Tránh ăn chất béo quá nhiều vì 1g = 9 kcal."
    ]
})

vegetable_patterns = [
    "Bông cải xanh dinh dưỡng", "Cà rốt vitamin", "Rau chân vịt dinh dưỡng",
    "Cà chua dinh dưỡng", "Dưa chuột calo", "Súp lơ xanh vitamin",
    "Rau muống dinh dưỡng", "Cải bó xôi protein", "Ớt chuông vitamin C",
]

for i in range(30):
    vegetable_patterns.extend([
        f"Món rau dinh dưỡng {i+1}",
        f"Công thức nấu bông cải {i+1}",
        f"Cách chế biến rau {i+1}",
        f"Món salad {i+1}",
        f"Thực đơn rau ngày {i+1}",
        f"Cách nấu súp lơ {i+1}",
        f"Món cà rốt {i+1}",
        f"Cách ăn rau sống {i+1}",
    ])

food_intents.append({
    "tag": "vegetables",
    "patterns": vegetable_patterns[:300],
    "responses": [
        "Rau xanh giàu vitamin, khoáng chất và chất xơ, ít calo. Ăn nhiều rau giúp tiêu hóa tốt và no lâu. Ưu tiên: Bông cải xanh, Cải bó xôi, Cà rốt, Súp lơ.",
        "Nguyên tắc đĩa ăn lành mạnh: 50% rau, 25% protein, 25% carb. Rau nên ăn nhiều màu sắc khác nhau để đa dạng dinh dưỡng.",
        "Rau xanh đậm (dark leafy greens) như Cải bó xôi, Rau chân vịt rất giàu sắt và vitamin K. Ăn cùng vitamin C (chanh, cà chua) để hấp thu sắt tốt hơn."
    ]
})

fruit_patterns = [
    "Chuối dinh dưỡng", "Táo calo", "Cam vitamin C",
    "Nho đen chất chống oxy hóa", "Dâu tây dinh dưỡng", "Xoài calo",
    "Dưa hấu calo", "Đu đủ dinh dưỡng", "Kiwi vitamin",
]

for i in range(30):
    fruit_patterns.extend([
        f"Món trái cây dinh dưỡng {i+1}",
        f"Công thức smoothie {i+1}",
        f"Cách ăn trái cây {i+1}",
        f"Món salad trái cây {i+1}",
        f"Thực đơn trái cây ngày {i+1}",
        f"Cách chọn trái cây {i+1}",
        f"Món nước ép {i+1}",
        f"Cách bảo quản trái cây {i+1}",
    ])

food_intents.append({
    "tag": "fruits",
    "patterns": fruit_patterns[:300],
    "responses": [
        "Trái cây giàu vitamin, khoáng chất và chất xơ. Tốt nhất nên ăn trái cây tươi thay vì nước ép. Ưu tiên: Chuối (năng lượng), Cam (vitamin C), Táo (chất xơ).",
        "Chuối rất tốt cho người tập gym: giàu kali (chống chuột rút), carb nhanh (năng lượng), dễ tiêu hóa. Ăn chuối trước/sau tập rất hiệu quả.",
        "Trái cây có đường tự nhiên (fructose) nên không nên ăn quá nhiều nếu đang giảm cân. 2-3 trái/ngày là đủ. Ưu tiên trái cây ít đường: Dâu, Bưởi, Táo."
    ]
})

meal_prep_patterns = [
    "Cách meal prep", "Thực đơn meal prep tuần", "Công thức meal prep",
    "Cách bảo quản thức ăn", "Meal prep cho người tập gym", "Thực đơn giảm cân",
    "Meal prep tăng cơ", "Cách nấu ăn cho cả tuần", "Thực đơn clean eating",
]

for i in range(30):
    meal_prep_patterns.extend([
        f"Thực đơn meal prep tuần {i+1}",
        f"Công thức meal prep {i+1}",
        f"Cách chuẩn bị bữa ăn {i+1}",
        f"Món meal prep {i+1}",
        f"Thực đơn tiết kiệm tuần {i+1}",
        f"Cách nấu ăn nhanh {i+1}",
        f"Món ăn sạch {i+1}",
        f"Cách đóng hộp thức ăn {i+1}",
    ])

food_intents.append({
    "tag": "meal_prep",
    "patterns": meal_prep_patterns[:300],
    "responses": [
        "Meal Prep (chuẩn bị bữa ăn trước) giúp tiết kiệm thời gian và kiểm soát dinh dưỡng tốt hơn. Nấu 1 lần cho cả tuần, bảo quản tủ lạnh, hâm nóng khi ăn.",
        "Công thức Meal Prep cơ bản: Chọn 1 nguồn protein (ức gà, cá, bò), 1 nguồn carb (cơm, khoai), 1-2 loại rau. Nấu chín, chia đều vào hộp, bảo quản tủ lạnh 3-5 ngày.",
        "Meal Prep tăng cơ: Mỗi hộp cần 40g protein, 60g carb, 15g fat, nhiều rau. Ví dụ: 200g ức gà + 200g cơm + Bông cải + Dầu olive."
    ]
})

supplement_patterns = [
    "Whey protein là gì", "Creatine tác dụng", "BCAA là gì",
    "Pre-workout là gì", "Mass gainer tác dụng", "Glutamine là gì",
    "Omega-3 tác dụng", "Vitamin D tác dụng", "ZMA là gì",
]

for i in range(20):
    supplement_patterns.extend([
        f"Thực phẩm bổ sung {i+1}",
        f"Cách dùng whey {i+1}",
        f"Liều lượng creatine {i+1}",
        f"Thời điểm uống BCAA {i+1}",
        f"Pre-workout tốt nhất {i+1}",
        f"Cách dùng mass gainer {i+1}",
        f"Vitamin cho gym {i+1}",
        f"Thực phẩm chức năng {i+1}",
    ])

food_intents.append({
    "tag": "supplements",
    "patterns": supplement_patterns[:200],
    "responses": [
        "Thực phẩm bổ sung (supplements) hỗ trợ, không thay thế thức ăn thật. Ưu tiên: Whey Protein (bổ sung đạm), Creatine (tăng sức mạnh), Omega-3 (sức khỏe tim mạch).",
        "Whey Protein: Uống sau tập (30 phút) hoặc bữa phụ. Liều: 25-30g/lần. Creatine: 5g mỗi ngày, uống bất kỳ lúc nào. BCAA: Uống trong lúc tập nếu tập dài >60 phút.",
        "Pre-workout chứa caffeine giúp tỉnh táo và tập mạnh hơn. Uống trước tập 20-30 phút. Không nên uống tối vì mất ngủ. Liều: 200-300mg caffeine."
    ]
})

hydration_patterns = [
    "Uống bao nhiêu nước mỗi ngày", "Nước điện giải là gì", "Tác dụng của nước",
    "Uống nước khi nào", "Nước dừa tác dụng", "Nước chanh tác dụng",
    "Trà xanh tác dụng", "Cà phê trước tập", "Nước tăng lực có tốt không",
]

for i in range(20):
    hydration_patterns.extend([
        f"Cách uống nước đúng cách {i+1}",
        f"Lợi ích của nước {i+1}",
        f"Thời điểm uống nước {i+1}",
        f"Nước uống cho vận động viên {i+1}",
        f"Cách bổ sung điện giải {i+1}",
        f"Đồ uống tốt cho sức khỏe {i+1}",
        f"Nước detox {i+1}",
        f"Cách chống mất nước {i+1}",
    ])

food_intents.append({
    "tag": "hydration",
    "patterns": hydration_patterns[:200],
    "responses": [
        "Uống đủ nước rất quan trọng cho hiệu suất tập luyện. Nhu cầu: 30-40ml/kg cơ thể/ngày. Người 70kg cần 2.1-2.8 lít/ngày. Tập luyện cần uống thêm 500ml-1 lít.",
        "Dấu hiệu thiếu nước: Nước tiểu vàng đậm, khô miệng, mệt mỏi, giảm hiệu suất tập. Hãy uống nước đều đặn cả ngày, không chờ khát mới uống.",
        "Nước điện giải (electrolytes) cần thiết khi tập luyện cường độ cao >60 phút hoặc ra mồ hôi nhiều. Nước dừa, nước muối khoáng, Gatorade đều tốt."
    ]
})

health_intents = []

sports_medicine_patterns = [
    "Chấn thương ACL là gì", "Cách điều trị viêm gân", "Đau khớp gối khi tập",
    "Chấn thương vai rotator cuff", "Cách phục hồi chấn thương", "Viêm cơ là gì",
    "Đau lưng dưới khi squat", "Chấn thương mắt cá chân", "Viêm khớp là gì",
]

for i in range(50):
    sports_medicine_patterns.extend([
        f"Chấn thương thể thao {i+1}",
        f"Cách điều trị chấn thương {i+1}",
        f"Phục hồi chức năng {i+1}",
        f"Bài tập phục hồi {i+1}",
        f"Phòng tránh chấn thương {i+1}",
        f"Triệu chứng chấn thương {i+1}",
        f"Khi nào cần gặp bác sĩ {i+1}",
        f"Cách chườm đá {i+1}",
    ])

health_intents.append({
    "tag": "sports_medicine",
    "patterns": sports_medicine_patterns[:500],
    "responses": [
        "Chấn thương thể thao phổ biến: ACL (dây chằng chéo trước gối), Rotator Cuff (vai), Viêm gân Achilles, Đau thắt lưng. Nguyên tắc RICE: Rest (nghỉ), Ice (chườm đá), Compression (băng ép), Elevation (nâng cao).",
        "Phòng tránh chấn thương: 1) Khởi động kỹ (10-15 phút), 2) Tập đúng kỹ thuật, 3) Tăng cường độ dần dần, 4) Nghỉ ngơi đủ, 5) Tập flexibility (giãn cơ, yoga).",
        "Khi nào cần gặp bác sĩ: Đau dữ dội không giảm sau 48h, Sưng to, Không thể cử động khớp, Nghe tiếng 'pop' khi chấn thương, Tê bì hoặc yếu cơ."
    ]
})

physiology_patterns = [
    "Cơ bắp phát triển như thế nào", "Quá trình tổng hợp protein", "Glycogen là gì",
    "ATP là gì", "Hệ năng lượng aerobic", "Hệ năng lượng anaerobic",
    "Sữa axit lactic", "VO2 max là gì", "Ngưỡng lactate",
]

for i in range(50):
    physiology_patterns.extend([
        f"Sinh lý học thể thao {i+1}",
        f"Cơ chế phát triển cơ {i+1}",
        f"Quá trình trao đổi chất {i+1}",
        f"Hệ thống năng lượng {i+1}",
        f"Cách cơ thể sử dụng năng lượng {i+1}",
        f"Quá trình phục hồi cơ {i+1}",
        f"Hormone và tập luyện {i+1}",
        f"Cơ chế đốt mỡ {i+1}",
    ])

health_intents.append({
    "tag": "exercise_physiology",
    "patterns": physiology_patterns[:500],
    "responses": [
        "Cơ bắp phát triển qua 3 giai đoạn: 1) Kích thích (tập tạ gây vi chấn thương sợi cơ), 2) Phục hồi (ăn protein, nghỉ ngơi), 3) Tăng trưởng (cơ to và khỏe hơn). Quá trình này gọi là Hypertrophy.",
        "Cơ thể có 3 hệ năng lượng: 1) ATP-PC (0-10 giây, tập nặng), 2) Glycolytic (10 giây-2 phút, HIIT), 3) Oxidative (>2 phút, cardio). Hiểu hệ năng lượng giúp tập hiệu quả hơn.",
        "Protein Synthesis (tổng hợp protein cơ) tăng cao nhất trong 24-48h sau tập. Hãy ăn đủ protein (20-40g mỗi bữa) và nghỉ ngơi để cơ phát triển tối đa."
    ]
})

nutrition_patterns = [
    "Calo là gì", "TDEE là gì", "BMR là gì",
    "Macro là gì", "Micro là gì", "Chỉ số đường huyết",
    "Insulin là gì", "Ketosis là gì", "Chế độ ăn keto",
]

for i in range(50):
    nutrition_patterns.extend([
        f"Khoa học dinh dưỡng {i+1}",
        f"Cách tính calo {i+1}",
        f"Tỉ lệ macro {i+1}",
        f"Vitamin và khoáng chất {i+1}",
        f"Cách hấp thu dinh dưỡng {i+1}",
        f"Thời điểm ăn tốt nhất {i+1}",
        f"Chế độ ăn khoa học {i+1}",
        f"Cách đọc nhãn dinh dưỡng {i+1}",
    ])

health_intents.append({
    "tag": "nutrition_science",
    "patterns": nutrition_patterns[:500],
    "responses": [
        "TDEE (Total Daily Energy Expenditure) = BMR (năng lượng cơ bản) + Hoạt động thể chất + Tiêu hóa thức ăn. Để giảm cân: Ăn ít hơn TDEE 300-500 kcal. Để tăng cơ: Ăn nhiều hơn TDEE 300-500 kcal.",
        "Macronutrients (Macro): Protein (4 kcal/g), Carb (4 kcal/g), Fat (9 kcal/g). Micronutrients (Micro): Vitamin, khoáng chất (không có calo nhưng rất quan trọng).",
        "Timing (thời điểm ăn) quan trọng cho vận động viên: Ăn Carb+Protein trước tập (năng lượng), Ăn Protein sau tập (phục hồi cơ), Ăn Fat xa buổi tập (tiêu hóa chậm)."
    ]
})

recovery_patterns = [
    "Tầm quan trọng của giấc ngủ", "Cách ngủ ngon", "Ngủ bao nhiêu là đủ",
    "Phục hồi cơ bắp", "Massage thể thao", "Foam rolling",
    "Stretching sau tập", "Chườm nóng hay chườm lạnh", "Active recovery",
]

for i in range(30):
    recovery_patterns.extend([
        f"Phương pháp phục hồi {i+1}",
        f"Cách cải thiện giấc ngủ {i+1}",
        f"Bài tập phục hồi {i+1}",
        f"Kỹ thuật massage {i+1}",
        f"Cách giảm đau cơ {i+1}",
        f"Phục hồi sau chấn thương {i+1}",
        f"Cách xả cơ {i+1}",
        f"Nghỉ ngơi tích cực {i+1}",
    ])

health_intents.append({
    "tag": "recovery_sleep",
    "patterns": recovery_patterns[:300],
    "responses": [
        "Giấc ngủ là lúc cơ thể phục hồi và phát triển cơ bắp. Ngủ đủ 7-9 tiếng/đêm. Thiếu ngủ làm giảm Testosterone, tăng Cortisol (hormone stress), cản trở tăng cơ.",
        "Phục hồi hiệu quả: 1) Ngủ đủ, 2) Ăn đủ protein, 3) Massage/Foam rolling, 4) Stretching, 5) Active recovery (đi bộ, bơi nhẹ ngày nghỉ).",
        "Foam Rolling giúp giảm đau cơ (DOMS), tăng lưu thông máu, cải thiện flexibility. Lăn từ từ trên các nhóm cơ lớn (đùi, lưng, vai) 1-2 phút/nhóm cơ."
    ]
})

mental_patterns = [
    "Cách giữ động lực tập luyện", "Vượt qua plateau", "Stress và tập luyện",
    "Thiền và thể thao", "Cách đặt mục tiêu", "Tư duy tích cực",
    "Burnout là gì", "Cách đối phó với thất bại", "Visualization",
]

for i in range(30):
    mental_patterns.extend([
        f"Sức khỏe tinh thần {i+1}",
        f"Cách tăng động lực {i+1}",
        f"Kỹ thuật tâm lý thể thao {i+1}",
        f"Cách vượt qua khó khăn {i+1}",
        f"Thiền cho vận động viên {i+1}",
        f"Cách đặt mục tiêu SMART {i+1}",
        f"Tư duy champion {i+1}",
        f"Cách giảm stress {i+1}",
    ])

health_intents.append({
    "tag": "mental_health",
    "patterns": mental_patterns[:300],
    "responses": [
        "Sức khỏe tinh thần quan trọng như thể chất. Tập luyện giúp giảm stress, tăng endorphin (hormone hạnh phúc). Nếu cảm thấy burnout, hãy nghỉ ngơi và tìm lại động lực.",
        "Cách giữ động lực: 1) Đặt mục tiêu cụ thể (SMART), 2) Theo dõi tiến bộ (chụp ảnh, ghi chép), 3) Tìm bạn tập, 4) Thưởng cho bản thân khi đạt mục tiêu.",
        "Plateau (đình trệ) là bình thường. Cách vượt qua: 1) Thay đổi chương trình tập, 2) Tăng cường độ/khối lượng, 3) Nghỉ ngơi 1 tuần (deload), 4) Kiểm tra lại dinh dưỡng."
    ]
})

hormone_patterns = [
    "Testosterone là gì", "Cách tăng testosterone tự nhiên", "Cortisol là gì",
    "Growth hormone", "Insulin và tập luyện", "Estrogen ở nam giới",
    "Thyroid và trao đổi chất", "Adrenaline", "Endorphin",
]

for i in range(30):
    hormone_patterns.extend([
        f"Hormone và thể thao {i+1}",
        f"Cách cân bằng hormone {i+1}",
        f"Tác động của hormone {i+1}",
        f"Cách tăng hormone tự nhiên {i+1}",
        f"Hormone và hiệu suất {i+1}",
        f"Rối loạn hormone {i+1}",
        f"Hormone và giảm cân {i+1}",
        f"Hormone và tăng cơ {i+1}",
    ])

health_intents.append({
    "tag": "hormones",
    "patterns": hormone_patterns[:300],
    "responses": [
        "Testosterone là hormone quan trọng nhất cho tăng cơ ở nam. Cách tăng tự nhiên: 1) Tập chân nặng (Squat, Deadlift), 2) Ngủ đủ 8 tiếng, 3) Ăn đủ chất béo lành mạnh, 4) Giảm stress.",
        "Cortisol (hormone stress) cao làm phân hủy cơ bắp, tích mỡ bụng. Cách giảm: 1) Ngủ đủ, 2) Thiền/Yoga, 3) Không tập quá nhiều (overtraining), 4) Ăn đủ calo.",
        "Growth Hormone (GH) tăng cao khi ngủ sâu và sau tập HIIT. GH giúp đốt mỡ và tăng cơ. Hãy ngủ đủ và tập HIIT 2-3 lần/tuần để tối ưu GH."
    ]
})

biomechanics_patterns = [
    "Tư thế squat đúng", "Kỹ thuật deadlift an toàn", "Cách bench press đúng",
    "Tư thế chạy bộ", "Kỹ thuật nhảy", "Cách đánh golf",
    "Tư thế ngồi đúng", "Kỹ thuật bơi", "Cách đi bộ đúng",
]

for i in range(20):
    biomechanics_patterns.extend([
        f"Sinh cơ học vận động {i+1}",
        f"Phân tích động tác {i+1}",
        f"Kỹ thuật tập đúng {i+1}",
        f"Cách tránh chấn thương {i+1}",
        f"Tư thế chuẩn {i+1}",
        f"Phân tích gait {i+1}",
        f"Kỹ thuật nâng vật nặng {i+1}",
        f"Cơ học khớp {i+1}",
    ])

health_intents.append({
    "tag": "biomechanics",
    "patterns": biomechanics_patterns[:200],
    "responses": [
        "Biomechanics (Sinh cơ học) nghiên cứu cách cơ thể di chuyển. Tập đúng kỹ thuật giúp tối ưu hiệu quả và phòng tránh chấn thương. Ví dụ: Squat phải giữ lưng thẳng, đầu gối không vượt mũi chân.",
        "Deadlift an toàn: 1) Lưng thẳng suốt động tác, 2) Tạ sát ống quyển, 3) Đẩy bằng chân (không kéo bằng lưng), 4) Hít vào khi xuống, thở ra khi đứng lên.",
        "Bench Press đúng: 1) Vai ép sát ghế, 2) Lưng hơi võng, 3) Chân đạp chặt sàn, 4) Tạ chạm ngực, đẩy thẳng lên. Sai form dễ chấn thương vai."
    ]
})

aging_patterns = [
    "Tập luyện ở tuổi 40", "Cách giữ cơ bắp khi già", "Tập luyện người cao tuổi",
    "Sarcopenia là gì", "Osteoporosis và tập luyện", "Tập luyện tuổi 50",
    "Cách tăng cơ ở tuổi trung niên", "Tập luyện an toàn cho người lớn tuổi", "Longevity",
]

for i in range(20):
    aging_patterns.extend([
        f"Tập luyện theo độ tuổi {i+1}",
        f"Cách chống lão hóa {i+1}",
        f"Sức khỏe người cao tuổi {i+1}",
        f"Bài tập cho tuổi trung niên {i+1}",
        f"Dinh dưỡng người lớn tuổi {i+1}",
        f"Cách giữ sức khỏe lâu dài {i+1}",
        f"Tập luyện an toàn {i+1}",
        f"Phòng tránh bệnh tật {i+1}",
    ])

health_intents.append({
    "tag": "aging_fitness",
    "patterns": aging_patterns[:200],
    "responses": [
        "Tập luyện ở mọi lứa tuổi đều quan trọng. Sau 30 tuổi, cơ bắp giảm 3-5%/thập kỷ (Sarcopenia). Tập tạ giúp giữ cơ bắp, xương chắc khỏe, phòng tránh loãng xương.",
        "Người trung niên (40-60 tuổi) nên: 1) Tập tạ 2-3 lần/tuần (giữ cơ), 2) Cardio nhẹ (đi bộ, bơi), 3) Yoga/Stretching (giữ linh hoạt), 4) Ăn đủ protein (1.2-1.6g/kg).",
        "Người cao tuổi (>60) nên tập nhẹ nhàng, tập trung vào thăng bằng, sức mạnh chức năng (ngồi đứng, leo cầu thang). Tập tạ nhẹ, đi bộ, yoga rất tốt."
    ]
})

all_intents = {
    "intents": sports_intents + food_intents + health_intents
}

with open('data/intents_extended.json', 'w', encoding='utf-8') as f:
    json.dump(all_intents, f, ensure_ascii=False, indent=4)

print(f"✅ Đã tạo file intents_extended.json với {len(all_intents['intents'])} intents!")
print(f"📊 Tổng số patterns: {sum(len(intent['patterns']) for intent in all_intents['intents'])}")
