from flask import Blueprint, request, jsonify
from .admin_middleware import require_admin
from models.post import Post
from db import db

posts_admin_bp = Blueprint('posts_admin', __name__)

@posts_admin_bp.route('/api/admin/posts', methods=['GET'])
def get_posts():
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status', '')  # pending, approved, rejected
        
        query = Post.query
        if status:
            query = query.filter(Post.Status == status)
        
        pagination = query.order_by(Post.CreatedAt.desc()).paginate(page=page, per_page=per_page, error_out=False)
        
        posts = [{
            'id': p.Id,
            'user_id': p.User_id,
            'content': p.Content,
            'status': p.Status,
            'created_at': p.CreatedAt.isoformat() if p.CreatedAt else None
        } for p in pagination.items]
        
        return jsonify({
            'success': True,
            'data': posts,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages
            }
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@posts_admin_bp.route('/api/admin/posts/<int:post_id>/approve', methods=['PUT'])
def approve_post(post_id):
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        post = Post.query.get_or_404(post_id)
        post.Status = 'approved'
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Post approved'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@posts_admin_bp.route('/api/admin/posts/<int:post_id>/reject', methods=['PUT'])
def reject_post(post_id):
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        post = Post.query.get_or_404(post_id)
        post.Status = 'rejected'
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Post rejected'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@posts_admin_bp.route('/api/admin/posts/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        post = Post.query.get_or_404(post_id)
        db.session.delete(post)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Post deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500