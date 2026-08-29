import { useEffect, useMemo, useState } from "react";
import SectionHeader from "../components/SectionHeader";
import DataTable, { type Column } from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { ToolbarSearch, FilterChip } from "../components/Toolbar";
import TechnicianDetailModal from "../components/TechnicianDetailModal";
import { listTechniciansForAdmin } from "../api/technicians.js";
import type {
  ApiTechnician,
  ApprovalStatus,
} from "../types/Pages/Technicians.types.js";

const filters: { label: string; value: ApprovalStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Training completed", value: "submit_for_review" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

export default function Request() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ApprovalStatus | "all">("all");
  const [requests, setRequests] = useState<ApiTechnician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ApiTechnician | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchRequests() {
      setLoading(true);
      setError(null);
      try {
        const data = await listTechniciansForAdmin();
        if (!cancelled) setRequests(data);
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to load requests",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchRequests();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return requests.filter((t) => {
      const matchesStatus = status === "all" || t.status === status;
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        (t.zone ?? "").toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [query, status, requests]);

  function handleApproved(id: string) {
    setRequests((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "approved" } : t)),
    );
  }

  const columns: Column<ApiTechnician>[] = [
    {
      header: "Technician",
      accessor: (t) => (
        <div>
          <p className="text-hi">{t.name}</p>
          <p className="font-mono text-[11px] text-faint">{t.id}</p>
        </div>
      ),
    },
    {
      header: "Contact",
      accessor: (t) => (
        <div>
          <p className="text-lo">{t.email}</p>
          <p className="font-mono text-[11px] text-faint">{t.phone}</p>
        </div>
      ),
    },
    {
      header: "Zone",
      accessor: (t) => <span className="text-lo">{t.zone ?? "—"}</span>,
    },
    { header: "Status", accessor: (t) => <StatusBadge status={t.status} /> },
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
          {t.status === "submit_for_review" && (
            <button
              onClick={() => setSelected(t)}
              className="rounded-sm bg-gold px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-wide text-bg transition-opacity hover:opacity-90"
            >
              Approve
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <SectionHeader
        eyebrow="Onboarding"
        title="Requests"
        description="Technician sign-up requests awaiting review and approval."
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <ToolbarSearch
          value={query}
          onChange={setQuery}
          placeholder="Search name, zone, ID…"
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

      {error && (
        <div className="mb-4 rounded-sm border border-red-500/30 bg-red-500/10 px-3 py-2 font-mono text-[12px] text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <p className="font-mono text-[12px] text-faint">Loading requests…</p>
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={function (): string {
              throw new Error("Function not implemented.");
            }}
          />
          <p className="mt-3 font-mono text-[11px] text-faint">
            Showing {filtered.length} of {requests.length} requests
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
