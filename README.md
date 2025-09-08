# LevantTalk – MVP Progress

This README tracks progress against `PRD_MVP.md` and links to the live work.

Quick Links
- App code: `web/`
- DB schema: `web/supabase/schema.sql`
- Handoff notes: `AGENT_HANDOFF.md`
- PRD: `PRD_MVP.md`

How to Run
- `cd web && npm install && npm run dev`
- Create Supabase project → copy keys to `web/.env.local` → paste `web/supabase/schema.sql` in SQL Editor → sign up in the app → set your `profiles.role` to `teacher`.

MVP Checklist (from PRD)
- [x] Users can create accounts (Supabase Auth UI)
- [x] Users can log in/out (redirects to `/dashboard`)
- [x] Landing page exists
- [x] Listening page plays audio with text (DB or stub)
- [x] Speaking page records voice (MediaRecorder)
- [ ] Speechmatics converts speech to text (stubbed only)
- [ ] LLM scores accuracy (placeholder heuristic only)
- [x] 90% threshold works (UI shows pass/fail)
- [x] Teachers can add content (`/admin`, DB insert, RLS)
- [ ] Everything saves to database (attempts persistence pending)

What’s Implemented
- Pages: `/`, `/signup`, `/login`, `/dashboard`, `/listening`, `/speaking`, `/admin`
- APIs: `/api/exercises/get-one`, `/api/exercises/create`, `/api/speechmatics` (stub), `/api/check-accuracy` (stub)
- DB: `profiles`, `exercises`, `attempts` with RLS; auto-profile trigger

Next Up
1. Replace Speechmatics stub with real API call; use `SPEECHMATICS_API_KEY`.
2. Add LLM scoring via `OPENAI_API_KEY`; keep normalization/fallback.
3. Save speaking attempts to `public.attempts` with score and pass/fail.
4. Role-gate `/admin` and hide its button for non-teachers.
5. Add Storage upload in admin (bucket `audio`), store public URL.
6. Clean `PRD_MVP.md` encoding artifacts; move docs to `docs/`.

Status
- Vertical slice runs locally with stubs; DB schema is ready; minimal RLS applied. Ready to integrate external APIs and persist attempts.
