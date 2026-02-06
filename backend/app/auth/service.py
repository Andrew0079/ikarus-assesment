"""Auth: register, login, get user."""

import re

from app.auth.models import User
from app.extensions import db

# Min 8 chars, at least one letter and one number
PASSWORD_PATTERN = re.compile(r"^(?=.*[A-Za-z])(?=.*\d).{8,}$")
# Email validation: basic RFC 5322 compliant pattern
EMAIL_PATTERN = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
# Username: 3-80 chars, alphanumeric, underscore, hyphen
USERNAME_PATTERN = re.compile(r"^[a-zA-Z0-9_-]{3,80}$")


def validate_email(email: str) -> tuple[bool, str]:
    """Return (ok, error_message)."""
    if not email or not email.strip():
        return False, "Email is required"
    email = email.strip()
    if len(email) > 120:
        return False, "Email must be at most 120 characters"
    if not EMAIL_PATTERN.match(email):
        return False, "Invalid email format"
    return True, ""


def validate_username(username: str) -> tuple[bool, str]:
    """Return (ok, error_message)."""
    if not username or not username.strip():
        return False, "Username is required"
    username = username.strip()
    if len(username) < 3:
        return False, "Username must be at least 3 characters"
    if len(username) > 80:
        return False, "Username must be at most 80 characters"
    if not USERNAME_PATTERN.match(username):
        return (
            False,
            "Username can only contain letters, numbers, underscores, and hyphens",
        )
    return True, ""


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
    # Validate username
    ok, err = validate_username(username)
    if not ok:
        return None, err
    username = username.strip()

    # Validate email
    ok, err = validate_email(email)
    if not ok:
        return None, err
    email = email.strip().lower()  # Normalize email to lowercase

    # Validate password
    ok, err = validate_password(password)
    if not ok:
        return None, err

    # Check for duplicates
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
