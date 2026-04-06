import uuid
import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File

from sqlalchemy.orm import Session
from pypdf import PdfReader
from database import get_db
from models.models import Material, User
from schemas.schemas import MaterialCreate, MaterialOut
from core.dependencies import get_current_user
from typing import Optional

router = APIRouter(prefix="/api/materials", tags=["materials"])


@router.get("", response_model=list[MaterialOut])
def get_materials(
    topic: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Material).filter(Material.user_id == current_user.id)
    if topic:
        query = query.filter(Material.topic == topic)
    return query.all()


@router.post("", response_model=MaterialOut)
def create_material(
    body: MaterialCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    material = Material(
        user_id=current_user.id,
        type=body.type,
        label=body.label,
        content=body.content,
        topic=body.topic,
    )
    db.add(material)
    db.commit()
    db.refresh(material)
    return material


MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_CONTENT_TYPES = {"application/pdf"}
MAX_TEXT_CHARS = 8000

@router.post("/upload", response_model=MaterialOut)
async def upload_material(
    topic: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    content = await file.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB")

    # Extract text from PDF
    try:
        reader = PdfReader(io.BytesIO(content))
        extracted = "\n".join(page.extract_text() or "" for page in reader.pages).strip()
    except Exception:
        extracted = ""

    if not extracted:
        raise HTTPException(status_code=400, detail="Could not extract text from PDF. Scanned/image PDFs are not supported.")

    if len(extracted) > MAX_TEXT_CHARS:
        extracted = extracted[:MAX_TEXT_CHARS] + "\n[truncated]"

    material = Material(
        user_id=current_user.id,
        type="pdf",
        label=file.filename,
        content=extracted,
        topic=topic,
    )
    db.add(material)
    db.commit()
    db.refresh(material)
    return material


@router.delete("/{material_id}")
def delete_material(
    material_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    if material.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(material)
    db.commit()
    return {"ok": True}
