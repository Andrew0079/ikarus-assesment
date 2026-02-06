"""Auth: Connexion handlers (operationId targets)."""
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required

from app.auth.service import authenticate_user, register_user

# Connexion passes body as positional arg for POST
def auth_register_post(body):
    username = (body or {}).get("username", "").strip()
    email = (body or {}).get("email", "").strip()
    password = (body or {}).get("password", "")

    if not username or not email or not password:
        return {"message": "username, email and password are required"}, 400
    user, err = register_user(username, email, password)
    if err:
        return {"message": err}, 400
    token = create_access_token(identity=user.id)
    return {"user": user.to_dict(), "access_token": token}, 201


def auth_login_post(body):
    login = (body or {}).get("login", "").strip()  # username or email
    password = (body or {}).get("password", "")

    if not login or not password:
        return {"message": "login and password are required"}, 400
    user = authenticate_user(login, password)
    if not user:
        return {"message": "Invalid login or password"}, 401
    token = create_access_token(identity=user.id)
    return {"user": user.to_dict(), "access_token": token}, 200


@jwt_required()
def auth_me_get():
    from app.auth.models import User
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return {"message": "User not found"}, 404
    return user.to_dict(), 200
