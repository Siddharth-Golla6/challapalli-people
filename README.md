# challapalli.people

**Your Ward. Your Voice. Our Challapalli.**

Civic engagement platform for the 18 wards of **Challapalli Gram Panchayat**
(Krishna District, Andhra Pradesh). React + Vite + Tailwind frontend, Node.js
+ Express + Supabase Postgres (via Prisma) backend, Cloudflare R2 for photo
storage.

This project is an independent fork of an earlier civic project; the Fund
Transparency / Development Projects / Funds Received / Funds Utilized /
Fundraising features are intentionally **not** included here. People
Suggestions and People Feedback are added as separate modules.

## Features

- **Home / Community Dashboard** — live overview of civic issues and
  volunteers across all 18 wards.
- **Ward Directory** — one dashboard per Ward (`/ward/ward-1` … `/ward/ward-18`)
  with per-ward complaint stats and category breakdown.
- **Report a Problem** — title, description, category, ward, optional
  landmark, up to 10 photos, GPS pin. Statuses: New → Verified → In Progress
  → Waiting for Funds / Completed / Rejected. Public tracking id per report.
- **People Suggestions** — residents propose ideas with category, ward and a
  short description. Each suggestion gets a reference id (`SG-00001`),
  moderation status and a community upvote count.
- **People Feedback** — feedback on community services, government
  initiatives and this website. Submitter contact is private by default;
  feedback is public only when the submitter explicitly checks the box.
  Admins can respond and mark public/private. Reference id (`FB-00001`).
- **Announcements** — scoped to a Ward or panchayat-wide, with SMS fanout
  in `live` provider mode.
- **About Challapalli** — mission, how it works, contact.
- **User accounts** — phone + password login, phone + OTP login, security-
  question-based password reset, four roles (Resident, Volunteer, Ward
  Admin, Administrator).
- **Admin dashboard** — Analytics (ward breakdown, top landmarks, monthly
  trend, volunteer activity), Complaints moderation, Suggestions moderation,
  Feedback review + response, Announcements, Users, Wards, Reports (CSV
  export), Activity log.
- **English and Telugu** — complete UI translations in both.

## Architecture

```
challapalli.people/
├── src/            React + Vite frontend
└── server/         Express + Prisma + Supabase Postgres backend
    └── prisma/schema.prisma   database schema (source of truth)
```

The frontend talks to the backend over HTTP (`VITE_API_URL`, default
`http://localhost:4000/api`). If the backend is unreachable, the frontend
degrades to an empty state rather than crashing.

## Browse the site without a backend (dev)

To click through the full UI with sample data for all 18 wards, no Supabase
or R2 setup required:

```bash
cd E:/challapalli.people
npm install
echo "VITE_USE_MOCK=true" > .env
npm run dev
```

Open <http://localhost:5174>. An in-memory mock backend from
[src/data/mockApi.js](src/data/mockApi.js) serves 24 problems, 10
suggestions, 8 public feedback entries, 3 announcements and 8 volunteers
across the 18 wards. Mutations persist for the browser session only; a
refresh resets to the seed. A small banner at the bottom-right reminds
you mock mode is on and prints the demo credentials:

| Role          | Phone        | Password   |
|---------------|--------------|------------|
| Resident      | 9876500001   | demo1234   |
| Volunteer     | 9876500002   | demo1234   |
| Ward Admin    | 9876500004   | demo1234   |
| Administrator | 9876500000   | demo1234   |

Set `VITE_USE_MOCK=` (empty) or delete the line for the real backend flow
below.

## Run locally (full stack)

### 1. Create a Supabase project

Free tier at [supabase.com](https://supabase.com). Get both connection
strings from **Connect → Direct connection** (see `server/.env.example` for
which two URIs are needed and why).

### 2. Backend

```bash
cd server
npm install
cp .env.example .env   # fill in DATABASE_URL, DIRECT_URL, JWT_SECRET, R2_*
npx prisma db push     # creates tables in Supabase from prisma/schema.prisma
npx prisma db execute --file prisma/sql/constraints.sql --schema prisma/schema.prisma
npm run seed           # populates sample data — required before first run
npm run dev            # starts on :4000
```

### 3. Frontend (separate terminal)

```bash
cd ..                  # back to project root
npm install
cp .env.example .env   # defaults to http://localhost:4000/api
npm run dev            # starts on :5174
```

Open <http://localhost:5174>.

## Demo accounts

`npm run seed` creates one demo account per role (Resident, Volunteer, Ward
Admin, Administrator) and prints their phone numbers plus a **freshly
generated random password** to the terminal when it finishes. Nothing is
hardcoded. Use `/admin-login` for Ward Admin and Administrator; `/login`
for Resident and Volunteer.

**`npm run seed` wipes all existing data first** — only run it against a
database you're OK clearing, never against a live/production one.

## Geographic model

- `src/data/geography.js` and `server/src/data/geography.js` both declare
  **18 wards** of Challapalli Gram Panchayat, with stable ids `ward-1` …
  `ward-18`. Names default to the neutral labels `Ward 1` … `Ward 18`
  because official per-ward names were not verifiable from public sources
  at the time of writing. To use verified names, just edit the `name:`
  field for each entry in both files; the `id:` values should not change.
- Complaints carry a `landmark` (optional free text) in addition to the
  ward, in place of the old village-dropdown model.

## Environment variables

Secrets are not included in this repo. `server/.env.example` and `.env.example`
at the project root list every variable with a short note. In short:

**Backend (`server/.env`)**
- `DATABASE_URL`, `DIRECT_URL` — Supabase Postgres pooled + direct URIs.
- `JWT_SECRET` — long random string for signing session tokens.
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`,
  `R2_BUCKET_NAME`, `R2_PUBLIC_URL` — Cloudflare R2 photo storage.
- `CORS_ORIGIN` — exact frontend URL in production.
- `MSG91_PROVIDER_MODE` — `mock` (default; logs OTP/SMS to the server
  console) or `live` (requires `MSG91_API_KEY`, `MSG91_SENDER_ID`, and a
  DLT-approved template id per message type per language — see
  `.env.example` for the full list).

**Frontend (`.env`)**
- `VITE_API_URL` — backend base URL plus `/api`.

## Deployment

- **Frontend → Netlify.** Build command `npm run build`, publish directory
  `dist/` (both already set in `netlify.toml`). Set `VITE_API_URL` to your
  backend URL + `/api` in Netlify's environment variables.
- **Backend → Render.** Build command `npm install && npx prisma generate`,
  start command `npm start`. Binds to `process.env.PORT`. Set every var
  from `server/.env.example` in Render's environment settings.
- **Database → Supabase Postgres.**
- **Images → Cloudflare R2.**

Set `CORS_ORIGIN` on the backend to your exact frontend URL once deployed —
it falls back to allowing any origin if unset, which is fine for local dev
but not for production.

## What is intentionally not here

The following features are **not** included in challapalli.people, and
their navigation links, homepage cards, dashboard widgets and feature-
specific components have been removed from this copy:

- Fund Transparency
- Development Projects
- Funds Received dashboards
- Funds Utilized dashboards
- Fundraising campaigns or donation functionality

The single remaining fund-adjacent reference is the complaint status
`Waiting for Funds`, which is a legitimate issue-lifecycle status (a
complaint whose resolution is pending budget approval), not a fund
dashboard.

## License

Not published. Private to the project maintainer.
