/**
 * API types aligned with backend OpenAPI schemas.
 */

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface WeatherSnapshot {
  temperature_c: number;
  humidity: number;
  conditions: string;
  wind_speed_kmh: number;
  cached_at: string;
}

export interface Zone {
  id: number;
  user_id: number;
  name: string;
  city_name: string;
  country_code: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
  weather?: WeatherSnapshot | null;
}

export interface ZonesListResponse {
  items: Zone[];
  total: number;
}

export interface CitySearchItem {
  id: number;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
}

export interface AuthLoginBody {
  login: string;
  password: string;
}

export interface AuthRegisterBody {
  username: string;
  email: string;
  password: string;
}

export interface AuthSuccessResponse {
  user: User;
  access_token: string;
}

export interface CreateZoneBody {
  name: string;
  city_name: string;
  country_code: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateZoneBody {
  name?: string;
}
