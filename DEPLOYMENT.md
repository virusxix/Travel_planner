# Deploying HiddenStay (24/7, public URL)

Three free services, one per layer:

| Layer | Service | Result |
|-------|---------|--------|
| Database | MongoDB Atlas | cloud `MONGO_URL` |
| Backend (FastAPI) | Render | `https://hiddenstay-api.onrender.com` |
| Frontend (React) | Vercel | `https://hiddenstay.vercel.app` |

Do them in this order — each step needs the URL from the one before.

---

## 0. Push to GitHub
Render and Vercel both deploy from a repo.

```bash
git add .
git commit -m "Prepare HiddenStay for deployment"
git push
```

---

## 1. MongoDB Atlas (database)
1. Create a free account at https://www.mongodb.com/cloud/atlas → **Build a Database** → **M0 (free)**.
2. **Database Access** → add a user (username + password). Save them.
3. **Network Access** → **Add IP** → `0.0.0.0/0` (allow anywhere — Render's IP changes).
4. **Connect → Drivers** → copy the connection string. It looks like:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority`
   That is your **`MONGO_URL`**. (The app seeds sample stays automatically on first boot.)

---

## 2. Render (backend)
1. https://render.com → **New → Blueprint** → connect the repo. It reads `render.yaml`.
2. Render creates `hiddenstay-api`. Open it → **Environment** and fill the blank secrets:
   - `MONGO_URL` = the Atlas string from step 1
   - `CORS_ORIGINS` = leave as `*` for now (tighten in step 4)
   - `GROQ_API_KEY`, `GOOGLE_MAPS_API_KEY`, `STRIPE_*` = copy from `backend/.env`
3. **Deploy**. When live, note the URL, e.g. `https://hiddenstay-api.onrender.com`.
4. Test it: open `https://hiddenstay-api.onrender.com/api/` → should return `{"status":"ok"}`.

> Free tier sleeps after ~15 min idle; the first request then takes ~30–50s to wake. Fine for a demo.

---

## 3. Vercel (frontend)
1. https://vercel.com → **Add New → Project** → import the repo.
2. **Root Directory** → `frontend`. Framework preset: **Create React App** (auto-detected).
3. **Environment Variables**:
   - `REACT_APP_BACKEND_URL` = your Render URL from step 2 (no trailing slash)
   - `REACT_APP_GOOGLE_MAPS_API_KEY` = your Maps key
4. **Deploy**. You get `https://hiddenstay.vercel.app` (rename in project settings if you like).

---

## 4. Lock it down (after both are live)
- **Render** → set `CORS_ORIGINS` = `https://hiddenstay.vercel.app` (exact, no trailing slash) → redeploy.
- **Google Cloud Console** → Credentials → your Maps key → **Website restrictions** → add
  `https://hiddenstay.vercel.app/*`. Enable **Maps JavaScript API** + **Places API**.

---

## 5. QR code (once the Vercel URL is live)
```bash
pip install "qrcode[pil]"
python -c "import qrcode; qrcode.make('https://hiddenstay.vercel.app').save('hiddenstay-qr.png')"
```
Drop `hiddenstay-qr.png` onto the poster. Anyone scans → opens the live site.

---

## Redeploying later
Both services auto-redeploy on every `git push`. No manual steps.

## Common gotchas
- **Blank page / API errors on Vercel** → `REACT_APP_BACKEND_URL` wrong or has a trailing slash. Fix env, redeploy.
- **CORS error in browser console** → `CORS_ORIGINS` on Render doesn't exactly match the Vercel origin.
- **Map is grey** → Maps key missing website restriction for the Vercel domain, or Places API not enabled.
- **Render build fails on `litellm`** → keep that line commented in `backend/requirements.txt` (it's Emergent-cloud-only and unused).
