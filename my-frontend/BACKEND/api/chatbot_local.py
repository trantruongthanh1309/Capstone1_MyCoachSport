from flask import Blueprint, request, jsonify, session
from chatbot_core.chat_service import get_response
from models.user_model import User
from models.chat_history import ChatHistory
from db import db
import time

chatbot_bp = Blueprint('chatbot_local', __name__)

@chatbot_bp.route('/chat', methods=['POST'])
def chat():
    """Chat với AI Coach và lưu lịch sử"""
    data = request.get_json()
    user_message = data.get('message')
    
    user_id = session.get('user_id') or data.get('user_id')
    
    if not user_message:
        return jsonify({"response": "..."}), 400

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

    time.sleep(1.5)

    response = get_response(user_message, user_context)

    if user_id:
        try:
            chat_record = ChatHistory(
                User_id=user_id,
                Message=user_message,
                Response=response
            )
            db.session.add(chat_record)
            db.session.commit()
        except Exception as e:
            print(f"❌ Error saving chat history: {e}")
            db.session.rollback()

    return jsonify({"response": response})

@chatbot_bp.route('/chat/history', methods=['GET'])
def get_chat_history():
    """Lấy lịch sử chat của user"""
    user_id = session.get('user_id') or request.args.get('user_id')
    
    if not user_id:
        return jsonify({"error": "Chưa đăng nhập"}), 401
    
    try:
        history = ChatHistory.query.filter_by(User_id=user_id)\
            .order_by(ChatHistory.Timestamp.desc())\
            .limit(50)\
            .all()
        
        history.reverse()
        
        return jsonify({
            "success": True,
            "history": [h.to_dict() for h in history]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@chatbot_bp.route('/chat/history/clear', methods=['DELETE'])
def clear_chat_history():
    """Xóa toàn bộ lịch sử chat của user"""
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({"error": "Chưa đăng nhập"}), 401
    
    try:
        ChatHistory.query.filter_by(User_id=user_id).delete()
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Đã xóa lịch sử chat"
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
