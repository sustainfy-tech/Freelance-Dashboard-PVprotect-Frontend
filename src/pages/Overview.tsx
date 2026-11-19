import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  IndianRupee,
  CalendarClock,
  Sun,
  HardHat,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import { useElementWidth } from "../hooks/useElementWidth";
import StatCell from "../components/StatCell";
import StatusBadge from "../components/StatusBadge";
import { getPlantCapacityStats, type PlantCapacityStats } from "../api/plant";
import { listAllTechnicians } from "../api/technicians";
import { listBookingRequestsForAdmin } from "../api/bookings";
import { bookings as mockBookings, auditLogs } from "../data/mockData";

import type {
  Booking,
  MonthlyRevenue,
  ApiBookingItem,
  TechnicianLite,
  PipelineRaw,
} from "../types/Pages/Overview.types";

const PIPELINE_COLORS: Record<string, string> = {
  pending: "#9AA5B1",
  received: "#9AA5B1",
  assigned: "#E3A542",
  accepted: "#60A5FA",
  in_progress: "#E3A542",
  payment_pending: "#F59E0B",
  completed: "#2FD6C4",
  rejected: "#F0555B",
  cancelled: "#5B6572",
};

const ATTENTION_STATUSES = ["pending", "rejected", "payment_pending"];

