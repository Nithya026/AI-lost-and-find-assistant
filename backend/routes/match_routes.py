from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db, Match, LostItem, FoundItem, User
from auth import get_current_user
from routes.item_routes import check_and_create_matches_for_lost_item

router = APIRouter(prefix="/api/matches", tags=["AI Matches"])

@router.get("")
def get_user_matches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves AI matched lost and found items associated with the current logged-in user or system."""
    # Find lost items reported by user
    user_lost_ids = [item.id for item in db.query(LostItem.id).filter(LostItem.user_id == current_user.id).all()]
    user_found_ids = [item.id for item in db.query(FoundItem.id).filter(FoundItem.user_id == current_user.id).all()]

    # Query matches involving user's lost or found items
    matches = db.query(Match).filter(
        (Match.lost_item_id.in_(user_lost_ids)) | (Match.found_item_id.in_(user_found_ids))
    ).order_by(Match.overall_score.desc()).all()

    # If no specific user matches, also return top system matches for demo exploration
    if not matches:
        matches = db.query(Match).order_by(Match.overall_score.desc()).limit(10).all()

    results = []
    for m in matches:
        lost = db.query(LostItem).filter(LostItem.id == m.lost_item_id).first()
        found = db.query(FoundItem).filter(FoundItem.id == m.found_item_id).first()
        if not lost or not found:
            continue

        results.append({
            "id": m.id,
            "overall_score": m.overall_score,
            "text_similarity": m.text_similarity,
            "image_similarity": m.image_similarity,
            "confidence_level": m.confidence_level,
            "status": m.status,
            "email_sent": m.email_sent,
            "created_at": m.created_at.isoformat(),
            "lost_item": {
                "id": lost.id,
                "name": lost.name,
                "category": lost.category,
                "description": lost.description,
                "date_lost": lost.date_lost,
                "location": lost.location,
                "image_url": lost.image_url,
                "status": lost.status
            },
            "found_item": {
                "id": found.id,
                "name": found.name,
                "category": found.category,
                "description": found.description,
                "date_found": found.date_found,
                "location_found": found.location_found,
                "contact_info": found.contact_info,
                "collection_instructions": found.collection_instructions,
                "image_url": found.image_url,
                "status": found.status
            }
        })

    return results

@router.post("/{match_id}/claim")
def claim_item_match(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match record not found")

    lost = db.query(LostItem).filter(LostItem.id == match.lost_item_id).first()
    found = db.query(FoundItem).filter(FoundItem.id == match.found_item_id).first()

    match.status = "claimed"
    if lost:
        lost.status = "claimed"
    if found:
        found.status = "claimed"

    db.commit()
    return {"message": "Item match successfully marked as Claimed & Recovered!", "status": "claimed"}

@router.post("/scan")
def trigger_ai_rescan(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Triggers an on-demand AI vector similarity search across all pending items."""
    lost_items = db.query(LostItem).filter(LostItem.status != "claimed").all()
    total_new_matches = 0

    for lost in lost_items:
        matches = check_and_create_matches_for_lost_item(lost, db)
        total_new_matches += len(matches)

    return {"message": "AI Vector Search Scan Completed!", "new_matches_created": total_new_matches}
