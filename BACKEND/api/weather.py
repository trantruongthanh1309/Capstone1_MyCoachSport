from flask import Blueprint, request, jsonify
import os, requests

weather_bp = Blueprint('weather', __name__)
OPENWEATHER_KEY = os.getenv("OPENWEATHER_KEY")  # hoặc thay bằng chuỗi key tạm

@weather_bp.route("/", methods=["GET"])
def get_weather():
    city = request.args.get("city", "Hanoi,vn")
    if not OPENWEATHER_KEY:
        return jsonify({"error": "OPENWEATHER_KEY chưa được cấu hình."}), 400
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&units=metric&lang=vi&appid={OPENWEATHER_KEY}"
        r = requests.get(url, timeout=10)
        d = r.json()
        return jsonify({
            "city": d.get("name"),
            "description": d["weather"][0]["description"],
            "icon": d["weather"][0]["icon"],
            "temp": d["main"]["temp"],
            "feels_like": d["main"]["feels_like"],
            "humidity": d["main"]["humidity"],
            "wind": d["wind"]["speed"]
        })
    except Exception:
        return jsonify({"error": "Không lấy được dữ liệu thời tiết."}), 500
