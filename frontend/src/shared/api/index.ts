export { apiClient, configureApiClient, ApiClientError } from "./client";
export { authApi, zonesApi, weatherApi } from "./endpoints";
export {
  useZonesQuery,
  useZoneQuery,
  useCreateZoneMutation,
  useUpdateZoneMutation,
  useDeleteZoneMutation,
  useRefreshZoneWeatherMutation,
  useWeatherSearchQuery,
} from "./queries";
export type {
  User,
  Zone,
  ZonesListResponse,
  WeatherSnapshot,
  CitySearchItem,
  ApiError,
  AuthLoginBody,
  AuthRegisterBody,
  AuthSuccessResponse,
  CreateZoneBody,
  UpdateZoneBody,
} from "./types";
