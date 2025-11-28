# api/auth.py
from flask import Blueprint, request, jsonify, session
from models import Account, User
from db import db
import random
import re
from datetime import datetime, timedelta
from services.email_service import send_otp_email

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength - at least 6 characters"""
    return len(password) >= 6

def generate_otp():
    """Generate 6-digit OTP"""
    return str(random.randint(100000, 999999))


@auth_bp.route('/register', methods=['POST'])
def register():
    """Đăng ký tài khoản mới"""
    try:
        data = request.get_json()
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        confirm_password = data.get('confirmPassword', '')
        name = data.get('name', '').strip()
        
        # Validation
        if not email or not password or not confirm_password:
            return jsonify({"success": False, "error": "Vui lòng điền đầy đủ thông tin"}), 400
        
        if not validate_email(email):
            return jsonify({"success": False, "error": "Email không hợp lệ"}), 400
        
        if not validate_password(password):
            return jsonify({"success": False, "error": "Mật khẩu phải có ít nhất 6 ký tự"}), 400
        
        if password != confirm_password:
            return jsonify({"success": False, "error": "Mật khẩu xác nhận không khớp"}), 400
        
        # Check if email already exists
        existing_account = Account.query.filter_by(Email=email).first()
        if existing_account:
            return jsonify({"success": False, "error": "Email đã được đăng ký"}), 400
        
        # Create new user
        user = User(
            Name=name if name else email.split('@')[0],
            Email=email
        )
        db.session.add(user)
        db.session.flush()  # Get user.Id
        
        # Create new account
        account = Account(
            Email=email,
            Password=password,  # Note: In production, hash this!
            Role='user',
            User_id=user.Id
        )
        db.session.add(account)
        db.session.commit()
        
        print(f"✅ Đăng ký thành công - Email: {email}, User ID: {user.Id}")
        
        return jsonify({
            "success": True,
            "message": "Đăng ký thành công! Bạn có thể đăng nhập ngay.",
            "user_id": user.Id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Register error: {str(e)}")
        return jsonify({"success": False, "error": f"Lỗi server: {str(e)}"}), 500


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Gửi mã OTP để reset mật khẩu"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        
        if not email:
            return jsonify({"success": False, "error": "Vui lòng nhập email"}), 400
        
        if not validate_email(email):
            return jsonify({"success": False, "error": "Email không hợp lệ"}), 400
        
        # Check if account exists
        account = Account.query.filter_by(Email=email).first()
        if not account:
            return jsonify({"success": False, "error": "Email chưa được đăng ký"}), 404
        
        # Generate OTP
        otp = generate_otp()
        expiry = datetime.utcnow() + timedelta(minutes=10)  # OTP valid for 10 minutes
        
        # Save OTP to database
        account.ResetToken = otp
        account.ResetTokenExpiry = expiry
        db.session.commit()
        
        # Send OTP via email
        email_sent = send_otp_email(email, otp, purpose="reset")
        
        if email_sent:
            print(f"✅ OTP sent to {email}: {otp}")
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
        print(f"❌ Forgot password error: {str(e)}")
        return jsonify({"success": False, "error": f"Lỗi server: {str(e)}"}), 500


@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    """Xác thực mã OTP"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        otp = data.get('otp', '').strip()
        
        if not email or not otp:
            return jsonify({"success": False, "error": "Vui lòng nhập đầy đủ thông tin"}), 400
        
        # Find account
        account = Account.query.filter_by(Email=email).first()
        if not account:
            return jsonify({"success": False, "error": "Email không tồn tại"}), 404
        
        # Check OTP
        if not account.ResetToken:
            return jsonify({"success": False, "error": "Không có mã OTP nào được yêu cầu"}), 400
        
        if account.ResetToken != otp:
            return jsonify({"success": False, "error": "Mã OTP không đúng"}), 400
        
        # Check expiry
        if datetime.utcnow() > account.ResetTokenExpiry:
            return jsonify({"success": False, "error": "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới."}), 400
        
        print(f"✅ OTP verified for {email}")
        
        return jsonify({
            "success": True,
            "message": "Xác thực thành công",
            "email": email
        }), 200
        
    except Exception as e:
        print(f"❌ Verify OTP error: {str(e)}")
        return jsonify({"success": False, "error": f"Lỗi server: {str(e)}"}), 500


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Đặt lại mật khẩu sau khi xác thực OTP"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        otp = data.get('otp', '').strip()
        new_password = data.get('newPassword', '')
        confirm_password = data.get('confirmPassword', '')
        
        if not email or not otp or not new_password or not confirm_password:
            return jsonify({"success": False, "error": "Vui lòng điền đầy đủ thông tin"}), 400
        
        if not validate_password(new_password):
            return jsonify({"success": False, "error": "Mật khẩu phải có ít nhất 6 ký tự"}), 400
        
        if new_password != confirm_password:
            return jsonify({"success": False, "error": "Mật khẩu xác nhận không khớp"}), 400
        
        # Find account
        account = Account.query.filter_by(Email=email).first()
        if not account:
            return jsonify({"success": False, "error": "Email không tồn tại"}), 404
        
        # Verify OTP again
        if not account.ResetToken or account.ResetToken != otp:
            return jsonify({"success": False, "error": "Mã OTP không hợp lệ"}), 400
        
        if datetime.utcnow() > account.ResetTokenExpiry:
            return jsonify({"success": False, "error": "Mã OTP đã hết hạn"}), 400
        
        # Update password
        account.Password = new_password  # Note: In production, hash this!
        account.ResetToken = None
        account.ResetTokenExpiry = None
        db.session.commit()
        
        print(f"✅ Password reset successful for {email}")
        
        return jsonify({
            "success": True,
            "message": "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay."
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Reset password error: {str(e)}")
        return jsonify({"success": False, "error": f"Lỗi server: {str(e)}"}), 500


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