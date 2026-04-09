from fastapi import APIRouter
from pydantic import BaseModel
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
client = Anthropic()


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    question: str
    bill_context: dict
    history: list[Message] = []


@router.post("/chat")
def chat(request: ChatRequest):
    bill = request.bill_context

    system_prompt = f"""You are a helpful medical billing assistant.
    The user has just received an analysis of their medical bill and may have questions about it.

    Here is their bill information:
    - Summary: {bill.get('summary')}
    - Total Amount: {bill.get('total_amount')}
    - Charges: {bill.get('charges')}
    - Red Flags: {bill.get('red_flags')}
    - Advice: {bill.get('advice')}

    Answer questions specifically about this bill in a clear, helpful, and friendly way.
    Keep answers concise — 2-4 sentences unless more detail is needed.
    If asked something unrelated to medical billing, politely redirect the conversation."""

    messages = [{"role": m.role, "content": m.content} for m in request.history]
    messages.append({"role": "user", "content": request.question})

    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=512,
        system=system_prompt,
        messages=messages,
    )

    return {"answer": response.content[0].text}
