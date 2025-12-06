from flask import Blueprint, request, jsonify, session
from models import Account, User, PendingRegistration
from db import db
import random
import re
from datetime import datetime, timedelta
from services.email_service import send_otp_email, send_welcome_email

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password_strength(password):
    if len(password) < 8:
        return False, "Mật khẩu phải có ít nhất 8 ký tự"
    if not re.search(r'[A-Z]', password):
        return False, "Mật khẩu phải có ít nhất 1 chữ hoa"
    if not re.search(r'[0-9]', password):
        return False, "Mật khẩu phải có ít nhất 1 số"
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Mật khẩu phải có ít nhất 1 ký tự đặc biệt"
    return True, ""

def generate_otp():
    return str(random.randint(100000, 999999))

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        confirm_password = data.get('confirmPassword', '')
        name = data.get('name', '').strip()
        
        if not email or not password or not confirm_password:
            return jsonify({"success": False, "error": "Vui lòng điền đầy đủ thông tin"}), 400
        
        if not validate_email(email):
            return jsonify({"success": False, "error": "Email không hợp lệ"}), 400
        
        is_valid, error_msg = validate_password_strength(password)
        if not is_valid:
            return jsonify({"success": False, "error": error_msg}), 400
        
        if password != confirm_password:
            return jsonify({"success": False, "error": "Mật khẩu xác nhận không khớp"}), 400
        
        existing_account = Account.query.filter_by(Email=email).first()
        if existing_account:
            return jsonify({"success": False, "error": "Email đã được đăng ký"}), 400
        
        otp = generate_otp()
        expiry = datetime.utcnow() + timedelta(minutes=10)
        
        pending = PendingRegistration.query.filter_by(Email=email).first()
        if pending:
            pending.Password = password
            pending.Name = name if name else email.split('@')[0]
            pending.OTP = otp
            pending.OTPExpiry = expiry
        else:
            pending = PendingRegistration(
                Email=email,
                Password=password,
                Name=name if name else email.split('@')[0],
                OTP=otp,
                OTPExpiry=expiry
            )
            db.session.add(pending)
        
        db.session.commit()
        
        email_sent = send_otp_email(email, otp, purpose="register")
        
        if email_sent:
            return jsonify({
                "success": True,
                "message": "Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.",
                "email": email
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": "Không thể gửi email. Vui lòng thử lại sau."
            }), 500
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": f"Lỗi server: {str(e)}"}), 500

