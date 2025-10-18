# api/ai_coach.py
from flask import Blueprint, request, jsonify,session
from datetime import datetime
from services.recommendation_service import build_daily_schedule
from db import db
from models import Log

ai_coach_bp = Blueprint('ai_coach', __name__)

@ai_coach_bp.route('/schedule', methods=['GET'])
def get_schedule():
    print("🔍 TOÀN BỘ SESSION:", dict(session))  # ← DÒNG 1
    
    if 'user_id' not in session:
        print("❌ KHÔNG CÓ user_id TRONG SESSION")
        return jsonify({"error": "Chưa đăng nhập"}), 401
    
    user_id = session['user_id']
    print(f"✅ user_id = {user_id}")
    
    try:
        date = request.args.get('date', '2025-10-18')
        result = build_daily_schedule(user_id, date)
        return jsonify(result)
    except Exception as e:
        print("💥 LỖI TRONG AI ENGINE:", str(e))
        import traceback
        traceback.print_exc()  # ← IN STACK TRACE ĐẦY ĐỦ
        return jsonify({"error": "Lỗi hệ thống: " + str(e)}), 500


@ai_coach_bp.route('/feedback', methods=['POST'])
def submit_feedback():
    try:
        
        data = request.get_json()
        user_id = data.get('user_id')
        meal_id = data.get('meal_id')
        workout_id = data.get('workout_id')
        rating = data.get('rating')  # 1-5
        feedback_type = data.get('feedback_type', 'liked')
            
        if not user_id or not rating:
            return jsonify({"error": "Thiếu user_id hoặc rating"}), 400

        if not (1 <= rating <= 5):
            return jsonify({"error": "Rating phải từ 1 đến 5"}), 400

        log = Log(
            User_id=user_id,
            Meal_id=meal_id,
            Workout_id=workout_id,
            Rating=rating,
            FeedbackType=feedback_type,
            CreatedAt=datetime.utcnow()
        )

        db.session.add(log)
        db.session.commit()

        return jsonify({"status": "success", "message": "Ghi nhận phản hồi thành công!"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500