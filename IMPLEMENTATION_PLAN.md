# Weather App — Implementation Plan

High-level plan for backend (Flask + Connexion + OpenAPI), frontend (React + Vite + Base Web), and Docker.

---

## Phase 1: Project Setup

- [x] Initialize repo (backend + frontend structure)
- [x] Backend: Flask, Connexion, OpenAPI 3.0
- [x] Frontend: React, Vite, TypeScript, Redux, Base Web
- [x] Pre-commit: Black, isort, flake8, mypy (backend); ESLint, Prettier, typecheck (frontend)
- [x] EditorConfig for consistent style

---

## Phase 2: Database

- [x] MSSQL as required database
- [x] Docker: MSSQL service (2022-latest), backend with `env_file` for API key
- [x] Alembic migrations under `backend/app/migrations/`
- [x] Models: User (auth), WeatherZone (zones), WeatherCache (weather)
- [x] Script: `scripts/ensure_mssql_db.py` to create DB on first run
- [x] Create initial migration; test migrations (up/down)

---

## Phase 3: OpenAPI Specification

### 3.1 Define API Contract (openapi.yaml)

- [x] Create openapi.yaml file with OpenAPI 3.0 structure
- [x] Define Authentication Endpoints:
  - [x] `POST /api/auth/register` - User registration
  - [x] `POST /api/auth/login` - Login (returns JWT)
  - [ ] `POST /auth/refresh` - Refresh access token (optional)
  - [x] `GET /api/auth/me` - Get current user info (JWT)
  - [x] `POST /api/auth/logout` - Logout (client discards token)

- [x] Define Weather Zones CRUD:
  - [x] `GET /api/zones` - List user's zones (with latest weather)
  - [x] `POST /api/zones` - Create new zone
  - [x] `GET /api/zones/{id}` - Get specific zone with weather (path: `/api/zones/{zone_id}`)
  - [x] `PUT /api/zones/{id}` - Update zone
  - [x] `DELETE /api/zones/{id}` - Delete zone
  - [x] `POST /api/zones/{id}/refresh` - Force refresh weather data

- [x] Define Weather Search:
  - [x] `GET /api/weather/search?q={city}` - Search cities (OpenWeatherMap Geocoding)
  - [x] `GET /api/weather/current?lat={lat}&lon={lon}` - Get current weather (cached)

- [x] `GET /api/health` - Health check

### 3.2 Define Schemas

- [x] Create request/response schemas with validation rules
- [x] Define **structured error response schema** (e.g. `{ "code": "string", "message": "string" }`) for consistent API errors
- [x] Configure security schemes (JWT Bearer)
- [x] Test OpenAPI spec with Swagger UI

---

## Phase 4: Backend Implementation

### 4.1 Authentication System

- [x] Implement JWT token generation/validation (Flask-JWT-Extended)
- [x] Implement **app.auth**: handlers (register, login, me, logout) and auth service (password validation, JWT)
- [x] Implement **password policy**: min 8 chars, at least one letter and one number; reject weak with 400
- [x] **Refresh**: optional (skipped for MVP); **Logout**: client discards token — `POST /api/auth/logout` returns 200 (server blacklist optional, not implemented)

### 4.2 Weather Service Integration

- [x] **OpenWeatherMap**: Geocoding API (search) + Current Weather API; key via `OPENWEATHERMAP_API_KEY` (or `WEATHER_API_KEY` fallback)
- [x] **app/integrations/openweathermap.py**: `search_cities(api_key, query)`, `current_weather(api_key, lat, lon)`; retry on 5xx/timeout
- [x] **app.weather.service**: `search_cities_query(q)` (with 5s in-memory dedupe), `get_current_weather(lat, lon)` with DB cache (TTL from config), fallback to stale cache on API error
- [x] **app.controllers.weather**: `GET /api/weather/search`, `GET /api/weather/current`; rate limiting (Flask-Limiter) and search dedupe in place
- [x] Test weather API integration (curl/Swagger)

### 4.3 Weather Zones CRUD

- [x] Implement **app.zones**: handlers for all zone endpoints; zone service layer:
  - [x] **Authorization**: Every zone endpoint (GET/PUT/DELETE/refresh by id) must verify the zone belongs to the authenticated user; return 404 for others' zones
  - [x] Fetch weather data when retrieving zones
  - [x] Handle duplicate zone prevention
  - [x] Implement pagination for zone listing
