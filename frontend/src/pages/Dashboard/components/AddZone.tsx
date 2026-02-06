import { useState, useCallback, useRef } from "react";
import { Block } from "baseui/block";
import { Input } from "baseui/input";
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

  const showDropdown = searchResults.length > 0 && !isSearching;

  return (
    <Block marginBottom="scale800">
      <Block font="font550" marginBottom="scale400">
        Add a city
      </Block>
      <Block $style={{ position: "relative", maxWidth: "400px" }}>
        <Input
          value={query}
          onChange={handleQueryChange}
          placeholder="Search by city name..."
          clearable
          overrides={{ Root: { style: { maxWidth: "100%" } } }}
        />
        {isSearching && (
          <Block
            marginTop="scale200"
            font="font200"
            color="contentSecondary"
            $style={{ position: "absolute", top: "100%", left: 0, marginTop: "4px" }}
          >
            Searching...
          </Block>
        )}
        {showDropdown && (
          <ul
            role="listbox"
            aria-label="City search results"
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              margin: 0,
              marginTop: "4px",
              padding: "6px 0",
              listStyle: "none",
              background: "#fff",
              border: "1px solid #e1e5e9",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              maxHeight: "280px",
              overflowY: "auto",
              zIndex: 1000,
            }}
          >
            {searchResults.slice(0, 8).map((city) => (
              <li key={`${city.lat}-${city.lon}`} role="option">
                <button
                  type="button"
                  onClick={() => handleSelectCity(city)}
                  disabled={createMutation.isPending}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "none",
                    background: "none",
                    textAlign: "left",
                    fontSize: "14px",
                    cursor: createMutation.isPending ? "not-allowed" : "pointer",
                    color: "#0d1117",
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={(e) => {
                    if (!createMutation.isPending) e.currentTarget.style.background = "#f1f3f5";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "none";
                  }}
                >
                  {city.name}
                  {city.region ? `, ${city.region}` : ""} · {city.country}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Block>
    </Block>
  );
}
