"""Initial tables: users, weather_zones, weather_cache (domain-driven).

Revision ID: 001
Revises:
Create Date: 2025-01-01 00:00:00

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("username", sa.String(80), nullable=False),
        sa.Column("email", sa.String(120), nullable=False),
        sa.Column("password_hash", sa.String(128), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)
    op.create_index(op.f("ix_users_username"), "users", ["username"], unique=True)

    op.create_table(
        "weather_zones",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("city_name", sa.String(120), nullable=False),
        sa.Column("country_code", sa.String(10), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "user_id", "city_name", "country_code", name="uq_user_city_country"
        ),
    )
    op.create_index(
        op.f("ix_weather_zones_user_id"), "weather_zones", ["user_id"], unique=False
    )

    op.create_table(
        "weather_cache",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("location_key", sa.String(120), nullable=False),
        sa.Column("temperature_c", sa.Float(), nullable=True),
        sa.Column("humidity", sa.Integer(), nullable=True),
        sa.Column("conditions", sa.String(200), nullable=True),
        sa.Column("wind_speed_kmh", sa.Float(), nullable=True),
        sa.Column("cached_at", sa.DateTime(), nullable=True),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_weather_cache_location_key"),
        "weather_cache",
        ["location_key"],
        unique=True,
    )
    op.create_index(
        op.f("ix_weather_cache_expires_at"),
        "weather_cache",
        ["expires_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_weather_cache_expires_at"), "weather_cache")
    op.drop_index(op.f("ix_weather_cache_location_key"), "weather_cache")
    op.drop_table("weather_cache")
    op.drop_index(op.f("ix_weather_zones_user_id"), "weather_zones")
    op.drop_table("weather_zones")
    op.drop_index(op.f("ix_users_username"), "users")
    op.drop_index(op.f("ix_users_email"), "users")
    op.drop_table("users")
