# Weather App (Ikarus Take-Home)

Backend (Flask + Connexion + OpenAPI), Docker, and frontend (React + Vite + TypeScript).

## Backend

```bash
cd backend && pip install -r requirements.txt && python run.py
```

API: `http://localhost:5000/api/health` · Swagger UI: `http://localhost:5000/api/ui`

**Logging & monitoring**: Centralised in `app/logging_config.py`. Every request is logged (method, path, status, duration); 4xx/5xx are logged at WARNING for alerting. Env: `LOG_LEVEL` (default `INFO`), `LOG_JSON=true` for one-JSON-line-per-log (e.g. in Docker). Response header `X-Request-ID` for correlation.

**Rate limiting**: Flask-Limiter applies a default limit per IP (env `RATELIMIT_DEFAULT`, e.g. `60 per minute`). Auth endpoints (login, register) use a stricter limit (env `RATELIMIT_AUTH`, default `10 per minute`) to reduce brute-force and enumeration. Set `RATELIMIT_ENABLED=false` to disable.

**API versioning**: Responses include `X-API-Version: 1`. Strategy for future breaking changes: new prefix `/api/v2/`, keep v1 supported for a release cycle. See `backend/docs/API_VERSIONING.md`.

## Docker

From repo root:

```bash
docker compose -f docker/docker-compose.yml up --build
```

API: `http://localhost:5001/api/health`

## Frontend

```bash
cd frontend && npm install && npm run dev
```

App: `http://localhost:5173` (Vite dev server)

## Pre-commit (format & checks)

One-time setup:

```bash
pip install -r backend/requirements-dev.txt
pre-commit install
```

Before each commit, pre-commit will run:

- **pre-commit-hooks**: trailing whitespace, end-of-file fix, check YAML/JSON, no large files, no private keys, no debug statements, LF line endings
- **Black**: format Python in `backend/`
- **isort**: sort imports in `backend/`

Run manually on all files:

```bash
pre-commit run --all-files
```

Hooks include **flake8** (lint) and **mypy** (type check) on `backend/`.

## Tests

From `backend/`:

```bash
cd backend && pytest
```

With coverage:

```bash
cd backend && pytest --cov=app
```
