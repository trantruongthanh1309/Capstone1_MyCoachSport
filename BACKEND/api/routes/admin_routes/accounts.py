from flask import Blueprint, request, jsonify
from .admin_middleware import require_admin
from models.account_model import Account
from models.user_model import User
from db import db

accounts_bp = Blueprint('accounts_admin', __name__)

@accounts_bp.route('/api/admin/accounts', methods=['GET'])
def get_accounts():
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        pagination = Account.query.paginate(page=page, per_page=per_page, error_out=False)
        
        accounts = []
        for acc in pagination.items:
            user = User.query.get(acc.User_id) if acc.User_id else None
            accounts.append({
                'id': acc.Id,
                'email': acc.Email,
                'role': acc.Role,
                'user_id': acc.User_id,
                'user_name': user.Name if user else None
            })
        
        return jsonify({
            'success': True,
            'data': accounts,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages
            }
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@accounts_bp.route('/api/admin/accounts/<int:account_id>/role', methods=['PUT'])
def update_role(account_id):
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        account = Account.query.get_or_404(account_id)
        data = request.get_json()
        
        account.Role = data.get('role', account.Role)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Role updated'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@accounts_bp.route('/api/admin/accounts/<int:account_id>', methods=['DELETE'])
def delete_account(account_id):
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        account = Account.query.get_or_404(account_id)
        db.session.delete(account)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Account deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500