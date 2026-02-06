"""Start the server (Flask dev server; Connexion's .run() would use uvicorn)."""

from app import create_app
from config import PORT

cnx = create_app()
flask_app = cnx.app

if __name__ == "__main__":
    flask_app.run(host="0.0.0.0", port=PORT)
