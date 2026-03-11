from fastapi import FastAPI
from dotenv import load_dotenv
from routers import analyze

load_dotenv()

app = FastAPI(title="ClearBill API")

app.include_router(analyze.router)


@app.get("/")
def root():
    return {"message": "ClearBill API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}
