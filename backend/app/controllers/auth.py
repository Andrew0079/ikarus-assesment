"""Auth: Connexion handlers (operationId targets)."""

from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required

from app.auth.models import User
from app.auth.service import authenticate_user, register_user


def auth_register_post(body):
    try:
        # Connexion may pass body as dict or as an object with .get
        if hasattr(body, "get"):
            data = body or {}
        else:
            data = dict(body) if body else {}
        username = (data.get("username") or "").strip()
        email = (data.get("email") or "").strip()
        password = data.get("password") or ""

        if not username or not email or not password:
            return {"message": "username, email and password are required"}, 400
        user, err = register_user(username, email, password)
        if err:
            return {"message": err}, 400
        token = create_access_token(identity=str(user.id))
        return {"user": user.to_dict(), "access_token": token}, 201
    except Exception as e:
        return {"message": str(e), "type": type(e).__name__}, 500


def auth_login_post(body):
    login = (body or {}).get("login", "").strip()
    password = (body or {}).get("password", "")

    if not login or not password:
        return {"message": "login and password are required"}, 400
    user = authenticate_user(login, password)
    if not user:
        return {"message": "Invalid login or password"}, 401
    token = create_access_token(identity=str(user.id))
    return {"user": user.to_dict(), "access_token": token}, 200


@jwt_required()
def auth_me_get():
    user_id = int(get_jwt_identity())  # JWT identity is stored as string
    user = User.query.get(user_id)
    if not user:
        return {"message": "User not found"}, 404
    return user.to_dict(), 200
