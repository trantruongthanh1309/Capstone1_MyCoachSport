from flask import Blueprint, request, jsonify,session
from db import db  # Giả sử bạn đã có `db = SQLAlchemy(app)` trong file `db.py` # Từ models.py chứa class User
from models import User  
profile_bp = Blueprint('profile', __name__, url_prefix='/api/profile')

def to_dict(self):
    return {
        "Id": self.Id,
        "Name": self.Name,
        "Email": self.Email,
        "Age": self.Age,
        "Sex": self.Sex,
        "Height_cm": self.Height_cm,
        "Weight_kg": self.Weight_kg,
        "Sport": self.Sport,
        "Goal": self.Goal,
        "Sessions_per_week": self.Sessions_per_week,
    }
@profile_bp.route('', methods=['GET'])
def get_profile():
    # Lấy user_id từ session
    user_id_from_session = session.get('user_id')

    if not user_id_from_session:
        return jsonify({"error": "Chưa đăng nhập"}), 401

    user = User.query.filter_by(Id=user_id_from_session).first()
    if not user:
        return jsonify({"error": "Không tìm thấy hồ sơ"}), 404

    return jsonify({
        "Id": user.Id,
        "Name": user.Name,
        "Email": user.Email,
        "Age": user.Age,
        "Sex": user.Sex,
        "Height_cm": user.Height_cm,
        "Weight_kg": user.Weight_kg,
        "Sport": user.Sport,
        "Goal": user.Goal,
        "Sessions_per_week": user.Sessions_per_week
    })



@profile_bp.route('/<int:user_id>', methods=['POST'])
def update_profile(user_id):
    try:
        print(f"📥 Nhận request cập nhật user_id = {user_id}")
        data = request.get_json()
        print("➡️ Dữ liệu nhận:", data)

        # Ép kiểu về int chắc chắn
        user = User.query.filter_by(Id=int(user_id)).first()
        if not user:
            print("⚠️ Không tìm thấy user, tạo mới...")
            user = User(Id=user_id)
            db.session.add(user)

        # Cập nhật dữ liệu
        user.Name = data.get('name', user.Name)
        user.Age = data.get('age', user.Age)
        user.Sex = data.get('sex', user.Sex)
        user.Height_cm = data.get('height_cm', user.Height_cm)
        user.Weight_kg = data.get('weight_kg', user.Weight_kg)
        user.Sport = data.get('sport', user.Sport)
        user.Goal = data.get('goal', user.Goal)
        user.Sessions_per_week = data.get('sessions_per_week', user.Sessions_per_week)

        db.session.commit()
        print("✅ Đã lưu thành công vào DB.")
        return jsonify({"message": "✅ Hồ sơ đã được lưu vào cơ sở dữ liệu"}), 200

    except db as e:
        db.session.rollback()
        print("❌ Lỗi SQLAlchemy:", e)
        return jsonify({"error": str(e)}), 500