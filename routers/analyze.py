from fastapi import APIRouter, UploadFile, File, Form
from pydantic import BaseModel
from anthropic import Anthropic
from dotenv import load_dotenv
import pdfplumber
import json
import io

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
async def analyze_pdf(file: UploadFile = File(...), language: str = Form("en")):
    language_name = LANGUAGE_MAP.get(language, "English")
    contents = await file.read()

    with pdfplumber.open(io.BytesIO(contents)) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text() or ""

    if not text.strip():
        return {"error": "Could not extract text from this PDF"}

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
                    {{"name": "charge name", "amount": "amount", "explanation": "plain English explanation" }}
                    ],
                    "red_flags": ["list of any suspicious or unsual charges"],
                    "advice": "one actionable piece of advice for the patient"
                }}
                Important: Write all text values in the JSON in this language: {language_name}.
                Only the JSON structure keys should remain in English. All values must be in {language_name}.
                Return only the JSON, no extra text.
                Bill text:
                {text}""",
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
