# HiddenStay

Southeast Asia homestay marketplace with an integrated AI trip planner — book independent stays at **from 5% commission** (hosts keep 95% on Starter; Growth tools / Featured / ads are optional).

**Live:** [hidden-stay.vercel.app](https://hidden-stay.vercel.app) · API: [hiddenstay-api-88ey.onrender.com](https://hiddenstay-api-88ey.onrender.com)

## What it is

HiddenStay is a **two-sided travel product** for travellers and independent hosts:

1. **Marketplace** — search and book boutique stays / homestays (not chain-hotel inventory).
2. **AI trip planner** — chat itineraries on a map, grounded in real listings you can book.
3. **Host portal** — free Starter tools to list, manage bookings, and see earnings.

Travellers plan → discover nearby stays → checkout. Hosts list once and keep most of the booking value vs typical OTA fees (15–30%).

## Main cores

| Core | Who | What it does |
|------|-----|--------------|
| **Traveller marketplace** | Guests | Home search, property detail, Stripe sandbox checkout, trips / bookings |
| **AI trip planner** | Guests | Multi-turn chat + map itinerary; suggests bookable HiddenStay stays |
| **Host workspace** | Hosts | Listings, dashboard, payouts / earnings (5% base commission), reviews |
| **Admin trust** | Ops | Approve listings before they go live |

### Roles (demo login)

- **Traveller** — search, book, AI planner, trips  
- **Host** — listings, bookings, earnings  
- **Admin** — listing approvals  

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Create React App, React Router, Tailwind, Radix UI |
| Backend | FastAPI (Python), Uvicorn |
| Database | MongoDB (Atlas in production) |
| Payments | Stripe (sandbox / Connect) |
| AI | Groq (default) — optional OpenAI / Gemini |
| Maps | Google Maps JavaScript + Places |

## Quick start

### Prerequisites

- Node.js 18+
- Python 3.11+
- MongoDB local **or** Atlas connection string
- Keys (optional for basic UI): Groq, Google Maps, Stripe — see [`.env.example`](.env.example)

### 1. Environment

```bash
# Backend
cp .env.example backend/.env   # fill MONGO_URL, keys as needed

# Frontend
# Create frontend/.env with:
# REACT_APP_BACKEND_URL=http://127.0.0.1:8000
# REACT_APP_GOOGLE_MAPS_API_KEY=...
```

### 2. Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn server:app --reload --port 8000
```

API: `http://127.0.0.1:8000` · health: `/api/`

### 3. Frontend

```bash
cd frontend
yarn install   # or npm install
yarn start     # or npm start
```

App: `http://localhost:3000`

## Project structure

```
sample/
├── frontend/          # CRA React app (traveller / host / admin)
├── backend/           # FastAPI + MongoDB
├── marketing/         # Product brief, financial plan, QR
├── DEPLOYMENT.md      # Atlas + Render + Vercel
└── .env.example
```

## Docs

- [Deployment (24/7)](DEPLOYMENT.md)
- [Product brief](marketing/PROJECT_BRIEF.md)
- [Financial strategy](marketing/REAL_WORLD_FINANCIAL_STRATEGY.md)

## License

Proprietary — HiddenStay capstone MVP (Group 63 I / BU3102–CP3102)
