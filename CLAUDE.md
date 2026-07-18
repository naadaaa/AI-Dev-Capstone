# AI-Dev-Capstone

Zewail City internship capstone project for AI-assisted application development. The repository is greenfield (initial commit only); this file defines the intended stack, layout, and conventions to follow as the project is built out.

## Current State

| Item | Status |
|------|--------|
| Application code | Not yet added |
| `package.json` / dependency manifests | Not yet added |
| License | MIT |
| Remote | `https://github.com/naadaaa/AI-Dev-Capstone.git` |

The `.gitignore` is the standard Node.js template (TypeScript, Vite, Next.js, `.env` files). Update it when Python or other runtimes are added.

## Intended Stack

Use this stack unless the team explicitly chooses otherwise. Update this section when decisions are finalized.

| Layer | Choice | Notes |
|-------|--------|-------|
| Language (frontend) | TypeScript | Strict mode; no `any` unless justified |
| Frontend framework | React 18+ | Functional components and hooks only |
| Build tool | Vite | Fast dev server; SPA or SSR as needed |
| Language (backend / AI) | Python 3.11+ | For ML, RAG, and model-serving endpoints |
| API framework | FastAPI | Async endpoints; Pydantic v2 for schemas |
| AI / LLM | Provider SDK or LangChain | Keep provider logic behind a service layer |
| Package managers | `pnpm` (frontend), `uv` or `pip` (backend) | Do not mix npm and pnpm in the same package |
| Containerization | Docker + Compose | One service per container; use `.env.example` |
| Version control | Git on `main` | Feature branches; PRs for non-trivial changes |

### Planned Directory Layout

```
AI-Dev-Capstone/
├── frontend/          # React + TypeScript + Vite
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── services/  # API client calls only
│       └── types/
├── backend/           # FastAPI + AI services
│   ├── app/
│   │   ├── api/       # Route handlers (thin)
│   │   ├── core/      # Config, security, deps
│   │   ├── models/    # Pydantic schemas
│   │   └── services/  # Business logic + AI calls
│   └── tests/
├── docs/              # Architecture notes, ADRs
├── .env.example       # Committed template; never commit real secrets
├── docker-compose.yml
├── CLAUDE.md          # This file
└── README.md
```

## Commands

Add real commands here as tooling is introduced. Until then, use the patterns below.

| Command | Description |
|---------|-------------|
| `pnpm install` | Install frontend dependencies (from `frontend/`) |
| `pnpm dev` | Start Vite dev server |
| `pnpm build` | Production frontend build |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run frontend unit tests |
| `uv sync` or `pip install -r requirements.txt` | Install backend dependencies |
| `uvicorn app.main:app --reload` | Start FastAPI dev server (from `backend/`) |
| `pytest` | Run backend tests |
| `docker compose up --build` | Start full stack locally |

## Architecture Principles

- **Thin routes, fat services.** HTTP handlers validate input and delegate; AI and business logic live in `services/`.
- **Provider abstraction.** Wrap LLM, embedding, and vector-store calls behind interfaces so providers can be swapped without touching routes or UI.
- **Typed boundaries.** Share request/response shapes via Pydantic models (backend) and matching TypeScript types (frontend). Generate or manually keep them in sync.
- **Fail safely.** AI outputs are untrusted until validated. Parse structured responses with schemas; surface errors clearly to the user.
- **No secrets in code.** Use environment variables. Commit only `.env.example` with placeholder values.

## Code Style

### General

- Prefer small, focused modules over large files.
- Match existing naming and patterns in the file you are editing.
- Add comments only for non-obvious business logic or AI prompt constraints.
- Do not commit generated artifacts (`dist/`, `.next/`, `node_modules/`, `__pycache__/`, `.venv/`).

### TypeScript (frontend)

- Use `camelCase` for variables/functions; `PascalCase` for components and types.
- Colocate component-specific styles and tests with the component.
- API calls go in `services/`; components do not call `fetch` directly.
- Use explicit return types on exported functions and hooks.

### Python (backend)

- Follow PEP 8; use `snake_case` for functions and variables.
- Type-hint all public functions; run `mypy` or `pyright` once configured.
- Keep prompts in dedicated modules or template files, not inline in route handlers.
- Log at appropriate levels; never log secrets, tokens, or raw PII.

### Git & Commits

- Write commit messages in imperative mood: `Add grade predictor endpoint`, `Fix chat history pagination`.
- One logical change per commit.
- Do not commit `.env`, API keys, model weights, or large binary datasets.

## Environment Variables

Document every variable in `.env.example` as it is introduced.

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Backend URL for the frontend |
| `OPENAI_API_KEY` (or equivalent) | LLM provider key — local/dev only |
| `DATABASE_URL` | Database connection string, if used |

Never hardcode keys. Never commit `.env`.

## Testing

- **Backend:** `pytest` with fixtures; mock external AI calls in unit tests.
- **Frontend:** Vitest + React Testing Library for components; mock API layer in tests.
- **Integration:** Test critical user flows end-to-end once the stack is running.
- Do not call paid LLM APIs in CI; use mocks or recorded fixtures.

## AI-Specific Conventions

- Version and document prompts used in production paths (file name, purpose, last updated).
- Set token/temperature limits explicitly; do not rely on provider defaults.
- Stream responses to the frontend when latency matters; show loading and error states.
- For RAG: log retrieval sources internally; expose citations to users when relevant.
- Evaluate prompt changes against a small fixed test set before merging.

## Gotchas

- **Greenfield repo.** Most commands and paths above are targets, not current reality. Verify files exist before running commands.
- **`.gitignore` is Node-only.** Add Python, Docker, and ML artifacts (`.venv/`, `*.pkl`, `models/`, etc.) when the backend is scaffolded.
- **README is a stub.** Expand `README.md` with setup steps once the project is bootstrapped.
- **Update this file.** When the stack, folder layout, or tooling changes, update `CLAUDE.md` in the same PR.

## Workflow for AI Assistants

1. Read this file and the relevant subdirectory before making changes.
2. Prefer minimal diffs; do not refactor unrelated code.
3. Reuse existing abstractions; do not duplicate API or AI client logic.
4. After adding tooling, update the Commands table and `.env.example`.
5. Do not create git commits unless explicitly asked.

## Project Rules (learned from FE-02 prompting drill)

1. **Never let scope be inferred from repo context alone — state the exact fields/entities in every feature prompt.** A vague prompt for "a settings form" produced an AI-preferences form (model, temperature, tokens) instead of the actual required fields, because the model inferred scope from the codebase rather than being told. Every prompt for a new component must explicitly list the fields/props/behavior — no prompt should rely on the AI guessing intent from surrounding files.

2. **`aria-describedby` (and any ARIA attribute) must be placed on the actual form control (input/select/textarea), never on a wrapping element.** A wrapper-level `aria-describedby` looks correct in a code review but is silently non-functional for screen readers. Any generated form component must be checked for this specifically — grep for `aria-describedby` and confirm it sits on the same JSX element as the input, not a parent div.

3. **Every AI-generated test suite must be run before being trusted, and any test using a shared/non-unique query (e.g. `getByRole('alert')`, `getByRole('button')` without a name filter) must be scoped tightly enough to survive multiple similar elements rendering at once.** A test suite passed code review but failed on run because `findByRole('alert')` broke when two validation errors rendered simultaneously — the component was correct, the test wasn't. "Write it, then write tests and run them" is not optional; a generated test file that has never been executed is an unverified claim, not a safety net.