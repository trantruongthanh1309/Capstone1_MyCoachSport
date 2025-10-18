from flask import Flask, request, jsonify
from flask import Blueprint
import requests
# Tạo chatbot blueprint
chatbot_bp = Blueprint('chatbot', __name__)
GEMINI_API_KEY = "AIzaSyC5Dwwo6PYfKOS9RwUsaunIiyBNTevJy5U"  # Thay thế bằng API Key của bạn
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

from flask import Flask, request, jsonify
import requests
@chatbot_bp.route('/', methods=['POST'])
def chat():
    # Nhận tin nhắn từ người dùng
    data = request.json or {}
    user_msg = data.get("message", "").strip()

    # Kiểm tra nếu người dùng chưa nhập tin nhắn
    if not user_msg:
        return jsonify({"reply": "❌ Bạn chưa nhập tin nhắn."})

    # Kiểm tra API Key
    if not GEMINI_API_KEY:
        return jsonify({"reply": "⚠️ GEMINI_API_KEY chưa được cấu hình."}), 500

    try:
        sys_prompt = "Bạn là MySportCoachAI - huấn luyện viên AI thân thiện. Trả lời ngắn gọn bằng tiếng Việt."

        payload = {
            "contents": [
                {"role": "user", "parts": [{"text": sys_prompt}]},
                {"role": "user", "parts": [{"text": user_msg}]}
            ]
        }

        # Gửi yêu cầu đến API Gemini
        r = requests.post(
            GEMINI_URL,
            headers={"Content-Type": "application/json"},
            params={"key": GEMINI_API_KEY},
            json=payload,
            timeout=20,
        )

        if r.status_code == 200:
            data = r.json()
            reply = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "⚠️ Không có phản hồi")
            return jsonify({"reply": reply})

        return jsonify({"reply": f"⚠️ Lỗi gọi Gemini API: {r.text}"}), 500

    except Exception as e:
        return jsonify({"reply": f"❌ Lỗi Backend: {e}"}), 500
