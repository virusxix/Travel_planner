# Stripe Checkout & Google Maps Setup

## Google Maps API Key

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable **Maps JavaScript API** and **Geocoding API** (APIs & Services → Library)
4. Go to **Credentials** → **Create credentials** → **API key**
5. Restrict the key (recommended):
   - Application restrictions: **HTTP referrers**
   - Add: `http://localhost:3000/*`, `http://localhost:3001/*` (if Next uses another port), and your production domain `https://yourdomain.com/*`
   - API restrictions: **Maps JavaScript API** only

6. Add to `frontend/.env.local`:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...your_key_here
```

7. Restart the frontend dev server:

```powershell
cd d:\sample\frontend
npm run dev
```

Maps appear on **Explore** (`/search`), **Property detail**, and anywhere `PropertyMap` is used.

---

## Stripe Checkout

### 1. Get API keys

1. [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **API keys**
2. Copy **Publishable key** (`pk_test_...`) and **Secret key** (`sk_test_...`)

### 2. Backend `.env`

Add to `d:\sample\backend\.env`:

```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx
```

### 3. Frontend `.env.local`

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxx
```

> The publishable key is used to detect Stripe mode in the UI. Checkout itself runs on Stripe-hosted pages.

### 4. Webhook (local development)

Install [Stripe CLI](https://stripe.com/docs/stripe-cli), then:

```powershell
stripe login
stripe listen --forward-to localhost:4000/api/webhooks/stripe
```

Copy the webhook signing secret (`whsec_...`) into `STRIPE_WEBHOOK_SECRET` in `backend/.env`.

### 5. Webhook (production)

In Stripe Dashboard → **Developers** → **Webhooks** → **Add endpoint**:

- URL: `https://your-api.com/api/webhooks/stripe`
- Events: `checkout.session.completed`, `checkout.session.expired`

### 6. Test payment

1. Start backend + frontend
2. Log in as `traveler@hiddenstay.ai` / `Password123!`
3. Book a room → **Reserve & pay** → **Pay with Stripe**
4. Use test card: `4242 4242 4242 4242`, any future expiry, any CVC

### Flow

```
Reserve booking (PENDING, 30 min hold)
  → POST /api/bookings/:id/checkout-session
  → Redirect to Stripe Checkout
  → User pays
  → Webhook checkout.session.completed → booking CONFIRMED
  → Redirect to /book/success?session_id=...
  → POST /api/bookings/verify-checkout (idempotent confirm)
```

Without Stripe keys, the app uses **mock payment** (dev only).

---

## Restart after env changes

```powershell
# Terminal 1
cd d:\sample\backend
npm run dev

# Terminal 2
cd d:\sample\frontend
npm run dev
```
