# api/auth.py
from flask import Blueprint, request, jsonify, session
from models import Account, User
from db import db

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    # Handle preflight request
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"success": False, "error": "Không có dữ liệu"}), 400
        
        email = data.get('email', '').strip()
        password = data.get('password', '')

        print(f"🔐 Login attempt - Email: {email}")

        if not email or not password:
            return jsonify({"success": False, "error": "Thiếu email hoặc mật khẩu"}), 400

        # ✅ TÌM ACCOUNT (Chữ hoa Email, Password)
        acc = Account.query.filter_by(Email=email, Password=password).first()
        
        if not acc:
            print(f"❌ Login failed - Invalid credentials")
            return jsonify({"success": False, "error": "Sai email hoặc mật khẩu"}), 401

        # ✅ TẠO USER NẾU CHƯA CÓ (Chữ hoa User_id)
        if not acc.User_id:
            user = User(Name=email.split('@')[0], Email=email)
            db.session.add(user)
            db.session.commit()
            acc.User_id = user.Id
            db.session.commit()

        # ✅ LƯU SESSION
        session.clear()
        session['user_id'] = acc.User_id
        session['account_id'] = acc.Id
        session['role'] = acc.Role
        session.permanent = True

        print(f"✅ Login successful - User: {acc.User_id}, Role: {acc.Role}")

        # ✅ TRẢ VỀ RESPONSE
        return jsonify({
            "success": True,
            "message": "Đăng nhập thành công",
            "user_id": acc.User_id,
            "account_id": acc.Id,
            "role": acc.Role
        }), 200
        
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        return jsonify({"success": False, "error": f"Lỗi server: {str(e)}"}), 500


@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Đăng xuất - xóa session"""
    session.clear()
    return jsonify({"success": True, "message": "Đã đăng xuất"}), 200


@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    """Lấy thông tin user hiện tại"""
    user_id = session.get('user_id')
    role = session.get('role')
    
    if not user_id:
        return jsonify({"error": "Chưa đăng nhập"}), 401
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User không tồn tại"}), 404
    
    return jsonify({
        "success": True,
        "user_id": user_id,
        "name": user.Name,
        "email": user.Email,
        "role": role
    }), 200


@auth_bp.route('/test', methods=['GET'])
def test():
    """Endpoint test xem backend có hoạt động không"""
    return jsonify({
        "success": True,
        "message": "Backend is running! ✅"
    }), 200