- [x] Test all CRUD operations

### 4.4 Middleware & Error Handling

- [x] Configure CORS for frontend origin (config `CORS_ORIGINS`)
- [x] Implement global error handler (map exceptions to HTTP responses with `{ "code", "message" }`)
- [x] Add request logging middleware (X-Request-ID, method/path/status/duration)
- [x] Rate limiting (Flask-Limiter; default 60/min per IP; `RATELIMIT_ENABLED` / `RATELIMIT_DEFAULT`)
- [x] Verify input validation via Connexion + OpenAPI (`strict_validation=True`; requestBody schemas in spec)
- [x] Test error responses

---

## Phase 5: Frontend Implementation

### 5.1 Authentication Flow

- [x] Create Login page with Base Web forms
- [x] Create Register page with Base Web forms
- [x] Implement Auth context/provider for global state (Redux auth slice + persisted token/user)
- [x] Create protected route wrapper component
- [x] Implement token storage: **prefer httpOnly, Secure, SameSite cookies** (better XSS resistance); if using localStorage, document trade-off and ensure tokens never in logs — *localStorage used; user object also persisted to avoid flicker on refresh*
- [ ] If using cookie-based auth: add **CSRF protection** (e.g. SameSite=Strict or CSRF token / double-submit cookie) — *N/A: using localStorage*
- [x] Set up Axios interceptor for JWT injection (or cookie sent automatically)
- [ ] Implement auto-refresh token logic (if refresh endpoint in scope)
- [x] Test authentication flow

### 5.2 Dashboard Layout

- [x] Create Base Web AppNavBar with user menu (DashboardLayout header with user label + logout)
- [x] Implement responsive grid layout for weather zones (table with sort/pagination; ZoneCard available)
- [x] Add search bar for adding new cities (debounced overlay dropdown)
- [x] **Logout**: Client discards token (and clears cookie if used), redirect to login; optional: call backend logout to invalidate/blacklist token if implemented

### 5.3 Weather Zones Management

- [x] Create Zone Card Component:
  - [x] Display city, temperature, conditions
  - [x] Show last updated timestamp
  - [x] Add edit/delete/refresh buttons

- [x] Implement Add Zone Flow:
  - [x] Search input with autocomplete (debounced)
  - [x] City selection from search results
  - [x] Optional custom name input (zone name defaults to city name)
  - [x] Form validation

- [x] Create Edit Zone Modal:
  - [x] Update zone name functionality
  - [x] Form validation

- [x] Implement Delete Zone:
  - [x] Confirmation dialog
  - [x] Optimistic UI update (query invalidation)

- [x] Add Refresh Weather:
  - [x] Manual refresh button per zone
  - [x] Loading state during refresh

### 5.4 State Management

- [x] Choose state management approach:
  - [x] Redux Toolkit (auth + UI toasts) + React Query (server state: zones, weather search)
- [x] Implement optimistic updates for better UX (query invalidation on mutations)
- [x] Handle loading and error states

### 5.5 Error Handling & Loading States

- [x] Implement Base Web Spinner for loading states
- [x] Add Toast notifications for errors/success
- [x] Implement graceful degradation for API failures
- [x] Add retry logic for failed requests (React Query retry; mutation error toasts)

---

## Phase 6: Polish & Production Readiness

### 6.1 Testing

- [ ] Backend Testing:
  - [ ] Unit tests for services
  - [ ] Integration tests for endpoints
  - [ ] Test authentication flows
  - [ ] Test weather API integration
- [ ] Frontend Testing:
  - [ ] Component tests (React Testing Library)
  - [ ] (Optional) E2E tests with Playwright

### 6.2 Configuration Management

- [x] Set up environment variables:
  - [x] Database connection string (`DATABASE_URL`)
  - [x] Weather API key (`OPENWEATHERMAP_API_KEY`)
  - [x] JWT secret (`JWT_SECRET_KEY`)
  - [x] CORS origins (`CORS_ORIGINS`)
- [x] Create .env.example files (`backend/.env.example`)
- [x] Separate configs for dev/prod (`FLASK_ENV` → DevelopmentConfig/ProductionConfig)
- [x] Add .env to .gitignore

### 6.3 Documentation

- [x] Create comprehensive README with:
  - [x] Prerequisites (Python 3.x, Node.js, MSSQL/Docker)
  - [x] Setup instructions (env vars, DB migrations, dependencies)
  - [x] Running instructions (backend + frontend)
  - [x] API documentation link (Swagger UI)
  - [x] Docker setup instructions
  - [x] Deployment instructions
