import { apiClient } from "../client";
import type { CitySearchItem } from "../types";

export const weatherApi = {
  searchCities: async (query: string): Promise<CitySearchItem[]> => {
    if (!query.trim()) return [];
    const { data } = await apiClient.get<CitySearchItem[]>("/api/weather/search", {
      params: { q: query.trim() },
    });
    return data;
  },
};
