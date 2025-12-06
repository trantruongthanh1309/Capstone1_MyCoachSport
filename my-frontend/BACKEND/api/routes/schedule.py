from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db
from services.recommendation_service import build_daily_schedule

router = APIRouter()

@router.get("/schedule")
def get_daily_schedule(
    user_id: int,
    date: str,
    db: Session = Depends(get_db)
):
    try:
        schedule = build_daily_schedule(user_id, date)
        return schedule
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))