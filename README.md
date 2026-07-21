# The BirthWave — Patient & Clinical Portal

Full-stack web app for Dr. Santoshi's clinic: mobile-OTP patient portal, appointment
booking/approval/reschedule workflow with SMS alerts, and the "Speak with Dr. Santoshi AI"
fertility risk assessment.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · PostgreSQL + Prisma ·
TanStack Query · Zustand · React Hook Form + Zod · Fast2SMS / Twilio · JWT (httpOnly cookie) sessions.

---

## 1. What's actually wired up vs. what needs your credentials

This is real, complete code — no stub functions or `// TODO`s in the app logic. But three
things require accounts that only you can create (I can't sign up for these on your behalf):

| Needs your own account | Free-tier option |
|---|---|
| PostgreSQL database | [Supabase](https://supabase.com) free project, or local Postgres |
| SMS sending (OTP + notifications) | [Fast2SMS](https://www.fast2sms.com) (India, free trial credits) or [Twilio](https://www.twilio.com) (free trial credits) |
| Hosting | [Vercel](https://vercel.com) free tier |

Until you add SMS credentials, set `SMS_DRY_RUN="true"` in `.env` — OTPs and notifications
will print to your terminal instead of sending, so you can test the whole app locally first.

---

## 2. Local setup

```bash
# 1. Install dependencies
npm install

# 2. Copy the environment template and fill it in
cp .env.example .env
# at minimum, set DATABASE_URL and JWT_SECRET (see below)

# 3. Generate the Prisma client and run migrations
npx prisma generate
npx prisma migrate dev --name init

# 4. Seed initial data (clinic services + one staff login number)
npm run seed

# 5. Run the dev server
npm run dev
```

Open http://localhost:3000.

### Generating a JWT_SECRET
```bash
openssl rand -base64 32
```
Paste the output into `JWT_SECRET` in `.env`.

### Setting up your free Supabase database (step by step)
1. Go to [supabase.com](https://supabase.com) → sign up (free) → **New Project**.
   Pick a database password and save it somewhere safe — you'll need it in the URLs below.
2. Wait ~2 minutes for the project to provision.
3. Go to **Project Settings → Database → Connection string**.
4. Supabase shows two connection modes:
   - **Transaction pooling (port 6543)** — copy this into `DATABASE_URL`, and append
     `?pgbouncer=true` to the end. This is what your app uses at runtime (works with
     Vercel's serverless functions, which open many short-lived connections).
   - **Session / Direct connection (port 5432)** — copy this into `DIRECT_URL`. Prisma
     uses this only when running `migrate dev` / `migrate deploy`, since PgBouncer's
     transaction mode can't run schema migrations.
5. Paste both into `.env`. Example shape (yours will have your actual project ref and password):
   ```
   DATABASE_URL="postgresql://postgres.abcxyz:yourpassword@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.abcxyz:yourpassword@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
   ```
6. Run the migration and seed against it:
   ```bash
   npx prisma migrate dev --name init
   npm run seed
   ```
7. Confirm it worked: `npx prisma studio` should open a browser view of your Supabase
   tables (Patient, Staff, Appointment, etc.) with the seeded services and staff row.

If you'd rather run Postgres locally instead of Supabase (e.g. for offline development),
just point `DATABASE_URL` and `DIRECT_URL` at the same local connection string — the
pgbouncer distinction only matters for Supabase/serverless setups.

### Staff login
The seed script creates one staff account with phone `+918247748398` (the clinic alert
number from the brief) — edit `prisma/seed.ts` to use your real staff mobile number(s)
before running `npm run seed`, since staff accounts must pre-exist (patients self-register
on first OTP login; staff do not).

---

## 3. Turning on real SMS

Set `SMS_DRY_RUN="false"` and pick a provider in `.env`:

**Fast2SMS** (recommended for India):
```
SMS_PROVIDER="fast2sms"
FAST2SMS_API_KEY="your-key-from-fast2sms-dashboard"
```

**Twilio** (works globally):
```
SMS_PROVIDER="twilio"
TWILIO_ACCOUNT_SID="..."
TWILIO_AUTH_TOKEN="..."
TWILIO_FROM_NUMBER="+1..."
```

---

## 4. Database schema

See `prisma/schema.prisma` for the full model. Summary:

- **Patient** — phone-identified, created on first OTP login.
- **Staff** — pre-provisioned, phone + role (ADMIN/DOCTOR/RECEPTION).
- **OtpCode** — hashed OTPs (bcrypt), 5-minute expiry, 5-attempt lockout.
- **Service** — the clinic's existing offerings (seeded).
- **Appointment** — status machine: `PENDING → APPROVED / RESCHEDULE_PROPOSED / DECLINED`,
  then `RESCHEDULE_PROPOSED → APPROVED / CANCELLED` via the patient's magic-link response,
  and `APPROVED → COMPLETED`.
- **FertilityAssessment** — every quiz submission + the risk classification, for the
  clinic's records.

To inspect data visually: `npx prisma studio`.

---

## 5. How the fertility decision engine works

Implemented in `src/lib/fertility-engine.ts` exactly per the brief:

- **High risk** (recommend direct booking) if: age > 35, OR trying > 12 months (or > 6
  months if age > 35), OR severely irregular cycles, OR prior miscarriage.
- **Low risk**: personalized lifestyle guidance card (folic acid, prenatal yoga, ovulation
  tracking, hydration, sleep hygiene) with an explicit "no immediate appointment required"
  message.

It's a pure function with its own logic file, so the clinic can tune thresholds later
without touching the API route or UI.

---

## 6. Health calculators

All 7 calculators from the live site are implemented with real formulas in
`src/lib/calculators.ts` and a tabbed UI in `src/components/patient/CalculatorsPanel.tsx`
(shown on the patient dashboard):

- **Due Date** — Naegele's rule (LMP + 280 days), plus current week/day of pregnancy.
- **Period** — next expected period from last period start + average cycle length.
- **Conception** — estimated conception date, from either LMP or a known due date.
- **Pregnancy** — current week/day and trimester from LMP.
- **Ovulation** — estimated ovulation date and 6-day fertile window.
- **BMI** — standard weight(kg)/height(m)² with WHO category bands.
- **Fertility** — age-based context note plus the cycle-based fertile window.

These are informational estimates, not a diagnosis — the UI doesn't claim otherwise.

---

## 7. Appointment workflow

1. Patient books → `PENDING`.
2. Staff **Approves** → status `APPROVED`, SMS sent to patient + to the fixed clinic alert
   number `+918247748398`.
3. Staff **Reschedules** → status `RESCHEDULE_PROPOSED`, patient gets an SMS with a
   magic link (`/reschedule/[token]`, 72-hour expiry) to Accept/Decline — no login required
   since the token itself authenticates the action.
4. Patient **Accepts** → `APPROVED` with the new date/slot; clinic gets notified.
   Patient **Declines** → `CANCELLED`; clinic gets notified.

---

## 8. Deploying for free (Vercel + Supabase)

1. Push this repo to GitHub.
2. On [vercel.com](https://vercel.com), **New Project** → import the repo.
3. In Vercel's **Environment Variables**, add everything from your `.env` — including
   both `DATABASE_URL` (pooled, port 6543) and `DIRECT_URL` (direct, port 5432) from Supabase.
4. Set `NEXT_PUBLIC_APP_URL` to your Vercel deployment URL (e.g.
   `https://thebirthwave.vercel.app`) so reschedule SMS links point to production.
5. Deploy. Vercel runs `next build` automatically; add a **Build Command** override of
   `npx prisma generate && next build` if Prisma's client isn't picked up automatically.
6. Run migrations against the production DB once, from your machine (use the **direct**,
   non-pooled URL for this command):
   ```bash
   DATABASE_URL="<your-supabase-direct-url>" DIRECT_URL="<your-supabase-direct-url>" npx prisma migrate deploy
   DATABASE_URL="<your-supabase-pooled-url>" npm run seed
   ```

---

## 9. Project structure

```
prisma/
  schema.prisma          — DB models
  seed.ts                — seeds services + a staff account
src/
  app/
    page.tsx             — homepage: full nav, specialities, education, about, footer (mirrors live site)
    login/patient/        — patient OTP login
    login/staff/          — staff OTP login
    patient/dashboard/    — patient portal (calculators, AI quiz, booking, history)
    clinical/dashboard/   — staff appointment queue
    reschedule/[token]/   — patient-facing magic-link accept/decline
    api/
      auth/send-otp, verify-otp, logout
      appointments/                — create (patient) + list (patient/staff)
      appointments/[id]/           — approve/reschedule/decline/complete (staff)
      appointments/reschedule-response/ — magic-link accept/decline
      fertility-ai/                — quiz submission + risk engine
      services/                    — service list for booking dropdown
  components/
    marketing/MarketingNav.tsx, MarketingFooter.tsx
    auth/OtpLoginForm.tsx
    patient/FertilityAssessmentQuiz.tsx
    patient/BookingModal.tsx
    patient/AppointmentHistory.tsx
    patient/CalculatorsPanel.tsx
    clinical/ClinicalQueueTable.tsx
  lib/
    prisma.ts, auth.ts, otp.ts, sms.ts, phone.ts,
    fertility-engine.ts, calculators.ts, validation.ts, store.ts
```

---

## 10. What's intentionally out of scope for this first drop

To keep this a working, honest deliverable rather than an over-promise, these weren't
built in this pass — happy to add any of them next:

- Migrating the exact page copy, imagery, and long-form guides from the live site (Wellness
  Guide articles, blog posts, birth stories, doctor bios beyond the homepage summary) —
  the homepage now mirrors the current site's navigation, specialties, and sections, but
  the individual guide/article pages themselves weren't rebuilt as separate routes.
- Automated tests.
- Rate-limiting on the OTP endpoints beyond the 5-attempt/5-minute lockout (worth adding
  IP-based throttling before going live).
