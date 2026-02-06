"""Health check handler (OpenAPI operationId)."""

def health_get():
    return {"status": "ok"}, 200
