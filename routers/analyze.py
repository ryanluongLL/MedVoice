from fastapi import APIRouter, UploadFile, File, Form
from pydantic import BaseModel
from anthropic import Anthropic
from dotenv import load_dotenv
import pdfplumber, json, io, uuid
from database import get_db, BillAnalysis
from sqlalchemy.orm import Session
from fastapi import Depends
import base64

LANGUAGE_MAP = {
    "en": "English",
    "es": "Spanish",
    "zh": "Chinese (Simplified)",
    "vi": "Vietnamese",
    "ko": "Korean",
    "tl": "Filipino (Tagalog)",
    "ar": "Arabic",
    "fr": "French",
}

load_dotenv()
router = APIRouter()
client = Anthropic()


class BillRequest(BaseModel):
    bill_text: str


@router.post("/analyze")
def analyze_bill(request: BillRequest):
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": f"""You are a helpful medical bill analyst.
                Analyze the following medical bill and return a JSON response with this exact structure:
                {{
                    "summary": "brief plain-English summary of the bill",
                    "total_amount": "total amount due as a string",
                    "charges":[
                    {{"name": "charge name", "amount": "amount", "explanation": "plain English explanation"}}
                    ],
                    "red_flags": ["list of any suspicious or unusual charges"],
                    "advice": "one actionable piece of advice for the patient"
                }}
                Return only the JSON, no extra text.

                Bill text:
                {request.bill_text}""",
            }
        ],
    )

    raw = response.content[0].text
    clean = (
        raw.strip()
        .removeprefix("```json")
        .removeprefix("```")
        .removesuffix("```")
        .strip()
    )
    result = json.loads(clean)
    return result


@router.post("/analyze-pdf")
async def analyze_pdf(
    file: UploadFile = File(...),
    language: str = Form("en"),
    user_id: str = Form("anonymous"),
    db: Session = Depends(get_db),
):
    language_name = LANGUAGE_MAP.get(language, "English")
    contents = await file.read()
    filename = file.filename.lower()

    # Determine file type
    is_image = filename.endswith((".jpg", ".jpeg", ".png", ".webp"))
    is_pdf = filename.endswith(".pdf")

    if not is_image and not is_pdf:
        return {"error": "Unsupported file type. Please upload a PDF or image file."}

    if is_pdf:
        # Extract text from PDF using pdfplumber
        with pdfplumber.open(io.BytesIO(contents)) as pdf:
            text = ""
            for page in pdf.pages:
                text += page.extract_text() or ""

        if not text.strip():
            return {"error": "Could not extract text from this PDF"}

        messages = [
            {
                "role": "user",
                "content": f"""You are a helpful medical bill analyst.
                Analyze the following medical bill and return a JSON response with this exact structure:
                {{
                    "summary": "brief plain-English summary of the bill",
                    "total_amount": "total amount due as a string",
                    "charges":[
                    {{"name": "charge name", "amount": "amount", "explanation": "plain English explanation"}}
                    ],
                    "red_flags": ["list of any suspicious or unusual charges"],
                    "advice": "one actionable piece of advice for the patient"
                }}
                Important: Write all text values in the JSON in this language: {language_name}.
                Only the JSON structure keys should remain in English. All values must be in {language_name}.
                Return only the JSON, no extra text.
                Bill text:
                {text}""",
            }
        ]

    else:
        # Send image directly to Claude vision
        image_data = base64.standard_b64encode(contents).decode("utf-8")

        # Determine media type
        if filename.endswith(".png"):
            media_type = "image/png"
        elif filename.endswith(".webp"):
            media_type = "image/webp"
        else:
            media_type = "image/jpeg"

        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": image_data,
                        },
                    },
                    {
                        "type": "text",
                        "text": f"""You are a helpful medical bill analyst.
                        Analyze the medical bill in this image and return a JSON response with this exact structure:
                        {{
                            "summary": "brief plain-English summary of the bill",
                            "total_amount": "total amount due as a string",
                            "charges":[
                            {{"name": "charge name", "amount": "amount", "explanation": "plain English explanation"}}
                            ],
                            "red_flags": ["list of any suspicious or unusual charges"],
                            "advice": "one actionable piece of advice for the patient"
                        }}
                        Important: Write all text values in the JSON in this language: {language_name}.
                        Only the JSON structure keys should remain in English. All values must be in {language_name}.
                        Return only the JSON, no extra text.""",
                    },
                ],
            }
        ]

    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        messages=messages,
    )

    raw = response.content[0].text
    clean = (
        raw.strip()
        .removeprefix("```json")
        .removeprefix("```")
        .removesuffix("```")
        .strip()
    )
    result = json.loads(clean)

    # Save to database
    record = BillAnalysis(
        id=str(uuid.uuid4()),
        user_id=user_id,
        filename=file.filename,
        language=language,
        summary=result.get("summary"),
        total_amount=result.get("total_amount"),
        charges=result.get("charges"),
        red_flags=result.get("red_flags"),
        advice=result.get("advice"),
    )
    db.add(record)
    db.commit()

    return result


@router.get("/history/{user_id}")
def get_history(user_id: str, db: Session = Depends(get_db)):
    records = (
        db.query(BillAnalysis)
        .filter(BillAnalysis.user_id == user_id)
        .order_by(BillAnalysis.created_at.desc())
        .all()
    )

    return [
        {
            "id": r.id,
            "filename": r.language,
            "summary": r.summary,
            "total_amount": r.total_amount,
            "charges": r.charges,
            "red_flags": r.red_flags,
            "advice": r.advice,
            "created_at": r.created_at.isoformat(),
        }
        for r in records
    ]
