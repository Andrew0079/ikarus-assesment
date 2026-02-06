"""Auth: register, login, get user."""
import re

from app.extensions import db
from app.auth.models import User


# Min 8 chars, at least one letter and one number
PASSWORD_PATTERN = re.compile(r"^(?=.*[A-Za-z])(?=.*\d).{8,}$")


def validate_password(password: str) -> tuple[bool, str]:
    """Return (ok, error_message)."""
    if not password or len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not PASSWORD_PATTERN.match(password):
        return False, "Password must contain at least one letter and one number"
    return True, ""


def register_user(username: str, email: str, password: str) -> tuple[User | None, str]:
    """
    Create a new user. Returns (user, error_message).
    If error_message is non-empty, user is None.
    """
    ok, err = validate_password(password)
    if not ok:
        return None, err
    if User.query.filter_by(username=username).first():
        return None, "Username already taken"
    if User.query.filter_by(email=email).first():
        return None, "Email already taken"
    user = User(username=username, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return user, ""


def get_user_by_username(username: str) -> User | None:
    return User.query.filter_by(username=username).first()


def get_user_by_email(email: str) -> User | None:
    return User.query.filter_by(email=email).first()


def authenticate_user(login: str, password: str) -> User | None:
    """login can be username or email."""
    user = get_user_by_username(login) or get_user_by_email(login)
    if not user or not user.check_password(password):
        return None
    return user
