"""
Logging and monitoring: centralised config, structured logs, request logging.

Use get_logger(__name__) in domains and handlers. Call init_logging() from create_app().
"""
import json
import logging
import os
import time
import uuid

LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO").upper()
LOG_JSON = os.environ.get("LOG_JSON", "false").lower() in ("1", "true", "yes")
LOG_FORMAT = os.environ.get("LOG_FORMAT", "%(asctime)s [%(levelname)s] %(name)s: %(message)s")


class JsonFormatter(logging.Formatter):
    """One JSON object per log line (for log aggregators)."""

    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        for key, value in record.__dict__.items():
            if key not in (
                "name", "msg", "args", "created", "filename", "funcName",
                "levelname", "levelno", "lineno", "module", "msecs",
                "pathname", "process", "processName", "relativeCreated",
                "stack_info", "exc_info", "exc_text", "thread", "threadName",
                "message", "asctime",
            ) and value is not None:
                payload[key] = value
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload)


def init_logging() -> None:
    """Configure root logger and app logger. Call once at startup."""
    level = getattr(logging, LOG_LEVEL, logging.INFO)
    root = logging.getLogger()
    root.setLevel(level)
    if not root.handlers:
        handler = logging.StreamHandler()
        handler.setLevel(level)
        if LOG_JSON:
            handler.setFormatter(JsonFormatter())
        else:
            handler.setFormatter(logging.Formatter(LOG_FORMAT))
        root.addHandler(handler)
    logging.getLogger("app").setLevel(level)


def get_logger(name: str) -> logging.Logger:
    """Return a logger for the given module (e.g. __name__)."""
    return logging.getLogger(name)


def request_logging(app) -> None:
    """Register before/after_request to log each request (method, path, status, duration)."""
    logger = get_logger("app.requests")

    @app.before_request
    def before_request():
        from flask import g, request
        g.request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())[:8]
        g.request_start = time.perf_counter()

    @app.after_request
    def after_request(response):
        from flask import g, request
        duration_ms = (time.perf_counter() - getattr(g, "request_start", 0)) * 1000
        request_id = getattr(g, "request_id", "-")
        extra = {"request_id": request_id}
        log_msg = "%s %s %s %.1fms"
        log_args = (request.method, request.path, response.status_code, duration_ms)
        if response.status_code >= 400:
            logger.warning(log_msg, *log_args, extra=extra)
        else:
            logger.info(log_msg, *log_args, extra=extra)
        response.headers["X-Request-ID"] = request_id
        return response
