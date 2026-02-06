"""Auth: Connexion handlers (operationId targets)."""

from flask import request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required

from app.auth.models import User
from app.auth.service import authenticate_user, register_user
from app.logging_config import get_logger

_AUDIT = get_logger("app.auth.audit")


def _client_ip():
    return request.headers.get("X-Forwarded-For", request.remote_addr or "").split(",")[0].strip()


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
            return {"code": "validation_error", "message": "username, email and password are required"}, 400
        user, err = register_user(username, email, password)
        if err:
            return {"code": "validation_error", "message": err}, 400
        token = create_access_token(identity=str(user.id))
        _AUDIT.info("register success user_id=%s ip=%s", user.id, _client_ip(), extra={"event": "register_success", "user_id": user.id, "ip": _client_ip()})
        return {"user": user.to_dict(), "access_token": token}, 201
    except Exception as e:
        return {"code": "internal_error", "message": str(e)}, 500


def auth_login_post(body):
    login = (body or {}).get("login", "").strip()
    password = (body or {}).get("password", "")
    ip = _client_ip()

    if not login or not password:
        return {"code": "validation_error", "message": "login and password are required"}, 400
    user = authenticate_user(login, password)
    if not user:
        _AUDIT.warning("login failure login=%s ip=%s", login[:32], ip, extra={"event": "login_failure", "ip": ip})
        return {"code": "unauthorized", "message": "Invalid login or password"}, 401
    token = create_access_token(identity=str(user.id))
    _AUDIT.info("login success user_id=%s ip=%s", user.id, ip, extra={"event": "login_success", "user_id": user.id, "ip": ip})
    return {"user": user.to_dict(), "access_token": token}, 200


@jwt_required()
def auth_me_get():
    user_id = int(get_jwt_identity())  # JWT identity is stored as string
    user = User.query.get(user_id)
    if not user:
        return {"code": "not_found", "message": "User not found"}, 404
    return user.to_dict(), 200


@jwt_required()
def auth_logout_post():
    """Logout: client should discard token. Server blacklist optional (not implemented for MVP)."""
    return {}, 200
