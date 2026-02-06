# Weather App — Backend

Flask + Connexion (OpenAPI 3) API: auth (JWT), weather zones CRUD, city search and current weather (OpenWeatherMap). MSSQL + SQLAlchemy, Alembic migrations.

Full project docs: [../README.md](../README.md).

---

## Run (local)

```bash
pip install -r requirements.txt
export DATABASE_URL="mssql+pymssql://sa:YourPassword@localhost:1433/weatherapp"
export JWT_SECRET_KEY="your-secret-key"
# optional: OPENWEATHERMAP_API_KEY
alembic upgrade head
python run.py
```

API: **http://localhost:5000** · Swagger: **http://localhost:5000/ui/**

---

## Env

See [../README.md#configuration](../README.md#configuration) and `.env.example`. Required: `DATABASE_URL`, `JWT_SECRET_KEY`.

---

## Migrations

```bash
alembic upgrade head
alembic revision -m "description"   # new revision
```

---

## Docs (in `docs/`)

- [API_EXAMPLES.md](docs/API_EXAMPLES.md) — curl examples
- [SECURITY.md](docs/SECURITY.md) — security notes
- [API_VERSIONING.md](docs/API_VERSIONING.md) — versioning

---

## Structure

- **`api/openapi.yaml`** — API spec
- **`app/`** — auth, zones, weather (models, services), controllers, migrations
- **`config.py`**, **`run.py`** — config and entrypoint
