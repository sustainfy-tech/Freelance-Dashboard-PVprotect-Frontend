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
} from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import StatCell from "../components/StatCell";
import StatusBadge from "../components/StatusBadge";
import {
  bookings as mockBookings,
  plants,
  technicians,
  revenueSeries,
  bookingStatusBreakdown,
  auditLogs,
} from "../data/mockData";

const BOOKING_REQUESTS_URL =
  "https://92cb-122-170-198-166.ngrok-free.app/api/v1/admin/bookings/requests";

type Booking = {
  id: string;
  plantName: string;
  clientName: string;
  status: string;
};

function currency(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

export default function Overview() {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchBookingRequests() {
      setBookingsLoading(true);
      setBookingsError(null);
      try {
        const res = await fetch(BOOKING_REQUESTS_URL, {
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data = await res.json();
        // Handles either a raw array response or { bookings: [...] }
        const list: Booking[] = Array.isArray(data)
          ? data
          : (data.bookings ?? []);
        if (!cancelled) setBookings(list);
      } catch (err) {
        if (!cancelled) {
          setBookingsError(
            err instanceof Error ? err.message : "Failed to load bookings",
          );
          setBookings(mockBookings); // fall back so the UI still renders something
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

  const activeBookings = bookings.filter((b) =>
    ["assigned", "en_route", "in_progress"].includes(b.status),
  ).length;
  const availableTechs = technicians.filter(
    (t) => t.status === "available",
  ).length;
  const monthRevenue = revenueSeries[revenueSeries.length - 1].revenue;
  const totalCapacity = plants.reduce((s, p) => s + p.capacityKw, 0);

  return (
    <div>
      <SectionHeader
        eyebrow="PVPROTECT · Live"
        title="Operations overview"
        description="Booking throughput, technician availability, and revenue across every connected plant."
      />

      <div className="grid grid-cols-1 gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        <StatCell
          label="Revenue this month"
          value={currency(monthRevenue)}
          delta="↓ 27.7% vs Jul (mid-cycle)"
          deltaTone="down"
          icon={IndianRupee}
          accent="gold"
        />
        <StatCell
          label="Active bookings"
          value={bookingsLoading ? "…" : String(activeBookings)}
          delta={
            bookingsError
              ? "Live data unavailable · showing cached"
              : "3 awaiting technician response"
          }
          deltaTone={bookingsError ? "down" : "flat"}
          icon={CalendarClock}
          accent="gold"
        />
        <StatCell
          label="Connected capacity"
          value={`${totalCapacity.toLocaleString("en-IN")} kW`}
          delta={`${plants.length} plants under contract`}
          deltaTone="up"
          icon={Sun}
          accent="teal"
        />
        <StatCell
          label="Technicians available"
          value={`${availableTechs} / ${technicians.length}`}
          delta="2 currently on job"
          deltaTone="flat"
          icon={HardHat}
          accent="teal"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card-shadow rounded-md border border-border bg-surface p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-lo">
                Revenue &amp; booking volume
              </p>
              <p className="font-display text-lg text-hi">Last 6 months</p>
            </div>
            <span className="flex items-center gap-1 font-mono text-[11px] text-teal">
              <ArrowUpRight size={13} /> 18.4% avg growth
            </span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart
              data={revenueSeries}
              margin={{ top: 24, right: 8, left: -16, bottom: 0 }}
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
                tick={{
                  fill: "#9AA5B1",
                  fontSize: 11,
                  fontFamily: "JetBrains Mono",
                }}
                axisLine={{ stroke: "#232D37" }}
                tickLine={false}
              />
              <YAxis
                stroke="#5B6572"
                tick={{
                  fill: "#9AA5B1",
                  fontSize: 11,
                  fontFamily: "JetBrains Mono",
                }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v / 1000}k`}
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
                formatter={(value) => [currency(Number(value)), "Revenue"]}
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

        <div className="card-shadow rounded-md border border-border bg-surface p-6">
          <p className="font-mono text-[11px] uppercase tracking-widest text-lo">
            Booking pipeline
          </p>
          <p className="font-display text-lg text-hi">Current distribution</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={bookingStatusBreakdown}
              layout="vertical"
              margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="status"
                width={140}
                tick={{ fill: "#9AA5B1", fontSize: 10.5, fontFamily: "Inter" }}
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
              />
              <Bar dataKey="count" radius={[0, 2, 2, 0]}>
                {bookingStatusBreakdown.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5">
            {bookingStatusBreakdown.map((s) => (
              <div
                key={s.status}
                className="flex items-center justify-between text-[11px]"
              >
                <span className="flex items-center gap-1.5 text-lo">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  {s.status}
                </span>
                <span className="font-mono text-hi">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card-shadow rounded-md border border-border bg-surface p-6 lg:col-span-2">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-widest text-lo">
            Bookings needing attention
          </p>
          {bookingsLoading ? (
            <p className="font-mono text-[11px] text-faint">
              Loading booking requests…
            </p>
          ) : bookingsError ? (
            <p className="font-mono text-[11px] text-red-400">
              Couldn't load live requests ({bookingsError}) — showing cached
              data.
            </p>
          ) : null}
          <div className="space-y-2">
            {bookings
              .filter((b) =>
                ["requested", "payment_pending", "rejected"].includes(b.status),
              )
              .map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between border border-border bg-surface2 px-4 py-3"
                >
                  <div>
                    <p className="text-[13px] font-medium text-hi">
                      {b.id} · {b.plantName}
                    </p>
                    <p className="font-mono text-[11px] text-faint">
                      {b.clientName}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))}
          </div>
        </div>

        <div className="card-shadow rounded-md border border-border bg-surface p-6">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-widest text-lo">
            Recent activity
          </p>
          <div className="space-y-4">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="border-l-2 border-gold-dim/50 pl-3">
                <p className="text-[12.5px] text-hi">
                  {log.action.replaceAll("_", " ")}
                </p>
                <p className="font-mono text-[10.5px] text-faint">
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
