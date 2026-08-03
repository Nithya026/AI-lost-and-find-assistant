import os
import json
import uuid
import shutil
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from database import get_db, LostItem, FoundItem, User, Match
from auth import get_current_user
from ai_engine import (
    extract_text_embedding, 
    extract_image_embedding, 
    calculate_match_scores,
    faiss_search
)
from email_service import send_match_notification

router = APIRouter(prefix="/api/items", tags=["Item Reporting & Catalog"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(os.path.join(UPLOAD_DIR, "lost"), exist_ok=True)
os.makedirs(os.path.join(UPLOAD_DIR, "found"), exist_ok=True)

@router.post("/lost")
async def report_lost_item(
    name: str = Form(...),
    category: str = Form(...),
    description: str = Form(...),
    date_lost: str = Form(...),
    location: str = Form(...),
    contact_email: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    image_url = None
    saved_file_path = None

    if image and image.filename:
        ext = os.path.splitext(image.filename)[1] or ".jpg"
        unique_filename = f"lost_{uuid.uuid4().hex}{ext}"
        saved_file_path = os.path.join(UPLOAD_DIR, "lost", unique_filename)
        with open(saved_file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        image_url = f"/uploads/lost/{unique_filename}"

    # Extract text & image vector embeddings
    text_content = f"{name} {category} {description} {location}"
    text_emb = extract_text_embedding(text_content)
    image_emb = extract_image_embedding(saved_file_path) if saved_file_path else []

    lost_item = LostItem(
        user_id=current_user.id,
        name=name.strip(),
        category=category.strip(),
        description=description.strip(),
        date_lost=date_lost,
        location=location.strip(),
        contact_email=contact_email.strip() if contact_email else current_user.email,
        image_url=image_url,
        status="pending",
        text_embedding=json.dumps(text_emb),
        image_embedding=json.dumps(image_emb)
    )
    db.add(lost_item)
    db.commit()
    db.refresh(lost_item)

    # Trigger AI match check against existing found items
    new_matches = check_and_create_matches_for_lost_item(lost_item, db)

    return {
        "message": "Lost item report submitted successfully!",
        "item": {
            "id": lost_item.id,
            "name": lost_item.name,
            "category": lost_item.category,
            "description": lost_item.description,
            "date_lost": lost_item.date_lost,
            "location": lost_item.location,
            "image_url": lost_item.image_url,
            "status": lost_item.status
        },
        "matches_found": len(new_matches)
    }

@router.post("/found")
async def report_found_item(
    name: str = Form("Found Item"),
    category: str = Form(...),
    description: str = Form(...),
    date_found: str = Form(...),
    location_found: str = Form(...),
    contact_info: Optional[str] = Form(None),
    collection_instructions: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    image_url = None
    saved_file_path = None

    if image and image.filename:
        ext = os.path.splitext(image.filename)[1] or ".jpg"
        unique_filename = f"found_{uuid.uuid4().hex}{ext}"
        saved_file_path = os.path.join(UPLOAD_DIR, "found", unique_filename)
        with open(saved_file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        image_url = f"/uploads/found/{unique_filename}"

    # Extract text & image vector embeddings
    text_content = f"{name} {category} {description} {location_found}"
    text_emb = extract_text_embedding(text_content)
    image_emb = extract_image_embedding(saved_file_path) if saved_file_path else []

    found_item = FoundItem(
        user_id=current_user.id,
        name=name.strip(),
        category=category.strip(),
        description=description.strip(),
        date_found=date_found,
        location_found=location_found.strip(),
        contact_info=contact_info.strip() if contact_info else current_user.email,
        collection_instructions=collection_instructions.strip() if collection_instructions else "Visit central lost & found office.",
        image_url=image_url,
        status="available",
        text_embedding=json.dumps(text_emb),
        image_embedding=json.dumps(image_emb)
    )
    db.add(found_item)
    db.commit()
    db.refresh(found_item)

    # Trigger AI match check against existing lost items
    new_matches = check_and_create_matches_for_found_item(found_item, db)

    return {
        "message": "Found item report submitted successfully!",
        "item": {
            "id": found_item.id,
            "name": found_item.name,
            "category": found_item.category,
            "description": found_item.description,
            "date_found": found_item.date_found,
            "location_found": found_item.location_found,
            "image_url": found_item.image_url,
            "status": found_item.status
        },
        "matches_found": len(new_matches)
    }

@router.get("/lost")
def get_lost_items(
    category: Optional[str] = None,
    search: Optional[str] = None,
    mine_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(LostItem)
    if mine_only:
        query = query.filter(LostItem.user_id == current_user.id)
    if category and category.lower() != "all":
        query = query.filter(LostItem.category == category)
    if search:
        s = f"%{search}%"
        query = query.filter((LostItem.name.ilike(s)) | (LostItem.description.ilike(s)) | (LostItem.location.ilike(s)))
    
    items = query.order_by(LostItem.created_at.desc()).all()
    return [{
        "id": item.id,
        "user_id": item.user_id,
        "name": item.name,
        "category": item.category,
        "description": item.description,
        "date_lost": item.date_lost,
        "location": item.location,
        "contact_email": item.contact_email,
        "image_url": item.image_url,
        "status": item.status,
        "created_at": item.created_at.isoformat()
    } for item in items]

@router.get("/found")
def get_found_items(
    category: Optional[str] = None,
    search: Optional[str] = None,
    mine_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(FoundItem)
    if mine_only:
        query = query.filter(FoundItem.user_id == current_user.id)
    if category and category.lower() != "all":
        query = query.filter(FoundItem.category == category)
    if search:
        s = f"%{search}%"
        query = query.filter((FoundItem.name.ilike(s)) | (FoundItem.description.ilike(s)) | (FoundItem.location_found.ilike(s)))
    
    items = query.order_by(FoundItem.created_at.desc()).all()
    return [{
        "id": item.id,
        "user_id": item.user_id,
        "name": item.name,
        "category": item.category,
        "description": item.description,
        "date_found": item.date_found,
        "location_found": item.location_found,
        "contact_info": item.contact_info,
        "collection_instructions": item.collection_instructions,
        "image_url": item.image_url,
        "status": item.status,
        "created_at": item.created_at.isoformat()
    } for item in items]

def check_and_create_matches_for_lost_item(lost_item: LostItem, db: Session) -> list[Match]:
    found_items = db.query(FoundItem).filter(FoundItem.status != "claimed").all()
    created_matches = []

    for f_item in found_items:
        # Check if match already exists
        existing = db.query(Match).filter(Match.lost_item_id == lost_item.id, Match.found_item_id == f_item.id).first()
        if existing:
            continue
        
        scores = calculate_match_scores(lost_item, f_item)
        if scores["overall_score"] >= 0.50: # Match threshold
            match = Match(
                lost_item_id=lost_item.id,
                found_item_id=f_item.id,
                text_similarity=scores["text_similarity"],
                image_similarity=scores["image_similarity"],
                overall_score=scores["overall_score"],
                confidence_level=scores["confidence_level"],
                status="pending",
                email_sent=False
            )
            db.add(match)
            db.commit()
            db.refresh(match)
            
            # Send notification email if high/medium confidence
            if scores["overall_score"] >= 0.55:
                send_match_notification(match, lost_item, f_item, db)
                lost_item.status = "matched"
                if f_item.status == "available":
                    f_item.status = "matched"
                db.commit()

            created_matches.append(match)

    return created_matches

def check_and_create_matches_for_found_item(found_item: FoundItem, db: Session) -> list[Match]:
    lost_items = db.query(LostItem).filter(LostItem.status != "claimed").all()
    created_matches = []

    for l_item in lost_items:
        existing = db.query(Match).filter(Match.lost_item_id == l_item.id, Match.found_item_id == found_item.id).first()
        if existing:
            continue

        scores = calculate_match_scores(l_item, found_item)
        if scores["overall_score"] >= 0.50: # Match threshold
            match = Match(
                lost_item_id=l_item.id,
                found_item_id=found_item.id,
                text_similarity=scores["text_similarity"],
                image_similarity=scores["image_similarity"],
                overall_score=scores["overall_score"],
                confidence_level=scores["confidence_level"],
                status="pending",
                email_sent=False
            )
            db.add(match)
            db.commit()
            db.refresh(match)

            if scores["overall_score"] >= 0.55:
                send_match_notification(match, l_item, found_item, db)
                l_item.status = "matched"
                if found_item.status == "available":
                    found_item.status = "matched"
                db.commit()

            created_matches.append(match)

    return created_matches
