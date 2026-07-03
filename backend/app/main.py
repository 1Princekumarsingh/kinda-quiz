from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, subjects, chapters, parse, questions, quiz_attempts, statistics, export, quiz_progress
from app.core.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="RecallX API",
    description="Exam preparation and active recall learning platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(subjects.router, prefix="/api")
app.include_router(chapters.router, prefix="/api")
app.include_router(parse.router, prefix="/api")
app.include_router(questions.router, prefix="/api")
app.include_router(quiz_attempts.router, prefix="/api")
app.include_router(quiz_progress.router, prefix="/api")
app.include_router(statistics.router, prefix="/api")
app.include_router(export.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "RecallX API"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
