from fastapi import FastAPI
from pydantic import BaseModel
from anthropic import Anthropic
from dotenv import load_dotenv
import json

load_dotenv()

app = FastAPI()
client = Anthropic()


class BillRequest(BaseModel):
    bill_text: str


@app.get("/")
def root():
    return {"message": "ClearBill API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze")
def analyze_bill(request: BillRequest):
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": f"""You are a helpful medical bill analyst.
                Analyse the following medical bill and return a JSON response with this exact structure:
                {{
                     "summary": "brief plain-English summary of the bill",
                    "total_amount": "total amount due as a string",
                    "charges": [
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
