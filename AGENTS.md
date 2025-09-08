# Repository Guidelines

This repository currently contains product documentation (`PRD_MVP.md`, `PRD_FULL.md`). Use these guidelines to keep future code and docs consistent and easy to navigate.

## Project Structure & Module Organization
- Source code lives in `src/` organized by feature (e.g., `src/auth/`, `src/api/`).
- Tests mirror sources in `tests/` (e.g., `tests/auth/` for `src/auth/`).
- Developer utilities in `scripts/` (one task per script).
- Product and technical docs in `docs/` (migrate `PRD_*.md` here when convenient).
- Assets (images, fixtures) in `assets/` or `tests/fixtures/` as appropriate.

## Build, Test, and Development Commands
- Prefer Makefile targets when present:
  - `make setup` – install dependencies.
  - `make lint` – run linters/formatters.
  - `make test` – run unit tests with coverage.
  - `make run` – start the local app/dev server.
- If no Makefile:
  - Node: `npm ci`, `npm run lint`, `npm test`, `npm run dev`.
  - Python: `pip install -r requirements.txt`, `pytest -q`, `ruff check --fix`, `uvicorn app:app --reload` (if applicable).
  - Check `package.json` or `pyproject.toml` for project-specific scripts.

## Coding Style & Naming Conventions
- Indentation: 2 spaces (JS/TS/YAML), 4 spaces (Python).
- Naming: PascalCase classes; camelCase functions/vars; UPPER_CASE constants.
- Files: kebab-case for JS/TS files; snake_case for Python modules; lowercase-dash for directories.
- Formatting: Prettier (JS/TS/JSON/YAML); Black + isort + Ruff (Python). Commit only formatted code.
- Keep modules focused; prefer small, pure functions and explicit types/docstrings.

## Testing Guidelines
- Place tests in `tests/` mirroring `src/` paths.
- Names: `test_<module>.py` (pytest) or `*.spec.ts`/`*.test.ts` (Jest/Vitest).
- Aim for ≥80% line coverage. Examples: `pytest --cov` or `npm test -- --coverage`.
- Use fixtures over shared state; mock network/IO; avoid real external calls in unit tests.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- PRs include: concise summary, linked issue, before/after or repro steps, and screenshots/logs for user-facing or behavior changes.
- Update `PRD_MVP.md`/`PRD_FULL.md` or `docs/` if scope/requirements change; call out any deviations or assumptions.

## Security & Configuration Tips
- Never commit secrets. Use `.env.local` (gitignored) and provide `.env.example` with placeholders.
- Validate inputs, handle errors consistently, and log with context. Add rate limiting/auth on public endpoints.
