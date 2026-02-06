# API Usage Examples

Complete examples for all Weather App API endpoints.

**Base URL (Development)**: `http://localhost:5001`  
**Base URL (Docker)**: `http://localhost:5001`

## Table of Contents
- [Authentication](#authentication)
- [Weather](#weather)
- [Weather Zones](#weather-zones)
- [Error Handling](#error-handling)

---

## Authentication

### Register a New User

**Endpoint**: `POST /api/auth/register`

**Request**:
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Response** (201 Created):
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "created_at": "2026-02-06T12:00:00.000000"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validation Rules**:
- Username: 3-80 characters, alphanumeric + underscore/hyphen
- Email: Valid email format, max 120 characters
- Password: Min 8 characters, at least one letter and one number

---

### Login

**Endpoint**: `POST /api/auth/login`

**Request** (with username):
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "john_doe",
    "password": "SecurePass123"
  }'
```

**Request** (with email):
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Response** (200 OK):
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "created_at": "2026-02-06T12:00:00.000000"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Get Current User

**Endpoint**: `GET /api/auth/me`  
**Authentication**: Required (JWT)

**Request**:
```bash
curl http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response** (200 OK):
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "created_at": "2026-02-06T12:00:00.000000"
}
```

---

### Logout

**Endpoint**: `POST /api/auth/logout`  
**Authentication**: Required (JWT)

**Request**:
```bash
curl -X POST http://localhost:5001/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response** (200 OK):
```json
{
  "message": "Logged out successfully"
}
```

**Note**: Client should discard the JWT token after logout.

---

## Weather

### Search Cities

**Endpoint**: `GET /api/weather/search`  
**Authentication**: Not required

**Request**:
```bash
curl "http://localhost:5001/api/weather/search?q=London"
```

**Response** (200 OK):
```json
[
  {
    "id": "London,GB",
    "name": "London",
    "region": "England",
    "country": "GB",
    "lat": 51.5074,
    "lon": -0.1278
  },
  {
    "id": "London,CA",
    "name": "London",
    "region": "Ontario",
    "country": "CA",
    "lat": 42.9834,
    "lon": -81.2497
  }
]
```

---

### Get Current Weather

**Endpoint**: `GET /api/weather/current`  
**Authentication**: Not required

**Request**:
```bash
curl "http://localhost:5001/api/weather/current?lat=51.5074&lon=-0.1278"
```

**Response** (200 OK):
```json
{
  "temperature_c": 15.5,
  "humidity": 72,
  "conditions": "partly cloudy",
  "wind_speed_kmh": 18.5,
  "cached_at": "2026-02-06T12:00:00.000000"
}
```

**Caching**: Weather data is cached for 20 minutes (configurable via `WEATHER_CACHE_TTL_MINUTES`).

---

## Weather Zones

All zone endpoints require authentication.

### List User's Zones

**Endpoint**: `GET /api/zones`  
**Authentication**: Required (JWT)

**Request**:
```bash
curl http://localhost:5001/api/zones \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Request** (with pagination):
```bash
curl "http://localhost:5001/api/zones?limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response** (200 OK):
```json
{
  "items": [
    {
      "id": 1,
      "user_id": 1,
      "name": "Home",
      "city_name": "London",
      "country_code": "GB",
      "latitude": 51.5074,
      "longitude": -0.1278,
      "created_at": "2026-02-06T12:00:00.000000",
      "updated_at": "2026-02-06T12:00:00.000000",
      "weather": {
        "temperature_c": 15.5,
        "humidity": 72,
        "conditions": "partly cloudy",
        "wind_speed_kmh": 18.5,
        "cached_at": "2026-02-06T12:00:00.000000"
      }
    }
  ],
  "total": 1
}
```

---

### Create a Zone

**Endpoint**: `POST /api/zones`  
**Authentication**: Required (JWT)

**Request**:
```bash
curl -X POST http://localhost:5001/api/zones \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Home",
    "city_name": "London",
    "country_code": "GB",
    "latitude": 51.5074,
    "longitude": -0.1278
  }'
```

**Response** (201 Created):
```json
{
  "id": 1,
  "user_id": 1,
  "name": "Home",
  "city_name": "London",
  "country_code": "GB",
  "latitude": 51.5074,
  "longitude": -0.1278,
  "created_at": "2026-02-06T12:00:00.000000",
  "updated_at": "2026-02-06T12:00:00.000000",
  "weather": {
    "temperature_c": 15.5,
    "humidity": 72,
    "conditions": "partly cloudy",
    "wind_speed_kmh": 18.5,
    "cached_at": "2026-02-06T12:00:00.000000"
  }
}
```

**Validation**:
- Duplicate zones (same city + country for user) are rejected with 400 error
- All fields except latitude/longitude are required

---

### Get a Specific Zone

**Endpoint**: `GET /api/zones/{zone_id}`  
**Authentication**: Required (JWT)

**Request**:
```bash
curl http://localhost:5001/api/zones/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response** (200 OK): Same as create zone response

---

### Update a Zone

**Endpoint**: `PUT /api/zones/{zone_id}`  
**Authentication**: Required (JWT)

**Request**:
```bash
curl -X PUT http://localhost:5001/api/zones/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Work Office"
  }'
```

**Response** (200 OK): Updated zone with weather data

---

### Delete a Zone

**Endpoint**: `DELETE /api/zones/{zone_id}`  
**Authentication**: Required (JWT)

**Request**:
```bash
curl -X DELETE http://localhost:5001/api/zones/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response** (204 No Content): Empty response

---

### Refresh Zone Weather

**Endpoint**: `POST /api/zones/{zone_id}/refresh`  
**Authentication**: Required (JWT)

**Request**:
```bash
curl -X POST http://localhost:5001/api/zones/1/refresh \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response** (200 OK): Zone with fresh weather data

---

## Error Handling

All errors follow a consistent format:

```json
{
  "code": "error_code",
  "message": "Human-readable error message"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `validation_error` | 400 | Invalid input data |
| `bad_request` | 400 | Malformed request |
| `unauthorized` | 401 | Missing or invalid JWT token |
| `not_found` | 404 | Resource not found |
| `internal_error` | 500 | Server error |

### Example Error Responses

**401 Unauthorized** (missing token):
```json
{
  "code": "unauthorized",
  "message": "Missing Authorization Header"
}
```

**400 Bad Request** (validation error):
```json
{
  "code": "validation_error",
  "message": "Password must be at least 8 characters"
}
```

**404 Not Found**:
```json
{
  "code": "not_found",
  "message": "Zone not found"
}
```

**429 Too Many Requests** (rate limit exceeded):
```json
{
  "code": "rate_limit_exceeded",
  "message": "Too many requests. Please try again later."
}
```

---

## Rate Limits

- **Default**: 60 requests/minute per IP
- **Auth endpoints** (login, register): 10 requests/minute per IP

**Response Headers**:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

---

## Testing with Postman

1. Import the OpenAPI spec: `http://localhost:5001/openapi.json`
2. Create an environment variable `token` for the JWT
3. Set Authorization header: `Bearer {{token}}`
4. After login/register, save the `access_token` to the `token` variable

---

## Swagger UI

Interactive API documentation available at:
**http://localhost:5001/ui/**

Try out endpoints directly in your browser!

