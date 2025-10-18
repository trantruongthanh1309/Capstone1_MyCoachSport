from flask import Blueprint, jsonify
from sqlalchemy import text  # Import text từ sqlalchemy để sử dụng trong execute
from db import db  # Import db từ app.py

leaderboard_bp = Blueprint('leaderboard', __name__)

@leaderboard_bp.route('/', methods=['GET'])
def get_leaderboard():
    # Sử dụng text() để đảm bảo câu lệnh SQL được khai báo đúng
    leaderboard_data = db.session.execute(text('SELECT * FROM dbo.Leaderboard ORDER BY Points DESC')).fetchall()

    leaderboard_list = [
        {"Id": entry[0], "Name": entry[1], "Points": entry[2], "Challenge_name": entry[3], "Date": entry[4]}
        for entry in leaderboard_data
    ]
    
    return jsonify(leaderboard_list)
