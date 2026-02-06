"""Zones: Connexion handlers; all require JWT; 404 when zone is not owned by user."""

from flask_jwt_extended import get_jwt_identity, jwt_required

from app.zones import service as zone_service


@jwt_required()
def zones_list_get(limit: int = 50, offset: int = 0):
    user_id = int(get_jwt_identity())
    items, total = zone_service.list_for_user(user_id, limit=limit, offset=offset)
    return {"items": items, "total": total}, 200


@jwt_required()
def zones_create_post(body):
    user_id = int(get_jwt_identity())
    data = body if isinstance(body, dict) else (body or {})
    name = (data.get("name") or "").strip()
    city_name = (data.get("city_name") or "").strip()
    country_code = (data.get("country_code") or "").strip()
    latitude = data.get("latitude")
    longitude = data.get("longitude")
    if latitude is not None:
        try:
            latitude = float(latitude)
        except (TypeError, ValueError):
            latitude = None
    if longitude is not None:
        try:
            longitude = float(longitude)
        except (TypeError, ValueError):
            longitude = None

    zone_dict, err = zone_service.create(
        user_id=user_id,
        name=name,
        city_name=city_name,
        country_code=country_code,
        latitude=latitude,
        longitude=longitude,
    )
    if err:
        return {"code": "validation_error", "message": err}, 400
    return zone_dict, 201


@jwt_required()
def zones_get(zone_id: int):
    user_id = int(get_jwt_identity())
    zone = zone_service.get_by_id_for_user(zone_id, user_id)
    if zone is None:
        return {"code": "not_found", "message": "Zone not found"}, 404
    return zone, 200


@jwt_required()
def zones_put(zone_id: int, body=None):
    user_id = int(get_jwt_identity())
    data = body if isinstance(body, dict) else (body or {})
    name = data.get("name")
    zone = zone_service.update(zone_id, user_id, name=name)
    if zone is None:
        return {"code": "not_found", "message": "Zone not found"}, 404
    return zone, 200


@jwt_required()
def zones_delete(zone_id: int):
    user_id = int(get_jwt_identity())
    if not zone_service.delete(zone_id, user_id):
        return {"code": "not_found", "message": "Zone not found"}, 404
    return None, 204


@jwt_required()
def zones_refresh_post(zone_id: int):
    user_id = int(get_jwt_identity())
    zone = zone_service.refresh_weather(zone_id, user_id)
    if zone is None:
        return {"code": "not_found", "message": "Zone not found"}, 404
    return zone, 200
