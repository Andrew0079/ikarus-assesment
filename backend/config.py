"""Minimal config."""
import os
from dotenv import load_dotenv

load_dotenv()

PORT = int(os.environ.get("PORT", 5000))
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")


class Config:
    PORT = PORT
    CORS_ORIGINS = CORS_ORIGINS


config_by_name = {"default": Config}
