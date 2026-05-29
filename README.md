# HiddenStay AI

AI-powered travel planning and accommodation marketplace for small hospitality businesses across Asia.

**Commission:** 5% (vs. 15–25% on major OTAs)

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React, TypeScript, Tailwind, ShadCN, React Query, Zustand |
| Backend | Node.js, Express, TypeScript, Prisma |
| Database | PostgreSQL (Supabase) |
| Auth | JWT + refresh tokens |
| Storage | Cloudinary |
| Payments | Stripe (sandbox) |
| AI | OpenAI |
| Maps | Google Maps |

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL (or Supabase connection string)
- API keys: OpenAI, Cloudinary, Stripe, Google Maps (optional for dev)

### 1. Environment

```bash
cp .env.example .env
# Edit .env with your credentials
```

### 2. Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

API: `http://localhost:4000`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:3000`

## Project Structure

```
hiddenstay-ai/
├── docs/           # Architecture, ERD, API spec, roadmap
├── backend/        # Express API + Prisma
└── frontend/       # Next.js 15 app
```

## User Roles

- **TRAVELER** — search, book, review, AI planner
- **BUSINESS_OWNER** — properties, rooms, bookings, analytics
- **ADMIN** — verification, users, platform analytics

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Database ERD](docs/ERD.md)
- [REST API](docs/API.md)
- [Development Roadmap](docs/ROADMAP.md)

## Deployment

- Frontend → Vercel (`NEXT_PUBLIC_API_URL`)
- Backend → Railway
- Database → Supabase PostgreSQL

## License

Proprietary — HiddenStay AI MVP
