# StudyAI — AI-Powered Personal Learning App

A full-stack web app that helps you study smarter using AI chat, quizzes, and study material management.

**Live:** [Frontend on Vercel](https://learning-web-app.vercel.app) · [Backend on Render](https://learning-web-app.onrender.com)

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React + Vite, deployed on Vercel |
| Backend | FastAPI + SQLAlchemy, deployed on Render |
| Database | PostgreSQL via Supabase |
| AI | Groq (llama-3.3-70b-versatile) |
| Auth | JWT (python-jose) + bcrypt |
| CI/CD | GitHub Actions |

---

## Features

- **Chat** — AI tutor for any topic, with context from your uploaded study materials
- **Quiz** — AI-generated MCQs to test your knowledge
- **Review** — Activity calendar, streak tracking, and weak area analysis
- **Materials** — Upload PDFs, paste text, or add URLs as study sources
- **Topics** — Separate workspaces per topic (System Design, AWS, etc.)

---

## Local Development

### Backend

```bash
cd studyai/backend
python -m venv venv && source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # fill in values
uvicorn main:app --reload --port 8000
```

`.env` values needed:
```
DATABASE_URL=postgresql://...      # Supabase session pooler URL (port 6543)
JWT_SECRET=your-secret-key
GROQ_API_KEY=your-groq-key
ACCESS_TOKEN_EXPIRE_MINUTES=10080
FRONTEND_URL=http://localhost:5173
```

### Frontend

```bash
cd studyai/frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env.local
npm run dev
```

---

## Deployment

| Service | Branch | Config |
|---------|--------|--------|
| Render (backend) | `dev` | Root dir: `studyai/backend` |
| Vercel (frontend) | `main` | Root dir: `studyai/frontend` |
| Supabase | — | Session pooler on port 6543 (IPv4 compatible) |

Environment variables are set directly in Render and Vercel dashboards.

---

## API Docs

Available at `https://learning-web-app.onrender.com/docs` (Swagger UI).

Key endpoints:
- `POST /api/auth/register` — create account
- `POST /api/auth/login` — get JWT token
- `GET /api/materials` — list study materials
- `POST /api/chat` — send message to AI tutor
- `GET /api/streak` — get study streak

---

## CI/CD

Push to `dev` → GitHub Actions runs:
1. Python lint (ruff)
2. mypy type check
3. Frontend build

Push to `main` → Vercel auto-deploys frontend.
Render watches `dev` branch and auto-deploys backend.

---

## Project Structure

```
studyai/
├── backend/
│   ├── routers/        API route handlers (auth, chat, materials, quiz, streak)
│   ├── models/         SQLAlchemy ORM models
│   ├── schemas/        Pydantic request/response schemas
│   ├── core/           Auth utilities (JWT, bcrypt, dependencies)
│   ├── main.py         FastAPI app entry point
│   ├── database.py     DB connection + session
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── pages/      Login, Register, Dashboard
    │   ├── components/ ChatPanel, QuizPanel, ReviewPanel, MaterialsPanel, Sidebar
    │   ├── context/    AuthContext
    │   └── api/        Axios instance with JWT interceptor
    └── vercel.json     SPA routing config
```
