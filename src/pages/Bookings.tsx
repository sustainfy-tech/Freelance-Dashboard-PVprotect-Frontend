import { useMemo, useState } from "react";
import { UserPlus, Info, ExternalLink, X, FileText, RefreshCw } from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import DataTable, { type Column } from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { ToolbarSearch, FilterChip } from "../components/Toolbar";
import { LoadingState, ErrorState } from "../components/AsyncStates";
import Modal from "../components/Modal";
import { useApiData } from "../hooks/useApiData";
import { listBookingRequestsForAdmin, assignTechnician } from "../api/bookings";
import { listTechniciansForAdmin } from "../api/technicians";
import type {
  ApiBookingRequest,
  BookingRequestStatus,
  ApiTechnician,
} from "../api/types";
import clsx from "clsx";


const BUCKET_NAME =  'pvprotech-blogs';
const AWS_REGION =  'ap-south-1';

// A visit-data field is either a plain value (e.g. "Generation Reading": 85)
// or an uploaded file object (e.g. "Before": { name, url, size, type }).
type VisitFileValue = {
  name: string;
  s3key: string;
  size: number;
  type: string;
};
type VisitFieldValue = string | number | boolean | VisitFileValue;

function isVisitFile(value: VisitFieldValue): value is VisitFileValue {
  return (
    typeof value === "object" &&
    value !== null &&
    "s3key" in value &&
    typeof (value as VisitFileValue).s3key === "string"
  );
}