- [x] Add code comments for complex logic
- [x] Verify OpenAPI spec documentation
- [ ] **Dependency scanning**: Pin versions in package.json; add `pip-audit` (Python) and `npm audit` (or similar) to CI or pre-commit for supply-chain security

### 6.4 Security Hardening

- [x] **Authorization**: Every zone endpoint must verify the zone belongs to the authenticated user; return 404 for others' zones
- [x] Verify SQL injection prevention (SQLAlchemy parameterized queries only; no raw SQL)
- [x] Verify XSS prevention (React auto-escaping; sanitize any user-generated content) — frontend
- [x] **Rate limiting**: Auth endpoints (strict) and all public/authenticated endpoints (e.g. /zones, /weather/*) to prevent abuse and enumeration (Flask-Limiter, default 60/min)
- [x] **Input validation**: Enforce max lengths and allowed characters for zone names, search queries; reject invalid input with 400 (OpenAPI + Connexion strict_validation)
- [x] **Secrets**: Never log tokens or passwords; use env vars only; document rotation for production (.env.example)
- [x] **Audit-style logging**: Log auth events (login success/failure, IP) and optionally critical actions (e.g. zone create/delete) for security review
- [x] Configure HTTPS enforcement (production) — document at reverse proxy
- [x] **Password policy**: Min length 8–12, complexity (e.g. letter + number); enforce in validation
- [x] Add security headers (e.g. Flask-Talisman or equivalent) — X-Content-Type-Options, X-Frame-Options

### 6.5 Performance Optimization

- [x] Add database indexing on foreign keys and query fields (migration: users email/username, weather_zones user_id, weather_cache location_key/expires_at)
- [x] Verify weather cache to minimize external API calls
- [ ] Implement frontend code splitting — frontend
- [x] Add compression (gzip) — Flask-Compress
- [x] Optimize database queries (avoid N+1) — zones list single query; weather per zone via cache

---

## Phase 7: Docker & Deployment

### 7.1 Docker Setup (Recommended)

- [x] Create Dockerfile for backend (docker/Dockerfile.backend):
  - [x] Python base image, install dependencies, copy app
  - [x] CMD: `scripts/ensure_mssql_db.py && alembic upgrade head && python run.py`
- [x] Create Dockerfile for frontend (after backend is done)

- [x] Create docker-compose.yml (docker/docker-compose.yml):
  - [x] MSSQL service (mcr.microsoft.com/mssql/server:2022-latest)
  - [x] Backend service; `env_file: ../backend/.env` for `OPENWEATHERMAP_API_KEY`; depends_on MSSQL
  - [x] Frontend service (Vite build + nginx; proxies /api to backend; port 8080)
  - [x] Network / ports (5001:5000 backend, 8080:80 frontend, 1433 MSSQL)

- [x] Create .dockerignore (backend excludes .env, .venv, *.db)
- [x] Test backend + MSSQL with Docker Compose

### 7.2 Database Migrations

- [x] Alembic in backend; migrations in `app/migrations/versions/`
- [x] Document migration workflow (create, upgrade, downgrade) in README

### 7.3 Production Considerations

- [ ] Use secrets management for DATABASE_URL, JWT_SECRET_KEY, OPENWEATHERMAP_API_KEY
- [ ] Run backend behind reverse proxy (nginx/Caddy) with HTTPS
- [ ] Optional: health check endpoint used by orchestrator (e.g. Docker HEALTHCHECK, k8s liveness)

---

## File Naming Conventions (Frontend)

- **PascalCase**: React component files only (e.g. `Button.tsx`, `Home.tsx`, `AuthForm.tsx`).
- **kebab-case**: Everything else — hooks, utils, lib, slices, API (e.g. `use-auth.ts`, `format-date.ts`, `auth-slice.ts`, `axios-client.ts`).

---

## Quick Reference

| Area        | Location / Command |
|------------|---------------------|
| Backend API| `backend/`, `python run.py` or Docker |
| OpenAPI    | `backend/api/openapi.yaml` |
| Frontend   | `frontend/`, `npm run dev` |
| Docker     | `docker compose -f docker/docker-compose.yml up --build` |
| Pre-commit | `pre-commit install` then `pre-commit run --all-files` |
