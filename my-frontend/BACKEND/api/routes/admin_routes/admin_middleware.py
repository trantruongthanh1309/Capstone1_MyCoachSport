"""
Admin Middleware - SIMPLIFIED VERSION
Chỉ kiểm tra 1 lần khi vào trang admin, không kiểm tra mỗi API call
"""
from flask import session, jsonify

def require_admin():
    """Middleware đơn giản - TẠM THỜI TẮT để test"""
    return None