"""Shared infra: Flask-SQLAlchemy (domains use this db instance)."""

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
