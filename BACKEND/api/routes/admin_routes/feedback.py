from flask import Blueprint, request, jsonify
from .admin_middleware import require_admin
from models.log import Log
from db import db

feedback_bp = Blueprint('feedback_admin', __name__)

@feedback_bp.route('/api/admin/feedback', methods=['GET'])
def get_feedback():
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        pagination = Log.query.order_by(Log.Date.desc()).paginate(page=page, per_page=per_page, error_out=False)
        
        feedbacks = [{
            'id': l.Id,
            'user_id': l.User_id,
            'meal_id': l.Meal_id,
            'workout_id': l.Workout_id,
            'rating': l.Rating,
            'notes': l.Notes,
            'date': l.Date.isoformat() if l.Date else None
        } for l in pagination.items]
        
        return jsonify({
            'success': True,
            'data': feedbacks,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages
            }
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@feedback_bp.route('/api/admin/feedback/<int:feedback_id>', methods=['DELETE'])
def delete_feedback(feedback_id):
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        log = Log.query.get_or_404(feedback_id)
        db.session.delete(log)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Feedback deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500