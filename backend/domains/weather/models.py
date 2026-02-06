"""Weather domain: WeatherCache model."""

from datetime import datetime

from app.extensions import db


def _location_key(lat=None, lon=None, city=None, country=None):
    if lat is not None and lon is not None:
        return f"latlon:{lat:.4f},{lon:.4f}"
    return f"city:{city or ''},{country or ''}"


class WeatherCache(db.Model):
    __tablename__ = "weather_cache"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    location_key = db.Column(db.String(120), unique=True, nullable=False, index=True)
    temperature_c = db.Column(db.Float, nullable=True)
    humidity = db.Column(db.Integer, nullable=True)
    conditions = db.Column(db.String(200), nullable=True)
    wind_speed_kmh = db.Column(db.Float, nullable=True)
    cached_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False, index=True)

    @classmethod
    def make_key(cls, lat=None, lon=None, city=None, country=None):
        return _location_key(lat=lat, lon=lon, city=city, country=country)

    def to_dict(self):
        return {
            "temperature_c": self.temperature_c,
            "humidity": self.humidity,
            "conditions": self.conditions,
            "wind_speed_kmh": self.wind_speed_kmh,
            "cached_at": self.cached_at.isoformat() if self.cached_at else None,
        }
