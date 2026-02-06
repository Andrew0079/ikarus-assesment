"""Zones domain: WeatherZone model."""

from datetime import datetime

from app.extensions import db


class WeatherZone(db.Model):
    __tablename__ = "weather_zones"
    __table_args__ = (
        db.UniqueConstraint(
            "user_id", "city_name", "country_code", name="uq_user_city_country"
        ),
    )

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey("users.id"), nullable=False, index=True
    )
    name = db.Column(db.String(120), nullable=False)
    city_name = db.Column(db.String(120), nullable=False)
    country_code = db.Column(db.String(10), nullable=False)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    def to_dict(self, weather=None):
        d = {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "city_name": self.city_name,
            "country_code": self.country_code,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if weather is not None:
            d["weather"] = weather
        return d
