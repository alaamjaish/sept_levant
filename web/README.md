## MVP Setup (Step-by-Step)

1) Create Supabase project
- Go to https://supabase.com and create an account.
- Click "New project". Name it anything. Choose a strong database password.
- Wait ~1 minute for it to provision.

2) Copy API keys into your env file
- In your Supabase project, go to Settings > API.
- Find "Project URL" and "anon public" key.
- In this folder, duplicate `.env.example` and rename the copy to `.env.local`.
- Open `.env.local` and paste:
  - `NEXT_PUBLIC_SUPABASE_URL=...` (Project URL)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY=...` (anon key)

3) Create tables and policies
- In Supabase, open SQL Editor.
- Copy the entire contents of `supabase/schema.sql` and run it.
- This creates `profiles`, `exercises`, `attempts`, RLS policies, and a signup trigger.

4) Make a teacher account
- In the web app (after you start it), sign up with your email.
- Back in Supabase > Table Editor > `profiles`, find your row and set `role` to `teacher`.

5) (Optional) Upload audio
- In Supabase > Storage, create a bucket (e.g., `audio`) and upload files.
- Copy a public URL and use it in the admin form for `audio_url`.

6) Run the app locally
```bash
npm install
npm run dev
```
Open http://localhost:3000

Routes:
- `/signup`, `/login` — email/password auth
- `/dashboard` — buttons to Listening/Speaking (+ Admin)
- `/listening` — shows text + audio
- `/speaking` — record + stubbed scoring
- `/admin` — create exercises (stubbed save)

Notes:
- API routes are stubbed for Speechmatics and scoring. After MVP flow works, replace stubs with real integrations.

## Flashcards (optional feature flag)

Set `NEXT_PUBLIC_FLASHCARDS_ENABLED=true` in your `.env.local` to expose the inline "Add to flashcard" gesture inside lessons.

### Required environment variables

Add the following to `.env.local` (see `.env.example` for placeholders):

```
NEXT_PUBLIC_FLASHCARDS_ENABLED=true
FLASHCARD_ENRICH_MODEL=gpt-4.1-mini
OPENAI_API_KEY=sk-...
SUPABASE_SERVICE_ROLE_KEY=... # needed by the background worker
GOOGLE_TTS_API_KEY=...        # Google Cloud Text-to-Speech REST API key
GOOGLE_TTS_VOICE=ar-XA-Standard-A
```

### Background enrichment worker

The worker reads queued jobs from `fc_jobs`, calls OpenAI + Google TTS, and updates `fc_cards` with meaning, example, and audio URLs.

Run it anywhere you can provide service-role credentials:

```
cd supabase/functions/enrich-card
node index.mjs
```

The worker processes all queued jobs, exits when none remain, and can be scheduled (e.g., cron) or triggered on demand.

