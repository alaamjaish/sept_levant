# Speaking Experimental UI – Design Notes

Goal: explore a cleaner two‑column layout for the Speaking flow without touching backend logic or APIs. This page is additive and lives under a separate route so the current experience remains unchanged.

Principles
- Non‑destructive: never modify existing endpoints or DB behavior.
- Reuse: call the same APIs already used by `/speaking` (`get-one`, `list`, `speechmatics`, `check-accuracy`, `attempts`, `exercises/update`, `exercises/delete`).
- Readable hierarchy: prompt at left, controls at right.
- Direct controls: big Play/Record/Stop, clear timer, transcript area, score.
- Teacher extras: inline Edit Text and Delete.

Route
- `/speaking/experimental` (App Router page coexisting with the original `/speaking`).