// Visit-data files only carry the S3 object key (e.g. "/visitdata/..."),
// not a full URL — build the actual fetchable URL from it.
function s3Url(s3key: string) {
  const key = s3key.startsWith("/") ? s3key.slice(1) : s3key;
  return `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;
}

function formatBytes(bytes?: number) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

const filters: { label: string; value: BookingRequestStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Assigned", value: "assigned" },
  // { label: "In progress", value: "in_progress" },
  { label: "Submitted", value: "submitted" },
  { label: "Rejected", value: "rejected" },
];

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Bookings() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<BookingRequestStatus | "all">("pending");
  const [assignTarget, setAssignTarget] = useState<ApiBookingRequest | null>(
    null,
  );
  const [detailsTarget, setDetailsTarget] = useState<ApiBookingRequest | null>(
    null,
  );
  // Target + mode for the "View visit data" / "View reason" modal.
  const [visitTarget, setVisitTarget] = useState<ApiBookingRequest | null>(
    null,
  );
  const [visitMode, setVisitMode] = useState<"visit" | "reason">("visit");
  const [selectedTechnician, setSelectedTechnician] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  const { data, loading, error, refetch } = useApiData(
    () => listBookingRequestsForAdmin(status === "all" ? undefined : status),
    [status],
  );

  const {
    data: technicianData,
    loading: techniciansLoading,
    error: techniciansError,
  } = useApiData(() => listTechniciansForAdmin(), []);

  // NOTE: /app-users/all's real response shape hasn't been fully confirmed
  // yet — apiRequest() already unwraps the top-level { success, data }
  // envelope, but `data` itself may be an array directly, or an object
  // wrapping the array under some key (e.g. { technicians: [...] } or
  // { users: [...] }, as seen on other endpoints in this backend). This
  // normalizes whichever shape shows up so the UI doesn't crash. Once the
  // real shape (and ApiTechnician's exact fields) are confirmed, replace
  // this with a direct `technicianData ?? []` and remove the guesswork.
  const technicians: ApiTechnician[] = useMemo(() => {
    if (Array.isArray(technicianData)) return technicianData;
    if (technicianData && typeof technicianData === "object") {
      const obj = technicianData as Record<string, unknown>;
      const candidate =
        obj.technicians ?? obj.users ?? obj.items ?? obj.results;
      if (Array.isArray(candidate)) return candidate as ApiTechnician[];
    }
    return [];
  }, [technicianData]);

  const rows = data ?? [];

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return rows;
    return rows.filter((b) =>
      [b.bookingId, b.plantName, b.plantAddress, b.serviceType, b.plantId]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [rows, query]);

  function openAssign(row: ApiBookingRequest) {
    setAssignTarget(row);
    setSelectedTechnician(row.assignedTechnicianId ?? "");
    setAssignError(null);
  }

  // Look up the technician object matching the currently selected ID.
  // Needed because the backend requires both assignedTechnicianId AND
  // assignedTechnicianName on assign — the <select> below only gives us
  // the ID, so we resolve the name from the loaded technicians list.
  function findTechnicianById(techId: string): ApiTechnician | undefined {
    return technicians.find((t) => String(t.verifiedUserId) === techId);
  }

  async function confirmAssign() {
    if (!assignTarget || !selectedTechnician) return;

    const tech = findTechnicianById(selectedTechnician);
    const technicianName =
      tech?.user_name && String(tech.user_name).trim()
        ? String(tech.user_name).trim()
        : null;

    if (!technicianName) {
      setAssignError(
        "Could not resolve the selected technician's name. Try reselecting them.",
      );
      return;
    }

    setAssigning(true);
    setAssignError(null);
    try {
      await assignTechnician(
        assignTarget.bookingId,
        selectedTechnician,
        technicianName,
      );
      setAssignTarget(null);
      refetch();
    } catch (err) {
      setAssignError(
        err instanceof Error ? err.message : "Could not assign technician.",
      );
    } finally {
      setAssigning(false);
    }
  }

  function openDetails(row: ApiBookingRequest) {
    setDetailsTarget(row);
  }

  // Opens the visit-data/reason modal depending on the row's status.
  function openVisit(row: ApiBookingRequest, mode: "visit" | "reason") {
    setVisitTarget(row);
    setVisitMode(mode);
  }

  const columns: Column<ApiBookingRequest>[] = [
    {
      header: "Plant",
      accessor: (b) => (
        <button
          onClick={() => openDetails(b)}
          className="font-mono text-gold hover:underline"
        >
          {b.plantName ?? b.plantId ?? "—"}
        </button>
      ),
    },
    {
      header: "Requested Service",
      accessor: (b) => (
        <div>
          <p className="text-hi">{b.serviceType ?? "—"}</p>
          <p className="font-mono text-[11px] text-faint">
            {b.plantAddress ?? "—"}
          </p>
        </div>
      ),
    },
    {
      header: "Requested for",
      accessor: (b) => (
        <span className="font-mono text-[12px] text-lo">
          {formatDate(b.preferredDate)}
        </span>
      ),
    },
    {
      header: "Technician",
      accessor: (b) =>
        b.assignedTechnicianName ? (
          <span className="text-hi">{b.assignedTechnicianName}</span>
        ) : (
          <span className="text-faint">Unassigned</span>
        ),
    },
    { header: "Status", accessor: (b) => <StatusBadge status={b.status} /> },
    {
      header: "Visit",
      accessor: (b) => {
        if (b.status === "submitted") {
          return (
            <button
              onClick={() => openVisit(b, "visit")}
              className="rounded-sm border border-emerald-600/40 bg-emerald-600/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-emerald-400 transition-colors hover:bg-emerald-600/20"
            >
              View visit data
            </button>
          );
        }
        if (b.status === "rejected") {
          return (
            <button
              onClick={() => openVisit(b, "reason")}
              className="rounded-sm border border-red-600/40 bg-red-600/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-red-400 transition-colors hover:bg-red-600/20"
            >
              View reason
            </button>
          );
        }
        return <span className="text-faint">—</span>;
      },
    },
    {
      header: "Actions",
      accessor: (b) => (
        <div className="flex items-center gap-3">
          {(b.status === "pending" || b.status === "rejected") && (
            <button
              onClick={() => openAssign(b)}
              className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wide text-gold hover:opacity-80"
            >
              <UserPlus size={13} /> Assign
            </button>
          )}

          <button
            onClick={() => openDetails(b)}
            className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wide text-lo hover:text-hi"
          >
            <Info size={13} /> Details
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <SectionHeader
        eyebrow="admin/bookings/requests"
        title="Bookings & assignments"
        description="Live booking requests from the Central Backend — assign a technician or view full request details."
        actions={
          <button
            onClick={refetch}
            className="flex items-center gap-1.5 rounded-sm border border-surface3 px-3.5 py-2 font-mono text-[11px] font-medium uppercase tracking-wide text-lo transition-opacity hover:bg-surface3 disabled:opacity-50"
          >
           <RefreshCw size={14} className={clsx(loading && "animate-spin")} />
              Refresh
          </button>
        }
      />
      

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <ToolbarSearch
          value={query}
          onChange={setQuery}
          placeholder="Search plant, service, address…"
        />
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <FilterChip
              key={f.value}
              label={f.label}
              active={status === f.value}
              onClick={() => setStatus(f.value)}
            />
          ))}
        </div>
      </div>

      {loading && <LoadingState label="Loading booking requests…" />}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && (
        <>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(b) => b.bookingId}
          />
          <p className="mt-3 font-mono text-[11px] text-faint">
            Showing {filtered.length} of {rows.length} requests{" "}
            {status !== "all" && `· status: ${status}`}
          </p>
        </>
      )}

      {assignTarget && (
        <Modal
          title={`Assign technician — ${assignTarget.plantName ?? assignTarget.bookingId}`}
          onClose={() => setAssignTarget(null)}
        >
          <p className="mb-4 text-[13px] text-lo">
            {assignTarget.serviceType ?? "Service"} at{" "}
            {assignTarget.plantAddress ?? "—"}.
          </p>
          <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wide text-faint">
            Technician
          </label>

          {techniciansLoading && (
            <p className="mb-4 text-[12px] text-faint">Loading technicians…</p>
          )}
          {!techniciansLoading && techniciansError && (
            <p className="mb-4 text-[12px] text-danger">
              Could not load technicians: {techniciansError}
            </p>
          )}
          {!techniciansLoading && !techniciansError && (
            <select
              value={selectedTechnician}
              onChange={(e) => setSelectedTechnician(e.target.value)}
              className="mb-4 w-full rounded-sm border border-border bg-surface2 px-3 py-2 text-[13px] text-hi focus:border-gold-dim focus:outline-none"
            >
              <option value="">Select a technician…</option>
              {technicians?.map((t, idx) => {
                const techId = t.verifiedUserId
                  ? String(t.verifiedUserId)
                  : `tech-${idx}`;
                const displayName =
                  t.user_name && String(t.user_name).trim()
                    ? String(t.user_name)
                    : `Technician ${idx + 1}`;
                return (
                  <option key={techId} value={techId}>
                    {displayName}
                    {t.address ? ` — ${String(t.address?.city)}` : ""}
                    {/* {t.status ? ` (${String(t.status)})` : ""} */}
                  </option>
                );
              })}
            </select>
          )}

          {assignError && (
            <p className="mb-3 text-[12px] text-danger">{assignError}</p>
          )}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setAssignTarget(null)}
              className="rounded-sm border border-border px-3.5 py-2 font-mono text-[11px] uppercase tracking-wide text-lo hover:text-hi"
            >
              Cancel
            </button>
            <button
              onClick={confirmAssign}
              disabled={!selectedTechnician || assigning}
              className="rounded-sm bg-gold px-3.5 py-2 font-mono text-[11px] font-medium uppercase tracking-wide text-bg disabled:opacity-50"
            >
              {assigning ? "Assigning…" : "Confirm assignment"}
            </button>
          </div>
        </Modal>
      )}

      {detailsTarget && (
        <Modal
          title={`Request — ${detailsTarget.plantName ?? detailsTarget.bookingId}`}
          onClose={() => setDetailsTarget(null)}
        >
          <dl className="space-y-3 text-[13px]">
            <DetailRow
              label="Booking ID"
              value={detailsTarget.bookingId.slice(0,8)}
              mono
            />
            <DetailRow
              label="Status"
              value={<StatusBadge status={detailsTarget.status} />}
            />
            <DetailRow label="Service type" value={detailsTarget.serviceType} />
            <DetailRow label="Plant name" value={detailsTarget.plantName} />
            <DetailRow label="Plant ID" value={detailsTarget.plantId?.slice(0,8)} mono />
            <DetailRow
              label="Plant address"
              value={detailsTarget.plantAddress}
            />
            <DetailRow
              label="Preferred date"
              value={formatDate(detailsTarget.preferredDate)}
            />
            <DetailRow label="Notes" value={detailsTarget.notes} />
            <DetailRow
              label="Assigned technician"
              value={detailsTarget.assignedTechnicianName ?? "Unassigned"}
            />
            <DetailRow
              label="Technician ID"
              value={detailsTarget.assignedTechnicianId ?? "—"}
              mono
            />
            <DetailRow label="User ID" value={detailsTarget.userId} mono />
            <DetailRow
              label="Created at"
              value={formatDateTime(detailsTarget.createdAt)}
            />
            <DetailRow
              label="Updated at"
              value={formatDateTime(detailsTarget.updatedAt)}
            />
          </dl>

          <div className="mt-5 flex justify-end">
            <button
              onClick={() => setDetailsTarget(null)}
              className="rounded-sm border border-border px-3.5 py-2 font-mono text-[11px] uppercase tracking-wide text-lo hover:text-hi"
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      {visitTarget && (
        <Modal
          title={
            visitMode === "visit"
              ? `Visit data — ${visitTarget.plantName ?? visitTarget.bookingId}`
              : `Rejection reason — ${visitTarget.plantName ?? visitTarget.bookingId}`
          }
          onClose={() => setVisitTarget(null)}
          // NOTE: assumes Modal forwards this to its dialog container.
          // If Modal doesn't accept this prop yet, add one — see note below.
          widthClassName={visitMode === "visit" ? "w-[75vw] max-w-[75vw]" : undefined}
        >
          {visitMode === "visit" ? (
            <VisitDataView
              visitData={(visitTarget as any).visitData}
              action={(visitTarget as any).action}
              technicianName={visitTarget.assignedTechnicianName}
              technicianId={visitTarget.assignedTechnicianId}
            />
          ) : (
            <p className="text-[13px] leading-relaxed text-hi">
              {(visitTarget as any).action?.reason ??
                (visitTarget as any).rejectionReason ??
                (visitTarget as any).reason ??
                "No reason was provided for this rejection."}
            </p>
          )}

          <div className="mt-5 flex justify-end">
            <button
              onClick={() => setVisitTarget(null)}
              className="rounded-sm border border-border px-3.5 py-2 font-mono text-[11px] uppercase tracking-wide text-lo hover:text-hi"
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Renders the visitData object across a horizontal layout: a left info
// column (technician, accepted-at, readings) and a right column with
// photos (tap to open a fullscreen lightbox) and documents ("View doc").
function VisitDataView({
  visitData,
  action,
  technicianName,
  technicianId,
}: {
  visitData?: Record<string, VisitFieldValue> | null;
  action?: { status?: string; updatedAt?: string } | null;
  technicianName?: string | null;
  technicianId?: string | null;
}) {
  // Currently open fullscreen photo, if any.
  const [lightbox, setLightbox] = useState<{
    url: string;
    label: string;
  } | null>(null);

  const entries = Object.entries(visitData ?? {});
  const fileEntries = entries.filter(([, v]) => isVisitFile(v)) as Array<
    [string, VisitFileValue]
  >;
  const plainEntries = entries.filter(([, v]) => !isVisitFile(v));

  const imageEntries = fileEntries.filter(([, file]) =>
    file.type?.startsWith("image/"),
  );
  const docEntries = fileEntries.filter(
    ([, file]) => !file.type?.startsWith("image/"),
  );

  

  const hasVisitData = entries.length > 0;

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start">
      {/* Left: technician, accepted-at, and any plain readings */}
      <div className="shrink-0 md:w-64">
        <dl className="space-y-2 text-[13px]">
          <div className="flex items-center justify-between gap-4 border-b border-border pb-2">
            <dt className="font-mono text-[10.5px] uppercase tracking-widest text-faint">
              Technician
            </dt>
            <dd className="text-right text-hi">{technicianName ?? "—"}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-b border-border pb-2">
            <dt className="font-mono text-[10.5px] uppercase tracking-widest text-faint">
              Technician ID
            </dt>
            <dd className="text-right font-mono text-[12px] text-hi">
              {technicianId ?? "—"}
            </dd>
          </div>
          {action?.status && (
            <div className="flex items-center justify-between gap-4 border-b border-border pb-2">
              <dt className="font-mono text-[10.5px] uppercase tracking-widest text-faint">
                Accepted at
              </dt>
              <dd className="text-right text-hi">
                {action.updatedAt ? formatDateTime(action.updatedAt) : "—"}
              </dd>
            </div>
          )}
          {plainEntries.map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4 border-b border-border pb-2 last:border-0"
            >
              <dt className="font-mono text-[10.5px] uppercase tracking-widest text-faint">
                {label}
              </dt>
              <dd className="text-right text-hi">{String(value)}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Right: photos + documents */}
      <div className="min-w-0 flex-1 space-y-5">
        {!hasVisitData && (
          <p className="text-[13px] text-faint">
            No visit data has been submitted for this booking yet.
          </p>
        )}

        {imageEntries.length > 0 && (
          <div>
            <p className="mb-2 font-mono text-[10.5px] uppercase tracking-widest text-faint">
              Photos
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {imageEntries.map(([label, file]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() =>
                    setLightbox({ url: s3Url(file.s3key), label })
                  }
                  className="group block overflow-hidden rounded-sm border border-border bg-surface2 text-left"
                >
                  <img
                    src={s3Url(file.s3key)}
                    alt={label}
                    className="h-28 w-full object-cover transition-opacity group-hover:opacity-80"
                  />
                  <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                    <span className="truncate font-mono text-[10.5px] text-hi">
                      {label}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] text-faint">
                      {formatBytes(file.size)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {docEntries.length > 0 && (
          <div>
            <p className="mb-2 font-mono text-[10.5px] uppercase tracking-widest text-faint">
              Documents
            </p>
            <div className="space-y-2">
              {docEntries.map(([label, file]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3 rounded-sm border border-border bg-surface2 px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText size={14} className="shrink-0 text-faint" />
                    <div className="min-w-0">
                      <p className="truncate text-[12px] text-hi">{label}</p>
                      <p className="truncate font-mono text-[10px] text-faint">
                        {file.name}
                        {file.size ? ` · ${formatBytes(file.size)}` : ""}
                      </p>
                    </div>
                  </div>
                  <a
                    href={s3Url(file.s3key)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex shrink-0 items-center gap-1 rounded-sm border border-border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-wide text-lo hover:text-hi"
                  >
                    <ExternalLink size={12} /> View doc
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white hover:bg-black/60"
          >
            <X size={18} />
          </button>
          <div className="flex max-h-full max-w-full flex-col items-center gap-2">
            <img
              src={lightbox.url}
              alt={lightbox.label}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] max-w-full rounded-sm object-contain"
            />
            <p className="font-mono text-[11px] uppercase tracking-wide text-white/70">
              {lightbox.label}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-2 last:border-0 last:pb-0">
      <dt className="font-mono text-[10.5px] uppercase tracking-widest text-faint">
        {label}
      </dt>
      <dd
        className={`text-right text-hi ${mono ? "font-mono text-[12px]" : ""}`}
      >
        {value === undefined || value === null || value === "" ? "—" : value}
      </dd>
    </div>
  );
}