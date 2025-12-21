from flask import Blueprint, request, jsonify, session, current_app
from models.social_models import Post, Comment, Like, Share, Conversation, Message
from models.user_model import User
from db import db
from datetime import datetime

social_bp = Blueprint('social', __name__, url_prefix='/api/social')

@social_bp.route('/posts', methods=['GET'])
def get_posts():
    """Lấy danh sách bài viết (chỉ bài đã duyệt)"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        user_id = session.get('user_id')
        
        sport_filter = request.args.get('sport')
        
        query = Post.query.filter(Post.Status == 'Approved')
        
        if sport_filter and sport_filter != 'All':
            query = query.filter(Post.Sport == sport_filter)
            
        posts = query.order_by(Post.CreatedAt.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'success': True,
            'posts': [post.to_dict(user_id) for post in posts.items],
            'total': posts.total,
            'pages': posts.pages,
            'current_page': page
        })
    except Exception as e:
        current_app.logger.error(f"Error in get_posts: {str(e)}")
        return jsonify({'error': 'Lỗi máy chủ nội bộ'}), 500

@social_bp.route('/posts', methods=['POST'])
def create_post():
    """Tạo bài viết mới - cần admin duyệt"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'message': 'Chưa đăng nhập'}), 401
    
    try:
        data = request.get_json()
        content = data.get('content', '').strip() if data.get('content') else ''
        image_url = data.get('image_url')
        title = data.get('title', '').strip() if data.get('title') else None

        if not content and not image_url:
            return jsonify({'success': False, 'message': 'Bài viết phải có nội dung hoặc ảnh'}), 400
        
        # Validate content length
        if content and len(content) > 5000:
            return jsonify({'success': False, 'message': 'Nội dung bài viết không được quá 5000 ký tự'}), 400
        
        # Validate title length if provided
        if title and len(title) > 200:
            return jsonify({'success': False, 'message': 'Tiêu đề không được quá 200 ký tự'}), 400

        post = Post(
            User_id=user_id,
            Content=content,
            Title=data.get('title'),
            Sport=data.get('sport'),
            Topic=data.get('topic'),
            ImageUrl=image_url,
            Status='Pending'
        )
        db.session.add(post)
        db.session.commit()
        
        current_app.logger.info(f"User {user_id} created post {post.Id} - Status: Pending")
        
        return jsonify({
            'success': True,
            'message': 'Bài viết đã được gửi và đang chờ admin duyệt!',
            'post': None
        }), 201
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error in create_post: {str(e)}")
        return jsonify({'success': False, 'message': 'Không thể tạo bài viết'}), 500

@social_bp.route('/posts/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    """Xóa bài viết"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Chưa đăng nhập'}), 401
    
    try:
        post = Post.query.get_or_404(post_id)
        if post.User_id != user_id:
            return jsonify({'error': 'Không có quyền xóa'}), 403
        
        db.session.delete(post)
        db.session.commit()
        
        current_app.logger.info(f"User {user_id} deleted post {post_id}")
        
        return jsonify({'success': True, 'message': 'Đã xóa bài viết'})
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error in delete_post: {str(e)}")
        return jsonify({'error': 'Không thể xóa bài viết'}), 500

@social_bp.route('/posts/<int:post_id>/comments', methods=['GET'])
def get_comments(post_id):
    """Lấy danh sách bình luận của bài viết"""
    try:
        comments = Comment.query.filter_by(Post_id=post_id)\
            .order_by(Comment.CreatedAt.desc()).all()
        
        return jsonify({
            'success': True,
            'comments': [comment.to_dict() for comment in comments]
        })
    except Exception as e:
        current_app.logger.error(f"Error in get_comments: {str(e)}")
        return jsonify({'error': 'Lỗi khi lấy bình luận'}), 500

@social_bp.route('/posts/<int:post_id>/comments', methods=['POST'])
def create_comment(post_id):
    """Thêm bình luận"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Chưa đăng nhập'}), 401
    
    try:
        data = request.get_json()
        content = data.get('content', '').strip()
        
        if not content:
            return jsonify({'error': 'Nội dung bình luận không được để trống'}), 400
        
        # Validate comment length
        if len(content) > 1000:
            return jsonify({'error': 'Bình luận không được quá 1000 ký tự'}), 400

        comment = Comment(
            Post_id=post_id,
            User_id=user_id,
            Content=content
        )
        db.session.add(comment)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'comment': comment.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error in create_comment: {str(e)}")
        return jsonify({'error': 'Không thể bình luận'}), 500

@social_bp.route('/posts/<int:post_id>/like', methods=['POST'])
def toggle_like(post_id):
    """Like/Unlike bài viết"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Chưa đăng nhập'}), 401
    
    try:
        existing_like = Like.query.filter_by(Post_id=post_id, User_id=user_id).first()
        
        if existing_like:
            db.session.delete(existing_like)
            db.session.commit()
            return jsonify({'success': True, 'liked': False})
        else:
            like = Like(Post_id=post_id, User_id=user_id)
            db.session.add(like)
            db.session.commit()
            return jsonify({'success': True, 'liked': True})
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error in toggle_like: {str(e)}")
        return jsonify({'error': 'Lỗi xử lý like'}), 500

