from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sqlite3
import os

router = APIRouter()

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "pricing", "benchmark.db")

class ChargeCheckRequest(BaseModel):
    code: str
    billed_amount: float

def lookup_code(code: str):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    row = conn.execute(
        "SELECT * FROM rvu WHERE hcpcs = ? ORDER BY modifier LIMIT 1",
        (code.upper().strip(),),
    ).fetchone()
    conn.close()
    return dict(row) if row else None

@router.post("/check-charge")
def check_charge(request: ChargeCheckRequest):
    result = lookup_code(request.code)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"Code '{request.code}' was not found in the Medicare physician fee schedule."
        )
    if result["status_code"] != "A":
        return{
            "code": result["hcpcs"],
            "description": result["description"],
            "status_code": result["status_code"],
            "benchmark_available": False,
            "reason": "This code is not priced under the standard physician fee schedule "
                      "(it may be billed elsewhere, e.g. the lab fee schedule, or is not "
                      "separately payable by Medicare).",
            "billed_amount": request.billed_amount,
        }

    benchmark = result["benchmark_nonfac"]
    ratio = round(request.billed_amount / benchmark , 2) if benchmark > 0 else None

    return{
        "code": result["hcpcs"],
        "description": result["description"],
        "status_code": result["status_code"],
        "benchmark_available": True,
        "benchmark_nonfacility": benchmark,
        "billed_amount": request.billed_amount,
        "difference": round(request.billed_amount - benchmark, 2),
        "ratio_vs_benchmark": ratio,
        "note": "Medicare's national non-facility rate is a public reference point, not "
                "a legal maximum. Private insurance and cash prices commonly differ from it. "
                "Use this as a comparison, not a verdict.",
    }
