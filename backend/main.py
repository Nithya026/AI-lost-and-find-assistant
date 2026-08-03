import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import init_db
from routes.auth_routes import router as auth_router
from routes.item_routes import router as item_router
from routes.match_routes import router as match_router
from routes.stats_routes import router as stats_router

app = FastAPI(
    title="AI Lost & Found Assistant API",
    description="Multimodal AI powered system for lost item recovery using Sentence Transformers, OpenCLIP, FAISS vector similarity, and automated notifications.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads directory
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth_router)
app.include_router(item_router)
app.include_router(match_router)
app.include_router(stats_router)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def root():
    return {
        "status": "online",
        "app": "AI Lost & Found Assistant",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
