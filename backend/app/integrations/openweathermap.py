"""OpenWeatherMap HTTP client. Geocoding + Current weather (free tier)."""

import time

import requests

GEO_URL = "https://api.openweathermap.org/geo/1.0/direct"
WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"
TIMEOUT = 10
MAX_RETRIES = 2
RETRY_BACKOFF = (1, 2)


class OpenWeatherMapError(Exception):
    """OpenWeatherMap request failed."""

    def __init__(self, message, status_code=None, body=None):
        super().__init__(message)
        self.status_code = status_code
        self.body = body


def _get_with_retry(url: str, params: dict) -> requests.Response:
    """GET with retries on 5xx and timeout."""
    last_exc = None
    for attempt in range(MAX_RETRIES + 1):
        try:
            resp = requests.get(url, params=params, timeout=TIMEOUT)
            if resp.status_code >= 500 and attempt < MAX_RETRIES:
                last_exc = OpenWeatherMapError(
                    f"OpenWeatherMap error: {resp.status_code}",
                    status_code=resp.status_code,
                    body=resp.text,
                )
                time.sleep(RETRY_BACKOFF[attempt])
                continue
            return resp
        except (requests.Timeout, requests.ConnectionError) as e:
            last_exc = OpenWeatherMapError(str(e))
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_BACKOFF[attempt])
            else:
                raise last_exc
    raise last_exc


def search_cities(api_key: str, query: str) -> list[dict]:
    """
    Geocoding: search cities by name. Returns list of location dicts:
    [{"id", "name", "region", "country", "lat", "lon"}, ...]
    """
    if not (api_key or "").strip():
        return []
    q = (query or "").strip()
    if not q:
        return []
    resp = _get_with_retry(GEO_URL, {"q": q, "limit": 10, "appid": api_key})
    if resp.status_code != 200:
        raise OpenWeatherMapError(
            f"OpenWeatherMap geocoding failed: {resp.status_code}",
            status_code=resp.status_code,
            body=resp.text,
        )
    data = resp.json()
    if isinstance(data, dict) and data.get("cod"):
        raise OpenWeatherMapError(
            data.get("message", "Unknown error"),
            status_code=data.get("cod"),
            body=data,
        )
    out = []
    for i, loc in enumerate(data if isinstance(data, list) else []):
        out.append({
            "id": loc.get("name", "") + "," + (loc.get("country", "") or ""),
            "name": loc.get("name", ""),
            "region": loc.get("state", ""),
            "country": loc.get("country", ""),
            "lat": loc.get("lat"),
            "lon": loc.get("lon"),
        })
    return out


def current_weather(api_key: str, lat: float, lon: float) -> dict | None:
    """
    Current weather by lat/lon. Returns normalized dict:
    temperature_c, humidity, conditions, wind_speed_kmh, location (name, region, country, lat, lon).
    """
    if not (api_key or "").strip():
        return None
    resp = _get_with_retry(WEATHER_URL, {
        "lat": lat,
        "lon": lon,
        "appid": api_key,
        "units": "metric",
    })
    if resp.status_code != 200:
        raise OpenWeatherMapError(
            f"OpenWeatherMap weather failed: {resp.status_code}",
            status_code=resp.status_code,
            body=resp.text,
        )
    data = resp.json()
    if data.get("cod") and data["cod"] != 200:
        raise OpenWeatherMapError(
            data.get("message", "Unknown error"),
            status_code=data.get("cod"),
            body=data,
        )
    main = data.get("main") or {}
    weather_list = data.get("weather") or []
    cond = weather_list[0] if weather_list else {}
    wind = data.get("wind") or {}
    # wind.speed in m/s; 1 m/s = 3.6 km/h
    wind_ms = wind.get("speed")
    wind_kmh = (wind_ms * 3.6) if wind_ms is not None else None
    return {
        "temperature_c": main.get("temp"),
        "humidity": main.get("humidity"),
        "conditions": cond.get("description"),
        "wind_speed_kmh": round(wind_kmh, 1) if wind_kmh is not None else None,
        "location": {
            "name": data.get("name"),
            "region": None,
            "country": (data.get("sys") or {}).get("country"),
            "lat": data.get("coord", {}).get("lat"),
            "lon": data.get("coord", {}).get("lon"),
        },
    }
