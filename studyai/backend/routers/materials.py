import uuid
import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
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


@router.post("/upload", response_model=MaterialOut)
async def upload_material(
    topic: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    os.makedirs("/app/uploads", exist_ok=True)
    filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = f"/app/uploads/{filename}"

    with open(filepath, "wb") as f:
        content = await file.read()
        f.write(content)

    material = Material(
        user_id=current_user.id,
        type="pdf",
        label=file.filename,
        content=filename,
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
