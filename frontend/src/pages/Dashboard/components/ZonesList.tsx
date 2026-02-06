import { Block } from "baseui/block";
import { Spinner } from "baseui/spinner";
import { useAppSelector } from "../../../shared/redux";
import { useZonesQuery } from "../../../shared/api/queries/use-zones";
import { ZoneCard } from "./ZoneCard";
import type { Zone } from "../../../shared/api/types";

interface ZonesListProps {
  onEdit: (zone: Zone) => void;
  onDelete: (zone: Zone) => void;
  onRefresh: (zone: Zone) => void;
  refreshingZoneId: number | null;
}

export function ZonesList({ onEdit, onDelete, onRefresh, refreshingZoneId }: ZonesListProps) {
  const token = useAppSelector((state) => state.auth.token);
  const { data, isLoading, isError, error } = useZonesQuery(token);

  if (isLoading) {
    return (
      <Block display="flex" justifyContent="center" padding="scale800">
        <Spinner $size={40} />
      </Block>
    );
  }

  if (isError) {
    return (
      <Block padding="scale600" color="negative">
        {error instanceof Error ? error.message : "Failed to load zones"}
      </Block>
    );
  }

  const zones = data?.items ?? [];

  if (zones.length === 0) {
    return (
      <Block padding="scale600" color="contentSecondary">
        No zones yet. Add one using the search above.
      </Block>
    );
  }

  return (
    <Block
      display="grid"
      gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))"
      gridGap="scale600"
    >
      {zones.map((zone) => (
        <ZoneCard
          key={zone.id}
          zone={zone}
          onEdit={onEdit}
          onDelete={onDelete}
          onRefresh={onRefresh}
          isRefreshing={refreshingZoneId === zone.id}
        />
      ))}
    </Block>
  );
}
