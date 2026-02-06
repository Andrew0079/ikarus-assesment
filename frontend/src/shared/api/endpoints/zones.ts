import { apiClient } from "../client";
import type { Zone, ZonesListResponse, CreateZoneBody, UpdateZoneBody } from "../types";

/** Token is attached by the client request interceptor. */
export const zonesApi = {
  list: async (params?: { limit?: number; offset?: number }): Promise<ZonesListResponse> => {
    const { data } = await apiClient.get<ZonesListResponse>("/api/zones", { params });
    return data;
  },

  get: async (zoneId: number): Promise<Zone> => {
    const { data } = await apiClient.get<Zone>(`/api/zones/${zoneId}`);
    return data;
  },

  create: async (body: CreateZoneBody): Promise<Zone> => {
    const { data } = await apiClient.post<Zone>("/api/zones", body);
    return data;
  },

  update: async (zoneId: number, body: UpdateZoneBody): Promise<Zone> => {
    const { data } = await apiClient.put<Zone>(`/api/zones/${zoneId}`, body);
    return data;
  },

  delete: async (zoneId: number): Promise<void> => {
    await apiClient.delete(`/api/zones/${zoneId}`);
  },

  refreshWeather: async (zoneId: number): Promise<Zone> => {
    const { data } = await apiClient.post<Zone>(`/api/zones/${zoneId}/refresh`, {});
    return data;
  },
};
