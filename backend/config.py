"""Application config."""

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
INSTANCE_DIR = BASE_DIR / "instance"
INSTANCE_DIR.mkdir(exist_ok=True)

PORT = int(os.environ.get("PORT", 5000))
CORS_ORIGINS = os.environ.get(
    "CORS_ORIGINS", "http://localhost:3000,http://localhost:5173"
).split(",")

# Logging
LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")
LOG_JSON = os.environ.get("LOG_JSON", "false").lower() in ("1", "true", "yes")

# JWT
JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "change-me-in-production")
JWT_ACCESS_TOKEN_EXPIRES = int(
    os.environ.get("JWT_ACCESS_TOKEN_EXPIRES", 900)
)  # 15 min

# Security: Fail fast in production if JWT secret is not set or too short
if os.environ.get("FLASK_ENV") == "production":
    if JWT_SECRET_KEY == "change-me-in-production":
        raise ValueError(
            "CRITICAL SECURITY ERROR: JWT_SECRET_KEY must be set in production! "
            "Set environment variable JWT_SECRET_KEY to a strong random value (32+ bytes). "
            'Generate with: python -c "import secrets; print(secrets.token_urlsafe(32))"'
        )
    if len(JWT_SECRET_KEY.encode()) < 32:
        raise ValueError(
            f"CRITICAL SECURITY ERROR: JWT_SECRET_KEY is too short ({len(JWT_SECRET_KEY.encode())} bytes). "
            "Must be at least 32 bytes for SHA256. "
            'Generate with: python -c "import secrets; print(secrets.token_urlsafe(32))"'
        )

# Weather (OpenWeatherMap). Optional: if unset, weather endpoints return empty/use cache only.
OPENWEATHERMAP_API_KEY = (
    os.environ.get("OPENWEATHERMAP_API_KEY") or os.environ.get("WEATHER_API_KEY") or ""
).strip()
WEATHER_CACHE_TTL_MINUTES = int(os.environ.get("WEATHER_CACHE_TTL_MINUTES", 20))

# Rate limiting (per IP). Default 60/min; set to empty to disable.
RATELIMIT_DEFAULT = os.environ.get("RATELIMIT_DEFAULT", "60 per minute")
RATELIMIT_ENABLED = os.environ.get("RATELIMIT_ENABLED", "true").lower() in (
    "1",
    "true",
    "yes",
)
# Stricter limit for auth (login/register) to reduce brute-force/enumeration.
RATELIMIT_AUTH = os.environ.get("RATELIMIT_AUTH", "10 per minute")
# Redis storage for rate limiting (optional, falls back to in-memory if not set)
RATELIMIT_STORAGE_URL = os.environ.get("RATELIMIT_STORAGE_URL", "")

# MSSQL (required). Example: mssql+pymssql://user:password@host:1433/weatherapp
DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError(
        "DATABASE_URL is required (e.g. mssql+pymssql://sa:YourPassword@localhost:1433/weatherapp)"
    )
SQLALCHEMY_DATABASE_URI = DATABASE_URL
SQLALCHEMY_ENGINE_OPTIONS = (
    {"connect_args": {"check_same_thread": False}} if "sqlite" in DATABASE_URL else {}
)


class Config:
    PORT = PORT
    CORS_ORIGINS = CORS_ORIGINS
    SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI
    SQLALCHEMY_ENGINE_OPTIONS = SQLALCHEMY_ENGINE_OPTIONS
    LOG_LEVEL = LOG_LEVEL
    LOG_JSON = LOG_JSON
    JWT_SECRET_KEY = JWT_SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = JWT_ACCESS_TOKEN_EXPIRES
    OPENWEATHERMAP_API_KEY = OPENWEATHERMAP_API_KEY
    WEATHER_CACHE_TTL_MINUTES = WEATHER_CACHE_TTL_MINUTES
    RATELIMIT_DEFAULT = RATELIMIT_DEFAULT
    RATELIMIT_ENABLED = RATELIMIT_ENABLED
    RATELIMIT_AUTH = RATELIMIT_AUTH
    RATELIMIT_STORAGE_URL = RATELIMIT_STORAGE_URL


class DevelopmentConfig(Config):
    """Development: relaxed defaults, no HTTPS enforcement."""

    pass


class ProductionConfig(Config):
    """Production: require strong JWT secret, document HTTPS at reverse proxy."""

    pass


def _get_config_name():
    return os.environ.get("FLASK_ENV", "default").lower()


config_by_name = {
    "default": Config,
    "development": DevelopmentConfig,
    "production": ProductionConfig,
}


def get_config():
    """Return config for current FLASK_ENV (default/development/production)."""
    name = _get_config_name()
    return config_by_name.get(name, Config)
