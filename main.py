from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import analyze, appeal, chat
from database import create_tables

load_dotenv()

create_tables()

app = FastAPI(title="MedVoice API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://med-voice-kappa.vercel.app",
        "https://med-voice-git-main-ryanluonglls-projects.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(analyze.router)
app.include_router(appeal.router)
app.include_router(chat.router)


@app.get("/")
def root():
    return {"message": "MedVoice API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}
