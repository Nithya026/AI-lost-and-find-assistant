from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from database import get_db, User
from auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class UserRegisterRequest(BaseModel):
    email: str
    full_name: str
    password: str

class UserLoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str

    class Config:
        from_attributes = True

@router.post("/register")
def register_user(req: UserRegisterRequest, db: Session = Depends(get_db)):
    if not req.email or not req.password or not req.full_name:
        raise HTTPException(status_code=400, detail="All fields are required")
    
    existing_user = db.query(User).filter(User.email == req.email.strip().lower()).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    hashed_pwd = get_password_hash(req.password)
    user = User(
        email=req.email.strip().lower(),
        full_name=req.full_name.strip(),
        hashed_password=hashed_pwd,
        role="user"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.email, "id": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    }

@router.post("/login")
def login_user(req: UserLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.strip().lower()).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"sub": user.email, "id": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
