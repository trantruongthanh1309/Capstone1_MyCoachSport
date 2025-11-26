from flask import Blueprint, request, jsonify, session
from chatbot_core.chat_service import get_response
from models.user_model import User
from db import db

chatbot_bp = Blueprint('chatbot_local', __name__)

# Bộ nhớ hội thoại (Lưu tạm trong RAM)
# Cấu trúc: { user_id: [ {"role": "user", "content": "..."}, ... ] }
chat_memory = {}

@chatbot_bp.route('/chat', methods=['POST'])
def chat():
    print(f"DEBUG CHAT - Cookies: {request.cookies}")
    print(f"DEBUG CHAT - Session: {session.get('user_id')}")

    data = request.get_json()
    user_message = data.get('message')
    
    # Debug chi tiết
    print(f"DEBUG CHAT REQUEST:")
    print(f"- Body User ID: {data.get('user_id')}")
    print(f"- Session User ID: {session.get('user_id')}")
    
    # Ưu tiên lấy từ session, nếu không có thì lấy từ body (fallback)
    user_id = session.get('user_id') or data.get('user_id')
    print(f"-> FINAL USER ID: {user_id}")

    if not user_message:
        return jsonify({"response": "..."})

    # 1. Lấy Context User (Tên, thông tin cơ bản)
    user_context = {"name": "Bạn", "id": user_id}
    if user_id:
        try:
            user = User.query.get(user_id)
            if user:
                user_context = {
                    "name": user.Name,
                    "id": user.Id,
                    "sport": user.Sport,
                    "goal": user.Goal,
                    "age": user.Age,
                    "sex": user.Sex,
                    "height": user.Height_cm,
                    "weight": user.Weight_kg
                }
        except:
            pass

    # 2. Quản lý bộ nhớ (Memory)
    # (Có thể dùng để AI hiểu ngữ cảnh câu trước, hiện tại ta lưu để log thôi)
    if user_id:
        if user_id not in chat_memory:
            chat_memory[user_id] = []
        chat_memory[user_id].append({"role": "user", "content": user_message})

    # 3. Gọi Model Local
    # Truyền user_context vào để hàm get_response có thể dùng DB tra cứu
    response = get_response(user_message, user_context)

    # 4. Lưu phản hồi bot
    if user_id:
        chat_memory[user_id].append({"role": "bot", "content": response})

    return jsonify({"response": response})
