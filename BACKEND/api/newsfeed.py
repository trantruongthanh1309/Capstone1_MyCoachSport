from flask import Blueprint, request, jsonify, session
from sqlalchemy import text
from db import db
from datetime import datetime

newsfeed_bp = Blueprint('newsfeed', __name__)

# --- HELPER: Lấy thông tin user hiện tại ---
def get_current_user_id():
    # Ưu tiên lấy từ session thực
    if 'user_id' in session:
        return session['user_id']
    # Fallback cho dev (nếu bạn đang test mà chưa login)
    # CẢNH BÁO: Chỉ dùng khi dev.
    return 18 # ID mặc định của bạn

# 1. Lấy danh sách bài viết
@newsfeed_bp.route('/', methods=['GET'])
def get_posts():
    try:
        user_id = get_current_user_id()
        
        # Query Join Users để lấy tên và avatar
        query = text("""
            SELECT 
                p.Id, 
                p.Content, 
                p.Image, 
                p.CreatedAt, 
                p.Likes, 
                p.Comments,
                u.Id as UserId, 
                u.Name
            FROM dbo.Posts p
            JOIN dbo.Users u ON p.User_id = u.Id
            WHERE p.Status = 'Approved' OR p.Status = 'Pending'
            ORDER BY p.CreatedAt DESC
        """)
        
        result = db.session.execute(query).fetchall()
        
        posts = []
        for row in result:
            # Check if liked
            is_liked = False
            # (Logic check like tạm thời bỏ qua để tối ưu tốc độ, sẽ thêm sau nếu cần)

            posts.append({
                "id": row[0],
                "content": row[1],
                "image": row[2],
                "createdAt": row[3].strftime("%d/%m/%Y %H:%M") if row[3] else "",
                "likes": row[4] or 0,
                "comments": row[5] or 0,
                "isLiked": is_liked,
                "author": {
                    "id": row[6],
                    "name": row[7],
                    "avatar": f"https://ui-avatars.com/api/?name={row[7]}&background=random",
                    "role": "User" # Default role
                }
            })

        return jsonify({"success": True, "data": posts})

    except Exception as e:
        print(f"❌ ERROR get_posts: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

# 2. Đăng bài mới
@newsfeed_bp.route('/create', methods=['POST'])
def create_post():
    try:
        user_id = get_current_user_id()
        data = request.json
        content = data.get('content')
        image = data.get('image') # URL ảnh hoặc Base64

        if not content:
            return jsonify({"success": False, "error": "Nội dung trống"}), 400

        # Insert vào DB đúng cột
        query = text("""
            INSERT INTO dbo.Posts 
            (User_id, Content, Image, Status, CreatedAt, Likes, Comments, UpdatedAt)
            VALUES 
            (:uid, :content, :image, 'Approved', GETDATE(), 0, 0, GETDATE())
        """)
        
        db.session.execute(query, {
            "uid": user_id,
            "content": content,
            "image": image
        })
        db.session.commit()

        return jsonify({"success": True, "message": "Đăng bài thành công!"})

    except Exception as e:
        db.session.rollback()
        print(f"❌ ERROR create_post: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

# 3. Like bài viết
@newsfeed_bp.route('/like', methods=['POST'])
def like_post():
    try:
        user_id = get_current_user_id()
        data = request.json
        post_id = data.get('post_id')

        # Tạm thời chỉ tăng số like trực tiếp (Simple Mode)
        # Để làm full tính năng Like/Unlike cần bảng Logs hoặc PostLikes riêng
        query = text("UPDATE dbo.Posts SET Likes = Likes + 1 WHERE Id = :pid")
        db.session.execute(query, {"pid": post_id})
        db.session.commit()

        return jsonify({"success": True})

    except Exception as e:
        db.session.rollback()
        print(f"❌ ERROR like_post: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500
