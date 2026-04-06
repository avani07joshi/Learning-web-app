from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.models import Topic, User
from schemas.schemas import TopicCreate, TopicOut
from core.dependencies import get_current_user
import uuid

router = APIRouter(prefix="/api/topics", tags=["topics"])


@router.get("", response_model=list[TopicOut])
def get_topics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Topic).filter(Topic.user_id == current_user.id).order_by(Topic.created_at.asc()).all()


@router.post("", response_model=TopicOut)
def create_topic(
    body: TopicCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = db.query(Topic).filter(Topic.user_id == current_user.id, Topic.name == body.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Topic already exists")
    topic = Topic(user_id=current_user.id, name=body.name)
    db.add(topic)
    db.commit()
    db.refresh(topic)
    return topic


@router.delete("/{topic_id}")
def delete_topic(
    topic_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    topic = db.query(Topic).filter(Topic.id == topic_id, Topic.user_id == current_user.id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    db.delete(topic)
    db.commit()
    return {"ok": True}


@router.patch("/{topic_id}/progress", response_model=TopicOut)
def update_progress(
    topic_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    topic = db.query(Topic).filter(Topic.id == topic_id, Topic.user_id == current_user.id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    from models.models import QuizResult
    results = db.query(QuizResult).filter(
        QuizResult.user_id == current_user.id,
        QuizResult.topic == topic.name,
    ).all()
    if results:
        total = len(results)
        correct = sum(1 for r in results if r.is_correct)
        accuracy = correct / total
        # Mastered = 80%+ accuracy over at least 10 questions → 100%
        # Otherwise scale 0-95% based on accuracy, but only after 5 questions
        if total < 5:
            topic.progress_pct = 0
        elif accuracy >= 0.8 and total >= 10:
            topic.progress_pct = 100
        else:
            topic.progress_pct = min(95, round(accuracy * 100))
    db.commit()
    db.refresh(topic)
    return topic
