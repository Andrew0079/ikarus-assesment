# Zonely — Frontend

React frontend for the Weather App: login/register, protected dashboard, and weather zones (table with sort, pagination, add/edit/delete/refresh).

**Stack**: React 18, Vite 7, TypeScript, Base Web (Styletron), React Query, Redux, React Router.

Full project docs (backend, Docker, API): see [../README.md](../README.md).

---

## Run

```bash
npm install
npm run dev
```

App: **http://localhost:5173**

### Using the real backend (Docker or local)

The UI needs the API. Either:

- **Option A — Full stack in Docker** (from repo root):  
  `docker compose -f docker/docker-compose.yml up --build`  
  Then open **http://localhost:8080** (frontend is served by nginx there).

- **Option B — Dev server against backend**  
  Start the backend (e.g. Docker or `python run.py` on port 5001), then run the frontend with the API base URL:

```bash
VITE_API_URL=http://localhost:5001 npm run dev
```

Then open **http://localhost:5173**. Requests go to the backend; CORS allows this origin.

**If you see `EPERM: operation not permitted, uv_cwd`:** open a new terminal, `cd` to this folder with the full path, then run `npm run dev` again.

---

## Build

```bash
npm run build
```

Output is in `dist/`. For production, the app is typically built and served by nginx (see root README and `docker/Dockerfile.frontend`).

---

## Environment

| Variable       | When to set | Description                                                                                                    |
| -------------- | ----------- | -------------------------------------------------------------------------------------------------------------- |
| `VITE_API_URL` | Dev only    | API base URL (e.g. `http://localhost:5001`). If unset, the app uses the same origin (for Docker/proxy setups). |

---

## Frontend structure

- **`src/pages/`** — Login, Register, Dashboard (each in its own folder with components, hooks, services).
- **`src/shared/`** — API client, Redux (auth + UI toasts), config, shared components (e.g. AuthLayout, ProtectedRoute, DashboardLayout, Toaster).
- **`src/providers/`** — Base Web, Redux + React Query, API client config; `AuthRestoreUser` restores user on refresh.

Auth is persisted (token + user in localStorage) and restored on load so the navbar shows the correct user after refresh.

---

## Code style & pre-commit

- **TypeScript**: Strict mode; ESLint recommended rules.
- **Prettier**: `npm run format` / `npm run format:check`.
- **ESLint**: `npm run lint`.

Repo-level pre-commit (from project root) runs Prettier and ESLint on `frontend/` for staged files. One-time:

```bash
cd frontend && npm install
cd .. && pre-commit install
```

---

## Expanding ESLint

For stricter type-aware rules, see the [Vite + React + TS ESLint guide](https://eslint.org/docs/latest/use/configure/typescript) and use `tsconfig.node.json` / `tsconfig.app.json` in `parserOptions.project`. You can switch to `tseslint.configs.recommendedTypeChecked` (or `strictTypeChecked`) in `eslint.config.js` when needed.
