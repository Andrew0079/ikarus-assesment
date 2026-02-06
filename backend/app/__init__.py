"""App factory: Connexion (OpenAPI) + Flask."""

from pathlib import Path

import connexion
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
    # Security handled by Flask-JWT-Extended decorators, not Connexion
    cnx.add_api("openapi.yaml", arguments={"title": "Weather App API"})

    # Debug: print registered routes
    print("\n=== Connexion Routes ===")
    for rule in cnx.app.url_map.iter_rules():
        print(f"{list(rule.methods)} {rule.rule} -> {rule.endpoint}")
    print("========================\n")

    flask_app = cnx.app
    from config import config_by_name

    flask_app.config.from_object(config_by_name.get("default"))
    CORS(flask_app, origins=flask_app.config["CORS_ORIGINS"], supports_credentials=True)
    JWTManager(flask_app)

    if flask_app.config.get("RATELIMIT_ENABLED") and flask_app.config.get("RATELIMIT_DEFAULT"):
        from flask_limiter import Limiter
        from flask_limiter.util import get_remote_address
        limiter = Limiter(
            key_func=get_remote_address,
            app=flask_app,
            default_limits=[flask_app.config["RATELIMIT_DEFAULT"]],
        )
        flask_app.extensions["limiter"] = limiter

    request_logging(flask_app)

    from app.extensions import db

    db.init_app(flask_app)

    # Import app modules so models are bound to db.metadata (Alembic + Flask-SQLAlchemy)
    from app.auth import models as _auth_models  # noqa: F401
    from app.weather import models as _weather_models  # noqa: F401
    from app.zones import models as _zones_models  # noqa: F401

    return cnx
