# Deploying challapalli.people (full stack)

Two moving parts:

1. **Frontend** — React + Vite, hosted on **Netlify** (already live at
   https://challapallipeople.com).
2. **Backend** — Express + Prisma, deploys to **Render** (free tier). Needs a
   Supabase Postgres database and, if you want photo uploads to work in
   production, a Cloudflare R2 bucket.

The frontend currently runs in **mock mode** (`VITE_USE_MOCK=true`), so
every API call is served from an in-memory `src/data/mockApi.js` with the
four demo accounts only. Everything else (problems, suggestions, feedback,
announcements) starts empty — residents and admins create their own.

## 0 · Demo accounts (same password, same phones, mock or real)

| Role            | Phone        | Password  |
|-----------------|--------------|-----------|
| Resident        | `9876500001` | `demo1234`|
| Volunteer       | `9876500002` | `demo1234`|
| Ward Admin      | `9876500004` | `demo1234`|
| Administrator   | `9876500000` | `demo1234`|

The password is identical in both the mock backend (`src/data/mockApi.js`)
and the real seed (`server/src/seed.js`). **Rotate it from the Admin
dashboard the moment the panchayat team takes over.**

---

## 1 · Backend to Render

### 1a. Create a Supabase Postgres database (free)

1. Sign up at https://supabase.com and create a project.
2. Open **Project Settings → Database → Connection string**.
3. Copy the **Pooled** connection string (port 6543). This is your `DATABASE_URL`.
4. Copy the **Direct** connection string (port 5432). This is your `DIRECT_URL`.

### 1b. Push the schema from your laptop (one-off)

```bash
cd server
cp .env.example .env            # fill in DATABASE_URL and DIRECT_URL
npm install
npx prisma db push              # creates all tables from prisma/schema.prisma
npx prisma db execute --file prisma/sql/constraints.sql --schema prisma/schema.prisma
npm run seed                    # creates the four demo users only
```

### 1c. Push the project to GitHub

Render deploys from a GitHub repo. If you haven't already:

```bash
cd ..                           # back to project root
git add .
git commit -m "Ready for deploy"
git remote add origin https://github.com/<you>/challapalli-people.git
git push -u origin main
```

### 1d. Create the Render web service

1. Sign up at https://render.com with your GitHub account.
2. **New +** → **Web Service** → pick your repo.
3. Render auto-detects `render.yaml` — confirm the settings.
4. Open **Environment** and add:
   - `DATABASE_URL` — Supabase pooled URL
   - `DIRECT_URL` — Supabase direct URL
   - `JWT_SECRET` — any long random string (`openssl rand -base64 48`)
   - `CORS_ORIGIN` — `https://challapallipeople.com`
   - (Optional, enables photo uploads) `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`
   - (Optional, enables real SMS/OTP) `MSG91_API_KEY`, `MSG91_SENDER_ID` and the `MSG91_TEMPLATE_ID_*` set — see `server/.env.example`.
5. Deploy. Render gives you a URL like `https://challapalli-people-api.onrender.com` after ~3 minutes.
6. Verify with `curl https://challapalli-people-api.onrender.com/api/health` — should return `{"ok":true}`.

> **Render free tier caveat:** services sleep after 15 minutes of inactivity. First request after a sleep takes 30–60 seconds to cold-start.

---

## 2 · Frontend to the real backend

Once your backend is live:

1. Netlify dashboard → **challapalli-people** → **Site configuration → Environment variables**.
2. Add:
   - `VITE_USE_MOCK` = `false`
   - `VITE_API_URL` = `https://challapalli-people-api.onrender.com/api` (your actual Render URL)
3. **Trigger a redeploy** (Deploys → Trigger deploy → Deploy site).

The Netlify build bakes the real backend URL into the bundle. The site calls Render, which calls Supabase, which returns real data.

> If you'd rather keep mock mode running as a demo and defer the real backend, do nothing — `.env.production` leaves `VITE_USE_MOCK=true` by default.

---

## 3 · Verifying the full stack

- Visit https://challapallipeople.com and log in as `9876500001 / demo1234` — the Dashboard loads but is empty.
- Report a problem — refresh, it should still be there (coming from Supabase, not browser memory).
- Log in as Administrator (`9876500000 / demo1234`) — Admin dashboard shows the complaint with a Verify button.
- Verify it — the resident view now shows the complaint publicly.

If anything fails, check: Render **Logs**, browser DevTools **Network** tab, `CORS_ORIGIN` on Render matches your Netlify URL exactly.

---

## 4 · Local development (unchanged)

```bash
# in one terminal — backend
cd server
npm install
cp .env.example .env            # fill in Supabase + optional R2 vars
npm run dev                     # :4000

# in another — frontend
npm install
cp .env.example .env            # defaults to http://localhost:4000/api
npm run dev                     # :5174
```

Or stay in mock mode (no backend needed at all):

```bash
echo "VITE_USE_MOCK=true" > .env
npm run dev
```
