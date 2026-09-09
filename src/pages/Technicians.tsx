import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Star } from "lucide-react";
import clsx from "clsx";
import SectionHeader from "../components/SectionHeader";
import DataTable, { type Column } from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { ToolbarSearch, FilterChip } from "../components/Toolbar";
import TechnicianDetailModal from "../components/TechnicianDetailModal";
import {
  listAllTechnicians,
  listTechnicianRequests,
} from "../api/technicians.js";
import type {
  Tab,
  TechniciansResponse,
  ApprovalStatus,
  ApiTechnician,
} from "../types/Pages/Technicians.types";

const technicianFilters: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Available", value: "available" },
  { label: "On job", value: "on_job" },
  { label: "Off duty", value: "off_duty" },
  { label: "Suspended", value: "suspended" },
];

const requestFilters: { label: string; value: ApprovalStatus | "all" }[] = [];

const s = (v: unknown, fallback = ""): string =>
  v === null || v === undefined ? fallback : String(v);
const n = (v: unknown, fallback = 0): number => {
  const num = Number(v);
  return Number.isFinite(num) ? num : fallback;
};

function extractList(response: TechniciansResponse): ApiTechnician[] {
  const r = response as any;
  if (Array.isArray(r)) return r;
  if (Array.isArray(r?.items)) return r.items;
  if (Array.isArray(r?.data?.items)) return r.data.items;
  return [];
}

