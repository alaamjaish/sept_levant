# Agent Handoff – Current Status and Next Steps

Date: 2025-09-07

Summary
- Scaffolded a Next.js (App Router) app in `web/` with Tailwind.
- Added Supabase client, auth pages (`/signup`, `/login`), dashboard, and core pages (`/listening`, `/speaking`, `/admin`).
- Implemented API routes: `GET /api/exercises/get-one`, `POST /api/exercises/create`, `POST /api/speechmatics` (stub), `POST /api/check-accuracy` (simple heuristic + Arabic normalization).
- Added database schema and RLS in `web/supabase/schema.sql` (paste-once script). Auto-creates `profiles` on signup.

Environment
- Required vars in `web/.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SPEECHMATICS_API_KEY` (not used yet), `OPENAI_API_KEY` (not used yet)

What works
- Local app runs (`npm run dev`).
- Email/password auth flows with Supabase UI.
- Listening page loads one exercise (from DB if configured; otherwise stub).
- Speaking page records via MediaRecorder, calls stub STT and simple scoring (>=90% pass).
- Admin page inserts `exercises` to DB (RLS allows teachers only; manual role assignment).

What’s pending (ordered)
1) Wire real Speechmatics in `/api/speechmatics` (use base64 WebM/WAV). Return `transcript`.
2) Implement LLM scoring in `/api/check-accuracy` using `OPENAI_API_KEY`; keep current normalization as pre‑processing and a fallback when LLM is unavailable.
3) Persist speaking attempts: create `POST /api/attempts` or write within scoring step to insert into `attempts` with `exercise_id`, `student_id`, `score`, `passed`.
4) Gate UI by role: hide “Add Content” for non‑teachers; protect `/admin` with a server check.
5) Storage UX: in `/admin`, upload file to Supabase Storage (`audio` bucket), then save public URL.
6) Replace DB fallback behavior when content exists; keep stub for local dev only.
7) Clean doc artifacts in `PRD_MVP.md` (encoding symbols) and move docs into `/docs`.

Notes / decisions
- Using Supabase Auth UI for simplest auth; SSR hardening can come later.
- `@supabase/auth-helpers-nextjs` shows deprecation warning; consider migrating to `@supabase/ssr` after MVP.
- Normalization removes diacritics/punctuation before scoring to reduce false negatives.

Runbook
- Supabase: create project → paste `web/supabase/schema.sql` in SQL Editor → set your `profiles.role='teacher'`.
- Start app: `cd web && npm install && npm run dev` → open http://localhost:3000.

Files of interest
- Pages: `web/src/app/{page.tsx,login,signup,dashboard,listening,speaking,admin}`
- APIs: `web/src/app/api/{exercises/get-one,exercises/create,speechmatics,check-accuracy}/route.ts`
- DB: `web/supabase/schema.sql`
