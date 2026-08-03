from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db, LostItem, FoundItem, Match, Notification
from auth import get_current_user

router = APIRouter(prefix="/api", tags=["Analytics & Notifications"])

@router.get("/stats")
def get_system_stats(db: Session = Depends(get_db)):
    total_lost = db.query(LostItem).count()
    total_found = db.query(FoundItem).count()
    total_matches = db.query(Match).count()
    total_claimed = db.query(Match).filter(Match.status == "claimed").count()
    
    # Calculate recovery rate
    recovery_rate = round((total_claimed / total_lost * 100), 1) if total_lost > 0 else 0.0

    return {
        "total_lost": total_lost,
        "total_found": total_found,
        "total_matches": total_matches,
        "total_claimed": total_claimed,
        "recovery_rate": recovery_rate
    }

@router.get("/notifications")
def get_user_notifications(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    notifs = db.query(Notification).order_by(Notification.sent_at.desc()).all()
    return [{
        "id": n.id,
        "recipient_email": n.recipient_email,
        "subject": n.subject,
        "body_html": n.body_html,
        "sent_at": n.sent_at.isoformat()
    } for n in notifs]
