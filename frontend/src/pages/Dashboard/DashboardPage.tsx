import { useState, useCallback } from "react";
import { Block } from "baseui/block";
import { DashboardLayout } from "../../shared/components";
import { useRefreshZoneWeatherMutation } from "../../shared/api/queries/use-zones";
import { AddZone } from "./components/AddZone";
import { ZonesTable } from "./components/ZonesTable";
import { EditZoneModal } from "./components/EditZoneModal";
import { DeleteZoneModal } from "./components/DeleteZoneModal";
import type { Zone } from "../../shared/api/types";

export function DashboardPage() {
  const [editZone, setEditZone] = useState<Zone | null>(null);
  const [deleteZone, setDeleteZone] = useState<Zone | null>(null);
  const [refreshingZoneId, setRefreshingZoneId] = useState<number | null>(null);

  const refreshMutation = useRefreshZoneWeatherMutation();

  const handleRefresh = useCallback(
    async (zone: Zone) => {
      setRefreshingZoneId(zone.id);
      try {
        await refreshMutation.mutateAsync(zone.id);
      } finally {
        setRefreshingZoneId(null);
      }
    },
    [refreshMutation]
  );

  return (
    <DashboardLayout>
      <Block marginBottom="scale800">
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 600 }}>My weather zones</h1>
        <Block font="font200" color="contentSecondary" marginTop="scale200">
          Add cities and see the latest weather.
        </Block>
      </Block>

      <AddZone />

      <ZonesTable
        onEdit={setEditZone}
        onDelete={setDeleteZone}
        onRefresh={handleRefresh}
        refreshingZoneId={refreshingZoneId}
      />

      <EditZoneModal zone={editZone} onClose={() => setEditZone(null)} />
      <DeleteZoneModal zone={deleteZone} onClose={() => setDeleteZone(null)} />
    </DashboardLayout>
  );
}
