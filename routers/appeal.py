from fastapi import APIRouter
from pydantic import BaseModel
from anthropic import Anthropic
from dotenv import load_dotenv
import json

load_dotenv()

router = APIRouter()
client = Anthropic()


class AppealRequest(BaseModel):
    # user info
    patient_name: str
    date_of_birth: str
    insurance_id: str
    insurance_company: str
    # provider info
    hospital_name: str
    hospital_address: str
    # bill analysis data
    summary: str
    total_amount: str
    charges: list
    red_flags: list


@router.post("/generate-appeal")
def generate_appeal(request: AppealRequest):
    red_flags_text = "\n".join([f"-{flag}" for flag in request.red_flags])
    charges_text = "\n".join(
        [f"-{c['name']}: {c['amount']} ({c['explanation']})" for c in request.charges]
    )

    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=2048,
        messages=[
            {
                "role": "user",
                "content": f"""You are an expert medical billing advocate.
                Write a formal, professional insurance appeal letter for the following patient.
                The letter should be firm but polite, reference specific charges, and request a review of the falgged items.

                Patient Information:
                - Name: {request.patient_name}
                - Date of Birth: {request.date_of_birth}
                - Insurance ID: {request.insurance_id}
                - Insurance Company: {request.insurance_company}

                Provider Information:
                - Hospital/Provider: {request.hospital_name}
                - Address: {request.hospital_address}

                Bill Summary:
                {request.summary}

                Total Amount: {request.total_amount}

                Charges:
                {charges_text}

                Flagged Issues:
                {red_flags_text}

                Write a complete, ready-to-send formal appeal letter. Include:
                - Proper data and address header
                - Patient and policy information
                - Clear descrtipion of the disputed charges
                - Professional closing with signature line

                Return only the letter text, no extra text commentary. """,
            }
        ],
    )

    return {"letter": response.content[0].text}
