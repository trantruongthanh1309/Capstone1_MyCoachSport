from flask import Blueprint, request, jsonify
from db import db
from models.social_models import Post  # ✅ Dùng SocialPosts thay vì Posts cũ
from models.user_model import User
from .admin_middleware import require_admin
from sqlalchemy import func

posts_admin_bp = Blueprint('posts_admin', __name__)

@posts_admin_bp.route('/api/admin/posts', methods=['GET'])
def get_posts():
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status', '')
        search = request.args.get('search', '')
        
        query = db.session.query(Post, User).join(User, Post.User_id == User.Id)
        
        if status:
            query = query.filter(Post.Status == status)
        
        if search:
            query = query.filter(
                (Post.Content.contains(search)) | 
                (User.Name.contains(search))
            )
        
        pagination = query.order_by(Post.CreatedAt.desc()).paginate(page=page, per_page=per_page, error_out=False)
        
        posts = [{
            'id': p.Post.Id,
            'user_id': p.Post.User_id,
            'user_name': p.User.Name,
            'content': p.Post.Content,
            'image': p.Post.ImageUrl,  # ✅ ImageUrl thay vì Image
            'status': p.Post.Status,
            'likes': len(p.Post.likes),  # ✅ Đếm relationship
            'comments': len(p.Post.comments),  # ✅ Đếm relationship
            'rejection_reason': None,  # SocialPosts không có field này
            'created_at': p.Post.CreatedAt.isoformat() if p.Post.CreatedAt else None
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

@posts_admin_bp.route('/api/admin/posts/<int:post_id>/approve', methods=['POST'])
def approve_post(post_id):
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        post = Post.query.get_or_404(post_id)
        post.Status = 'Approved'  # ✅ Capital A
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Post approved'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@posts_admin_bp.route('/api/admin/posts/<int:post_id>/reject', methods=['POST'])
def reject_post(post_id):
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        post = Post.query.get_or_404(post_id)
        data = request.get_json()
        reason = data.get('reason', '')
        
        post.Status = 'Rejected'  # ✅ Capital R
        # SocialPosts không có RejectionReason field
        
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

@posts_admin_bp.route('/api/admin/posts/stats', methods=['GET'])
def get_posts_stats():
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        total_posts = Post.query.count()
        pending_posts = Post.query.filter_by(Status='Pending').count()
        approved_posts = Post.query.filter_by(Status='Approved').count()
        rejected_posts = Post.query.filter_by(Status='Rejected').count()
        
        return jsonify({
            'success': True,
            'data': {
                'total_posts': total_posts,
                'pending_posts': pending_posts,
                'approved_posts': approved_posts,
                'rejected_posts': rejected_posts
            }
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@posts_admin_bp.route('/api/admin/posts/bulk-action', methods=['POST'])
def bulk_action_posts():
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        data = request.get_json()
        post_ids = data.get('post_ids', [])
        action = data.get('action')
        reason = data.get('reason', '')
        
        if not post_ids or not action:
            return jsonify({'success': False, 'error': 'Missing data'}), 400
            
        if action == 'delete':
            Post.query.filter(Post.Id.in_(post_ids)).delete(synchronize_session=False)
        elif action == 'approve':
            Post.query.filter(Post.Id.in_(post_ids)).update({Post.Status: 'approved'}, synchronize_session=False)
        elif action == 'reject':
            Post.query.filter(Post.Id.in_(post_ids)).update({Post.Status: 'rejected'}, synchronize_session=False)
            
        db.session.commit()
        
        return jsonify({'success': True, 'message': f'Bulk {action} successful'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500