"""App factory: Connexion (OpenAPI) + Flask."""
from pathlib import Path

import connexion
from flask_cors import CORS

# Backend root (parent of app/)
BASE_DIR = Path(__file__).resolve().parent.parent


def create_app():
    spec_dir = str(BASE_DIR / "api")
    cnx = connexion.App(__name__, specification_dir=spec_dir)
    cnx.add_api("openapi.yaml", base_path="/api", options={"swagger_ui": True})

    flask_app = cnx.app
    from config import config_by_name
    flask_app.config.from_object(config_by_name.get("default"))
    CORS(flask_app, origins=flask_app.config["CORS_ORIGINS"], supports_credentials=True)

    return cnx
