"""Tests for /api/health."""


def test_health_returns_ok(client):
    """GET /api/health returns 200 and { status: ok }."""
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data == {"status": "ok"}
