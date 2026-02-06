import { Button } from "baseui/button";
import { TrashCanFilled } from "baseui/icon";
import { Spinner } from "baseui/spinner";
import { useMemo, useState } from "react";
import { useZonesQuery } from "../../../../shared/api/queries/use-zones";
import type { Zone } from "../../../../shared/api/types";
import { useAppSelector } from "../../../../shared/redux";
import styles from "./ZonesTable.module.css";

const PAGE_SIZE = 10;

const EditIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm.176 4.823L3.7 14.64 2.36 13.3l7.39-7.39 1.35 1.35Z" />
  </svg>
);

const RefreshIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <path d="M8 2.5a5.5 5.5 0 1 0 5.5 5.5.75.75 0 0 1 1.5 0A7 7 0 1 1 8 1v1.5a.5.5 0 0 1-.854.354L5.646 1.646a.5.5 0 0 1 0 .708l1.5 1.5A.5.5 0 0 1 8 3.5V2.5Z" />
  </svg>
);

type SortKey = "name" | "city_name" | "temp" | "updated";
type SortDir = "asc" | "desc";

interface SortHeaderProps {
  label: string;
  columnKey: SortKey;
  currentSortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}

function SortHeader({ label, columnKey, currentSortKey, sortDir, onSort }: SortHeaderProps) {
  const isActive = currentSortKey === columnKey;
  const icon =
    !isActive ? (
      <span className={styles.sortIconInactive} aria-hidden>↕</span>
    ) : sortDir === "asc" ? (
      <span className={styles.sortIcon} aria-hidden>↑</span>
    ) : (
      <span className={styles.sortIcon} aria-hidden>↓</span>
    );
  return (
    <th>
      <button type="button" onClick={() => onSort(columnKey)} className={styles.sortButton}>
        {label}
        {icon}
      </button>
    </th>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

interface ZonesTableProps {
  onEdit: (zone: Zone) => void;
  onDelete: (zone: Zone) => void;
  onRefresh: (zone: Zone) => void;
  refreshingZoneId: number | null;
}

export function ZonesTable({ onEdit, onDelete, onRefresh, refreshingZoneId }: ZonesTableProps) {
  const token = useAppSelector((state) => state.auth.token);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const { data, isLoading, isError, error } = useZonesQuery(token, {
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const sortedItems = useMemo(() => {
    const items = data?.items ?? [];
    const arr = [...items];
    arr.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;
      switch (sortKey) {
        case "name":
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case "city_name":
          aVal = a.city_name.toLowerCase();
          bVal = b.city_name.toLowerCase();
          break;
        case "temp":
          aVal = a.weather?.temperature_c ?? -999;
          bVal = b.weather?.temperature_c ?? -999;
          break;
        case "updated":
          aVal = a.weather?.cached_at ?? a.updated_at ?? "";
          bVal = b.weather?.cached_at ?? b.updated_at ?? "";
          break;
        default:
          return 0;
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [data?.items, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingWrap}>
        <Spinner $size={40} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.error}>
        {error instanceof Error ? error.message : "Failed to load zones"}
      </div>
    );
  }

  if (total === 0) {
    return <div className={styles.noData}>No zones yet. Add one using the search above.</div>;
  }

  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

  return (
    <>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.colNum}>#</th>
              <SortHeader
                label="Name"
                columnKey="name"
                currentSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
              <SortHeader
                label="City"
                columnKey="city_name"
                currentSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
              <th>Country</th>
              <SortHeader
                label="Temp"
                columnKey="temp"
                currentSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
              <th>Conditions</th>
              <SortHeader
                label="Updated"
                columnKey="updated"
                currentSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
              <th className={styles.colActions}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((zone, idx) => (
              <tr key={zone.id}>
                <td className={styles.colNum}>{start + idx}</td>
                <td>{zone.name}</td>
                <td>{zone.city_name}</td>
                <td>{zone.country_code}</td>
                <td>
                  {zone.weather != null ? `${Math.round(zone.weather.temperature_c)}°C` : "—"}
                </td>
                <td>{zone.weather?.conditions ?? "—"}</td>
                <td>{zone.weather?.cached_at ? formatDate(zone.weather.cached_at) : "—"}</td>
                <td className={styles.colActions}>
                  <div className={styles.colActionsInner}>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() => onEdit(zone)}
                      title="Edit"
                      aria-label="Edit zone"
                    >
                      <EditIcon />
                    </button>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() => onRefresh(zone)}
                      disabled={refreshingZoneId === zone.id}
                      title="Refresh weather"
                      aria-label="Refresh weather"
                    >
                      {refreshingZoneId === zone.id ? <Spinner $size={16} /> : <RefreshIcon />}
                    </button>
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.delete}`}
                      onClick={() => onDelete(zone)}
                      title="Delete"
                      aria-label="Delete zone"
                    >
                      <TrashCanFilled size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <span className={styles.paginationInfo}>
          {start}–{end} of {total}
        </span>
        <div className={styles.paginationButtons}>
          <Button
            size="compact"
            kind="tertiary"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className={styles.paginationInfo}>
            Page {page} of {totalPages}
          </span>
          <Button
            size="compact"
            kind="tertiary"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}
