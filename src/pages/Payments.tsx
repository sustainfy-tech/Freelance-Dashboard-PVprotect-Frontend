import { useCallback, useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import DataTable from "../components/DataTable";
import type { Column } from "../types/Components/DataTable.types";
import { ToolbarSearch, FilterChip } from "../components/Toolbar";
import { listBookingRequestsForAdmin } from "../api/bookings";

import type { PaymentRow, PaymentStatus } from "../types/Pages/Payments.types";

const STATUS_STYLES: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  },
  received: {
    label: "Received",
    className: "border-green-500/30 bg-green-500/10 text-green-400",
  },
  otp_verified: {
    label: "Verified",
    className: "border-teal-500/30 bg-teal-500/10 text-teal-400",
  },
  verified: {
    label: "Verified",
    className: "border-teal-500/30 bg-teal-500/10 text-teal-400",
  },
  failed: {
    label: "Failed",
    className: "border-red-500/30 bg-red-500/10 text-red-400",
  },
};

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-[10.5px] font-medium uppercase tracking-wide ${s.className}`}
    >
      {s.label}
    </span>
  );
}

const VALID_STATUSES: PaymentStatus[] = [
  "pending",
  "received",
  "otp_verified",
  "verified",
  "failed",
];

function normalizeStatus(raw: unknown): PaymentStatus {
  const s = String(raw ?? "")
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  if ((VALID_STATUSES as string[]).includes(s)) return s as PaymentStatus;

  if (s === "paid") return "received";
  if (s === "unpaid") return "pending";
  return "pending";
}

function mapBookingToPayment(b: any, index: number): PaymentRow {
  const pay = b.payment ?? {};
  const bookingId = String(b.bookingId ?? b.id ?? "—");
  const mode = pay.paymentMode ?? pay.mode ?? null;

  return {
    rowId: `${bookingId}-${index}`,
    bookingId,
    clientName: String(
      b.name ?? b.userName ?? b.plant?.verifiedUserName ?? b.userId ?? "—",
    ),
    amount: Number(pay.finalAmount ?? pay.amount ?? 0),
    method: mode ? String(mode) : null,
    date: pay.updatedAt ?? null,
    status: normalizeStatus(pay.status),
  };
}

async function fetchPayments(): Promise<PaymentRow[]> {
  const res: any = await listBookingRequestsForAdmin();

  const list: any[] = Array.isArray(res)
    ? res
    : (res?.items ??
      res?.data?.items ??
      (Array.isArray(res?.data) ? res.data : []));

  return list.map((b, i) => mapBookingToPayment(b, i));
}


const filters: { label: string; value: PaymentStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Received", value: "received" },
  { label: "Verified", value: "verified" },
  { label: "Failed", value: "failed" },
];

function currency(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

export default function Payments() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<PaymentStatus | "all">("all");
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setPayments(await fetchPayments());
    } catch (e: any) {
      setError(e?.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return payments.filter((p) => {
      const matchesStatus = status === "all" || p.status === status;
      const matchesQuery =
        !q ||
        p.clientName.toLowerCase().includes(q) ||
        p.bookingId.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [payments, query, status]);

  const totalReceived = payments
    .filter((p) => ["received", "otp_verified", "verified"].includes(p.status))
    .reduce((s, p) => s + p.amount, 0);
  const totalPending = payments
    .filter((p) => p.status === "pending")
    .reduce((s, p) => s + p.amount, 0);

  const columns: Column<PaymentRow>[] = [
    {
      header: "Booking",
      accessor: (p) => (
        <span className="font-mono text-gold">{p.bookingId.slice(0, 8)}</span>
      ),
    },
    {
      header: "Client",
      accessor: (p) => <span className="text-hi">{p.clientName}</span>,
    },
    {
      header: "Amount",
      accessor: (p) => <span className="font-mono">{currency(p.amount)}</span>,
    },
    {
      header: "Method",
      accessor: (p) =>
        p.method ? (
          <span className="uppercase text-lo">
            {p.method.replace(/_/g, " ")}
          </span>
        ) : (
          <span className="uppercase text-yellow-400">Pending</span>
        ),
    },
    {
      header: "Date",
      accessor: (p) => (
        <span className="font-mono text-[12px] text-lo">
          {p.date
            ? new Date(p.date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
              })
            : "—"}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (p) => <PaymentStatusBadge status={p.status} />,
    },
  ];

  return (
    <div>
      <SectionHeader
        eyebrow="Payments · Reports"
        title="Payments & reports"
        description="Payment lifecycle from pending to received, reconciled with the central backend."
        actions={
          <button className="flex items-center gap-1.5 rounded-sm border border-border bg-surface2 px-3.5 py-2 font-mono text-[11px] font-medium uppercase tracking-wide text-lo transition-colors hover:text-hi">
            <Download size={14} /> Export report
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
        <div className="bg-surface p-4">
          <p className="font-mono text-[10.5px] uppercase tracking-widest text-faint">
            Received (period)
          </p>
          <p className="mt-1 font-display text-xl text-hi">
            {currency(totalReceived)}
          </p>
        </div>
        <div className="bg-surface p-4">
          <p className="font-mono text-[10.5px] uppercase tracking-widest text-faint">
            Pending settlement
          </p>
          <p className="mt-1 font-display text-xl text-gold">
            {currency(totalPending)}
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <ToolbarSearch
          value={query}
          onChange={setQuery}
          placeholder="Search booking, client…"
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

      {loading ? (
        <p className="py-10 text-center font-mono text-[12px] text-faint">
          Loading payments…
        </p>
      ) : error ? (
        <div className="py-10 text-center">
          <p className="font-mono text-[12px] text-red-400">{error}</p>
          <button
            onClick={load}
            className="mt-3 rounded-sm border border-border bg-surface2 px-3.5 py-2 font-mono text-[11px] uppercase tracking-wide text-lo hover:text-hi"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(p) => p.rowId}
          />
          <p className="mt-3 font-mono text-[11px] text-faint">
            Showing {filtered.length} of {payments.length} payments
          </p>
        </>
      )}
    </div>
  );
}
