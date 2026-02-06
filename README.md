# Weather App

Full-stack weather application with user authentication, weather zones management, and real-time weather data.

**Tech Stack**:

- **Backend**: Flask + Connexion (OpenAPI 3.0) + SQLAlchemy + MSSQL
- **Frontend**: React + Vite + TypeScript + Base Web (Styletron), React Query, Redux
- **DevOps**: Docker Compose, Alembic migrations
- **Security**: JWT authentication, bcrypt password hashing, rate limiting

**Frontend features**: Login / Register (shared auth layout), protected dashboard, weather zones table (sortable, paginated), city search with overlay dropdown, add/edit/delete/refresh zones, toasts and loading states, persisted auth (token + user in localStorage, restored on refresh).

---

## Documentation

- **[API Examples](backend/docs/API_EXAMPLES.md)** - Complete API usage guide with curl examples
- **[Security](backend/docs/SECURITY.md)** - Security considerations and best practices
- **[API Versioning](backend/docs/API_VERSIONING.md)** - Versioning strategy

---

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 20.19+ or 22.12+
- Docker & Docker Compose (for MSSQL)

### 1. Backend Setup (Local Development)

```bash
cd backend
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="mssql+pymssql://sa:YourPassword@localhost:1433/weatherapp"
export JWT_SECRET_KEY="your-secret-key-here"
export OPENWEATHERMAP_API_KEY="your-api-key-here"  # Optional

# Run migrations
alembic upgrade head

# Start server
python run.py
```

**API**: `http://localhost:5000/api/health`
**Swagger UI**: `http://localhost:5000/ui/`

### 2. Docker Setup (Recommended)

One command builds and runs the full stack (DB → backend → frontend). The UI is served by nginx and proxies `/api` to the backend so the app works from a single origin.

```bash
# From repo root
docker compose -f docker/docker-compose.yml up --build
```

- **App (UI)**: `http://localhost:8080` — use this for the full app (login, zones, etc.)
- **API (direct)**: `http://localhost:5001/api/health`
- **Swagger UI**: `http://localhost:5001/ui/`

The Docker setup includes:

- MSSQL Server 2022
- Backend (Flask) with automatic DB creation and Alembic migrations on startup
- Frontend (React/Vite) built and served by nginx; `/api` is proxied to the backend

### 3. Frontend Setup

```bash
cd frontend

# Make sure you're using Node.js 20.19+ or 22.12+
nvm use 22  # If using nvm

npm install
npm run dev
```

**App**: `http://localhost:5173`

---

## Security Features

- **JWT Authentication**: Secure token-based auth with configurable expiration
- **Password Hashing**: bcrypt with automatic salt generation
- **Input Validation**: Username, email, and password validation
- **Rate Limiting**: 60 req/min global, 10 req/min for auth endpoints
- **User Isolation**: All queries filtered by user_id (IDOR prevention)
- **Security Headers**: X-Content-Type-Options, X-Frame-Options
- **CORS**: Configurable allowed origins

See [SECURITY.md](backend/docs/SECURITY.md) for details.

---

## API Overview

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (username or email)
- `GET /api/auth/me` - Get current user (requires JWT)
- `POST /api/auth/logout` - Logout

### Weather

- `GET /api/weather/search?q=London` - Search cities
- `GET /api/weather/current?lat=51.5&lon=-0.1` - Get current weather (cached)

### Weather Zones (Protected)

- `GET /api/zones` - List user's zones with weather
- `POST /api/zones` - Create zone
- `GET /api/zones/{id}` - Get zone
- `PUT /api/zones/{id}` - Update zone
- `DELETE /api/zones/{id}` - Delete zone
- `POST /api/zones/{id}/refresh` - Refresh weather

See [API_EXAMPLES.md](backend/docs/API_EXAMPLES.md) for complete examples.

---

## Testing

Automated tests are not part of this deliverable. The backend has a `tests/` structure and can be extended with pytest; the frontend currently has no test suite. See **Further improvements** below for testing-related suggestions.

---

## Configuration

### Environment Variables

| Variable                    | Default                                       | Description                                  |
| --------------------------- | --------------------------------------------- | -------------------------------------------- |
| `DATABASE_URL`              | _Required_                                    | MSSQL connection string                      |
| `JWT_SECRET_KEY`            | `change-me-in-production`                     | JWT signing key (must change in prod)        |
| `JWT_ACCESS_TOKEN_EXPIRES`  | `900`                                         | Token expiration in seconds (15 min)         |
| `OPENWEATHERMAP_API_KEY`    | `""`                                          | OpenWeatherMap API key (optional)            |
| `WEATHER_CACHE_TTL_MINUTES` | `20`                                          | Weather cache duration                       |
| `CORS_ORIGINS`              | `http://localhost:3000,http://localhost:5173` | Allowed CORS origins                         |
| `RATELIMIT_DEFAULT`         | `60 per minute`                               | Default rate limit                           |
| `RATELIMIT_AUTH`            | `10 per minute`                               | Auth endpoints rate limit                    |
| `RATELIMIT_ENABLED`         | `true`                                        | Enable/disable rate limiting                 |
| `LOG_LEVEL`                 | `INFO`                                        | Logging level                                |
| `LOG_JSON`                  | `false`                                       | JSON-formatted logs                          |
| `FLASK_ENV`                 | `default`                                     | Environment (default/development/production) |

### Example `.env` File

```bash
DATABASE_URL=mssql+pymssql://sa:[REDACTED]@localhost:1433/weatherapp
JWT_SECRET_KEY=your-super-secret-key-change-this-in-production
OPENWEATHERMAP_API_KEY=your-openweathermap-api-key
FLASK_ENV=development
```

