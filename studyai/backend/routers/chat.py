import os
from groq import Groq
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.models import ChatMessage, Material, User
from schemas.schemas import ChatSend, ChatMessageOut
from core.dependencies import get_current_user

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.get("/{topic}", response_model=list[ChatMessageOut])
def get_messages(
    topic: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == current_user.id, ChatMessage.topic == topic)
        .order_by(ChatMessage.created_at.asc())
        .limit(50)
        .all()
    )


@router.post("", response_model=ChatMessageOut)
async def send_message(
    body: ChatSend,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Fetch user materials for this topic
    materials = (
        db.query(Material)
        .filter(Material.user_id == current_user.id, Material.topic == body.topic)
        .all()
    )
    materials_summary = "\n".join(
        f"- {m.label}: {m.content[:500]}" for m in materials
    ) or "No materials added yet."

    system_prompt = (
        f"You are StudyAI, a personal AI teacher for {body.topic}. "
        f"You are teaching {current_user.name}, a data engineer with Python, "
        f"AWS, and Databricks experience. Teach concisely like a senior "
        f"engineer mentor. 3-5 sentences max unless asked to go deep. "
        f"Use **bold** for key terms. Draw analogies to data engineering. "
        f"Study materials the user has added: {materials_summary}"
    )

    # Fetch last 20 messages for context
    history = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == current_user.id, ChatMessage.topic == body.topic)
        .order_by(ChatMessage.created_at.asc())
        .limit(20)
        .all()
    )
    # Convert history to Gemini format (uses "model" instead of "assistant")
    gemini_history = [
        {
            "role": "user" if m.role == "user" else "model",
            "parts": [m.content],
        }
        for m in history
    ]

    # Call Groq API
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        raise HTTPException(status_code=500, detail="Groq API key not configured")

    try:
        client = Groq(api_key=groq_key)
        messages = [{"role": "system", "content": system_prompt}]
        for m in gemini_history:
            role = "user" if m["role"] == "user" else "assistant"
            messages.append({"role": role, "content": m["parts"][0]})
        messages.append({"role": "user", "content": body.message})
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
        )
        ai_reply = response.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {str(e)}")

    # Save user message
    user_msg = ChatMessage(
        user_id=current_user.id,
        role="user",
        content=body.message,
        topic=body.topic,
    )
    db.add(user_msg)

    # Save assistant reply
    assistant_msg = ChatMessage(
        user_id=current_user.id,
        role="assistant",
        content=ai_reply,
        topic=body.topic,
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    return assistant_msg
