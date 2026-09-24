"""
routers/match.py
Free-text description -> CPT code matching, scoped to common patient-facing
codes. Returns a shortlist when the correct code can't be determined from
the description alone (e.g. office visit complexity level), and an explicit
explanation when the query describes something this tool doesn't price yet
(labs, preventive visits).
"""
from fastapi import APIRouter
from pydantic import BaseModel
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "pricing"))
from matcher import get_matcher

router = APIRouter()

class MatchRequest(BaseModel):
    description: str

@router.post("/match-code")
def match_code(request: MatchRequest):
    matcher = get_matcher()
    result = matcher.match(request.description)
    return result