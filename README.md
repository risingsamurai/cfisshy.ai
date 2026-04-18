# LUMIS.AII

Bias detection and fairness auditing platform for AI/ML systems, built for Google Solution Challenge-style judging.

## Stack

- React 18 + TypeScript + Vite + Tailwind + Framer Motion
- Firebase Auth + Firestore + Storage + Hosting + Functions
- Google Gemini (`@google/generative-ai`) for narrative and chat
- Recharts + D3 for visual analysis
- Python FastAPI + AIF360 + scikit-learn on Cloud Run

## Local setup

1. Install Node.js 20+ and npm.
2. Copy `.env.example` -> `.env` and fill all keys.
3. Install frontend deps:
   - `npm install`
4. Start frontend:
   - `npm run dev`

## ML backend setup

1. `cd ml-backend`
2. `pip install -r requirements.txt`
3. `uvicorn main:app --reload --port 8080`
4. Set `VITE_ANALYZER_URL=http://localhost:8080/analyze` in `.env`.

## Firebase setup

1. Enable Authentication providers: Google + Email/Password.
2. Create Firestore and Storage.
3. Deploy security rules:
   - `firebase deploy --only firestore:rules,storage`
4. Deploy hosting/functions:
   - `firebase deploy --only hosting,functions`

## Demo flow for judges

1. Open landing page and click `Try Demo`.
2. Load a demo dataset in `/audit/new`.
3. Open the report page and show:
   - Fairness gauge + severity
   - Protected attribute metrics
   - Bias heatmap
   - Distribution chart
   - Intersectional trend + proxy variable alerts
   - Gemini-powered `Ask FairLens AI` panel
4. Compare before/after in `/compare`.
5. Run what-if simulation in `/playground`.

## Repository note

- Synced and maintained from local development workspace.
