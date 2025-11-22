from flask import Blueprint, request, jsonify
from chatbot_core.chat_service import get_response

chatbot_bp = Blueprint('chatbot_local', __name__)

@chatbot_bp.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message')
    
    if not user_message:
        return jsonify({"error": "Tin nhắn trống"}), 400

    response = get_response(user_message)
    
    return jsonify({"response": response})
