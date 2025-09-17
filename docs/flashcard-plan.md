# Flashcard Feature Plan

## Vision (Updated)
- Flashcards live inside named sets. Each set has a title, optional cover/description, and contains a sequence of cards.
- Dashboard tile links to `/flashcards` where users see a polished library grid inspired by `docs/setdesign.md`: create-new-set CTA at top-right, card-like tiles for every set.
- Card creation is frictionless: users supply only Arabic text; the system generates the English meaning plus Levantine 4–5 word sentence + English translation via LLM.
- Long-term goal: from any lesson (e.g., speaking page) users can select vocabulary and add to sets via contextual popovers.

## Current Scope
1. **Sets Library UI**
   - Grid layout mirroring `docs/setdesign.md`: set tiles show card count, title, description snippet, actions (View, Add word).
   - “Create New Set” button opens flow to name + describe set.
2. **Set Detail Experience**
   - Within a set, users review cards via flip/stack or carousel; card backs show generated English + example sentence.
   - Provide quick-add form (Arabic only) inside the set view.
3. **Card Generation Pipeline**
   - LLM fills missing English meaning & Levantine example automatically.
   - Allow manual edits or regenerate options if users want to tweak outcomes.
4. **Data Model Needs**
   - New `flashcard_sets` table with `id`, `owner_id`, `title`, `description`, `cover_image`, timestamps.
   - `flashcards` references `set_id`; enforce owner scoping via RLS.
5. **API Surface**
   - `/api/flashcards/sets` CRUD for sets (list, create, rename, archive).
   - `/api/flashcards/cards` to add/remove/update cards within sets, invoking LLM for enrichment.
6. **Future (Not in current sprint)**
   - Hover-to-add from lessons and contextual popups.
   - Collaborative sharing between teachers/students.

## LLM Integration Rules
- Input: Arabic phrase + optional user hint.
- Outputs:
  - `english_meaning`: concise translation (<=6 words).
  - `sentence_ar`: Levantine dialect, 4–5 words, uses the term.
  - `sentence_en`: English translation of sentence.
- Enforce JSON mode; clamp outputs to length; gracefully degrade if API unavailable.

## UX Notes
- Landing view shows sets grid; empty state encourages creating the first set.
- Inside a set: split layout with card viewer on left, Arabic input pane on right.
- Provide progress indicators (cards learned vs total) for delight.

## Next Steps Checklist
- [x] Design schema additions (`flashcard_sets`, `flashcards.set_id`, indices, RLS).
- [x] Update Supabase SQL + migrations.
- [x] Replace current flashcards page with sets library UX.
- [x] Build set detail route `/flashcards/[setId]` with card carousel + add form (Arabic only).
- [x] Update APIs to support sets + auto-generated fields.
- [ ] Follow-up: integrate lesson hover workflow (future milestone).
