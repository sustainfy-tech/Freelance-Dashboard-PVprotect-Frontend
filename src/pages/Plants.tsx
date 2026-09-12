import { useEffect, useMemo, useState, useRef, startTransition } from "react";
import { X, RefreshCw, MapPin } from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import DataTable from "../components/DataTable";
import type { Column } from "../types/Components/DataTable.types";
import { ToolbarSearch } from "../components/Toolbar";
import clsx from "clsx";
import type {
  ApiPlant,
  PlantDetailModalProps,
  PlantMapModalProps,
  LeafletStatic,
  LeafletMap,
} from "../types/Pages/Plant.types";
import { listPlants } from "../api/plant";
import { ApiError } from "../api/http";

const LEAFLET_CSS_ID = "leaflet-css-cdn";
const LEAFLET_JS_ID = "leaflet-js-cdn";

function statusTone(status: string) {
  switch (status) {
    case "active":
      return "text-teal";
    case "inactive":
      return "text-danger";
    default:
      return "text-gold";
  }
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeHtml(value: string) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function hasCoords(p: ApiPlant) {
  return (
    typeof p.latitude === "number" &&
    typeof p.longitude === "number" &&
    !Number.isNaN(p.latitude) &&
    !Number.isNaN(p.longitude)
  );
}

export default function Plants() {
  const [query, setQuery] = useState("");
  const [plants, setPlants] = useState<ApiPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<ApiPlant | null>(null);
  const [mapPlant, setMapPlant] = useState<ApiPlant | null>(null);

  async function fetchPlants(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await listPlants();
      setPlants(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load plants");
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  }

  useEffect(() => {
    startTransition(() => {
      fetchPlants();
    });
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();

    if (!Array.isArray(plants)) {
      return [];
    }

    return plants.filter(
      (p) =>
        !q ||
        p.plantName?.toLowerCase().includes(q) ||
        p.address?.toLowerCase().includes(q) ||
        p.plantId?.toLowerCase().includes(q),
    );
  }, [plants, query]);
  console.log('plants',plants)

  const columns: Column<ApiPlant>[] = [
    {
      header: "Plant",
      accessor: (p) => (
        <button
          type="button"
          onClick={() => setSelectedPlant(p)}
          className="text-left hover:opacity-80 cursor-pointer"
        >
          <p className="text-hi underline-offset-2 hover:underline">
            {p.plantName}
          </p>
          <p className="font-mono text-[11px] text-faint">
            {p.plantId.slice(0, 8)}
          </p>
        </button>
      ),
    },
    {
      header: "Address",
      accessor: (p) => <span className="text-lo">{p.address}</span>,
    },
    {
      header: "Capacity",
      accessor: (p) => (
        <span className="font-mono">
          {p.capacityKw.toLocaleString("en-IN")} kW
        </span>
      ),
    },
    {
      header: "Install date",
      accessor: (p) => (
        <span className="font-mono text-[12px] text-lo">
          {formatDate(p.installDate)}
        </span>
      ),
    },
    {
      header: "Last serviced",
      accessor: (p) => (
        <span className="font-mono text-[12px] text-lo">
          {formatDate(p.lastServiceDate)}
        </span>
      ),
    },
    {
      header: "Location",
      accessor: (p) =>
        hasCoords(p) ? (
          <button
            type="button"
            onClick={() => setMapPlant(p)}
            className="flex items-center gap-1.5 rounded-sm border border-surface3 px-2.5 py-1.5 font-mono text-[11px] font-medium uppercase tracking-wide text-lo transition-opacity hover:bg-surface3"
          >
            <MapPin size={13} />
            View plant
          </button>
        ) : (
          <span className="font-mono text-[11px] text-faint">No location</span>
        ),
    },
    {
      header: "Status",
      accessor: (p) => (
        <span
          className={clsx(
            "font-mono text-[12px] capitalize",
            statusTone(p.status),
          )}
        >
          {p.status}
        </span>
      ),
    },
  ];

  return (
    <div>
      <SectionHeader
        eyebrow="admin/Plants"
        title="Plants"
        description="Every solar installation registered under a client, with servicing cadence and status."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchPlants(true)}
              disabled={refreshing || loading}
              className="flex items-center gap-1.5 rounded-sm border border-surface3 px-3.5 py-2 font-mono text-[11px] font-medium uppercase tracking-wide text-lo transition-opacity hover:bg-surface3 disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={clsx(refreshing && "animate-spin")}
              />
              Refresh
            </button>
          </div>
        }
      />

      <div className="mb-4">
        <ToolbarSearch
          value={query}
          onChange={setQuery}
          placeholder="Search plant, address, ID…"
        />
      </div>

      {error && (
        <div className="mb-4 rounded-sm border border-danger/40 bg-danger/10 px-3.5 py-2.5 font-mono text-[12px] text-danger">
          {error}
        </div>
      )}

      {loading ? (
        <p className="font-mono text-[12px] text-faint">Loading plants…</p>
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(p) => p.plantId}
          />
          <p className="mt-3 font-mono text-[11px] text-faint">
            Showing {filtered.length} of {plants.length} plants
          </p>
        </>
      )}

      {selectedPlant && (
        <PlantDetailModal
          plant={selectedPlant}
          onClose={() => setSelectedPlant(null)}
        />
      )}

      {mapPlant && (
        <PlantMapModal plant={mapPlant} onClose={() => setMapPlant(null)} />
      )}
    </div>
  );
}

