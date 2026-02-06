"""Minimal config."""
import os
from dotenv import load_dotenv

load_dotenv()

PORT = int(os.environ.get("PORT", 5000))
