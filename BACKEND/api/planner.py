from flask import Blueprint, jsonify

planner_bp = Blueprint('planner', __name__)

@planner_bp.route("/", methods=["GET"])
def get_plan():
    plan = {
        "week": "7-day",
        "meals": ["Sáng: Yến mạch", "Trưa: Ức gà", "Tối: Salad"],
        "workouts": ["Ngày 1: Cardio", "Ngày 2: HIIT", "Ngày 3: Nghỉ"]
    }
    return jsonify(plan)
