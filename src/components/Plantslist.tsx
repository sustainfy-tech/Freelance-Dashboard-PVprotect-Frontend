import { startTransition, useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  X,
  Sun,
  ArrowLeft,
  FileImage,
  Check,
  X as XIcon,
} from "lucide-react";
import SectionHeader from "./SectionHeader";
import { ToolbarSearch } from "./Toolbar";
import StatusBadge from "./StatusBadge";
import { getPlantsByClientId } from "../api/technicians";
import type {
  PlantsListProps,
  ApiPlantAddress,
} from "../types/Components/PlantList.types";
import type {
  ApiPlant,
  JsonValue,
  ApiPlantPhoto,
  ApiSiteConditions,
  PlantPhotoWithUrl,
} from "../types/Pages/Plant.types";

// S3 bucket details used to resolve an s3key into a viewable image URL.
const BUCKET_NAME = "pvprotech-bucket-new";
const AWS_REGION = "ap-south-1";

function s3Url(s3key: string) {
  const key = s3key.startsWith("/") ? s3key.slice(1) : s3key;
  return `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;
}

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

function formatFileSize(bytes?: number): string {
  if (bytes === undefined || bytes === null) return "";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function extractPlantItems(response: unknown): ApiPlant[] | null {
  if (Array.isArray(response)) return response as ApiPlant[];
  if (!response || typeof response !== "object") return null;

  const r = response as Record<string, unknown>;

  const candidates: unknown[] = [
    r.items,
    r.data,
    r.plants,
    (r.data as Record<string, unknown> | undefined)?.items,
    (r.data as Record<string, unknown> | undefined)?.plants,
    (r.data as Record<string, unknown> | undefined)?.data,
    (
      (r.data as Record<string, unknown> | undefined)?.data as
        | Record<string, unknown>
        | undefined
    )?.items,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as ApiPlant[];
  }

  return null;
}

const KNOWN_PLANT_KEYS = new Set([
  "plantId",
  "plantName",
  "userId",
  "address",
  "capacityKw",
  "status",
  "installDate",
  "lastServiceDate",
  "createdAt",
  "updatedAt",
  "latitude",
  "longitude",
  "soilingLevel",
  "plantPhotos",
  "siteConditions",
  "noOfModules",
]);

const SITE_CONDITION_LABELS: Record<string, string> = {
  waterPumpAvailable: "Water pump available",
  waterAvailable: "Water available",
  everyModuleAccessible: "Every module accessible",
  walkwaysAvailable: "Walkways available",
  hosePipeAvailable: "Hose pipe available",
};

function PhotoThumb({
  photo,
  onClick,
}: {
  photo: PlantPhotoWithUrl;
  onClick: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      title={photo.name ?? "Plant photo"}
      className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-white/10 bg-white/5 transition-opacity hover:opacity-80"
    >
      {!imgFailed ? (
        <img
          src={photo.url}
          alt={photo.name ?? "Plant photo"}
          className="h-full w-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <FileImage size={18} className="text-faint" />
      )}
    </button>
  );
}

function PhotoRow({
  photos,
  onSelect,
}: {
  photos: PlantPhotoWithUrl[];
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {photos.map((photo, i) => (
        <PhotoThumb
          key={photo.url ?? i}
          photo={photo}
          onClick={() => onSelect(i)}
        />
      ))}
    </div>
  );
}

function PhotoLightbox({
  photos,
  startIndex,
  onClose,
}: {
  photos: PlantPhotoWithUrl[];
  startIndex: number;
  onClose: () => void;
}) {
  const [failedIdx, setFailedIdx] = useState<Set<number>>(new Set());

  return (
    <div className="fixed inset-0 z-60 flex flex-col bg-black/90">
      <div className="flex items-center justify-between p-4">
        <p className="font-mono text-[11px] uppercase tracking-wide text-faint">
          {photos.length} photo{photos.length === 1 ? "" : "s"} · scroll to view
        </p>
        <button onClick={onClose} className="text-faint hover:text-hi">
          <X size={20} />
        </button>
      </div>

      <div
        className="flex flex-1 snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4"
        ref={(el) => {
          if (!el) return;
          const target = el.children[startIndex] as HTMLElement | undefined;
          target?.scrollIntoView({
            inline: "center",
            behavior: "instant" as ScrollBehavior,
          });
        }}
      >
        {photos.map((photo, i) => {
          const failed = failedIdx.has(i);
          return (
            <div
              key={photo.url ?? i}
              className="flex w-full shrink-0 snap-center flex-col items-center justify-center gap-3"
            >
              {!failed ? (
                <img
                  src={photo.url}
                  alt={photo.name ?? "Plant photo"}
                  className="max-h-[70vh] max-w-full rounded-sm object-contain"
                  onError={() => setFailedIdx((prev) => new Set(prev).add(i))}
                />
              ) : (
                <div className="flex h-64 w-64 items-center justify-center rounded-sm bg-white/5">
                  <FileImage size={32} className="text-faint" />
                </div>
              )}
              <p className="text-[12px] text-lo">
                {photo.name ?? "Untitled photo"}
              </p>
              <p className="font-mono text-[10px] text-faint">
                {[photo.type, formatFileSize(photo.size)]
                  .filter(Boolean)
                  .join(" · ") || "—"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SiteConditionsGrid({ conditions }: { conditions: ApiSiteConditions }) {
  const entries = Object.entries(conditions).filter(
    ([, v]) => typeof v === "boolean",
  ) as [string, boolean][];

  if (entries.length === 0) return <span className="text-lo">—</span>;

  return (
    <div className="grid w-full grid-cols-1 gap-1.5 sm:grid-cols-2">
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="flex items-center justify-between gap-2 rounded-sm border border-white/5 px-2 py-1.5"
        >
          <span className="text-[11px] text-lo">
            {SITE_CONDITION_LABELS[key] ?? formatLabel(key)}
          </span>
          <span
            className={`flex items-center gap-1 font-mono text-[10px] uppercase ${
              value ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {value ? <Check size={12} /> : <XIcon size={12} />}
            {value ? "Yes" : "No"}
          </span>
        </div>
      ))}
    </div>
  );
}

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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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
      const response = await getPlantsByClientId(id);
      const plantRows = extractPlantItems(response);

      if (plantRows === null) {
        console.warn(
          "[PlantsList] Unrecognized plants response shape:",
          response,
        );
      }
      setPlants(plantRows ?? []);
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
        (p.plantName ?? "").toLowerCase().includes(q) ||
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
            <p className="text-hi">{plant.plantName ?? "Untitled plant"}</p>
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
          <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-sm border border-white/10 bg-bg p-5">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wide text-faint">
                  Plant details
                </p>
                <p className="text-hi">
                  {selectedPlant.plantName ?? "Untitled plant"}
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
                  No of modules
                </dt>
                <dd className="text-right font-mono text-lo">
                  {formatValue(
                    selectedPlant.noOfModules as JsonValue | undefined,
                  )}
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

              {Array.isArray(selectedPlant.plantPhotos) &&
                selectedPlant.plantPhotos.length > 0 && (
                  <div className="border-b border-white/5 pb-2">
                    <dt className="mb-2 font-mono text-[11px] uppercase tracking-wide text-faint">
                      Plant photos
                    </dt>
                    <dd>
                      <PhotoRow
                        photos={(selectedPlant.plantPhotos as ApiPlantPhoto[])
                          .filter((photo) => !!photo.s3key)
                          .map((photo) => ({
                            url: s3Url(photo.s3key as string),
                            name: photo.name,
                            type: photo.type,
                            size: photo.size,
                          }))}
                        onSelect={(i) => setLightboxIndex(i)}
                      />
                    </dd>
                  </div>
                )}

              {selectedPlant.siteConditions && (
                <div className="border-b border-white/5 pb-2">
                  <dt className="mb-2 font-mono text-[11px] uppercase tracking-wide text-faint">
                    Site conditions
                  </dt>
                  <dd>
                    <SiteConditionsGrid
                      conditions={
                        selectedPlant.siteConditions as unknown as ApiSiteConditions
                      }
                    />
                  </dd>
                </div>
              )}

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

      {selectedPlant &&
        lightboxIndex !== null &&
        Array.isArray(selectedPlant.plantPhotos) &&
        selectedPlant.plantPhotos.length > 0 && (
          <PhotoLightbox
            photos={(selectedPlant.plantPhotos as ApiPlantPhoto[])
              .filter((photo) => !!photo.s3key)
              .map((photo) => ({
                url: s3Url(photo.s3key as string),
                name: photo.name,
                type: photo.type,
                size: photo.size,
              }))}
            startIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
    </div>
  );
}
