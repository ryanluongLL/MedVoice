# MedLedger

Ever gotten a medical bill and had no idea whether the price was normal or not? That's the problem this solves. No upload, no account, no AI reading your bill. Just a real government pricing dataset and math you can check yourself.

**Live app:** [medvoiceapp.vercel.app](https://medvoiceapp.vercel.app)

---

## Why this exists (and why it's not what it used to be)

This project started as an AI bill reader. Upload a photo of your medical bill, Claude reads it, explains the charges, generates an appeal letter. It worked, but I kept asking myself one question: if a user can already paste their bill into Claude and get the same explanation, what is this tool actually adding?

The honest answer was not much. So I rebuilt it around something an AI chatbot cannot do on its own: comparing a real charge against a real, cited government benchmark, computed by code, not guessed by a model.

The rebuild also dropped every reason this project used to need to handle personal data. No document upload means no protected health information. No accounts means nothing to secure or leak. What's left is genuinely simpler, and more honest about what it can and can't tell you.

---

## What it does

You enter a CPT code and the amount you were billed. MedLedger looks up Medicare's published Physician Fee Schedule, computes the real national benchmark rate for that code, and shows you the dollar difference and the ratio against what you paid.

If you don't know your CPT code, you can describe the visit in plain language instead ("office visit," "chest xray," "flu shot"). A text matcher checks it against a curated list of common outpatient codes. If the description is genuinely ambiguous, like an office visit, where the exact billing level depends on something only your doctor's coding decision would show, it shows you the real candidates and lets you pick, instead of silently guessing. If you describe something this tool doesn't price yet, like a lab test, it tells you exactly why, rather than giving you a wrong answer.

Every number shown is computed live from the actual CMS relative value formula: (Work RVU + Practice Expense RVU + Malpractice RVU) times the conversion factor, both pulled straight from the government's own release, not hardcoded. The full breakdown, with a real worked example, is on the [How it works](https://medvoiceapp.vercel.app/how-it-works) page.

---

## What it deliberately does not do

- No document or photo upload, ever
- No accounts, no login, no stored personal data of any kind
- No AI model in the pricing calculation itself, the number is math, not a generated answer
- No regional (GPCI) price adjustment yet, benchmarks are the national rate
- No lab test or preventive/wellness visit pricing yet, those live under a separate CMS dataset this tool doesn't include
- The description matcher covers a curated set of common codes, not all ~7,600 active codes in the fee schedule, most of the rest are specialist procedure codes an ordinary patient couldn't describe accurately anyway

---

## Tech Stack

**Frontend:** Next.js, CSS Modules, Motion (for the few animations that earn their place), react-hot-toast

**Backend:** FastAPI, scikit-learn (TF-IDF text matching for the description search), pandas, slowapi (rate limiting)

**Data:** SQLite, built at deploy time directly from the real CMS Physician Fee Schedule Relative Value File (public, no API key needed)

**Deployed on:** Vercel (frontend) and Render (backend). No database service to manage, no secrets required to run either half.

---

## Running it locally

### Backend

```bash
git clone https://github.com/ryanluongLL/MedVoice.git
cd MedVoice
python -m venv venv
source venv/bin/activate      # venv/Scripts/activate on Windows
pip install -r requirements.txt
bash build_db.sh              # downloads the real CMS data and builds pricing/benchmark.db
uvicorn main:app --reload
```

No `.env` file is required. Nothing in this app needs a secret key or a database connection string anymore.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env.local`:
NEXT_PUBLIC_API_URL=http://localhost:8000


---

## Project structure

MedVoice/
├── main.py # FastAPI app entry point
├── build_db.sh # downloads CMS data, builds benchmark.db
├── requirements.txt
├── pricing/
│ ├── ingest_rvu.py # parses the raw CMS file into SQLite
│ ├── matcher.py # description to CPT code matching
│ └── eval_matcher.py # honest accuracy test set for the matcher
├── routers/
│ ├── pricing.py # POST /check-charge
│ └── match.py # POST /match-code
└── frontend/
└── app/
├── page.js # the price checker itself
├── how-it-works/ # the actual formula, with a real example
└── privacy/ # what is and isn't collected (spoiler: nothing)


---

## About

Built by **Luan Luong**, CS student at Cal State Fullerton.

- GitHub: [@ryanluongLL](https://github.com/ryanluongLL)
- Email: luanluongforwork@gmail.com