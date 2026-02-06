import { useQuery } from "@tanstack/react-query";
import { weatherApi } from "../endpoints/weather";

const WEATHER_SEARCH_QUERY_KEY = ["weather", "search"] as const;

export function useWeatherSearchQuery(query: string, enabled = true) {
  return useQuery({
    queryKey: [...WEATHER_SEARCH_QUERY_KEY, query],
    queryFn: () => weatherApi.searchCities(query),
    enabled: enabled && query.trim().length >= 2,
    staleTime: 60_000,
  });
}
