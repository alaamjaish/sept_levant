# Flashcard Set Experience Notes

- Top bar mirrors `docs/setdesign.md`: "My Sets" heading, primary button `Create New Set` on the right.
- Sets grid layout: responsive cards (1 col mobile, 2 md, 3 lg). Each tile shows card count, title, short description, and actions (`View Cards`, quick add icon).
- Entering a set opens a two-panel layout:
  - Left: study area with flip-able card stack or carousel (front Arabic ? back English + Levantine sentence).
  - Right: sidebar listing cards and providing an Arabic-only add form.
- Add-card flow: user enters Arabic phrase ? server auto-fills English meaning + 4–5 word Levantine example + English translation.
- Empty states encourage first set creation or first card addition.
- Future: integrate contextual “Add to set” popover from lessons/hover interactions.
