# API Keys & Environment Variables

Everything needed to run challapalli.people, split by whether the site can run without it.

There are two `.env` files: one at the project root (frontend) and one in `server/` (backend). Copy the matching `.env.example` to `.env` in each location and fill in the values below.

## Required to run at all

Without these, the backend won't start or auth won't work.

| Variable | File | What it is | Where to get it |
|---|---|---|---|
| `DATABASE_URL` | `server/.env` | Postgres connection string (pooled, port 6543) used by the running app | [Supabase](https://supabase.com) — free tier. Connect → "Direct connection" tab, Transaction pooler. Must end in `?pgbouncer=true`. |
| `DIRECT_URL` | `server/.env` | Postgres connection string (direct, port 5432) used only by Prisma migrations | Same Supabase page — Session/direct connection, no `pgbouncer` param |
| `JWT_SECRET` | `server/.env` | Random string used to sign login tokens | Generate your own: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `CORS_ORIGIN` | `server/.env` | Which frontend URL(s) the API accepts requests from | You choose — e.g. `http://localhost:5174` in dev, your real domain in production |
| `PORT` | `server/.env` | Port the backend listens on | You choose — defaults to `4000`; Render sets this automatically in production |
| `VITE_API_URL` | `.env` (root) | Where the frontend sends API requests | You choose — e.g. `http://localhost:4000/api` in dev |

**Status:** `DATABASE_URL`, `DIRECT_URL`, and `JWT_SECRET` are already filled in in `server/.env` against a live Supabase project.

## Required for photo uploads (Cloudflare R2)

Reporting a problem with real photos fails without these — see `server/src/services/storage.js`.

| Variable | What it is |
|---|---|
| `R2_ACCOUNT_ID` | Your Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 API token access key |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret key |
| `R2_BUCKET_NAME` | The bucket you created for photos |
| `R2_PUBLIC_URL` | Public base URL the bucket serves from (r2.dev subdomain or custom domain) |

Get these by creating a free R2 bucket at [dash.cloudflare.com](https://dash.cloudflare.com) → R2 Object Storage.

**Status:** not yet configured — all five are blank in `server/.env`.

## Optional (SMS / OTP)

The site runs fine without these — SMS just logs to the console instead of sending (`MSG91_PROVIDER_MODE=mock`, the default). Only needed if you want real SMS delivery.

| Variable | What it is |
|---|---|
| `MSG91_PROVIDER_MODE` | `mock` (default, safe) or `live` |
| `MSG91_API_KEY` | Your MSG91 auth key |
| `MSG91_SENDER_ID` | Your approved 6-character DLT sender ID |
| `MSG91_TEMPLATE_ID_OTP_EN` / `_TE` | MSG91 Flow template ID, OTP message, English/Telugu |
| `MSG91_TEMPLATE_ID_STATUSCHANGE_EN` / `_TE` | Same, for status-change notifications |
| `MSG91_TEMPLATE_ID_ASSIGNMENT_EN` / `_TE` | Same, for volunteer assignment notifications |
| `MSG91_TEMPLATE_ID_ANNOUNCEMENT_EN` / `_TE` | Same, for announcement broadcasts |

Getting these requires DLT registration (a business process, not something done in code) — see the "Messaging" section in `README.md` for the full walkthrough.

**Status:** running in `mock` mode — no real SMS is sent, nothing is required here to keep developing.

## Not needed

- **Maps** (GPS location picker) — uses Leaflet + OpenStreetMap, free, no API key.
- **Payments** — not implemented; donations were removed from this build.
