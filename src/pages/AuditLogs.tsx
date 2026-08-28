import { useMemo, useState } from "react";
import SectionHeader from "../components/SectionHeader";
import { ToolbarSearch, FilterChip } from "../components/Toolbar";
import { auditLogs } from "../data/mockData";
import type { AuditLogEntry } from "../types";
import clsx from "clsx";

const roles: { label: string; value: AuditLogEntry["actorRole"] | "all" }[] = [
  { label: "All actors", value: "all" },
  { label: "Client", value: "client" },
  { label: "Technician", value: "technician" },
  { label: "Admin", value: "admin" },
  { label: "System", value: "system" },
];

const roleDot: Record<AuditLogEntry["actorRole"], string> = {
  client: "bg-teal",
  technician: "bg-gold",
  admin: "bg-hi",
  system: "bg-faint",
};

export default function AuditLogs() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<AuditLogEntry["actorRole"] | "all">("all");

  const filtered = useMemo(() => {
    return auditLogs.filter((l) => {
      const matchesRole = role === "all" || l.actorRole === role;
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        l.actor.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.target.toLowerCase().includes(q) ||
        l.correlationId.toLowerCase().includes(q);
      return matchesRole && matchesQuery;
    });
  }, [query, role]);

  return (
    <div>
      <SectionHeader
        eyebrow="File management · Traceability"
        title="Audit logs"
        description="Every state change across the booking lifecycle, correlated by ID for end-to-end tracing."
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <ToolbarSearch value={query} onChange={setQuery} placeholder="Search actor, action, correlation ID…" />
        <div className="flex flex-wrap gap-2">
          {roles.map((r) => (
            <FilterChip key={r.value} label={r.label} active={role === r.value} onClick={() => setRole(r.value)} />
          ))}
        </div>
      </div>

      <div className="border border-border bg-surface">
        {filtered.map((log, i) => (
          <div
            key={log.id}
            className={clsx(
              "grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-3.5",
              i !== filtered.length - 1 && "border-b border-border"
            )}
          >
            <span className={clsx("h-1.5 w-1.5 shrink-0 rounded-full", roleDot[log.actorRole])} />
            <div className="min-w-0">
              <p className="truncate text-[13px] text-hi">
                <span className="font-mono text-gold">{log.action.replaceAll("_", " ")}</span>
                <span className="text-faint"> — {log.target}</span>
              </p>
              <p className="font-mono text-[11px] text-faint">
                {log.actor} · corr: {log.correlationId}
              </p>
            </div>
            <span className="font-mono text-[11px] text-lo">
              {new Date(log.timestamp).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-faint">No log entries match the current filters.</p>
        )}
      </div>
      <p className="mt-3 font-mono text-[11px] text-faint">
        Showing {filtered.length} of {auditLogs.length} log entries
      </p>
    </div>
  );
}
