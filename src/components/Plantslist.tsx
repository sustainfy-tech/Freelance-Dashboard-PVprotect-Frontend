import { startTransition, useEffect, useMemo, useState } from "react";
import { RefreshCw, X, Sun, ArrowLeft } from "lucide-react";
import SectionHeader from "./SectionHeader";
import { ToolbarSearch } from "./Toolbar";
import StatusBadge from "./StatusBadge";
import { getPlantsByClientId } from "../api/technicians";
import type {
  PlantsListProps,
  ApiPlantAddress,
} from "../types/Components/PlantList.types";
import type {
  PlantsListApiResponse,
  ApiPlant,JsonValue
} from "../types/Pages/Plant.types";



function formatLabel(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}

function formatValue(value: JsonValue | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return value.toLocaleString("en-IN");
  if (Array.isArray(value))
    return value.length ? value.map(formatValue).join(", ") : "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function formatAddress(address?: ApiPlantAddress | string): string {
  if (!address) return "—";
  if (typeof address === "string") return address;
  const parts = [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.pincode,
  ].filter((p): p is string => typeof p === "string" && p.length > 0);
  return parts.length ? parts.join(", ") : "—";
}

function formatDate(d?: string | null) {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const KNOWN_PLANT_KEYS = new Set([
  "plantId",
  "plantname",
  "userId",
  "address",
  "capacityKw",
  "status",
  "installDate",
  "lastServiceDate",
  "createdAt",
  "updatedAt",
]);

export default function PlantsList({
  clientId,
  clientName,
  onBack,
  showHeader = true,
}: PlantsListProps) {
  const [query, setQuery] = useState("");
  const [plants, setPlants] = useState<ApiPlant[]>([]);
  const [plantsLoading, setPlantsLoading] = useState(false);
  const [plantsError, setPlantsError] = useState<string | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<ApiPlant | null>(null);

  const [prevClientId, setPrevClientId] = useState(clientId);
  if (clientId !== prevClientId) {
    setPrevClientId(clientId);
    setSelectedPlant(null);
    setQuery("");
  }

  const fetchPlants = async (id: string) => {
    if (!id) {
      setPlants([]);
      return;
    }
    setPlantsLoading(true);
    setPlantsError(null);
    try {
      const response = (await getPlantsByClientId(id)) as
        | ApiPlant[]
        | PlantsListApiResponse;

      const plantRows: ApiPlant[] = Array.isArray(response)
        ? response
        : (response?.data ?? []);
      setPlants(plantRows);
    } catch (err) {
      setPlantsError(
        err instanceof Error ? err.message : "Failed to fetch plants",
      );
      setPlants([]);
    } finally {
      setPlantsLoading(false);
    }
  };

  useEffect(() => {
    startTransition(() => {
      fetchPlants(clientId);
    });
  }, [clientId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return plants;
    return plants.filter(
      (p) =>
        (p.plantname ?? "").toLowerCase().includes(q) ||
        formatAddress(p.address).toLowerCase().includes(q) ||
        p.plantId.toLowerCase().includes(q),
    );
  }, [query, plants]);

  const extraEntries = (plant: ApiPlant): [string, JsonValue][] =>
    Object.entries(plant).filter(
      ([key, value]) => !KNOWN_PLANT_KEYS.has(key) && value !== undefined,
    ) as [string, JsonValue][];

  return (
    <div>
      {showHeader && (
        <SectionHeader
          eyebrow="Assets · Solar"
          title={clientName ? `Plants · ${clientName}` : "Plants"}
          description={
            plantsLoading
              ? "Loading plants…"
              : `${filtered.length} of ${plants.length} plant${plants.length === 1 ? "" : "s"} shown.`
          }
          actions={
            <div className="flex items-center gap-2">
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center gap-1.5 rounded-sm border border-white/10 px-3.5 py-2 font-mono text-[11px] font-medium uppercase tracking-wide text-lo transition-opacity hover:opacity-90"
                >
                  <ArrowLeft size={14} /> Back
                </button>
              )}
              <button
                onClick={() => fetchPlants(clientId)}
                disabled={plantsLoading}
                className="flex items-center gap-1.5 rounded-sm border border-white/10 px-3.5 py-2 font-mono text-[11px] font-medium uppercase tracking-wide text-lo transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <RefreshCw
                  size={14}
                  className={plantsLoading ? "animate-spin" : ""}
                />{" "}
                Refresh
              </button>
            </div>
          }
        />
      )}

      {!showHeader && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[11px] text-faint">
            {plantsLoading
              ? "Loading plants…"
              : `${filtered.length} of ${plants.length} plant${plants.length === 1 ? "" : "s"} shown.`}
          </p>
          <button
            onClick={() => fetchPlants(clientId)}
            disabled={plantsLoading}
            className="flex items-center gap-1.5 rounded-sm border border-white/10 px-3.5 py-2 font-mono text-[11px] font-medium uppercase tracking-wide text-lo transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={plantsLoading ? "animate-spin" : ""}
            />{" "}
            Refresh
          </button>
        </div>
      )}

      <div className="mb-4">
        <ToolbarSearch
          value={query}
          onChange={setQuery}
          placeholder="Search plant, address…"
        />
      </div>

      {plantsError && (
        <p className="mb-3 font-mono text-[11px] text-red-400">
          Failed to load plants: {plantsError}
        </p>
      )}

      {!plantsLoading && !plantsError && filtered.length === 0 && (
        <p className="font-mono text-[12px] text-faint">No plants found.</p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((plant) => (
          <button
            key={plant.plantId}
            onClick={() => setSelectedPlant(plant)}
            className="flex flex-col items-start gap-2 rounded-sm border border-white/10 p-4 text-left transition-colors hover:border-gold/50"
          >
            <div className="flex w-full items-center justify-between">
              <Sun size={16} className="text-gold" />
              {plant.status && <StatusBadge status={plant.status} />}
            </div>
            <p className="text-hi">{plant.plantname ?? "Untitled plant"}</p>
            {plant.address && (
              <p className="font-mono text-[11px] text-lo">
                {formatAddress(plant.address)}
              </p>
            )}
            <div className="mt-1 flex flex-wrap gap-3 font-mono text-[11px] text-faint">
              <span>
                {plant.capacityKw ? `${plant.capacityKw} kW` : "— kW"}
              </span>
              <span>Installed {formatDate(plant.installDate)}</span>
            </div>
          </button>
        ))}
      </div>

      {selectedPlant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-sm border border-white/10 bg-bg p-5">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wide text-faint">
                  Plant details
                </p>
                <p className="text-hi">
                  {selectedPlant.plantname ?? "Untitled plant"}
                </p>
                <p className="font-mono text-[11px] text-faint">
                  {selectedPlant.plantId}
                </p>
              </div>
              <button
                onClick={() => setSelectedPlant(null)}
                className="text-faint hover:text-hi"
              >
                <X size={18} />
              </button>
            </div>

            <dl className="space-y-2">
              <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
                <dt className="font-mono text-[11px] uppercase tracking-wide text-faint">
                  Address
                </dt>
                <dd className="text-right text-lo">
                  {formatAddress(selectedPlant.address)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
                <dt className="font-mono text-[11px] uppercase tracking-wide text-faint">
                  Capacity
                </dt>
                <dd className="text-right font-mono text-lo">
                  {selectedPlant.capacityKw
                    ? `${selectedPlant.capacityKw} kW`
                    : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
                <dt className="font-mono text-[11px] uppercase tracking-wide text-faint">
                  Status
                </dt>
                <dd className="text-right">
                  <StatusBadge status={selectedPlant.status ?? "—"} />
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
                <dt className="font-mono text-[11px] uppercase tracking-wide text-faint">
                  Installed
                </dt>
                <dd className="text-right font-mono text-lo">
                  {formatDate(selectedPlant.installDate)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
                <dt className="font-mono text-[11px] uppercase tracking-wide text-faint">
                  Last service
                </dt>
                <dd className="text-right font-mono text-lo">
                  {formatDate(selectedPlant.lastServiceDate)}
                </dd>
              </div>

              {extraEntries(selectedPlant).map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between gap-4 border-b border-white/5 pb-2"
                >
                  <dt className="font-mono text-[11px] uppercase tracking-wide text-faint">
                    {formatLabel(key)}
                  </dt>
                  <dd className="text-right text-lo">{formatValue(value)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
