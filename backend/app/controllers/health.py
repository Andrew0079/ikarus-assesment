"""Health check handler (OpenAPI operationId)."""
from app.logging_config import get_logger

logger = get_logger(__name__)


def health_get():
    logger.debug("health check")
    return {"status": "ok"}, 200
