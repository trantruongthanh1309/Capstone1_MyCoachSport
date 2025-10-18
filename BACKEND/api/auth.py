from flask import Blueprint, request, jsonify, session
from models import Account, User
from db import db

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # ⚠️ Lưu ý: So sánh mật khẩu dạng plain text KHÔNG AN TOÀN
    # → Nên dùng hash (bcrypt, werkzeug.security)
    acc = Account.query.filter_by(Email=email, Password=password).first()
    if not acc:
        return jsonify({"error": "Sai thông tin đăng nhập"}), 401

    # Tạo User nếu chưa có
    if not acc.User_id:
        user = User(Name=email.split('@')[0], Email=email)
        db.session.add(user)
        db.session.commit()
        acc.User_id = user.Id
        db.session.commit()

    # ✅ Đặt session — Flask sẽ tự xử lý cookie
    session.clear()
    session['user_id'] = acc.User_id
    session['account_id'] = acc.Id
    session.permanent = True

    print("✅ Session sau khi login:", dict(session))

    return jsonify({
        "message": "Đăng nhập thành công",
        "user_id": acc.User_id,
        "account_id": acc.Id
    }), 200