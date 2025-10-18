from flask import Blueprint, jsonify
from sqlalchemy import text   # 👈 thêm dòng này
from db import db

planner_bp = Blueprint('planner', __name__)

@planner_bp.route("/", methods=["GET"])
def get_plan():
    try:
        meals = db.session.execute(text("SELECT * FROM Meals")).fetchall()
        workouts = db.session.execute(text("SELECT * FROM Workouts")).fetchall()

        meals_list = [
            {"id": m[0], "name": m[1], "kcal": m[2], "protein": m[3],
             "carb": m[4], "fat": m[5], "tags": m[6]}
            for m in meals
        ]

        workouts_list = [
            {"id": w[0], "name": w[1], "sport": w[2], "goal": w[3],
             "duration_min": w[4], "rpe": w[5], "tags": w[6]}
            for w in workouts
        ]

        return jsonify({"meals": meals_list, "workouts": workouts_list})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
