"""
pricing/matcher.py
Matches a free-text bill description to a CPT code, scoped to a curated
set of common patient-facing codes verified active in benchmark.db.
Returns one of: unsupported (lab/preventive), low_confidence, confident
(single clear answer), or needs_selection (tied family, show a shortlist).
"""
import sqlite3
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

DB_PATH = "benchmark.db"

# The 37 codes verified active in the real dataset, spanning office visits,
# immunizations, imaging, EKG, and minor procedures. Labs and preventive
# visits were checked and excluded, see verify_curated_codes.py output.
CURATED_CODES = [
    "99211", "99212", "99213", "99214", "99215",
    "99202", "99203", "99204", "99205",
    "90471", "90472", "90473", "90474",
    "71045", "71046", "71047", "71048",
    "73030", "73060", "73090", "73100", "73110",
    "73560", "73600", "73610", "72100",
    "93000", "93005", "93010",
    "11200", "11201", "12001", "12002", "12004",
    "29125", "29126", "69210",
]

# Hand-built, inspectable, and meant to grow over time as real misses
# reveal real vocabulary gaps, see eval_matcher.py.
SYNONYMS = {
    "ekg": "electrocardiogram",
    "ecg": "electrocardiogram",
    "xray": "x-ray",
    "x ray": "x-ray",
    "shot": "immunization admin",
    "vaccine": "immunization admin",
    "flu shot": "immunization admin",
    "skin tag": "rmvl skin tags",
    "stitches": "rpr repair laceration wound closure",
    "sutures": "rpr repair laceration wound closure",
    "wound repair": "rpr repair",
    "cast": "splint",
    "broken arm": "splint x-ray",
    "sprained ankle": "x-ray ankle",
    "ear wax": "remove impacted ear wax",
    "checkup": "office visit",
    "check up": "office visit",
    "sick visit": "office visit",
    "doctor visit": "office visit",
    "new patient": "office o/p new",
    "established patient": "office o/p est",
}

LAB_TERMS = [
    "blood test", "blood work", "bloodwork", "urinalysis", "urine test",
    "cbc", "complete blood count", "metabolic panel", "lipid panel",
    "cholesterol test", "glucose test", "hemoglobin test", "blood draw",
    "venipuncture", "lab test", "lab work",
]
PREVENTIVE_TERMS = [
    "annual physical", "physical exam", "wellness visit", "preventive visit",
    "yearly checkup", "annual checkup", "well visit",
]

CONFIDENCE_THRESHOLD = 0.30
CLUSTER_MARGIN = 0.08


class CodeMatcher:
    def __init__(self, db_path=DB_PATH):
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        placeholders = ",".join("?" for _ in CURATED_CODES)
        rows = conn.execute(
            f"SELECT hcpcs, description FROM rvu "
            f"WHERE hcpcs IN ({placeholders}) AND modifier = '' AND status_code = 'A'",
            CURATED_CODES,
        ).fetchall()
        conn.close()

        self.codes = [r["hcpcs"] for r in rows]
        self.descriptions = [r["description"] for r in rows]
        self.vectorizer = TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 4))
        self.desc_matrix = self.vectorizer.fit_transform(self.descriptions)

    def _expand(self, text):
        t = text.lower()
        for term, expansion in SYNONYMS.items():
            if term in t:
                t = t + " " + expansion
        return t

    def _detect_unsupported(self, query):
        q = query.lower()
        for term in LAB_TERMS:
            if term in q:
                return ("lab", "Lab tests are priced under Medicare's separate Clinical "
                                "Laboratory Fee Schedule, which this tool does not yet include.")
        for term in PREVENTIVE_TERMS:
            if term in q:
                return ("preventive", "Preventive and wellness visits are not priced the same "
                                       "way under the physician fee schedule this tool uses.")
        return (None, None)

    def match(self, query, top_n=4):
        category, reason = self._detect_unsupported(query)
        if category:
            return {"status": "unsupported", "category": category, "reason": reason}

        expanded = self._expand(query)
        q_vec = self.vectorizer.transform([expanded])
        sims = cosine_similarity(q_vec, self.desc_matrix)[0]
        ranked = sorted(zip(self.codes, self.descriptions, sims), key=lambda x: -x[2])
        top_score = ranked[0][2]

        if top_score < CONFIDENCE_THRESHOLD:
            return {"status": "low_confidence", "score": round(float(top_score), 3)}

        cluster = [
            {"code": c, "description": d, "score": round(float(s), 3)}
            for c, d, s in ranked if top_score - s <= CLUSTER_MARGIN
        ][:top_n]

        if len(cluster) > 1:
            return {"status": "needs_selection", "candidates": cluster}

        return {
            "status": "confident",
            "code": ranked[0][0],
            "description": ranked[0][1],
            "score": round(float(top_score), 3),
        }


_matcher_instance = None

def get_matcher():
    global _matcher_instance
    if _matcher_instance is None:
        _matcher_instance = CodeMatcher()
    return _matcher_instance