export default function Technicians() {
  const [tab, setTab] = useState<Tab>("technicians");
  const [query, setQuery] = useState("");
  const [techStatus, setTechStatus] = useState<string>("all");
  const [reqStatus, setReqStatus] = useState<ApprovalStatus | "all">("all");

  const [allTechnicians, setAllTechnicians] = useState<ApiTechnician[]>([]);
  const [allLoading, setAllLoading] = useState(true);
  const [allError, setAllError] = useState<string | null>(null);

  const [requests, setRequests] = useState<ApiTechnician[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState<string | null>(null);

  const [selected, setSelected] = useState<ApiTechnician | null>(null);

  async function fetchAllTechnicians() {
    setAllLoading(true);
    setAllError(null);
    try {
      const response = await listAllTechnicians();
      setAllTechnicians(extractList(response));
    } catch (err) {
      setAllError(
        err instanceof Error ? err.message : "Failed to load technicians",
      );
    } finally {
      setAllLoading(false);
    }
  }

  async function fetchRequests() {
    setRequestsLoading(true);
    setRequestsError(null);
    try {
      const response = await listTechnicianRequests();
      setRequests(extractList(response));
    } catch (err) {
      setRequestsError(
        err instanceof Error ? err.message : "Failed to load requests",
      );
    } finally {
      setRequestsLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setAllLoading(true);
      setAllError(null);
      try {
        const response = await listAllTechnicians();
        if (cancelled) return;
        setAllTechnicians(extractList(response));
      } catch (err) {
        if (!cancelled)
          setAllError(
            err instanceof Error ? err.message : "Failed to load technicians",
          );
      } finally {
        if (!cancelled) setAllLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setRequestsLoading(true);
      setRequestsError(null);
      try {
        const response = await listTechnicianRequests();
        if (cancelled) return;
        setRequests(extractList(response));
      } catch (err) {
        if (!cancelled)
          setRequestsError(
            err instanceof Error ? err.message : "Failed to load requests",
          );
      } finally {
        if (!cancelled) setRequestsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleRefresh() {
    if (tab === "technicians") {
      fetchAllTechnicians();
    } else {
      fetchRequests();
    }
  }

  const filteredTechnicians = useMemo(() => {
    return allTechnicians.filter((t) => {
      const availability = s(t.availabilityStatus, "off_duty");
      const matchesStatus = techStatus === "all" || availability === techStatus;
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        s(t.user_name).toLowerCase().includes(q) ||
        s(t.zone).toLowerCase().includes(q) ||
        s(t.verifiedUserId).toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [allTechnicians, techStatus, query]);

  const filteredRequests = useMemo(() => {
    return requests.filter((t) => {
      const matchesStatus = reqStatus === "all" || s(t.status) === reqStatus;
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        s(t.user_name).toLowerCase().includes(q) ||
        s(t.zone).toLowerCase().includes(q) ||
        s(t.verifiedUserId).toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [requests, reqStatus, query]);

  function handleApproved(id: string) {
    setRequests((prev) => prev.filter((t) => s(t.verifiedUserId) !== id));
    setAllTechnicians((prev) =>
      prev.map((t) =>
        s(t.verifiedUserId) === id
          ? { ...t, status: "approved" as ApprovalStatus }
          : t,
      ),
    );
  }

  const technicianColumns: Column<ApiTechnician>[] = [
    {
      header: "Technician",
      accessor: (t) => (
        <div>
          <p className="text-hi">{s(t.user_name)}</p>
          <p className="font-mono text-[11px] text-faint">
            {s(t.verifiedUserId)}
          </p>
        </div>
      ),
    },
    {
      header: "Contact",
      accessor: (t) => (
        <div>
          <p className="text-lo">{s(t.user_email)}</p>
          <p className="font-mono text-[11px] text-faint">
            {s(t.contact_number)}
          </p>
        </div>
      ),
    },
    {
      header: "Zone",
      accessor: (t) => <span className="text-lo">{s(t.zone, "—")}</span>,
    },
    {
      header: "Rating",
      accessor: (t) => (
        <span className="flex items-center gap-1 font-mono">
          <Star size={12} className="fill-gold text-gold" />{" "}
          {n(t.rating).toFixed(1)}
        </span>
      ),
    },
    {
      header: "Jobs completed",
      accessor: (t) => <span className="font-mono">{n(t.jobsCompleted)}</span>,
    },
    {
      header: "Active since",
      accessor: (t) => {
        const date = s(t.activeSince) || s(t.createdAt);
        return (
          <span className="font-mono text-[12px] text-lo">
            {date
              ? new Date(date).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "—"}
          </span>
        );
      },
    },
    {
      header: "Approval",
      accessor: (t) => <StatusBadge status={s(t.status, "pending")} />,
    },
    {
      header: "Availability",
      accessor: (t) => (
        <StatusBadge status={s(t.availabilityStatus, "off_duty")} />
      ),
    },
  ];

  const requestColumns: Column<ApiTechnician>[] = [
    {
      header: "Technician",
      accessor: (t) => (
        <div>
          <p className="text-hi">{s(t.user_name)}</p>
          <p className="font-mono text-[11px] text-faint">
            {s(t.verifiedUserId)}
          </p>
        </div>
      ),
    },
    {
      header: "Contact",
      accessor: (t) => (
        <div>
          <p className="text-lo">{s(t.user_email)}</p>
          <p className="font-mono text-[11px] text-faint">
            {s(t.contact_number)}
          </p>
        </div>
      ),
    },
    {
      header: "Zone",
      accessor: (t) => <span className="text-lo">{s(t.zone, "—")}</span>,
    },
    { header: "Status", accessor: (t) => <StatusBadge status={s(t.status)} /> },
    {
      header: "",
      accessor: (t) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setSelected(t)}
            className="rounded-sm border border-white/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-lo transition-colors hover:border-gold hover:text-gold"
          >
            View
          </button>
          <button
            onClick={() => setSelected(t)}
            className="rounded-sm bg-gold px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-wide text-bg transition-opacity hover:opacity-90"
          >
            Approve
          </button>
        </div>
      ),
    },
  ];

  const loading = tab === "technicians" ? allLoading : requestsLoading;
  const error = tab === "technicians" ? allError : requestsError;

  return (
    <div>
      <SectionHeader
        eyebrow="admin/Technicians . Field workforce"
        title="Technicians"
        description="Field crew assigned to visits — availability, service zone, and performance."
        actions={
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-sm border border-border bg-surface2 px-3.5 py-2 font-mono text-[11px] font-medium uppercase tracking-wide text-lo transition-colors hover:text-hi disabled:opacity-50"
          >
            <RefreshCw size={14} className={clsx(loading && "animate-spin")} />
            Refresh
          </button>
        }
      />

      <div className="mb-4 flex gap-2 border-b border-white/10">
        <button
          onClick={() => setTab("technicians")}
          className={`px-3 py-2 font-mono text-[11px] uppercase tracking-wide ${
            tab === "technicians"
              ? "border-b-2 border-gold text-hi"
              : "text-faint hover:text-lo"
          }`}
        >
          Technicians ({allTechnicians.length})
        </button>
        <button
          onClick={() => setTab("requests")}
          className={`px-3 py-2 font-mono text-[11px] uppercase tracking-wide ${
            tab === "requests"
              ? "border-b-2 border-gold text-hi"
              : "text-faint hover:text-lo"
          }`}
        >
          Requests ({requests.length})
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <ToolbarSearch
          value={query}
          onChange={setQuery}
          placeholder="Search name, zone, ID…"
        />
        <div className="flex flex-wrap gap-2">
          {tab === "technicians"
            ? technicianFilters.map((f) => (
                <FilterChip
                  key={f.value}
                  label={f.label}
                  active={techStatus === f.value}
                  onClick={() => setTechStatus(f.value)}
                />
              ))
            : requestFilters.map((f) => (
                <FilterChip
                  key={f.value}
                  label={f.label}
                  active={reqStatus === f.value}
                  onClick={() => setReqStatus(f.value)}
                />
              ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-sm border border-red-500/30 bg-red-500/10 px-3 py-2 font-mono text-[12px] text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <p className="font-mono text-[12px] text-faint">Loading…</p>
      ) : tab === "technicians" ? (
        <>
          <DataTable
            columns={technicianColumns}
            rows={filteredTechnicians}
            rowKey={(t) => s(t.verifiedUserId)}
          />
          <p className="mt-3 font-mono text-[11px] text-faint">
            Showing {filteredTechnicians.length} of {allTechnicians.length}{" "}
            technicians
          </p>
        </>
      ) : (
        <>
          <DataTable
            columns={requestColumns}
            rows={filteredRequests}
            rowKey={(t) => s(t.verifiedUserId)}
          />
          <p className="mt-3 font-mono text-[11px] text-faint">
            Showing {filteredRequests.length} of {requests.length} requests
          </p>
        </>
      )}

      <TechnicianDetailModal
        technician={selected}
        onClose={() => setSelected(null)}
        onApproved={handleApproved}
      />
    </div>
  );
}