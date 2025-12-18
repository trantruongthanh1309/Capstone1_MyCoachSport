from flask import Blueprint, request, jsonify, session
from models.feedback import Feedback
from db import db

user_feedback_bp = Blueprint('user_feedback', __name__)

@user_feedback_bp.route('/api/feedback', methods=['POST'])
def submit_feedback():
    """User gửi feedback mới"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'success': False, 'error': 'Chưa đăng nhập'}), 401
        
        data = request.get_json()
        
        # Validate required fields
        feedback_type = data.get('type', '').strip()
        title = data.get('title', '').strip()
        message = data.get('message', '').strip()
        priority = data.get('priority', 'low')
        
        if not feedback_type or not title or not message:
            return jsonify({'success': False, 'error': 'Vui lòng điền đầy đủ thông tin'}), 400
        
        # Validate type
        valid_types = ['bug', 'feature', 'improvement', 'question', 'other']
        if feedback_type not in valid_types:
            feedback_type = 'other'
        
        # Validate priority
        valid_priorities = ['low', 'medium', 'high']
        if priority not in valid_priorities:
            priority = 'low'
        
        # Create feedback
        feedback = Feedback(
            User_id=user_id,
            Type=feedback_type,
            Title=title,
            Message=message,
            Status='pending',
            Priority=priority
        )
        
        db.session.add(feedback)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Gửi feedback thành công! Cảm ơn bạn đã đóng góp.',
            'data': feedback.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@user_feedback_bp.route('/api/feedback', methods=['GET'])
def get_my_feedback():
    """User xem lịch sử feedback của mình"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'success': False, 'error': 'Chưa đăng nhập'}), 401
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status', '')
        
        query = Feedback.query.filter_by(User_id=user_id)
        
        if status and status != 'all':
            query = query.filter(Feedback.Status == status)
        
        pagination = query.order_by(Feedback.CreatedAt.desc()).paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
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

@user_feedback_bp.route('/api/feedback/<int:feedback_id>', methods=['GET'])
def get_feedback_detail(feedback_id):
    """User xem chi tiết feedback của mình"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'success': False, 'error': 'Chưa đăng nhập'}), 401
        
        feedback = Feedback.query.filter_by(Id=feedback_id, User_id=user_id).first()
        
        if not feedback:
            return jsonify({'success': False, 'error': 'Không tìm thấy feedback'}), 404
        
        return jsonify({
            'success': True,
            'data': feedback.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500









