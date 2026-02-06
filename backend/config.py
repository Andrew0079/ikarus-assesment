"""Application config."""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
INSTANCE_DIR = BASE_DIR / "instance"
INSTANCE_DIR.mkdir(exist_ok=True)

PORT = int(os.environ.get("PORT", 5000))
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")

# Logging
LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")
LOG_JSON = os.environ.get("LOG_JSON", "false").lower() in ("1", "true", "yes")

# JWT
JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "change-me-in-production")
JWT_ACCESS_TOKEN_EXPIRES = int(os.environ.get("JWT_ACCESS_TOKEN_EXPIRES", 900))  # 15 min

# SQLite (single file, no server)
_default_db = f"sqlite:///{INSTANCE_DIR / 'weatherapp.db'}"
DATABASE_URL = os.environ.get("DATABASE_URL", _default_db)
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


config_by_name = {"default": Config}
