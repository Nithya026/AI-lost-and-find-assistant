<<<<<<< HEAD
# AI Lost & Found Assistant

<div align="center">

![AI Lost & Found Assistant](https://img.shields.io/badge/AI-Lost_%26_Found_Assistant-6366f1?style=for-the-badge&logo=sparkles)
![Python](https://img.shields.io/badge/Python-3.14-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.141-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![FAISS](https://img.shields.io/badge/FAISS-VectorSearch-FF6B35?style=for-the-badge)

**Intelligent multimodal AI system that automatically matches lost and found items using Sentence Transformers, OpenCLIP visual embeddings, FAISS vector search, and automated email notifications.**

</div>

---

## 🌟 Overview

**AI Lost & Found Assistant** is an intelligent web application designed to simplify the process of reporting and recovering lost items within organizations or educational institutions. Unlike traditional systems that rely on manual searching, this application leverages **Artificial Intelligence** to automatically compare lost and found item reports using **textual descriptions** (semantic NLP) and **uploaded images** (visual embeddings).

When a user reports a found item, the system analyzes it against all pending lost reports using vector similarity search. If a high-confidence match is identified, the system automatically dispatches a formatted HTML email notification to the item owner.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔐 **JWT Authentication** | Secure user registration and login with bcrypt password hashing |
| 📦 **Lost Item Reporting** | Submit item name, category, description, location, date & photo |
| 🔍 **Found Item Reporting** | Turn in recovered items with collection instructions & photo |
| 🤖 **AI Text Matching** | Sentence Transformers `all-MiniLM-L6-v2` for semantic text embeddings |
| 🖼️ **AI Image Matching** | OpenCLIP/ResNet visual feature vector extraction via OpenCV |
| ⚡ **FAISS Vector Search** | Real-time cosine similarity indexing across all item pairs |
| 📧 **Auto Email Notifications** | HTML email dispatch when match confidence ≥ 55% |
| 📋 **Email Inbox Audit** | Live preview of sent notifications in the browser UI |
| 📊 **Analytics Dashboard** | Recovery rate, total items, matches, and system health metrics |
| 🎉 **Item Claiming Flow** | Verify ownership & mark items as claimed with celebratory confetti |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              React 18 + Vite + Tailwind CSS UI              │
│    Dashboard | Report Lost | Report Found | AI Matches      │
│         Browse Catalog | Email Inbox | Auth Modal           │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API (JSON + Multipart)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   FastAPI Backend (Python)                   │
│        JWT Auth | Item Routes | Match Routes | Stats        │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
    SQLite + SQLAlchemy ORM          Local File Storage
   (Users, Items, Matches,           (Uploaded Item Photos)
        Notifications)
               │                              │
               └──────────────┬───────────────┘
                              ▼
        ┌────────────────────────────────────────────┐
        │          AI Vector Match Engine            │
        │  Text: SentenceTransformers all-MiniLM-L6  │
        │  Image: OpenCLIP / HSV + Grid Embeddings   │
        │  Search: FAISS IndexFlatIP (cosine sim)    │
        │  Score: 45% Text + 55% Image (weighted)    │
        └─────────────────────┬──────────────────────┘
                              │
                              ▼
              Auto HTML Email Notification Service
              (Collection location, photo comparison,
               SMTP dispatch + in-browser audit log)
```

---

## 🧠 AI Matching Engine

The matching pipeline uses a **dual-embedding strategy**:

1. **Text Semantic Embeddings (Sentence Transformers)**
   - Model: `all-MiniLM-L6-v2` (384-dimensional vectors)
   - Encodes full item descriptions into dense vector space
   - Fallback: TF-IDF frequency hash embedder if model unavailable

2. **Image Visual Feature Embeddings (OpenCLIP)**
   - Extracts HSV color histograms + structural grid features
   - Normalized 512-dimensional visual feature vectors

3. **FAISS Vector Index (IndexFlatIP)**
   - Real-time inner-product similarity search
   - Scales efficiently across thousands of item entries

4. **Confidence Scoring Formula**
   ```
   Overall Score = 0.45 × Text_Similarity + 0.55 × Image_Similarity
   
   High Confidence:   Score ≥ 70%
   Medium Confidence: Score ≥ 55%
   Low Confidence:    Score < 55%
   ```

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite + Tailwind CSS + Lucide React Icons |
| **Backend** | FastAPI (Python 3.14) |
| **Database** | SQLite 3 + SQLAlchemy ORM |
| **Authentication** | JWT (PyJWT) + bcrypt password hashing |
| **AI Text Matching** | Sentence Transformers (`all-MiniLM-L6-v2`) |
| **AI Image Matching** | OpenCLIP / OpenCV + Pillow |
| **Vector Similarity Search** | FAISS (`IndexFlatIP`) |
| **Email Notifications** | Python `smtplib` + HTML templates |
| **Development Environment** | Antigravity AI |
| **Version Control** | Git & GitHub |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Clone the Repository
```bash
git clone https://github.com/Nithya026/AI-lost-and-find-assistant.git
cd AI-lost-and-find-assistant
```

### 2. Backend Setup
```bash
# Create and activate virtual environment
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn python-multipart pyjwt bcrypt sqlalchemy pydantic pillow opencv-python numpy sentence-transformers faiss-cpu scikit-learn
```

### 3. Seed Demo Data
```bash
cd backend
python seed.py
```

### 4. Start Backend Server
```bash
python main.py
# Runs on http://127.0.0.1:8000
```

### 5. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## 🔑 Demo Accounts

The seed script creates two demo accounts:

| User | Email | Password | Role |
|---|---|---|---|
| Alex Rivera | `student@university.edu` | `password123` | Student User |
| Officer Vance | `campus.security@university.edu` | `password123` | Security Admin |

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user | Public |
| `POST` | `/api/auth/login` | Login & get JWT token | Public |
| `GET` | `/api/auth/me` | Current user profile | JWT |
| `POST` | `/api/items/lost` | Report a lost item | JWT |
| `POST` | `/api/items/found` | Report a found item | JWT |
| `GET` | `/api/items/lost` | List lost items (with filters) | JWT |
| `GET` | `/api/items/found` | List found items (with filters) | JWT |
| `GET` | `/api/matches` | Get AI-matched item pairs | JWT |
| `POST` | `/api/matches/{id}/claim` | Mark match as claimed | JWT |
| `POST` | `/api/matches/scan` | Trigger manual FAISS re-scan | JWT |
| `GET` | `/api/stats` | System analytics | Public |
| `GET` | `/api/notifications` | Email dispatch audit log | JWT |

---

## 📁 Project Structure

```
AI-lost-and-find-assistant/
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── database.py             # SQLAlchemy models & DB init
│   ├── auth.py                 # JWT auth & password hashing
│   ├── ai_engine.py            # Sentence Transformers + FAISS
│   ├── email_service.py        # HTML email builder & dispatch
│   ├── seed.py                 # Demo data seeder
│   └── routes/
│       ├── auth_routes.py      # Auth endpoints
│       ├── item_routes.py      # Item reporting & catalog
│       ├── match_routes.py     # AI match results & claiming
│       └── stats_routes.py     # Analytics & notifications
├── frontend/
│   ├── index.html              # HTML shell + Google Fonts
│   ├── vite.config.js          # Vite + proxy config
│   ├── tailwind.config.js      # Tailwind CSS config
│   └── src/
│       ├── App.jsx             # Root app, routing & state
│       ├── main.jsx            # React DOM entry point
│       ├── index.css           # Global styles + glassmorphism
│       └── components/
│           ├── Navbar.jsx          # Navigation bar
│           ├── Dashboard.jsx       # Main overview with metrics
│           ├── StatsOverview.jsx   # Statistics cards
│           ├── ReportLostForm.jsx  # Lost item form + image upload
│           ├── ReportFoundForm.jsx # Found item form + image upload
│           ├── MatchList.jsx       # AI match results list
│           ├── MatchDetailModal.jsx# Side-by-side comparison modal
│           ├── BrowseCatalog.jsx   # Searchable item catalog
│           ├── EmailInboxModal.jsx # HTML email audit viewer
│           └── AuthModal.jsx       # JWT login/register modal
├── uploads/
│   ├── lost/                   # Lost item uploaded images
│   └── found/                  # Found item uploaded images
└── README.md
```

---

## 📧 Email Notification System

When a match confidence score reaches ≥ 55%, the system automatically:

1. Generates a responsive HTML email containing:
   - Original lost item details and photo
   - Matched found item photo
   - Similarity score breakdown (Text % + Image %)
   - Collection location and instructions
   - Contact information for the finder

2. Stores the notification in the database for in-browser preview

3. Optionally dispatches via SMTP (configure via environment variables):
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SENDER_EMAIL=lostandfound@institution.edu
   ```

---

## 🎯 System Workflow

```
1. User registers / logs in (JWT Authentication)
          │
          ▼
2. User submits Lost Item Report
   (name, category, description, location, photo)
          │
          ▼
3. AI Engine extracts embeddings:
   • Text → 384-dim Sentence Transformer vector
   • Image → 512-dim OpenCLIP feature vector
          │
          ▼
4. FAISS performs cosine similarity search
   against all existing Found Items
          │
          ▼
5. If score ≥ 55% → Match record created
          │
          ▼
6. System dispatches HTML email to item owner
   (photos side-by-side + collection details)
          │
          ▼
7. Owner verifies item → Marks as "Claimed"
   (Celebratory confetti animation 🎉)
```

---

## 📸 UI Highlights

- **Glassmorphism Dark Theme** with smooth gradient backgrounds
- **Side-by-Side AI Match Comparison** with similarity score progress bars
- **Drag & Drop Image Upload** with live client-side preview
- **Built-in Email Inbox Viewer** using `<iframe>` HTML rendering
- **Confetti animation** on successful item recovery
- **Google Fonts** (`Inter` + `Outfit`) for premium typography

---

## 📄 License

This project is developed as an educational AI application demonstration.

---

<div align="center">
Built with ❤️ using <strong>Antigravity AI</strong> · FastAPI · React · FAISS · Sentence Transformers
</div>
=======
# AI-lost-and-find-assistant
>>>>>>> ea98df025a1701d5f359b2203512c044e0416ffa
