from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import analyze, appeal, chat, pricing
from database import create_tables
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

load_dotenv()

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="MedVoice API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

create_tables()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://med-voice-kappa.vercel.app",
        "https://med-voice-git-main-ryanluonglls-projects.vercel.app",
        "https://medvoiceapp.vercel.app/",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(analyze.router)
app.include_router(appeal.router)
app.include_router(chat.router)
app.include_router(pricing.router)
@app.get("/")
def root():
    return {"message": "MedVoice API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}
