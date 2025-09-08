Supabase Setup (Do-This Checklist)

Follow these steps exactly. You don’t need to understand the details — just copy/paste where it says and confirm the screens match.

1) Create a Supabase project
- Go to https://supabase.com → Sign in with GitHub or email.
- Click “New project”.
- Pick any name. Choose the free plan. Click “Create project”.
- Wait until it finishes provisioning (about 1–2 minutes).

2) Get your two keys and set them locally
- Open your project → left sidebar “Project Settings” → “API”.
- Copy these values into `web/.env.local` (create the file if missing):
  NEXT_PUBLIC_SUPABASE_URL= paste_the_anon_url_here
  NEXT_PUBLIC_SUPABASE_ANON_KEY= paste_the_anon_key_here
- Save the file. (No other changes needed here.)

3) Paste the database schema
- Left sidebar → “SQL Editor”.
- Click “+ New query”.
- Open the repo file: `web/supabase/schema.sql`.
- Copy everything from that file and paste it into the SQL editor.
- Click “Run”. It should say success. If you run it again later, it’s safe; it won’t break anything.

What this created for you
- Tables: `profiles`, `exercises`, `attempts` with Row Level Security.
- A trigger that auto-creates your `profiles` row on sign-up.
- A public storage bucket named `audio`. Everyone can read, only teachers can upload.

4) Make yourself a teacher (so you can build exercises inline)
- Left sidebar → “Authentication” → “Users”. If you don’t see your user, sign up in the app first (go to `/signup`).
- Left sidebar → “Table Editor” → open `profiles`.
- Find the row with your user’s `id`. Set `role` to `teacher`. Click “Save”.

5) Confirm Storage bucket exists
- Left sidebar → “Storage” → you should see a bucket named `audio` (public). If not, re-run the SQL from step 3.

6) Add your Speechmatics key
- Put this in `web/.env.local` (same file as before):
  SPEECHMATICS_API_KEY= paste_your_key_here
- Save the file.

7) Run the app
- In a terminal from the `web/` folder: `npm install` (first time only), then `npm run dev`.
- Open http://localhost:3000
- Sign up or log in.

8) Use it
- Speaking page: press “Record” → you will see live transcript as you talk. Stopping gives you a final score and saves an attempt.
- Teacher build mode (same Speaking page):
  - Record a reference line → stop → a suggested transcript appears.
  - Click “Use Transcript as Text” (or edit the text box).
 - Click “Save as New Speaking Exercise” → this uploads audio to Storage and saves the exercise.

If something fails
- Storage upload blocked: confirm Step 4 (role is `teacher`) and Step 3 ran successfully.
- No exercises are shown: the app falls back to a demo exercise; but to use real ones, save an exercise in build mode.
- Speechmatics errors: confirm Step 6 and that your key is valid. The app will still show live transcript using the browser engine, and use Speechmatics for the final transcript.

Troubleshooting: SQL error “must be owner of table objects”
- This is normal for one line in our script that tries to re‑enable RLS on a system table.
- Fix: run this smaller snippet in the SQL Editor (copy/paste exactly) and click Run:

  insert into storage.buckets (id, name, public)
  values ('audio', 'audio', true)
  on conflict (id) do nothing;

  drop policy if exists "read_audio_public" on storage.objects;
  create policy "read_audio_public" on storage.objects
    for select using (bucket_id = 'audio');

  drop policy if exists "insert_audio_teachers" on storage.objects;
  create policy "insert_audio_teachers" on storage.objects
    for insert with check (
      bucket_id = 'audio' and exists (
        select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher'
      )
    );

After that, refresh the Supabase “Storage” page and you should see the `audio` bucket.

Policy check (quick test from the app)
- Make sure you are signed in in the app.
- Open this URL in your browser: http://localhost:3000/api/debug/policy-check
- You should see JSON like:
  { "signed_in": true, "role": "teacher", "storage_upload_ok": true, ... }
- If `role` is not `teacher`, set it in Table Editor → profiles.
- If `storage_upload_ok` is false, re-run the snippet above to create the bucket/policies.

Auth settings (only if you still get Unauthorized)
- Supabase → Authentication → URL Configuration:
  - Set “Site URL” to `http://localhost:3000` during development.
  - Under “Redirect URLs”, add `http://localhost:3000`.
- Save, then in the app: Sign out and sign back in.
