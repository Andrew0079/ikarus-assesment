"""Alembic env: use app config and domain models."""

from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config
from sqlalchemy import pool

from config import SQLALCHEMY_DATABASE_URI
from app.extensions import db

# Import all domain models so db.metadata has every table
from domains.auth.models import User  # noqa: F401
from domains.zones.models import WeatherZone  # noqa: F401
from domains.weather.models import WeatherCache  # noqa: F401

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)
config.set_main_option("sqlalchemy.url", SQLALCHEMY_DATABASE_URI)

target_metadata = db.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        {"sqlalchemy.url": SQLALCHEMY_DATABASE_URI},
        prefix="",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
