# Speaking Experience Overhaul (Cross-Browser Ready)

We are moving to a single, reliable speaking flow that works the same way in **every** modern browser. The live Web Speech API captions were a nice experiment, but they block Safari, Firefox, and most mobile devices. From now on, the server-driven transcription (Soniox) becomes the default path for everyone and the UI must reassure learners while the background work happens.

---

## Goals
- **One path for all browsers.** No conditional behavior based on Chrome-only APIs.
- **Clear, friendly feedback** during every phase: recording, uploading, transcribing, and scoring.
- **Zero confusion** about whether the mic is working or if the app is "stuck."

---

## Implementation Plan

### 1. Remove the live Web Speech layer
- Delete the `<LiveTranscriber />` component from `src/app/speaking/page.tsx` and `src/app/speaking/lesson/[id]/page.tsx`.
- Drop related state (`livePartial`, `liveFinals`, `liveStatus`, `transcriberRef`, etc.) and any conditional UI that depends on them.
- Make sure `capturedTranscriptionRef` and similar helpers fall back to the server transcript path without assuming live finals are available.

### 2. Make recording feel alive
- Keep the existing timer (`timerText`) visible and prominent while the user speaks.
- Add a waveform or volume meter that responds in real time. Any lightweight library or custom canvas will work; the key is showing movement tied to the mic input.
- Surface status text such as "Listening..." as soon as recording starts, even without live captions.

### 3. Narrate the post-recording pipeline
Wrap the `MediaRecorder.onstop` flow with progress messaging:
1. **Uploading...** (immediately after stop, while the blob is converted and sent)
2. **Transcribing...** (while Soniox runs)
3. **Evaluating...** (while `/api/check-accuracy-enhanced` returns feedback)

Use a simple state machine so the UI updates a loader text, progress bar, or checklist. If an error happens at any stage, show a friendly explanation and a "Try again" button.

### 4. Keep learners in the loop
- After scoring, show the transcript returned by Soniox so learners can spot transcription mistakes.
- If the transcript is empty (e.g., Soniox failure), display a clear warning instead of jumping straight to a zero score.
- Persist the final score, pass/fail status, and debug info exactly as we do today (`/api/attempts` stays the same).

---

## Definition of Done
- Recording and scoring behave identically in Chrome, Safari, Firefox, Edge, and mobile browsers.
- No references to `window.SpeechRecognition` or `LiveTranscriber` remain in the codebase.
- QA checklist includes: mic permission denied, short clips (<2 seconds), Soniox timeout, and slow network uploads.
- The UI always shows what is happening ("Recording", "Uploading...", etc.) so learners never see a frozen or empty panel.

Once these steps are shipped, there is a single, dependable speaking workflow with consistent UX and messaging for every learner.