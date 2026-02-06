"""Zones: CRUD and ownership checks; attach weather when returning zones."""

from flask import current_app

from app.extensions import db
from app.weather.service import get_current_weather
from app.zones.models import WeatherZone


def _attach_weather(zone: WeatherZone) -> dict:
    """Return zone as dict with weather if lat/lon present."""
    weather = None
    if zone.latitude is not None and zone.longitude is not None:
        weather = get_current_weather(zone.latitude, zone.longitude)
    return zone.to_dict(weather=weather)


def list_for_user(
    user_id: int, limit: int = 50, offset: int = 0
) -> tuple[list[dict], int]:
    """
    List zones for user with weather. Returns (items, total).
    """
    q = (
        db.session.query(WeatherZone)
        .filter(WeatherZone.user_id == user_id)
        .order_by(WeatherZone.updated_at.desc())
    )
    total = q.count()
    zones = q.offset(offset).limit(max(1, min(100, limit))).all()
    return ([_attach_weather(z) for z in zones], total)


def get_by_id_for_user(zone_id: int, user_id: int) -> dict | None:
    """
    Get zone by id if it belongs to user. Returns zone dict with weather or None (404).
    """
    zone = (
        db.session.query(WeatherZone)
        .filter(WeatherZone.id == zone_id, WeatherZone.user_id == user_id)
        .first()
    )
    if not zone:
        return None
    return _attach_weather(zone)


def create(
    user_id: int,
    name: str,
    city_name: str,
    country_code: str,
    latitude: float | None = None,
    longitude: float | None = None,
) -> tuple[dict | None, str | None]:
    """
    Create zone for user. Enforces unique (user_id, city_name, country_code).
    Returns (zone_dict, error_message). error_message set on duplicate or DB error.
    """
    name = (name or "").strip()
    city_name = (city_name or "").strip()
    country_code = (country_code or "").strip()
    if not name or not city_name or not country_code:
        return None, "name, city_name and country_code are required"

    existing = (
        db.session.query(WeatherZone)
        .filter(
            WeatherZone.user_id == user_id,
            WeatherZone.city_name == city_name,
            WeatherZone.country_code == country_code,
        )
        .first()
    )
    if existing:
        return None, "A zone with this city and country already exists"

    try:
        zone = WeatherZone(
            user_id=user_id,
            name=name,
            city_name=city_name,
            country_code=country_code,
            latitude=latitude,
            longitude=longitude,
        )
        db.session.add(zone)
        db.session.commit()
        db.session.refresh(zone)
        return _attach_weather(zone), None
    except Exception as e:
        db.session.rollback()
        current_app.logger.exception("Zone create failed")
        return None, str(e)


def update(zone_id: int, user_id: int, name: str | None) -> dict | None:
    """
    Update zone (e.g. name) if it belongs to user. Returns updated zone dict or None (404).
    """
    zone = (
        db.session.query(WeatherZone)
        .filter(WeatherZone.id == zone_id, WeatherZone.user_id == user_id)
        .first()
    )
    if not zone:
        return None
    if name is not None:
        zone.name = (name or "").strip() or zone.name
    db.session.commit()
    db.session.refresh(zone)
    return _attach_weather(zone)


def delete(zone_id: int, user_id: int) -> bool:
    """Delete zone if it belongs to user. Returns True if deleted, False if not found."""
    zone = (
        db.session.query(WeatherZone)
        .filter(WeatherZone.id == zone_id, WeatherZone.user_id == user_id)
        .first()
    )
    if not zone:
        return False
    db.session.delete(zone)
    db.session.commit()
    return True


def refresh_weather(zone_id: int, user_id: int) -> dict | None:
    """
    Get zone by id for user and force-refresh weather (by calling get_current_weather
    which may bypass or refresh cache). Returns zone dict with weather or None (404).
    """
    zone = (
        db.session.query(WeatherZone)
        .filter(WeatherZone.id == zone_id, WeatherZone.user_id == user_id)
        .first()
    )
    if not zone:
        return None
    # Optional: invalidate cache for this lat/lon so next get_current_weather fetches fresh.
    # For MVP we just return zone with current cached/fresh weather.
    return _attach_weather(zone)
