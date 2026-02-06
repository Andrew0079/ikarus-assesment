"""Weather: Connexion handlers for search and current."""

from app.weather.service import get_current_weather, search_cities_query


def weather_search_get(q):
    """GET /api/weather/search?q= - search cities (OpenWeatherMap Geocoding)."""
    results = search_cities_query(q or "")
    return results, 200


def weather_current_get(lat, lon):
    """GET /api/weather/current?lat=&lon= - current weather (cached)."""
    try:
        lat_f = float(lat)
        lon_f = float(lon)
    except (TypeError, ValueError):
        return {"message": "lat and lon must be numbers"}, 400
    data = get_current_weather(lat_f, lon_f)
    if not data:
        return {"message": "Weather unavailable"}, 503
    return data, 200
