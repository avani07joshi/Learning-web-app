from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.models import Streak, User
from schemas.schemas import StreakOut
from core.dependencies import get_current_user

router = APIRouter(prefix="/api/streak", tags=["streak"])


@router.post("/checkin", response_model=StreakOut)
def checkin(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    streak = db.query(Streak).filter(Streak.user_id == current_user.id).first()
    if not streak:
        streak = Streak(user_id=current_user.id, study_dates=[], current_streak=0)
        db.add(streak)

    today = date.today().isoformat()
    dates = list(streak.study_dates or [])

    if today not in dates:
        dates.append(today)
        dates.sort()

    # Recalculate streak
    count = 0
    for i in range(len(dates) - 1, -1, -1):
        expected = (date.today() - timedelta(days=count)).isoformat()
        if dates[i] == expected:
            count += 1
        else:
            break

    streak.study_dates = dates
    streak.current_streak = count
    db.commit()
    db.refresh(streak)

    return StreakOut(study_dates=streak.study_dates, current_streak=streak.current_streak)


@router.get("/", response_model=StreakOut)
def get_streak(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    streak = db.query(Streak).filter(Streak.user_id == current_user.id).first()
    if not streak:
        return StreakOut(study_dates=[], current_streak=0)
    return StreakOut(study_dates=streak.study_dates, current_streak=streak.current_streak)
