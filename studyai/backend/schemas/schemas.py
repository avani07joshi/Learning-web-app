from pydantic import BaseModel, ConfigDict
from datetime import datetime
import uuid


class UserCreate(BaseModel):
    name: str
    email: str
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    email: str
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class MaterialCreate(BaseModel):
    type: str
    label: str
    content: str
    topic: str


class MaterialOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    type: str
    label: str
    topic: str
    created_at: datetime


class ChatSend(BaseModel):
    message: str
    topic: str


class ChatMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    role: str
    content: str
    topic: str
    created_at: datetime


class QuizAnswerCreate(BaseModel):
    topic: str
    question: str
    user_answer: str
    is_correct: bool


class QuizResultOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    topic: str
    is_correct: bool
    created_at: datetime


class QuizStatsOut(BaseModel):
    total_answered: int
    correct_count: int
    accuracy_pct: float
    weak_areas: list[str]


class StreakOut(BaseModel):
    study_dates: list[str]
    current_streak: int


class TopicCreate(BaseModel):
    name: str


class TopicOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    progress_pct: int
    created_at: datetime
