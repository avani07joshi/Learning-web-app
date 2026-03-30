import os
from google import genai
from google.genai import types
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


@router.post("/", response_model=ChatMessageOut)
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
        f"- {m.label}: {m.content[:200]}" for m in materials
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

    # Call Gemini API
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")

    try:
        client = genai.Client(api_key=gemini_key)
        contents = []
        for m in gemini_history:
            role = "user" if m["role"] == "user" else "model"
            contents.append(types.Content(role=role, parts=[types.Part(text=m["parts"][0])]))
        contents.append(types.Content(role="user", parts=[types.Part(text=body.message)]))
        response = client.models.generate_content(
            model="gemini-1.5-flash-latest",
            contents=contents,
            config=types.GenerateContentConfig(system_instruction=system_prompt),
        )
        ai_reply = response.text
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