@social_bp.route('/posts/<int:post_id>/share', methods=['POST'])
def share_post(post_id):
    """Chia sẻ bài viết"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Chưa đăng nhập'}), 401
    
    try:
        share = Share(Post_id=post_id, User_id=user_id)
        db.session.add(share)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Đã chia sẻ bài viết'})
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error in share_post: {str(e)}")
        return jsonify({'error': 'Không thể chia sẻ'}), 500

@social_bp.route('/conversations', methods=['GET'])
def get_conversations():
    """Lấy danh sách cuộc trò chuyện"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Chưa đăng nhập'}), 401
    
    try:
        conversations = Conversation.query.filter(
            (Conversation.User1_id == user_id) | (Conversation.User2_id == user_id)
        ).order_by(Conversation.LastMessageAt.desc()).all()
        
        return jsonify({
            'success': True,
            'conversations': [conv.to_dict(user_id) for conv in conversations]
        })
    except Exception as e:
        current_app.logger.error(f"Error in get_conversations: {str(e)}")
        return jsonify({'error': 'Lỗi lấy danh sách tin nhắn'}), 500

@social_bp.route('/conversations/<int:user2_id>', methods=['GET'])
def get_or_create_conversation(user2_id):
    """Lấy hoặc tạo cuộc trò chuyện với user khác"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Chưa đăng nhập'}), 401
    
    try:
        conversation = Conversation.query.filter(
            ((Conversation.User1_id == user_id) & (Conversation.User2_id == user2_id)) |
            ((Conversation.User1_id == user2_id) & (Conversation.User2_id == user_id))
        ).first()
        
        if not conversation:
            conversation = Conversation(User1_id=user_id, User2_id=user2_id)
            db.session.add(conversation)
            db.session.commit()
        
        try:
            messages = Message.query.filter_by(Conversation_id=conversation.Id)\
                .order_by(Message.CreatedAt.asc()).all()
            
            # Convert messages to dict với error handling
            messages_data = []
            for msg in messages:
                try:
                    messages_data.append(msg.to_dict())
                except Exception as e:
                    current_app.logger.error(f"Error converting message {msg.Id} to dict: {e}")
                    # Vẫn thêm message nhưng không có shared_post nếu có lỗi
                    messages_data.append({
                        'id': msg.Id,
                        'conversation_id': msg.Conversation_id,
                        'sender_id': msg.Sender_id,
                        'sender_name': msg.sender.Name if msg.sender else 'Unknown',
                        'content': msg.Content,
                        'is_read': msg.IsRead,
                        'created_at': msg.CreatedAt.isoformat() if msg.CreatedAt else None
                    })
            
            return jsonify({
                'success': True,
                'conversation': conversation.to_dict(user_id),
                'messages': messages_data
            })
        except Exception as msg_error:
            current_app.logger.error(f"Error loading messages: {msg_error}")
            return jsonify({
                'success': True,
                'conversation': conversation.to_dict(user_id),
                'messages': []
            })
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error in get_or_create_conversation: {str(e)}")
        return jsonify({'error': 'Lỗi xử lý cuộc trò chuyện'}), 500

@social_bp.route('/conversations/<int:conversation_id>/messages', methods=['POST'])
def send_message(conversation_id):
    """Gửi tin nhắn (có thể kèm shared post)"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Chưa đăng nhập'}), 401
    
    try:
        data = request.get_json()
        content = data.get('content', '')
        shared_post_id = data.get('shared_post_id')
        
        if not content and not shared_post_id:
            return jsonify({'error': 'Nội dung tin nhắn hoặc bài đăng chia sẻ không được để trống'}), 400

        message = Message(
            Conversation_id=conversation_id,
            Sender_id=user_id,
            Content=content or '📎 Đã chia sẻ một bài đăng',
            SharedPostId=shared_post_id
        )
        db.session.add(message)
        
        conversation = Conversation.query.get(conversation_id)
        if conversation:
            conversation.LastMessageAt = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': message.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error in send_message: {str(e)}")
        return jsonify({'error': 'Không thể gửi tin nhắn'}), 500

@social_bp.route('/users/search', methods=['GET'])
def search_users():
    """Tìm kiếm người dùng theo tên"""
    query = request.args.get('q', '')
    if not query:
        return jsonify({'users': []})
    
    try:
        users = User.query.filter(User.Name.ilike(f'%{query}%')).limit(10).all()
        
        return jsonify({
            'success': True,
            'users': [{
                'id': u.Id,
                'name': u.Name,
                'avatar': u.Avatar,
                'email': u.Email
            } for u in users]
        })
    except Exception as e:
        current_app.logger.error(f"Error in search_users: {str(e)}")
        return jsonify({'error': 'Lỗi tìm kiếm'}), 500
