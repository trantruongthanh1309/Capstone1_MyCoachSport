from fastapi import APIRouter, Body
from models import Log
from db import db
from datetime import datetime
router = APIRouter()

@router.post("/feedback")
def submit_feedback(
    user_id: int = Body(...),
    meal_id: int = Body(None),
    workout_id: int = Body(None),
    rating: int = Body(..., ge=1, le=5),
    feedback_type: str = Body("liked")
):
    log = Log(
        User_id=user_id,
        Meal_id=meal_id,
        Workout_id=workout_id,
        Rating=rating,
        FeedbackType=feedback_type,
        CreatedAt=datetime.utcnow()
    )
    db.session.add(log)
    db.session.commit()
    return {"status": "success"}