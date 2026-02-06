import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { zonesApi } from "../endpoints/zones";
import type { CreateZoneBody, UpdateZoneBody } from "../types";

const ZONES_QUERY_KEY = ["zones"] as const;

export function useZonesQuery(token: string | null, params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: [...ZONES_QUERY_KEY, token ?? "anon", params?.limit, params?.offset],
    queryFn: () => zonesApi.list(params),
    enabled: Boolean(token),
  });
}

export function useZoneQuery(token: string | null, zoneId: number | null) {
  return useQuery({
    queryKey: [...ZONES_QUERY_KEY, "detail", token ?? "anon", zoneId],
    queryFn: () => zonesApi.get(zoneId!),
    enabled: Boolean(token && zoneId != null),
  });
}

export function useCreateZoneMutation(token: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateZoneBody) => zonesApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ZONES_QUERY_KEY });
    },
  });
}

export function useUpdateZoneMutation(token: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ zoneId, body }: { zoneId: number; body: UpdateZoneBody }) =>
      zonesApi.update(zoneId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ZONES_QUERY_KEY });
    },
  });
}

export function useDeleteZoneMutation(token: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (zoneId: number) => zonesApi.delete(zoneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ZONES_QUERY_KEY });
    },
  });
}

export function useRefreshZoneWeatherMutation(token: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (zoneId: number) => zonesApi.refreshWeather(zoneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ZONES_QUERY_KEY });
    },
  });
}
