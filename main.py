from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import analyze, appeal
from database import create_tables

load_dotenv()

create_tables()

app = FastAPI(title="MedVoice API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router)
app.include_router(appeal.router)


@app.get("/")
def root():
    return {"message": "MedVoice API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}
