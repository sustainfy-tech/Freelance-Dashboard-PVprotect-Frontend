import { useEffect, useMemo, useState } from "react";
import { RefreshCw, X } from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import DataTable, { type Column } from "../components/DataTable";
import { ToolbarSearch } from "../components/Toolbar";
import { listTechniciansForAdmin } from "../api/technicians.js";
import type { ApiAppUser } from "../types/Pages/Client.types.js";
import type { ClientRow } from "../types/Pages/Client.types.js";
import PlantsList from "../components/Plantslist.js";

function currency(n?: number) {
  if (n === undefined || n === null) return "—";
  return "₹" + n.toLocaleString("en-IN");
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

// Shape actually returned by the API:
// { statusCode, data: { items: ApiAppUser[], count, scannedCount, nextToken }, message, success }
// Kept the older shapes as fallbacks in case other endpoints/mocks still use them.
type TechniciansApiResponse =
  | ApiAppUser[]
  | { technicians?: ApiAppUser[] }
  | { items?: ApiAppUser[] }
  | { data?: { items?: ApiAppUser[]; technicians?: ApiAppUser[] } };

async function loadClientRows(): Promise<ClientRow[]> {
  const response = (await listTechniciansForAdmin()) as unknown as TechniciansApiResponse;

  const users: ApiAppUser[] = Array.isArray(response)
    ? response
    : ((response as { data?: { items?: ApiAppUser[]; technicians?: ApiAppUser[] } })?.data
        ?.items ??
      (response as { data?: { items?: ApiAppUser[]; technicians?: ApiAppUser[] } })?.data
        ?.technicians ??
      (response as { items?: ApiAppUser[] })?.items ??
      (response as { technicians?: ApiAppUser[] })?.technicians ??
      []);

  return users
    .filter((u) => (u.role ?? "").toLowerCase() === "client")
    .map((u, idx) => {
      const rawPayment = (u as unknown as { payment?: number | string })
        .payment;
      const payment =
        typeof rawPayment === "number"
          ? rawPayment
          : typeof rawPayment === "string" && rawPayment.trim() !== ""
            ? Number(rawPayment)
            : undefined;
      return {
        id: u.verifiedUserId ?? String(idx),
        name: (u.user_name ?? "—").trim() || "—",
        email: u.user_email ?? "—",
        contact: u.contact_number ?? "—",
        plants: typeof u.plants === "number" ? u.plants : undefined,
        joined: u.createdAt,
        payment: Number.isFinite(payment) ? payment : undefined,
        status: u.status ?? "—",
      };
    });
}

export default function Clients() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [plantsModalClient, setPlantsModalClient] = useState<ClientRow | null>(
    null,
  );

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const clientRows = await loadClientRows();
      setRows(clientRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    loadClientRows()
      .then((clientRows) => {
        if (!ignore) setRows(clientRows);
      })
      .catch((err) => {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch clients",
          );
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const closePlantsModal = () => setPlantsModalClient(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.contact.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q),
    );
  }, [query, rows]);

  const columns: Column<ClientRow>[] = [
    {
      header: "Client",
      accessor: (c) => (
        <div>
          <p className="text-hi">{c.name}</p>
          <p className="font-mono text-[11px] text-faint">{c.id}</p>
        </div>
      ),
    },
    {
      header: "Contact",
      accessor: (c) => (
        <div>
          <p className="text-lo">{c.email}</p>
          <p className="font-mono text-[11px] text-faint">{c.contact}</p>
        </div>
      ),
    },
    {
      header: "Plants",
      accessor: (c) => (
        <button
          onClick={() => setPlantsModalClient(c)}
          className="rounded-sm bg-green-600 px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-wide text-white transition-opacity hover:opacity-90"
        >
          View Plants
        </button>
      ),
    },
    {
      header: "Joined",
      accessor: (c) => (
        <span className="font-mono text-[12px] text-lo">
          {formatDate(c.joined)}
        </span>
      ),
    },
    {
      header: "Value",
      accessor: (c) => <span className="font-mono">{currency(c.payment)}</span>,
    },
  ];

  return (
    <div>
      <SectionHeader
        eyebrow="Admin/clients"
        title="Clients"
        description="Everyone who books cleaning, inspection, and repair visits through the client app."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchClients}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-sm border border-white/10 px-3.5 py-2 font-mono text-[11px] font-medium uppercase tracking-wide text-lo transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />{" "}
              Refresh
            </button>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <ToolbarSearch
          value={query}
          onChange={setQuery}
          placeholder="Search name, email, contact, ID…"
        />
      </div>

      {error && (
        <p className="mb-3 font-mono text-[11px] text-red-400">
          Failed to load clients: {error}
        </p>
      )}

      <DataTable columns={columns} rows={filtered} rowKey={(c) => c.id} />
      <p className="mt-3 font-mono text-[11px] text-faint">
        {loading
          ? "Loading…"
          : `Showing ${filtered.length} of ${rows.length} clients`}
      </p>

      {plantsModalClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm border border-white/10 bg-bg p-5">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wide text-faint">
                  Plants
                </p>
                <p className="text-hi">{plantsModalClient.name}</p>
                <p className="font-mono text-[11px] text-faint">
                  {plantsModalClient.id}
                </p>
              </div>
              <button
                onClick={closePlantsModal}
                className="text-faint hover:text-hi"
              >
                <X size={18} />
              </button>
            </div>

            <PlantsList
              clientId={plantsModalClient.id}
              clientName={plantsModalClient.name}
            />
          </div>
        </div>
      )}
    </div>
  );
}