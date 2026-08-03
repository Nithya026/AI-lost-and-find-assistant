import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from sqlalchemy.orm import Session
from database import Notification, Match, LostItem, FoundItem, User

logger = logging.getLogger("email_service")
logger.setLevel(logging.INFO)

SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "lostandfound-ai@institution.edu")

def generate_match_email_html(match: Match, lost_item: LostItem, found_item: FoundItem, owner: User) -> str:
    """Generates a responsive HTML email body with side-by-side item images and collection details."""
    confidence_color = "#10B981" if match.confidence_level == "High" else "#F59E0B"
    
    lost_img_src = lost_item.image_url if lost_item.image_url else "https://via.placeholder.com/300x200?text=No+Lost+Photo"
    found_img_src = found_item.image_url if found_item.image_url else "https://via.placeholder.com/300x200?text=No+Found+Photo"

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px; color: #1f2937; }}
        .container {{ max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }}
        .header {{ background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px 20px; text-align: center; color: white; }}
        .header h1 {{ margin: 0; font-size: 24px; font-weight: 700; }}
        .header p {{ margin: 8px 0 0 0; opacity: 0.9; font-size: 14px; }}
        .badge {{ display: inline-block; padding: 6px 16px; border-radius: 20px; background-color: {confidence_color}; color: white; font-weight: bold; font-size: 14px; margin-top: 10px; }}
        .content {{ padding: 25px; }}
        .comparison-grid {{ display: table; width: 100%; margin-top: 20px; table-layout: fixed; }}
        .comparison-col {{ display: table-cell; width: 50%; padding: 10px; vertical-align: top; box-sizing: border-box; }}
        .card {{ background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; text-align: center; }}
        .card img {{ width: 100%; max-height: 180px; object-fit: cover; border-radius: 6px; border: 1px solid #d1d5db; }}
        .card h3 {{ margin: 10px 0 5px 0; font-size: 16px; color: #374151; }}
        .card p {{ margin: 4px 0; font-size: 13px; color: #6b7280; text-align: left; }}
        .instructions-box {{ background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 6px; margin-top: 25px; }}
        .instructions-box h3 {{ margin-top: 0; color: #1e40af; font-size: 16px; }}
        .instructions-box p {{ margin: 5px 0; font-size: 14px; color: #1e3a8a; }}
        .footer {{ background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 15px; text-align: center; font-size: 12px; color: #9ca3af; }}
        .btn {{ display: inline-block; background: #4f46e5; color: white; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 15px; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 Potential Match Found!</h1>
          <p>AI Lost & Found Assistant has detected a match for your item</p>
          <div class="badge">{match.confidence_level} Confidence ({int(match.overall_score * 100)}% Match)</div>
        </div>
        
        <div class="content">
          <p>Hello <strong>{owner.full_name}</strong>,</p>
          <p>Good news! Our AI matching engine identified a potential match for your reported lost item <strong>"{lost_item.name}"</strong> with a recently reported found item.</p>

          <div class="comparison-grid">
            <div class="comparison-col">
              <div class="card">
                <h3>🔍 Your Reported Lost Item</h3>
                <img src="{lost_img_src}" alt="Lost Item">
                <p><strong>Item:</strong> {lost_item.name}</p>
                <p><strong>Category:</strong> {lost_item.category}</p>
                <p><strong>Date Lost:</strong> {lost_item.date_lost}</p>
                <p><strong>Location:</strong> {lost_item.location}</p>
              </div>
            </div>
            <div class="comparison-col">
              <div class="card">
                <h3>✨ Matched Found Item</h3>
                <img src="{found_img_src}" alt="Found Item">
                <p><strong>Category:</strong> {found_item.category}</p>
                <p><strong>Date Found:</strong> {found_item.date_found}</p>
                <p><strong>Location Found:</strong> {found_item.location_found}</p>
                <p><strong>Description:</strong> {found_item.description}</p>
              </div>
            </div>
          </div>

          <div class="instructions-box">
            <h3>📍 Recovery & Collection Instructions</h3>
            <p><strong>Collection Location:</strong> {found_item.location_found} - Central Security / Lost & Found Desk</p>
            <p><strong>Instructions:</strong> {found_item.collection_instructions or "Please visit the collection location with a valid ID and proof of ownership to claim your item."}</p>
            <p><strong>Contact Info:</strong> {found_item.contact_info or "campus-security@institution.edu"}</p>
          </div>

          <div style="text-align: center; margin-top: 20px;">
            <a href="#" class="btn">View & Claim Item on Dashboard</a>
          </div>
        </div>

        <div class="footer">
          Automated Notification from AI Lost & Found Assistant Platform.<br>
          Please do not reply directly to this email.
        </div>
      </div>
    </body>
    </html>
    """
    return html

def send_match_notification(match: Match, lost_item: LostItem, found_item: FoundItem, db: Session) -> bool:
    """Dispatches match notification email and stores record in SQLite database."""
    owner = db.query(User).filter(User.id == lost_item.user_id).first()
    recipient_email = lost_item.contact_email or (owner.email if owner else "user@example.com")
    subject = f"🎯 AI Match Alert ({int(match.overall_score * 100)}%): '{lost_item.name}'"
    
    html_body = generate_match_email_html(match, lost_item, found_item, owner or User(full_name="Item Owner", email=recipient_email))

    # 1. Store Notification in database for live preview in UI
    notif = Notification(
        user_id=lost_item.user_id,
        match_id=match.id,
        recipient_email=recipient_email,
        subject=subject,
        body_html=html_body,
        sent_at=datetime.utcnow()
    )
    db.add(notif)
    match.email_sent = True
    db.commit()

    # 2. Try actual SMTP send if configured
    if SMTP_HOST and SMTP_USER and SMTP_PASS:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = SENDER_EMAIL
            msg["To"] = recipient_email
            msg.attach(MIMEText(html_body, "html"))

            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASS)
                server.sendmail(SENDER_EMAIL, [recipient_email], msg.as_string())
            logger.info(f"Email sent successfully to {recipient_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email via SMTP ({e}). Stored in notifications DB table.")
            return False

    logger.info(f"Email notification generated and stored in DB for {recipient_email}")
    return True