@auth_bp.route('/verify-register-otp', methods=['POST'])
def verify_register_otp():
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        otp = data.get('otp', '').strip()
        
        if not email or not otp:
            return jsonify({"success": False, "error": "Vui lòng nhập đầy đủ thông tin"}), 400
        
        pending = PendingRegistration.query.filter_by(Email=email).first()
        
        if not pending:
            return jsonify({"success": False, "error": "Không tìm thấy yêu cầu đăng ký"}), 404
        
        if pending.OTP != otp:
            return jsonify({"success": False, "error": "Mã OTP không đúng"}), 400
        
        if datetime.utcnow() > pending.OTPExpiry:
            return jsonify({"success": False, "error": "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới."}), 400
        
        user = User(
            Name=pending.Name,
            Email=pending.Email
        )
        db.session.add(user)
        db.session.flush()
        
        account = Account(
            Email=pending.Email,
            Password=pending.Password,
            Role='user',
            User_id=user.Id
        )
        db.session.add(account)
        
        db.session.delete(pending)
        db.session.commit()
        
        send_welcome_email(email, user.Name)
        
        return jsonify({
            "success": True,
            "message": "Đăng ký thành công! Bạn có thể đăng nhập ngay.",
            "user_id": user.Id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": f"Lỗi server: {str(e)}"}), 500

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        
        if not email:
            return jsonify({"success": False, "error": "Vui lòng nhập email"}), 400
        
        if not validate_email(email):
            return jsonify({"success": False, "error": "Email không hợp lệ"}), 400
        
        account = Account.query.filter_by(Email=email).first()
        if not account:
            return jsonify({"success": False, "error": "Email chưa được đăng ký"}), 404
        
        otp = generate_otp()
        expiry = datetime.utcnow() + timedelta(minutes=10)
        
        account.ResetToken = otp
        account.ResetTokenExpiry = expiry
        db.session.commit()
        
        email_sent = send_otp_email(email, otp, purpose="reset")
        
        if email_sent:
            return jsonify({
                "success": True,
                "message": "Mã OTP đã được gửi đến email của bạn",
                "email": email
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": "Không thể gửi email. Vui lòng thử lại sau."
            }), 500
            
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": f"Lỗi server: {str(e)}"}), 500

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        otp = data.get('otp', '').strip()
        
        if not email or not otp:
            return jsonify({"success": False, "error": "Vui lòng nhập đầy đủ thông tin"}), 400
        
        account = Account.query.filter_by(Email=email).first()
        if not account:
            return jsonify({"success": False, "error": "Email không tồn tại"}), 404
        
        if not account.ResetToken:
            return jsonify({"success": False, "error": "Không có mã OTP nào được yêu cầu"}), 400
        
        if account.ResetToken != otp:
            return jsonify({"success": False, "error": "Mã OTP không đúng"}), 400
        
        if datetime.utcnow() > account.ResetTokenExpiry:
            return jsonify({"success": False, "error": "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới."}), 400
        
        return jsonify({
            "success": True,
            "message": "Xác thực thành công",
            "email": email
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "error": f"Lỗi server: {str(e)}"}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        otp = data.get('otp', '').strip()
        new_password = data.get('newPassword', '')
        confirm_password = data.get('confirmPassword', '')
        
        if not email or not otp or not new_password or not confirm_password:
            return jsonify({"success": False, "error": "Vui lòng điền đầy đủ thông tin"}), 400
        
        is_valid, error_msg = validate_password_strength(new_password)
        if not is_valid:
            return jsonify({"success": False, "error": error_msg}), 400
        
        if new_password != confirm_password:
            return jsonify({"success": False, "error": "Mật khẩu xác nhận không khớp"}), 400
        
        account = Account.query.filter_by(Email=email).first()
        if not account:
            return jsonify({"success": False, "error": "Email không tồn tại"}), 404
        
        if not account.ResetToken or account.ResetToken != otp:
            return jsonify({"success": False, "error": "Mã OTP không hợp lệ"}), 400
        
        if datetime.utcnow() > account.ResetTokenExpiry:
            return jsonify({"success": False, "error": "Mã OTP đã hết hạn"}), 400
        
        account.Password = new_password
        account.ResetToken = None
        account.ResetTokenExpiry = None
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay."
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": f"Lỗi server: {str(e)}"}), 500

@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"success": False, "error": "Không có dữ liệu"}), 400
        
        email = data.get('email', '').strip()
        password = data.get('password', '')

        if not email or not password:
            return jsonify({"success": False, "error": "Thiếu email hoặc mật khẩu"}), 400

        acc = Account.query.filter_by(Email=email, Password=password).first()
        
        if not acc:
            return jsonify({"success": False, "error": "Sai email hoặc mật khẩu"}), 401

        if not acc.User_id:
            user = User(Name=email.split('@')[0], Email=email)
            db.session.add(user)
            db.session.commit()
            acc.User_id = user.Id
            db.session.commit()

        session.clear()
        session['user_id'] = acc.User_id
        session['account_id'] = acc.Id
        session['role'] = acc.Role
        session.permanent = True

        return jsonify({
            "success": True,
            "message": "Đăng nhập thành công",
            "user_id": acc.User_id,
            "account_id": acc.Id,
            "role": acc.Role
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "error": f"Lỗi server: {str(e)}"}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"success": True, "message": "Đã đăng xuất"}), 200

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
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
        "avatar": user.Avatar,
        "role": role
    }), 200