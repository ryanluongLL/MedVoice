from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import pricing, match
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

load_dotenv()

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="MedLedger API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

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

app.include_router(pricing.router)
app.include_router(match.router)


@app.get("/")
def root():
    return {"message": "MedLedger API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}