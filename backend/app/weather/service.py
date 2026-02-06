"""Weather: search cities, get current weather with cache (TTL) and fallback."""

import time
from datetime import datetime, timedelta

from flask import current_app

from app.extensions import db
from app.integrations.openweathermap import (
    OpenWeatherMapError,
    current_weather,
    search_cities,
)
from app.weather.models import WeatherCache

# Short in-memory cache for search (dedupe rapid identical requests; TTL 5s)
_SEARCH_CACHE: dict[str, tuple[list[dict], float]] = {}
_SEARCH_CACHE_TTL = 5.0


def search_cities_query(query: str) -> list[dict]:
    """Search cities via OpenWeatherMap Geocoding. Returns [] if no key or on error. Dedupes within 5s."""
    q = (query or "").strip().lower()
    if not q:
        return []
    now = time.monotonic()
    if q in _SEARCH_CACHE:
        cached_result, expiry = _SEARCH_CACHE[q]
        if expiry > now:
            return cached_result
        del _SEARCH_CACHE[q]
    api_key = current_app.config.get("OPENWEATHERMAP_API_KEY") or ""
    if not api_key:
        return []
    try:
        result = search_cities(api_key, query.strip())
        _SEARCH_CACHE[q] = (result, now + _SEARCH_CACHE_TTL)
        return result
    except (OpenWeatherMapError, Exception):
        return []


def get_current_weather(lat: float, lon: float) -> dict | None:
    """
    Get current weather for lat/lon. Uses cache (TTL from config); calls API on miss.
    On API error, returns cached data if still valid, else None.
    """
    api_key = (current_app.config.get("OPENWEATHERMAP_API_KEY") or "").strip()
    ttl_min = current_app.config.get("WEATHER_CACHE_TTL_MINUTES") or 20
    location_key = WeatherCache.make_key(lat=lat, lon=lon)
    now = datetime.utcnow()
    expires_at = now + timedelta(minutes=ttl_min)

    # Try cache first
    cached = (
        db.session.query(WeatherCache)
        .filter(
            WeatherCache.location_key == location_key,
            WeatherCache.expires_at > now,
        )
        .first()
    )
    if cached:
        return cached.to_dict()

    # Call API if we have a key
    if api_key:
        try:
            raw = current_weather(api_key, lat, lon)
            if raw:
                row = WeatherCache(
                    location_key=location_key,
                    temperature_c=raw.get("temperature_c"),
                    humidity=raw.get("humidity"),
                    conditions=raw.get("conditions"),
                    wind_speed_kmh=raw.get("wind_speed_kmh"),
                    expires_at=expires_at,
                )
                existing = (
                    db.session.query(WeatherCache)
                    .filter(WeatherCache.location_key == location_key)
                    .first()
                )
                if existing:
                    existing.temperature_c = row.temperature_c
                    existing.humidity = row.humidity
                    existing.conditions = row.conditions
                    existing.wind_speed_kmh = row.wind_speed_kmh
                    existing.cached_at = now
                    existing.expires_at = expires_at
                else:
                    db.session.add(row)
                db.session.commit()
                return (existing or row).to_dict()
        except OpenWeatherMapError:
            # Fallback: return stale cache if any
            stale = (
                db.session.query(WeatherCache)
                .filter(WeatherCache.location_key == location_key)
                .first()
            )
            if stale:
                return stale.to_dict()
        except Exception:
            stale = (
                db.session.query(WeatherCache)
                .filter(WeatherCache.location_key == location_key)
                .first()
            )
            if stale:
                return stale.to_dict()

    return None