---

## Monitoring & Logging

**Request Logging**: Every request is logged with:

- HTTP method and path
- Status code
- Response time (ms)
- Request ID (for correlation)

**Error Logging**: 4xx/5xx responses logged at WARNING level for alerting.

**Headers**:

- `X-Request-ID`: Unique request identifier
- `X-API-Version`: API version (currently `1`)

---

## Development Tools

### Pre-commit Hooks (Code Quality)

One-time setup:

```bash
pip install -r backend/requirements-dev.txt
pre-commit install
```

Before each commit, pre-commit will run:

- **pre-commit-hooks**: trailing whitespace, end-of-file fix, check YAML/JSON, no large files, no private keys, no debug statements, LF line endings
- **Black**: format Python in `backend/`
- **isort**: sort imports in `backend/`
- **flake8**: lint Python code
- **mypy**: type checking

Run manually on all files:

```bash
pre-commit run --all-files
```

---

## Architecture

### Backend Structure

```
backend/
├── api/                    # OpenAPI specification
│   └── openapi.yaml
├── app/
│   ├── __init__.py        # App factory
│   ├── auth/              # Authentication domain
│   │   ├── models.py      # User model
│   │   ├── service.py     # Auth business logic
│   │   └── handlers.py    # Auth utilities
│   ├── zones/             # Weather zones domain
│   │   ├── models.py      # WeatherZone model
│   │   └── service.py     # Zones CRUD logic
│   ├── weather/           # Weather domain
│   │   ├── models.py      # WeatherCache model
│   │   └── service.py     # Weather API integration
│   ├── controllers/       # API endpoint handlers
│   │   ├── auth.py
│   │   ├── zones.py
│   │   └── weather.py
│   ├── integrations/      # External APIs
│   │   └── openweathermap.py
│   ├── migrations/        # Alembic migrations
│   └── extensions.py      # Flask extensions (db, jwt, etc.)
├── config.py              # Configuration
├── run.py                 # Application entry point
└── tests/                 # Test suite
```

### Design Patterns

- **Domain-Driven Design**: Code organized by business domain (auth, zones, weather)
- **Layered Architecture**: Controllers → Services → Models
- **Repository Pattern**: Service layer abstracts database operations
- **Dependency Injection**: Configuration via Flask's `current_app.config`

---

## Production Deployment

### Checklist

- [ ] Set strong `JWT_SECRET_KEY` (32+ random characters)
- [ ] Set `FLASK_ENV=production`
- [ ] Configure production `DATABASE_URL`
- [ ] Enable HTTPS at reverse proxy (nginx, Cloudflare, etc.)
- [ ] Set production `CORS_ORIGINS`
- [ ] Configure `OPENWEATHERMAP_API_KEY`
- [ ] Set up monitoring (Sentry, Datadog, etc.)
- [ ] Configure log aggregation
- [ ] Set up database backups
- [ ] Review rate limits for expected traffic

### Deployment Options

**Option 1: Railway + Azure SQL**

- Backend: Railway (free tier)
- Database: Azure SQL Database (free tier)
- Frontend: Vercel (free tier)

**Option 2: Docker on VPS**

- Use `docker-compose.yml` on any VPS (DigitalOcean, Linode, etc.)
- Set up nginx reverse proxy with SSL (Let's Encrypt)

See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for detailed deployment guide.

---

## Further Improvements

### Backend

- **Testing**: Add/expand pytest unit and integration tests (auth, zones, weather), aim for good coverage; consider contract tests for OpenAPI.
- **Zones API**: Support server-side sorting and filtering (e.g. `?sort=name&order=asc`) so the frontend can avoid client-side sort on paginated data.
- **Pagination**: Standardise list responses (e.g. consistent `limit`/`offset` or cursor-based) and document in OpenAPI.
- **Validation**: Stricter request validation (e.g. Pydantic/OpenAPI schema), clearer error payloads (field-level messages).
- **Caching**: Consider response caching or ETag for zones list and weather endpoints where appropriate.
- **Logging**: Structured logging (e.g. JSON) and request correlation (X-Request-ID) end-to-end; optional APM.
- **Security**: Refresh tokens, optional 2FA, and security headers (CSP, etc.) for production.
- **Health**: Richer `/api/health` (DB connectivity, dependency checks) for orchestration and monitoring.

### Frontend

- **Testing**: Add Vitest (and optionally React Testing Library) for unit tests; E2E with Playwright or Cypress for critical flows (login, add zone, refresh).
- **Error handling**: Global error boundary, retry UI for failed requests, and clearer offline/network error messages.
- **Accessibility**: Audit with axe or Lighthouse; ensure keyboard nav, focus management in modals, and ARIA where needed.
- **Performance**: Code-split routes and heavy components; lazy-load dashboard/zones; consider virtualisation for very long zone lists.
- **UX**: Skeleton loaders instead of spinners where possible; optimistic updates for zone create/delete; optional “table vs cards” view toggle.
- **State**: Optionally move more server state into React Query only and reduce Redux to auth + UI (toasts); or keep as-is for simplicity.
- **i18n**: If the app will be localised, introduce a small i18n layer (e.g. react-i18next) and extract copy.
- **PWA / Mobile**: Optional service worker and manifest for installability; responsive tweaks for small screens.

---

## License

This project is part of a take-home assessment.

---

## Author

**Andras Strublics**
GitHub: [@Andrew0079](https://github.com/Andrew0079)
