import { useMemo, useState } from "react";
import { ShieldCheck, ShieldAlert, Download } from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import DataTable from "../components/DataTable";
import type { Column } from "../types/Components/DataTable.types";
import StatusBadge from "../components/StatusBadge";
import { ToolbarSearch, FilterChip } from "../components/Toolbar";
import { payments } from "../data/mockData";
import type { Payment, PaymentStatus } from "../types/types";

const filters: { label: string; value: PaymentStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Received", value: "received" },
  { label: "OTP verified", value: "otp_verified" },
  { label: "Verified", value: "verified" },
  { label: "Failed", value: "failed" },
];

function currency(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

export default function Payments() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<PaymentStatus | "all">("all");

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      const matchesStatus = status === "all" || p.status === status;
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        p.id.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        p.bookingId.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [query, status]);

  const totalReceived = payments
    .filter((p) => ["received", "otp_verified", "verified"].includes(p.status))
    .reduce((s, p) => s + p.amount, 0);
  const totalPending = payments
    .filter((p) => p.status === "pending")
    .reduce((s, p) => s + p.amount, 0);

  const columns: Column<Payment>[] = [
    {
      header: "Payment",
      accessor: (p) => <span className="font-mono text-gold">{p.id}</span>,
    },
    {
      header: "Booking",
      accessor: (p) => <span className="font-mono text-lo">{p.bookingId}</span>,
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
      accessor: (p) => (
        <span className="uppercase text-lo">{p.method.replace("_", " ")}</span>
      ),
    },
    {
      header: "OTP",
      accessor: (p) =>
        p.otpVerified ? (
          <span className="flex items-center gap-1 text-teal">
            <ShieldCheck size={14} /> Verified
          </span>
        ) : (
          <span className="flex items-center gap-1 text-faint">
            <ShieldAlert size={14} /> Pending
          </span>
        ),
    },
    {
      header: "Date",
      accessor: (p) => (
        <span className="font-mono text-[12px] text-lo">
          {new Date(p.date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          })}
        </span>
      ),
    },
    { header: "Status", accessor: (p) => <StatusBadge status={p.status} /> },
  ];

  return (
    <div>
      <SectionHeader
        eyebrow="Payments · OTP · Reviews"
        title="Payments & reports"
        description="Payment lifecycle from received to OTP-verified closure, reconciled with the central backend."
        actions={
          <button className="flex items-center gap-1.5 rounded-sm border border-border bg-surface2 px-3.5 py-2 font-mono text-[11px] font-medium uppercase tracking-wide text-lo transition-colors hover:text-hi">
            <Download size={14} /> Export report
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-px overflow-hidden border border-border bg-border sm:grid-cols-3">
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
        <div className="bg-surface p-4">
          <p className="font-mono text-[10.5px] uppercase tracking-widest text-faint">
            OTP verification rate
          </p>
          <p className="mt-1 font-display text-xl text-teal">
            {Math.round(
              (payments.filter((p) => p.otpVerified).length / payments.length) *
                100,
            )}
            %
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <ToolbarSearch
          value={query}
          onChange={setQuery}
          placeholder="Search payment, booking, client…"
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

      <DataTable columns={columns} rows={filtered} rowKey={(p) => p.id} />
      <p className="mt-3 font-mono text-[11px] text-faint">
        Showing {filtered.length} of {payments.length} payments
      </p>
    </div>
  );
}
