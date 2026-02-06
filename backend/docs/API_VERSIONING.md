# API Versioning Strategy

## Current version: 1

- **Paths**: All API routes live under `/api/` (e.g. `/api/health`, `/api/auth/login`, `/api/zones`).
- **Response header**: Every response includes `X-API-Version: 1` so clients can detect the version.
- **OpenAPI**: `openapi.yaml` `info.version` is `1.0.0`.

## Future versions (breaking changes)

When we introduce **breaking** changes (e.g. remove or rename fields, change behaviour):

1. **New prefix**: Add routes under `/api/v2/` (e.g. `/api/v2/zones`).
2. **New spec**: Either a separate `openapi-v2.yaml` or versioned paths in the same spec.
3. **Support window**: Keep `/api/` (v1) working for at least one release cycle; document deprecation and sunset date.
4. **Header**: Responses for v2 will send `X-API-Version: 2`.

Non-breaking changes (new optional fields, new endpoints) stay in the current version and do not require a new API version.
