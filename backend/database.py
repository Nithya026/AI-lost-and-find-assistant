import os
import json
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

DB_PATH = os.path.join(os.path.dirname(__file__), "lost_and_found.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user") # user, admin
    created_at = Column(DateTime, default=datetime.utcnow)

    lost_items = relationship("LostItem", back_populates="user")
    found_items = relationship("FoundItem", back_populates="user")
    notifications = relationship("Notification", back_populates="user")

class LostItem(Base):
    __tablename__ = "lost_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    date_lost = Column(String, nullable=False)
    location = Column(String, nullable=False)
    contact_email = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    status = Column(String, default="pending") # pending, matched, claimed
    text_embedding = Column(Text, nullable=True)  # JSON encoded list of floats
    image_embedding = Column(Text, nullable=True) # JSON encoded list of floats
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="lost_items")
    matches = relationship("Match", back_populates="lost_item", cascade="all, delete-orphan")

class FoundItem(Base):
    __tablename__ = "found_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False, default="Found Item")
    category = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    date_found = Column(String, nullable=False)
    location_found = Column(String, nullable=False)
    contact_info = Column(String, nullable=True)
    collection_instructions = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    status = Column(String, default="available") # available, matched, claimed
    text_embedding = Column(Text, nullable=True)  # JSON encoded list of floats
    image_embedding = Column(Text, nullable=True) # JSON encoded list of floats
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="found_items")
    matches = relationship("Match", back_populates="found_item", cascade="all, delete-orphan")

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    lost_item_id = Column(Integer, ForeignKey("lost_items.id"), nullable=False)
    found_item_id = Column(Integer, ForeignKey("found_items.id"), nullable=False)
    text_similarity = Column(Float, nullable=False)
    image_similarity = Column(Float, nullable=False)
    overall_score = Column(Float, nullable=False)
    confidence_level = Column(String, nullable=False) # High, Medium, Low
    status = Column(String, default="pending") # pending, verified, claimed, rejected
    email_sent = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    lost_item = relationship("LostItem", back_populates="matches")
    found_item = relationship("FoundItem", back_populates="matches")
    notifications = relationship("Notification", back_populates="match")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    match_id = Column(Integer, ForeignKey("matches.id"), nullable=True)
    recipient_email = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    body_html = Column(Text, nullable=False)
    sent_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")
    match = relationship("Match", back_populates="notifications")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
