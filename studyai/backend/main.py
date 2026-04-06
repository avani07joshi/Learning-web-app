from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from database import engine, Base
from routers import auth, materials, chat, quiz, streak
import os

app = FastAPI(title="StudyAI API", version="1.0.0", redirect_slashes=False)

_frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[_frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Instrumentator().instrument(app).expose(app)

app.include_router(auth.router)
app.include_router(materials.router)
app.include_router(chat.router)
app.include_router(quiz.router)
app.include_router(streak.router)


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"status": "StudyAI API running", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "healthy"}
