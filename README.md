# Weather App (Ikarus Take-Home)

Backend (Flask + Connexion + OpenAPI), Docker, and frontend (TBD).

## Backend

```bash
cd backend && pip install -r requirements.txt && python run.py
```

API: `http://localhost:5000/api/health` · Swagger UI: `http://localhost:5000/api/ui`

## Docker

From repo root:

```bash
docker compose -f docker/docker-compose.yml up --build
```

API: `http://localhost:5001/api/health`

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
