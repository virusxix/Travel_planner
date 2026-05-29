# HiddenStay AI — System Architecture

## 1. Overview

HiddenStay AI is a **three-tier marketplace** connecting travelers with small accommodation providers across Asia. The system follows a **modular monolith** backend with a **BFF-style** Next.js frontend.

```
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js 15 (Vercel)                         │
│  Pages │ ShadCN │ React Query │ Zustand │ Google Maps          │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS / REST + JWT
┌────────────────────────────▼────────────────────────────────────┐
│                  Express API (Railway)                          │
│  Auth │ Properties │ Rooms │ Bookings │ Reviews │ AI │ Admin   │
│  Pricing Engine │ Stripe │ Cloudinary                           │
└────────────────────────────┬────────────────────────────────────┘
                             │ Prisma ORM
┌────────────────────────────▼────────────────────────────────────┐
│              PostgreSQL (Supabase)                              │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
    Cloudinary           OpenAI API            Stripe
```

## 2. Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| Monorepo (backend + frontend) | Single repo for MVP demos; clear separation of deploy targets |
| JWT access + refresh | Stateless API scaling; short-lived access tokens |
| RBAC via `UserRole` enum | Three distinct UX surfaces with middleware guards |
| Property verification workflow | Only `APPROVED` listings in public search — trust for lecturers/partners |
| Pricing engine as service | `FinalPrice = Base × Seasonal × Occupancy` — testable, auditable |
| Prisma | Type-safe schema, migrations, seed for demo data |
| React Query + Zustand | Server state vs. auth/UI client state |

## 3. Security Model

- **Passwords:** bcrypt (12 rounds)
- **Tokens:** HS256 JWT; refresh stored hashed in DB
- **Routes:** `authenticate` → `authorize(roles)` middleware chain
- **Input:** Zod validation on all mutating endpoints
- **Rate limiting:** express-rate-limit on auth and AI routes
- **CORS:** restricted to `FRONTEND_URL`
- **Uploads:** Cloudinary signed uploads; MIME validation

## 4. Core Domain Flows

### Booking Flow

```
Traveler selects dates → Check availability → Calculate dynamic price
→ Create PENDING booking → Reserve inventory → Stripe payment intent
→ Webhook confirms → CONFIRMED → Decrement room availability
```

### Property Verification

```
Owner submits → PENDING_REVIEW → Admin reviews → APPROVED | REJECTED
Public API filters status = APPROVED only
```

### AI Travel Planner

```
User inputs → POST /itinerary/generate → OpenAI structured JSON
→ Persist Itinerary + days + activities → Optional link to Property recommendations
```

## 5. Folder Structure

```
backend/
  prisma/schema.prisma
  src/
    index.ts
    config/
    middleware/
    routes/
    controllers/
    services/        # pricing, ai, recommendations, analytics
    utils/
    validators/

frontend/
  src/
    app/               # App Router pages
    components/
    lib/
    hooks/
    stores/
    types/
```

## 6. Scalability Path (Post-MVP)

- Redis for session/cache and availability locks
- Elasticsearch for property search
- Event queue for booking confirmations
- CDN for static assets
- Multi-region read replicas

## 7. Commission Model

Platform fee: **5%** of booking subtotal, stored on `Booking.platformFee` at creation time.
