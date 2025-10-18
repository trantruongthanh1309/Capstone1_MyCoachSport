from flask import Blueprint, request, jsonify, session
from datetime import timedelta
from models import Account, User
from db import db
from flask import make_response
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    acc = Account.query.filter_by(Email=email, Password=password).first()
    if not acc:
        return jsonify({"error": "Sai thông tin đăng nhập"}), 401

    if not acc.User_id:
        user = User(Name=email.split('@')[0], Email=email)
        db.session.add(user)
        db.session.commit()
        acc.User_id = user.Id
        db.session.commit()

    session.clear()
    session['user_id'] = acc.User_id
    session['account_id'] = acc.Id
    session.permanent = True

    print("✅ Session sau khi login:", dict(session))

    resp = make_response(jsonify({
        "message": "Đăng nhập thành công",
        "user_id": acc.User_id,
        "account_id": acc.Id
    }))
    # ✅ ép Flask tự set cookie session
    resp.set_cookie(
        'session', 
        session.sid if hasattr(session, 'sid') else '',
        httponly=True,
        samesite='None',
        secure=False,
        domain='localhost',
        path='/'
    )
    resp.set_cookie(
        'user_id',  # Tên cookie
        str(acc.User_id),  # Lưu giá trị user_id vào cookie
        max_age=timedelta(days=10000),  # Thời gian tồn tại cookie
        httponly=True,  # Bảo vệ cookie khỏi JS
        samesite='None',  # Cho phép cookie cross-domain
        secure=False,  # Nếu bạn dùng HTTPS, bật `True`
        domain='localhost',  # Chỉ cho phép cookie cho domain này
        path='/'  # Cookie sẽ có sẵn cho tất cả các đường dẫn của domain
    )
    return resp