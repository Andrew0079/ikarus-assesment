"""Pytest fixtures."""
import os

import pytest

# Use in-memory SQLite for tests so no MSSQL is required
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("RATELIMIT_ENABLED", "false")

from app import create_app


@pytest.fixture
def client():
    """Flask test client (Connexion app's underlying Flask app)."""
    cnx = create_app()
    return cnx.app.test_client()
