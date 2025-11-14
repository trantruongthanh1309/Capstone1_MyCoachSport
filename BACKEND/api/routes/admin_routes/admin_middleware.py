"""
Admin Middleware - Xác thực quyền admin
"""
from flask import session, jsonify
from models.user_model import User
from models.account_model import Account

def require_admin():
    """Middleware kiểm tra quyền admin"""
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({"success": False, "error": "Chưa đăng nhập"}), 401
    
    user = User.query.filter_by(Id=user_id).first()
    if not user:
        return jsonify({"success": False, "error": "User không tồn tại"}), 404
    
    # Kiểm tra role trong bảng Accounts
    account = Account.query.filter_by(User_id=user_id).first()
    if not account or account.Role not in ['admin', 'manager']:
        return jsonify({"success": False, "error": "Không có quyền truy cập"}), 403
    
    return None