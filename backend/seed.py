import os
import json
import shutil
from datetime import datetime
from database import SessionLocal, init_db, User, LostItem, FoundItem, Match
from auth import get_password_hash
from ai_engine import extract_text_embedding, extract_image_embedding, calculate_match_scores
from email_service import send_match_notification

def seed_database():
    init_db()
    db = SessionLocal()

    # Check if already seeded
    if db.query(User).filter(User.email == "student@university.edu").first():
        print("Database already contains seed data.")
        db.close()
        return

    print("Seeding database with sample users, items, and AI matches...")

    # 1. Create Demo Users
    user1 = User(
        email="student@university.edu",
        full_name="Alex Rivera",
        hashed_password=get_password_hash("password123"),
        role="user"
    )
    user2 = User(
        email="campus.security@university.edu",
        full_name="Officer Marcus Vance",
        hashed_password=get_password_hash("password123"),
        role="admin"
    )
    db.add_all([user1, user2])
    db.commit()
    db.refresh(user1)
    db.refresh(user2)

    # 2. Sample Lost Items
    lost_items_data = [
        {
            "user_id": user1.id,
            "name": "Apple MacBook Pro 14 inch Space Gray",
            "category": "Electronics",
            "description": "MacBook Pro 14-inch with M2 chip, Space Gray color with a university sticker on the top cover.",
            "date_lost": "2026-08-01",
            "location": "Science Library, 2nd Floor Quiet Zone",
            "contact_email": "alex.rivera@university.edu",
            "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80"
        },
        {
            "user_id": user1.id,
            "name": "Black Leather Bi-Fold Wallet",
            "category": "Personal Items",
            "description": "Black genuine leather wallet containing Student ID card (Alex R.) and metro pass.",
            "date_lost": "2026-08-02",
            "location": "Student Union Cafeteria",
            "contact_email": "alex.rivera@university.edu",
            "image_url": "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80"
        },
        {
            "user_id": user1.id,
            "name": "Sony WH-1000XM4 Wireless Headphones",
            "category": "Electronics",
            "description": "Black noise canceling over-ear headphones stored in a dark zipper case.",
            "date_lost": "2026-07-30",
            "location": "Engineering Building Lecture Hall 101",
            "contact_email": "alex.rivera@university.edu",
            "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
        }
    ]

    lost_records = []
    for item in lost_items_data:
        text_content = f"{item['name']} {item['category']} {item['description']} {item['location']}"
        text_emb = extract_text_embedding(text_content)
        
        record = LostItem(
            user_id=item["user_id"],
            name=item["name"],
            category=item["category"],
            description=item["description"],
            date_lost=item["date_lost"],
            location=item["location"],
            contact_email=item["contact_email"],
            image_url=item["image_url"],
            status="pending",
            text_embedding=json.dumps(text_emb),
            image_embedding=json.dumps([])
        )
        db.add(record)
        lost_records.append(record)
    
    db.commit()
    for r in lost_records:
        db.refresh(r)

    # 3. Sample Found Items
    found_items_data = [
        {
            "user_id": user2.id,
            "name": "Found Space Gray Apple Laptop",
            "category": "Electronics",
            "description": "Found a 14-inch Apple laptop in Space Gray with sticker on lid near Science Library desk.",
            "date_found": "2026-08-02",
            "location_found": "Science Library Main Desk",
            "contact_info": "library-staff@university.edu",
            "collection_instructions": "Visit Science Library Information Desk between 8 AM - 6 PM.",
            "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80"
        },
        {
            "user_id": user2.id,
            "name": "Black Wallet with Cards",
            "category": "Personal Items",
            "description": "Black leather wallet recovered from Cafeteria table containing Alex's Student ID.",
            "date_found": "2026-08-02",
            "location_found": "Campus Security Office",
            "contact_info": "security@university.edu",
            "collection_instructions": "Security Office Desk 1B, Building A.",
            "image_url": "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80"
        }
    ]

    found_records = []
    for item in found_items_data:
        text_content = f"{item['name']} {item['category']} {item['description']} {item['location_found']}"
        text_emb = extract_text_embedding(text_content)

        record = FoundItem(
            user_id=item["user_id"],
            name=item["name"],
            category=item["category"],
            description=item["description"],
            date_found=item["date_found"],
            location_found=item["location_found"],
            contact_info=item["contact_info"],
            collection_instructions=item["collection_instructions"],
            image_url=item["image_url"],
            status="available",
            text_embedding=json.dumps(text_emb),
            image_embedding=json.dumps([])
        )
        db.add(record)
        found_records.append(record)

    db.commit()
    for r in found_records:
        db.refresh(r)

    # 4. Generate AI Matches & Notifications
    for lost in lost_records:
        for found in found_records:
            scores = calculate_match_scores(lost, found)
            if scores["overall_score"] >= 0.50:
                match = Match(
                    lost_item_id=lost.id,
                    found_item_id=found.id,
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
                    send_match_notification(match, lost, found, db)
                    lost.status = "matched"
                    found.status = "matched"
                    db.commit()

    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
