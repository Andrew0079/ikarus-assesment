import { Block } from "baseui/block";
import { Button } from "baseui/button";
import { Card } from "baseui/card";
import type { Zone } from "../../../shared/api/types";

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

interface ZoneCardProps {
  zone: Zone;
  onEdit: (zone: Zone) => void;
  onDelete: (zone: Zone) => void;
  onRefresh: (zone: Zone) => void;
  isRefreshing?: boolean;
}

export function ZoneCard({ zone, onEdit, onDelete, onRefresh, isRefreshing = false }: ZoneCardProps) {
  const weather = zone.weather;

  return (
    <Card
      overrides={{
        Root: { style: { width: "100%", minWidth: "280px" } },
      }}
    >
      <Block display="flex" flexDirection="column" gridGap="scale400">
        <Block display="flex" justifyContent="space-between" alignItems="flex-start">
          <Block>
            <Block font="font450" color="contentPrimary" marginBottom="scale100">
              {zone.name}
            </Block>
            <Block font="font200" color="contentSecondary">
              {zone.city_name}
              {zone.country_code ? `, ${zone.country_code}` : ""}
            </Block>
          </Block>
        </Block>

        {weather ? (
          <Block
            paddingTop="scale300"
            paddingBottom="scale300"
            $style={{
              borderTop: "1px solid var(--borderOpaque)",
              borderBottom: "1px solid var(--borderOpaque)",
            }}
          >
            <Block display="flex" alignItems="center" gridGap="scale400">
              <Block font="font750" color="contentPrimary">
                {Math.round(weather.temperature_c)}°C
              </Block>
              <Block font="font350" color="contentSecondary">
                {weather.conditions}
              </Block>
            </Block>
            <Block font="font200" color="contentTertiary" marginTop="scale200">
              Humidity {weather.humidity}% · Wind {weather.wind_speed_kmh} km/h
            </Block>
            <Block font="font200" color="contentTertiary" marginTop="scale100">
              Updated {formatDate(weather.cached_at)}
            </Block>
          </Block>
        ) : (
          <Block font="font200" color="contentTertiary" paddingTop="scale300" paddingBottom="scale300">
            No weather data. Tap Refresh to fetch.
          </Block>
        )}

        <Block $style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          <Button size="compact" kind="tertiary" onClick={() => onEdit(zone)} disabled={isRefreshing}>
            Edit
          </Button>
          <Button
            size="compact"
            kind="tertiary"
            onClick={() => onRefresh(zone)}
            isLoading={!!isRefreshing}
            disabled={!!isRefreshing}
          >
            Refresh
          </Button>
          <Button size="compact" kind="tertiary" onClick={() => onDelete(zone)} disabled={isRefreshing}>
            Delete
          </Button>
        </Block>
      </Block>
    </Card>
  );
}
