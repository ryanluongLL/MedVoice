# MedVoice

Ever gotten a medical bill and had absolutely no idea what you were paying for? Yeah, me too. That's why I built this.

MedVoice lets you upload a medical bill and get a plain-English breakdown of every charge, flags anything suspicious, and even generates a formal appeal letter if something looks wrong.

🔗 **Live Demo:** [med-voice-kappa.vercel.app](https://med-voice-kappa.vercel.app)

---

## What it does

- Upload a medical bill (PDF or photo) and get a full breakdown in seconds
- Flags potential billing errors and suspicious charges
- Generates a professional insurance appeal letter based on your bill
- Supports 8 languages — English, Spanish, Chinese, Vietnamese, Korean, Filipino, Arabic, French
- Saves your bill history so you can track spending over time
- AI chat assistant to answer follow-up questions about your bill
- Find nearby hospitals and clinics with ratings, photos, and contact info

---

## Tech Stack

**Frontend:** Next.js, Clerk (auth), Motion (animations), Recharts, Google Maps API

**Backend:** FastAPI, Claude API (Anthropic), pdfplumber, SQLAlchemy, PostgreSQL

**Deployed on:** Vercel (frontend) + Railway (backend) + Supabase (database)

**CI/CD:** GitHub Actions — runs build checks on every push

---

## Running it locally

### Backend
```bash
cd clearbill
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Create a `.env` file:
ANTHROPIC_API_KEY=your_key
DATABASE_URL=your_supabase_url
### Frontend
```bash
cd frontend
npm install
npm run dev
```

Create a `.env.local` file:

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key

---
## About

Built by **Luan Luong**

- GitHub: [@ryanluongll](https://github.com/ryanluongll)
- Email: luongryanll@gmail.com