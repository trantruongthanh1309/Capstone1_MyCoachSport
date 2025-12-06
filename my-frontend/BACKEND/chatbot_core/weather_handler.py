import requests
import re

OPENWEATHER_API_KEY = "40dfa2d8e73afabb299edc21486cb2c3"
OPENWEATHER_BASE_URL = "http://api.openweathermap.org/data/2.5/weather"

# Map tên thành phố tiếng Việt -> tiếng Anh
CITY_MAP = {
    "hà nội": "Hanoi",
    "hcm": "Ho Chi Minh City",
    "hồ chí minh": "Ho Chi Minh City",
    "sài gòn": "Ho Chi Minh City",
    "đà nẵng": "Da Nang",
    "huế": "Hue",
    "nha trang": "Nha Trang",
    "cần thơ": "Can Tho",
    "hải phòng": "Hai Phong",
    "vũng tàu": "Vung Tau"
}

def extract_city_from_message(message):
    """Trích xuất tên thành phố từ câu hỏi"""
    message_lower = message.lower()
    
    # Tìm thành phố trong map
    for vn_city, en_city in CITY_MAP.items():
        if vn_city in message_lower:
            return en_city
    
    # Nếu không tìm thấy, mặc định là Hà Nội
    return "Hanoi"

def get_weather(city="Hanoi"):
    """Lấy thông tin thời tiết từ OpenWeatherMap API"""
    try:
        params = {
            "q": city,
            "appid": OPENWEATHER_API_KEY,
            "units": "metric",  # Celsius
            "lang": "vi"
        }
        
        response = requests.get(OPENWEATHER_BASE_URL, params=params, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            
            temp = data['main']['temp']
            feels_like = data['main']['feels_like']
            humidity = data['main']['humidity']
            description = data['weather'][0]['description']
            
            return {
                "success": True,
                "city": city,
                "temp": temp,
                "feels_like": feels_like,
                "humidity": humidity,
                "description": description
            }
        else:
            return {"success": False, "error": "Không thể lấy dữ liệu thời tiết"}
            
    except Exception as e:
        print(f"Weather API error: {e}")
        return {"success": False, "error": str(e)}

def handle_weather_query(user_context, message):
    """Xử lý câu hỏi về thời tiết"""
    # Trích xuất thành phố từ câu hỏi
    city = extract_city_from_message(message)
    
    # Lấy thông tin thời tiết
    weather_data = get_weather(city)
    
    if weather_data["success"]:
        temp = weather_data["temp"]
        feels_like = weather_data["feels_like"]
        humidity = weather_data["humidity"]
        desc = weather_data["description"]
        
        # Tạo câu trả lời
        response = f"🌤️ Thời tiết tại {city}:\n"
        response += f"🌡️ Nhiệt độ: {temp}°C (cảm giác như {feels_like}°C)\n"
        response += f"💧 Độ ẩm: {humidity}%\n"
        response += f"☁️ Tình trạng: {desc.capitalize()}\n\n"
        
        # Lời khuyên
        if temp > 30:
            response += "💡 Trời nóng! Nhớ uống đủ nước khi tập nhé!"
        elif temp < 20:
            response += "💡 Trời mát, thích hợp để chạy bộ ngoài trời!"
        else:
            response += "💡 Thời tiết đẹp để tập luyện! 💪"
        
        return response
    else:
        return "Xin lỗi, tôi không thể kiểm tra thời tiết lúc này. Bạn thử lại sau nhé! 🌦️"
