from flask import Blueprint, request, jsonify
from .admin_middleware import require_admin
from models.feedback import Feedback
from models.user_model import User
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
        status = request.args.get('status', '')
        
        query = Feedback.query
        if status and status != 'all':
            query = query.filter(Feedback.Status == status)
            
        pagination = query.order_by(Feedback.CreatedAt.desc()).paginate(page=page, per_page=per_page, error_out=False)
        
        feedbacks = [f.to_dict() for f in pagination.items]
        
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

@feedback_bp.route('/api/admin/feedback/<int:feedback_id>/resolve', methods=['POST'])
def resolve_feedback(feedback_id):
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        feedback = Feedback.query.get_or_404(feedback_id)
        data = request.get_json(force=True)  # Force JSON parsing
        reply = data.get('reply', '')
        
        # Ensure UTF-8 encoding for reply - handle all cases
        if reply is None:
            reply = ''
        elif isinstance(reply, bytes):
            reply = reply.decode('utf-8', errors='replace')
        elif not isinstance(reply, str):
            reply = str(reply)
        
        # Normalize unicode characters to ensure proper encoding
        import unicodedata
        reply = unicodedata.normalize('NFC', reply)
        
        feedback.Status = 'resolved'
        feedback.Response = reply
        db.session.commit()
        
        # Refresh to get updated data
        db.session.refresh(feedback)
        
        return jsonify({
            'success': True, 
            'message': 'Feedback resolved',
            'data': feedback.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error resolving feedback {feedback_id}: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@feedback_bp.route('/api/admin/feedback/<int:feedback_id>', methods=['DELETE'])
def delete_feedback(feedback_id):
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        feedback = Feedback.query.get_or_404(feedback_id)
        db.session.delete(feedback)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Feedback deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@feedback_bp.route('/api/admin/feedback/stats', methods=['GET'])
def get_feedback_stats():
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        total = Feedback.query.count()
        pending = Feedback.query.filter_by(Status='pending').count()
        resolved = Feedback.query.filter_by(Status='resolved').count()
        
        return jsonify({
            'success': True,
            'data': {
                'total': total,
                'pending': pending,
                'resolved': resolved
            }
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500