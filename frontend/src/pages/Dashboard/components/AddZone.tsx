import { useState, useCallback, useRef } from "react";
import { Block } from "baseui/block";
import { Input } from "baseui/input";
import { Button } from "baseui/button";
import { useWeatherSearchQuery } from "../../../shared/api/queries/use-weather-search";
import { useCreateZoneMutation } from "../../../shared/api/queries/use-zones";
import { useAppDispatch, addToast } from "../../../shared/redux";
import type { CitySearchItem } from "../../../shared/api/types";

const DEBOUNCE_MS = 300;

export function AddZone() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dispatch = useAppDispatch();

  const createMutation = useCreateZoneMutation();
  const { data: searchResults = [], isFetching: isSearching } = useWeatherSearchQuery(debouncedQuery);

  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setQuery(value);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setDebouncedQuery(value), DEBOUNCE_MS);
    },
    []
  );

  const handleSelectCity = useCallback(
    async (city: CitySearchItem) => {
      const countryCode = city.country.length === 2 ? city.country : city.country.slice(0, 2).toUpperCase();
      try {
        await createMutation.mutateAsync({
          name: city.name,
          city_name: city.name,
          country_code: countryCode.slice(0, 10),
          latitude: city.lat,
          longitude: city.lon,
        });
        dispatch(addToast({ type: "success", message: `Added ${city.name}` }));
        setQuery("");
        setDebouncedQuery("");
      } catch {
        // Error toast is handled by mutation default in AppProviders
      }
    },
    [createMutation, dispatch]
  );

  return (
    <Block marginBottom="scale800">
      <Block font="font550" marginBottom="scale400">
        Add a city
      </Block>
      <Input
        value={query}
        onChange={handleQueryChange}
        placeholder="Search by city name..."
        clearable
        overrides={{ Root: { style: { maxWidth: "400px" } } }}
      />
      {isSearching && (
        <Block marginTop="scale300" font="font200" color="contentSecondary">
          Searching...
        </Block>
      )}
      {searchResults.length > 0 && !isSearching && (
        <Block
          marginTop="scale400"
          display="flex"
          flexDirection="column"
          gridGap="scale200"
          $style={{ maxWidth: "400px" }}
        >
          {searchResults.slice(0, 8).map((city) => (
            <Button
              key={`${city.lat}-${city.lon}`}
              kind="tertiary"
              size="compact"
              onClick={() => handleSelectCity(city)}
              disabled={createMutation.isPending}
              overrides={{
                BaseButton: {
                  style: {
                    justifyContent: "flex-start",
                    textAlign: "left",
                  },
                },
              }}
            >
              {city.name}
              {city.region ? `, ${city.region}` : ""} · {city.country}
            </Button>
          ))}
        </Block>
      )}
    </Block>
  );
}
