"""App factory: Connexion (OpenAPI) + Flask."""

from pathlib import Path

import connexion
from flask_compress import Compress
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from app.logging_config import init_logging, request_logging

# Backend root (parent of app/)
BASE_DIR = Path(__file__).resolve().parent.parent

init_logging()


def create_app():
    spec_dir = str(BASE_DIR / "api")
    # Connexion 2.x uses connexion.App (not FlaskApp)
    cnx = connexion.App(__name__, specification_dir=spec_dir)
    # Paths in spec are full (/api/...) so no base_path
    # Security: Connexion validates via app.security.bearer_auth (dummy passthrough)
    # Actual JWT validation done by Flask-JWT-Extended @jwt_required() decorators
    cnx.add_api(
        "openapi.yaml",
        arguments={"title": "Weather App API"},
        strict_validation=True,
    )

    flask_app = cnx.app
    from config import get_config

    flask_app.config.from_object(get_config())
    CORS(
        flask_app,
        resources={r"/api/*": {"origins": flask_app.config["CORS_ORIGINS"]}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "X-Request-ID"],
        expose_headers=["Content-Type"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    )
    JWTManager(flask_app)

    if flask_app.config.get("RATELIMIT_ENABLED") and flask_app.config.get(
        "RATELIMIT_DEFAULT"
    ):
        from flask_limiter import Limiter
        from flask_limiter.util import get_remote_address

        # Use Redis for rate limiting storage if configured, otherwise fall back to in-memory
        storage_uri = flask_app.config.get("RATELIMIT_STORAGE_URL") or None

        limiter = Limiter(
            key_func=get_remote_address,
            app=flask_app,
            default_limits=[flask_app.config["RATELIMIT_DEFAULT"]],
            storage_uri=storage_uri,
        )
        flask_app.extensions["limiter"] = limiter
        # Stricter rate limit for auth endpoints (login/register) to reduce enumeration
        auth_limit = flask_app.config.get("RATELIMIT_AUTH") or "10 per minute"
        for endpoint_name in (
            "app.controllers.auth.auth_login_post",
            "app.controllers.auth.auth_register_post",
        ):
            if endpoint_name in flask_app.view_functions:
                flask_app.view_functions[endpoint_name] = limiter.limit(auth_limit)(
                    flask_app.view_functions[endpoint_name]
                )

    request_logging(flask_app)
    add_security_headers(flask_app)
    Compress(flask_app)

    from app.extensions import db

    db.init_app(flask_app)

    # Import app modules so models are bound to db.metadata (Alembic + Flask-SQLAlchemy)
    from app.auth import models as _auth_models  # noqa: F401
    from app.weather import models as _weather_models  # noqa: F401
    from app.zones import models as _zones_models  # noqa: F401

    register_error_handlers(flask_app)

    return cnx


def add_security_headers(flask_app):
    """Add common security headers (X-Content-Type-Options, X-Frame-Options)."""

    @flask_app.after_request
    def security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-API-Version"] = "1"
        return response


def register_error_handlers(flask_app):
    """Map exceptions to HTTP responses with structured Error schema (code + message)."""

    @flask_app.errorhandler(400)
    def bad_request(e):
        body = {
            "code": "bad_request",
            "message": getattr(e, "description", str(e)) or "Bad request",
        }
        return body, 400

    @flask_app.errorhandler(404)
    def not_found(e):
        body = {
            "code": "not_found",
            "message": getattr(e, "description", str(e)) or "Not found",
        }
        return body, 404

    @flask_app.errorhandler(401)
    def unauthorized(e):
        body = {
            "code": "unauthorized",
            "message": getattr(e, "description", str(e)) or "Unauthorized",
        }
        return body, 401

    @flask_app.errorhandler(500)
    def internal_error(e):
        body = {
            "code": "internal_error",
            "message": getattr(e, "description", str(e)) or "Internal server error",
        }
        return body, 500

    @flask_app.errorhandler(Exception)
    def default_error(e):
        # Connexion validation and other framework errors may be caught here
        code = "internal_error"
        status = 500
        msg = str(e) if str(e) else "Internal server error"
        if hasattr(e, "status_code") and e.status_code == 400:
            code = "validation_error"
            status = 400
        elif hasattr(e, "status_code") and e.status_code == 401:
            code = "unauthorized"
            status = 401
        return {"code": code, "message": msg}, status
