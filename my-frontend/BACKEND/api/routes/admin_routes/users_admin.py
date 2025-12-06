from flask import Blueprint, request, jsonify, session
from .admin_middleware import require_admin
from models.user_model import User
from models.account_model import Account
from db import db
from sqlalchemy import or_

users_admin_bp = Blueprint('users_admin', __name__)

@users_admin_bp.route('/api/admin/users', methods=['GET'])
def get_users():
    auth_error = require_admin()
    if auth_error:
        return auth_error

    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '', type=str)
        sport = request.args.get('sport', '', type=str)
        goal = request.args.get('goal', '', type=str)
        
        query = db.session.query(User, Account).outerjoin(Account, Account.User_id == User.Id)
        
        if search:
            query = query.filter(or_(User.Name.contains(search), User.Email.contains(search)))
        if sport:
            query = query.filter(User.Sport == sport)
        if goal:
            query = query.filter(User.Goal == goal)
        
        query = query.order_by(User.Id.desc())
        
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        users = []
        for user, account in pagination.items:
            users.append({
                'id': user.Id,
                'name': user.Name,
                'email': user.Email,
                'age': user.Age,
                'sex': user.Sex,
                'height_cm': user.Height_cm,
                'weight_kg': user.Weight_kg,
                'sport': user.Sport,
                'goal': user.Goal,
                'sessions_per_week': user.Sessions_per_week,
                'role': account.Role if account else 'user',
                'activity_level': 'Normal'
            })
        
        return jsonify({
            'success': True,
            'data': users,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages
            }
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@users_admin_bp.route('/api/admin/filters/sports', methods=['GET'])
def get_sports_filter():
    auth_error = require_admin()
    if auth_error:
        return auth_error

    try:
        sports = db.session.query(User.Sport).distinct().filter(User.Sport.isnot(None)).all()
        return jsonify({'success': True, 'data': [s[0] for s in sports if s[0]]}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@users_admin_bp.route('/api/admin/filters/goals', methods=['GET'])
def get_goals_filter():
    auth_error = require_admin()
    if auth_error:
        return auth_error

    try:
        goals = db.session.query(User.Goal).distinct().filter(User.Goal.isnot(None)).all()
        return jsonify({'success': True, 'data': [g[0] for g in goals if g[0]]}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@users_admin_bp.route('/api/admin/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    auth_error = require_admin()
    if auth_error:
        return auth_error

    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        if 'name' in data: user.Name = data['name']
        if 'email' in data: user.Email = data['email']
        if 'age' in data: user.Age = data['age']
        if 'sex' in data: user.Sex = data['sex']
        if 'height_cm' in data: user.Height_cm = data['height_cm']
        if 'weight_kg' in data: user.Weight_kg = data['weight_kg']
        if 'sport' in data: user.Sport = data['sport']
        if 'goal' in data: user.Goal = data['goal']
        if 'sessions_per_week' in data: user.Sessions_per_week = data['sessions_per_week']
        
        if 'role' in data:
            account = Account.query.filter_by(User_id=user_id).first()
            if account:
                account.Role = data['role']
        
        db.session.commit()
        return jsonify({'success': True, 'message': 'User updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@users_admin_bp.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    auth_error = require_admin()
    if auth_error:
        return auth_error

    try:
        user = User.query.get_or_404(user_id)
        account = Account.query.filter_by(User_id=user_id).first()
        if account:
            db.session.delete(account)
        db.session.delete(user)
        db.session.commit()
        return jsonify({'success': True, 'message': 'User deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500