function currency(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

function normalizeStatus(s: unknown) {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function shortId(id: string) {
  return id.replace(/-/g, "").slice(0, 9);
}

function unwrapList(d: unknown, depth = 0): unknown[] | null {
  if (Array.isArray(d)) return d;
  if (!d || typeof d !== "object" || depth > 4) return null;
  const obj = d as Record<string, unknown>;
  for (const key of ["items", "bookings", "requests", "results"]) {
    if (Array.isArray(obj[key])) return obj[key] as unknown[];
  }
  if (obj.data) return unwrapList(obj.data, depth + 1);
  return null;
}

function toBookingList(data: unknown): Booking[] {
  const raw = unwrapList(data);
  if (!raw) {
    console.warn("Unexpected booking requests response shape:", data);
    return [];
  }

  return (raw as ApiBookingItem[]).map((item) => ({
    id: String(item.bookingId ?? item.id ?? ""),
    plantName: item.plant?.name ?? "Unknown plant",
    address: item.plant?.address,
    clientName:
      item.name ??
      item.userName ??
      item.plant?.verifiedUserName ??
      item.plant?.userId ??
      "—",
    status: normalizeStatus(item.bookingStatus ?? item.status),
  }));
}

function getLast6MonthsRevenue(data: unknown, months = 6): MonthlyRevenue[] {
  const now = new Date();
  const buckets = new Map<string, MonthlyRevenue>();

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.set(`${d.getFullYear()}-${d.getMonth()}`, {
      month: d.toLocaleString("en-IN", { month: "short" }),
      revenue: 0,
      bookings: 0,
    });
  }

  const raw = unwrapList(data) ?? [];
  for (const item of raw as ApiBookingItem[]) {
    const pay = item.payment;
    if (!pay || normalizeStatus(pay.status) !== "paid") continue;

    const when = pay.updatedAt ?? item.updatedAt;
    if (!when) continue;
    const date = new Date(when);
    if (Number.isNaN(date.getTime())) continue;

    const bucket = buckets.get(`${date.getFullYear()}-${date.getMonth()}`);
    if (!bucket) continue; // older than the 6-month window

    bucket.revenue += Number(pay.finalAmount ?? pay.amount ?? 0);
    bucket.bookings += 1;
  }

  return Array.from(buckets.values());
}

function toTechnicianList(data: unknown): TechnicianLite[] {
  if (Array.isArray(data)) return data as TechnicianLite[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items as TechnicianLite[];
    if (obj.data) return toTechnicianList(obj.data);
  }
  console.warn("Unexpected technicians response shape:", data);
  return [];
}

export default function Overview() {
  const [rootRef, width] = useElementWidth<HTMLDivElement>();
  const narrow = width > 0 && width < 480;

  const [stats, setStats] = useState<PlantCapacityStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const statsLoading = !stats && !statsError;

  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  const [revenueData, setRevenueData] = useState<MonthlyRevenue[]>(() =>
    getLast6MonthsRevenue(null),
  );

  // Technician counts
  const [techCounts, setTechCounts] = useState<{
    total: number;
    available: number;
  } | null>(null);
  const [techError, setTechError] = useState<string | null>(null);
  const techLoading = !techCounts && !techError;

  useEffect(() => {
    let cancelled = false;
    getPlantCapacityStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setStatsError(
            err instanceof Error ? err.message : "Failed to load stats",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    listAllTechnicians()
      .then((res) => {
        if (cancelled) return;
        const list = toTechnicianList(res);
        const approved = list.filter(
          (t) => String(t.status).toLowerCase() === "approved",
        );
        const available = approved.length;
        setTechCounts({ total: approved.length, available });
      })
      .catch((err) => {
        if (!cancelled) {
          setTechError(
            err instanceof Error ? err.message : "Failed to load technicians",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchBookingRequests() {
      setBookingsLoading(true);
      setBookingsError(null);
      try {
        const data = await listBookingRequestsForAdmin();
        if (!cancelled) {
          setBookings(toBookingList(data));
          setRevenueData(getLast6MonthsRevenue(data));
        }
      } catch (err) {
        if (!cancelled) {
          setBookingsError(
            err instanceof Error ? err.message : "Failed to load bookings",
          );
          setBookings(mockBookings);
        }
      } finally {
        if (!cancelled) setBookingsLoading(false);
      }
    }

    fetchBookingRequests();
    return () => {
      cancelled = true;
    };
  }, []);

  const pipeline = (
    (stats?.bookingPipeline ?? []) as unknown as PipelineRaw[]
  ).map((p) => ({
    ...p,
    color: PIPELINE_COLORS[p.value] ?? "#5B6572",
  }));

  const attentionBookings = bookings.filter((b) =>
    ATTENTION_STATUSES.includes(normalizeStatus(b.status)),
  );

  const latestRevenue = revenueData[revenueData.length - 1]?.revenue ?? 0;
  const previousRevenue = revenueData[revenueData.length - 2]?.revenue ?? 0;
  const growth =
    previousRevenue > 0
      ? ((latestRevenue - previousRevenue) / previousRevenue) * 100
      : null;

  const statValue = (value: string | null | undefined) =>
    statsLoading ? "…" : (value ?? "—");
  const plural = (n: number, word: string) =>
    `${n} ${word}${n === 1 ? "" : "s"}`;

  const techValue = techLoading
    ? "…"
    : techCounts
      ? `${techCounts.available} / ${techCounts.total}`
      : "—";

  const axisTick = {
    fill: "#9AA5B1",
    fontSize: narrow ? 10 : 11,
    fontFamily: "JetBrains Mono",
  };

  return (
    <div ref={rootRef} className="@container w-full min-w-0">
      <SectionHeader
        eyebrow="PVPROTECT · Live"
        title="Operations overview"
        description="Booking throughput, technician availability, and revenue across every connected plant."
      />

      <div className="grid grid-cols-1 gap-px overflow-hidden border border-border bg-border @lg:grid-cols-2 @4xl:grid-cols-4">
        <StatCell
          label="Total revenue"
          value={statValue(stats && currency(stats.totalRevenue))}
          delta={
            stats
              ? plural(stats.paidBookingCount, "paid booking")
              : statsError
                ? "Live data unavailable"
                : undefined
          }
          deltaTone={statsError ? "down" : "flat"}
          icon={IndianRupee}
          accent="gold"
        />
        <StatCell
          label="Active bookings"
          value={statValue(stats && String(stats.activeBookingCount))}
          delta={
            stats
              ? `Updated ${new Date(stats.updatedAt).toLocaleTimeString(
                  "en-IN",
                  { hour: "2-digit", minute: "2-digit" },
                )}`
              : statsError
                ? "Live data unavailable"
                : undefined
          }
          deltaTone={statsError ? "down" : "flat"}
          icon={CalendarClock}
          accent="gold"
        />
        <StatCell
          label="Connected capacity"
          value={statValue(
            stats && `${stats.totalCapacityKw.toLocaleString("en-IN")} kW`,
          )}
          delta={
            stats
              ? `${plural(stats.plantCount, "plant")} under contract`
              : statsError
                ? "Live data unavailable"
                : undefined
          }
          deltaTone={statsError ? "down" : "up"}
          icon={Sun}
          accent="teal"
        />
        <StatCell
          label="Technicians available"
          value={techValue}
          delta={
            techCounts
              ? `${plural(techCounts.total, "approved technician")}`
              : techError
                ? "Live data unavailable"
                : undefined
          }
          deltaTone={techError ? "down" : "flat"}
          icon={HardHat}
          accent="teal"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 @xl:mt-6 @xl:gap-6 @4xl:grid-cols-3">
        <div className="card-shadow min-w-0 rounded-md border border-border bg-surface p-4 @xl:p-6 @4xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-lo">
                Revenue &amp; booking volume
              </p>
              <p className="font-display text-lg text-hi">Last 6 months</p>
            </div>
            {bookingsLoading ? (
              <span className="font-mono text-[11px] text-faint">Loading…</span>
            ) : bookingsError ? (
              <span className="font-mono text-[11px] text-red-400">
                Revenue unavailable
              </span>
            ) : growth !== null ? (
              <span
                className={`flex items-center gap-1 font-mono text-[11px] ${
                  growth >= 0 ? "text-teal" : "text-red-400"
                }`}
              >
                {growth >= 0 ? (
                  <ArrowUpRight size={13} />
                ) : (
                  <ArrowDownRight size={13} />
                )}
                {Math.abs(growth).toFixed(1)}% vs last month
              </span>
            ) : null}
          </div>
          <div className="mt-2 h-55 w-full min-w-0 @xl:h-65">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueData}
                margin={{
                  top: 24,
                  right: narrow ? 4 : 8,
                  left: -16,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E3A542" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#E3A542" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#232D37" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#5B6572"
                  tick={axisTick}
                  axisLine={{ stroke: "#232D37" }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#5B6572"
                  tick={axisTick}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    v >= 1000 ? `₹${+(v / 1000).toFixed(1)}k` : `₹${v}`
                  }
                />
                <Tooltip
                  contentStyle={{
                    background: "#1D2530",
                    border: "1px solid #232D37",
                    borderRadius: 2,
                    fontSize: 12,
                    fontFamily: "Inter",
                  }}
                  labelStyle={{ color: "#E8ECEF" }}
                  formatter={(value, _name, item) => {
                    const count = (item?.payload as MonthlyRevenue | undefined)
                      ?.bookings;
                    return [
                      `${currency(Number(value))}${
                        count !== undefined
                          ? ` · ${plural(count, "booking")}`
                          : ""
                      }`,
                      "Revenue",
                    ];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#E3A542"
                  strokeWidth={2}
                  fill="url(#revFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-shadow min-w-0 rounded-md border border-border bg-surface p-4 @xl:p-6">
          <p className="font-mono text-[11px] uppercase tracking-widest text-lo">
            Booking pipeline
          </p>
          <p className="font-display text-lg text-hi">Current distribution</p>
          {statsLoading ? (
            <p className="mt-4 font-mono text-[11px] text-faint">Loading…</p>
          ) : statsError ? (
            <p className="mt-4 wrap-break-word font-mono text-[11px] text-red-400">
              Couldn't load pipeline ({statsError})
            </p>
          ) : (
            <>
              <div className="mt-2 h-60 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={pipeline}
                    layout="vertical"
                    margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="status"
                      width={narrow ? 84 : 100}
                      tick={{
                        fill: "#9AA5B1",
                        fontSize: narrow ? 10 : 10.5,
                        fontFamily: "Inter",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "#1D2530" }}
                      contentStyle={{
                        background: "#1D2530",
                        border: "1px solid #232D37",
                        borderRadius: 2,
                        fontSize: 12,
                      }}
                      itemStyle={{ color: "#FFFFFF" }}
                    />
                    <Bar dataKey="count" radius={[0, 2, 2, 0]}>
                      {pipeline.map((entry) => (
                        <Cell key={entry.value} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 space-y-1.5">
                {pipeline.map((s) => (
                  <div
                    key={s.value}
                    className="flex items-center justify-between gap-3 text-[11px]"
                  >
                    <span className="flex min-w-0 items-center gap-1.5 text-lo">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="truncate">{s.status}</span>
                    </span>
                    <span className="shrink-0 font-mono text-hi">
                      {s.count}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 @xl:mt-6 @xl:gap-6 @4xl:grid-cols-3">
        <div className="card-shadow min-w-0 rounded-md border border-border bg-surface p-4 @xl:p-6 @4xl:col-span-2">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-widest text-lo">
            Bookings needing attention
          </p>
          {bookingsLoading ? (
            <p className="font-mono text-[11px] text-faint">
              Loading booking requests…
            </p>
          ) : bookingsError ? (
            <p className="wrap-break-word font-mono text-[11px] text-red-400">
              Couldn't load live requests ({bookingsError}) — showing cached
              data.
            </p>
          ) : attentionBookings.length === 0 ? (
            <p className="font-mono text-[11px] text-faint">
              No bookings need attention.
            </p>
          ) : null}
          <div className="space-y-2">
            {attentionBookings.map((b) => (
              <div
                key={b.id}
                className="flex flex-col gap-2 border border-border bg-surface2 px-3 py-3 @md:flex-row @md:items-center @md:justify-between @md:gap-3 @md:px-4"
              >
                <div className="min-w-0">
                  <p className="wrap-break-word text-[13px] font-medium text-hi">
                    {shortId(b.id)} · {b.address ?? b.plantName}
                  </p>
                  <p className="truncate font-mono text-[11px] text-faint">
                    {b.clientName}
                  </p>
                </div>
                <div className="shrink-0 self-start @md:self-auto">
                  <StatusBadge status={b.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-shadow min-w-0 rounded-md border border-border bg-surface p-4 @xl:p-6">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-widest text-lo">
            Recent activity
          </p>
          <div className="space-y-4">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="border-l-2 border-gold-dim/50 pl-3">
                <p className="wrap-break-word text-[12.5px] text-hi">
                  {log.action.replaceAll("_", " ")}
                </p>
                <p className="wrap-break-word font-mono text-[10.5px] text-faint">
                  {log.actor} ·{" "}
                  {new Date(log.timestamp).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
