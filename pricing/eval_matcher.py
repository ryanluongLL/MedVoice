"""
pricing/eval_matcher.py
The honest test set for the matcher. Run this after any change to
SYNONYMS, CURATED_CODES, or the thresholds in matcher.py, to see whether
accuracy actually improved or quietly regressed.
"""
from matcher import get_matcher
TEST_CASES = [
    ("office visit", "shortlist_contains", ["99213"]),
    ("new patient visit", "shortlist_contains", ["99202"]),
    ("chest xray", "shortlist_contains", ["71046"]),
    ("chest x-ray two views", "shortlist_contains", ["71046"]),
    ("ekg", "shortlist_contains", ["93000"]),
    ("flu shot", "single", "90471"),
    ("vaccine", "single", "90471"),
    ("skin tag removal", "shortlist_contains", ["11200"]),
    ("stitches", "any_match", None),
    ("broken arm splint", "shortlist_contains", ["29125"]),
    ("ear wax removal", "single", "69210"),
    ("shoulder xray", "single", "73030"),
    ("knee xray", "single", "73560"),
    ("annual physical", "unsupported", "preventive"),
    ("blood test", "unsupported", "lab"),
    ("cbc", "unsupported", "lab"),
    ("blood draw", "unsupported", "lab"),
    ("something totally unrelated to medicine", "low_confidence", None),
]

matcher = get_matcher()
passed = 0

for query, expectation, expected in TEST_CASES:
    result = matcher.match(query)
    status = result["status"]

    if expectation == "single":
        ok = status == "confident" and result["code"] == expected
    elif expectation == "shortlist_contains":
        ok = status == "needs_selection" and any(c["code"] in expected for c in result["candidates"])
    elif expectation == "unsupported":
        ok = status == "unsupported" and result["category"] == expected
    elif expectation == "low_confidence":
        ok = status == "low_confidence"
    elif expectation == "any_match":
        ok = status in ("confident", "needs_selection")

    passed += ok
    print(f"{'PASS' if ok else 'FAIL':5} '{query}'  ->  status={status}"
          + (f" code={result.get('code')}" if status == "confident" else "")
          + (f" candidates={[c['code'] for c in result['candidates']]}" if status == "needs_selection" else "")
          + (f" category={result.get('category')}" if status == "unsupported" else ""))

print(f"\n{passed}/{len(TEST_CASES)} passed = {passed/len(TEST_CASES)*100:.0f}%")