"""Pytest fixtures."""
import pytest

from app import create_app


@pytest.fixture
def client():
    """Flask test client (Connexion app's underlying Flask app)."""
    cnx = create_app()
    return cnx.app.test_client()