function PlantDetailModal({ plant, onClose }: PlantDetailModalProps) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const rows: { label: string; value: string }[] = [
    { label: "Plant ID", value: plant.plantId.slice(0, 8) },
    { label: "Plant name", value: plant.plantName },
    { label: "User ID", value: plant.userId },
    { label: "Address", value: plant.address },
    {
      label: "Capacity",
      value: `${plant.capacityKw.toLocaleString("en-IN")} kW`,
    },
    { label: "Status", value: plant.status },
    { label: "Install date", value: formatDateTime(plant.installDate) },
    { label: "Last serviced", value: formatDateTime(plant.lastServiceDate) },
    { label: "Created at", value: formatDateTime(plant.createdAt) },
    { label: "Updated at", value: formatDateTime(plant.updatedAt) },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-md border border-surface3 bg-surface2 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wide text-faint">
              Plant details
            </p>
            <h3 className="text-hi text-lg">{plant.plantName}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm p-1 text-faint hover:bg-surface3 hover:text-hi"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2">
          {rows.map((r) => (
            <div
              key={r.label}
              className="flex items-center justify-between gap-4 border-b border-surface3 py-1.5 last:border-b-0"
            >
              <span className="font-mono text-[11px] uppercase tracking-wide text-faint">
                {r.label}
              </span>
              <span className="text-right font-mono text-[12px] text-lo">
                {r.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function loadLeaflet(): Promise<LeafletStatic> {
  const w = window as Window & { L?: LeafletStatic };
  if (w.L) return Promise.resolve(w.L);

  return new Promise((resolve, reject) => {
    if (!document.getElementById(LEAFLET_CSS_ID)) {
      const link = document.createElement("link");
      link.id = LEAFLET_CSS_ID;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const existingScript = document.getElementById(
      LEAFLET_JS_ID,
    ) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        const loaded = (window as Window & { L?: LeafletStatic }).L;
        if (loaded) resolve(loaded);
        else reject(new Error("Leaflet failed to initialize"));
      });
      existingScript.addEventListener("error", () =>
        reject(new Error("Failed to load Leaflet script")),
      );
      return;
    }

    const script = document.createElement("script");
    script.id = LEAFLET_JS_ID;
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => {
      const loaded = (window as Window & { L?: LeafletStatic }).L;
      if (loaded) resolve(loaded);
      else reject(new Error("Leaflet failed to initialize"));
    };
    script.onerror = () => reject(new Error("Failed to load Leaflet script"));
    document.body.appendChild(script);
  });
}

function PlantMapModal({ plant, onClose }: PlantMapModalProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;

    loadLeaflet()
      .then((L) => {
        if (cancelled || !mapContainerRef.current) return;

        const map = L.map(mapContainerRef.current, {
          zoomControl: true,
        }).setView([plant.latitude, plant.longitude], 17);
        mapInstanceRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(map);

        const popupHtml = `
          <div style="font-family: monospace; font-size: 12px; line-height: 1.5;">
            <div style="font-weight: 700; font-size: 13px; margin-bottom: 4px;">${escapeHtml(
              plant.plantName,
            )}</div>
            <div><strong>Capacity:</strong> ${plant.capacityKw.toLocaleString("en-IN")} kW</div>
            <div><strong>Installed:</strong> ${formatDate(plant.installDate)}</div>
            <div><strong>Address:</strong> ${escapeHtml(plant.address)}</div>
          </div>
        `;

        L.marker([plant.latitude, plant.longitude])
          .addTo(map)
          .bindPopup(popupHtml)
          .openPopup();
      })
      .catch(() => {
        if (!cancelled)
          setMapError("Failed to load the map. Check your network connection.");
      });

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [plant]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="flex h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-md border border-surface3 bg-surface2">
        <div className="flex items-start justify-between border-b border-surface3 px-5 py-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wide text-faint">
              Plant location
            </p>
            <h3 className="text-hi text-lg">{plant.plantName}</h3>
            <p className="font-mono text-[11px] text-faint">
              {plant.latitude.toFixed(6)}, {plant.longitude.toFixed(6)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm p-1 text-faint hover:bg-surface3 hover:text-hi"
          >
            <X size={16} />
          </button>
        </div>

        <div className="relative flex-1">
          {mapError ? (
            <div className="flex h-full items-center justify-center px-6 text-center font-mono text-[12px] text-danger">
              {mapError}
            </div>
          ) : (
            <div ref={mapContainerRef} className="h-full w-full" />
          )}
        </div>

        <div className="flex items-center justify-between border-t border-surface3 px-5 py-3">
          <div className="flex gap-6 font-mono text-[11px] text-faint">
            <span>
              <span className="text-lo">Capacity:</span>{" "}
              {plant.capacityKw.toLocaleString("en-IN")} kW
            </span>
            <span>
              <span className="text-lo">Installed:</span>{" "}
              {formatDate(plant.installDate)}
            </span>
          </div>

          <a
            href={`https://www.google.com/maps?q=${plant.latitude},${plant.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[11px] text-gold hover:underline"
          >
            Open in Google Maps ↗
          </a>
        </div>
      </div>
    </div>
  );
}
