from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.models import QuizResult, User
from schemas.schemas import QuizAnswerCreate, QuizResultOut, QuizStatsOut
from core.dependencies import get_current_user

router = APIRouter(prefix="/api/quiz", tags=["quiz"])


@router.post("/answer", response_model=QuizResultOut)
def save_answer(
    body: QuizAnswerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = QuizResult(
        user_id=current_user.id,
        topic=body.topic,
        question=body.question,
        user_answer=body.user_answer,
        is_correct=body.is_correct,
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return result


@router.get("/stats/{topic}", response_model=QuizStatsOut)
def get_stats(
    topic: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    results = (
        db.query(QuizResult)
        .filter(QuizResult.user_id == current_user.id, QuizResult.topic == topic)
        .all()
    )

    total = len(results)
    correct = sum(1 for r in results if r.is_correct)
    accuracy = round((correct / total * 100), 1) if total > 0 else 0.0

    seen = set()
    weak_areas = []
    for r in results:
        if not r.is_correct and r.question not in seen:
            seen.add(r.question)
            weak_areas.append(r.question)

    return QuizStatsOut(
        total_answered=total,
        correct_count=correct,
        accuracy_pct=accuracy,
        weak_areas=weak_areas,
    )
