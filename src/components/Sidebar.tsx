import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  HardHat,
  Sun,
  CalendarClock,
  Receipt,
  ScrollText,
  Settings,
  Wrench,
} from "lucide-react";
import clsx from "clsx";

const nav = [
  { to: "/", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/bookings", label: "Bookings & Assignments", icon: CalendarClock },
  { to: "/services", label: "Services", icon: Wrench },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/technicians", label: "Technicians", icon: HardHat },
  { to: "/plants", label: "Plants", icon: Sun },
  { to: "/payments", label: "Payments & Reports", icon: Receipt },
  { to: "/audit-logs", label: "Audit Logs", icon: ScrollText },
];

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-border bg-surface">
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
        <div className="brand-glow flex h-7 w-7 items-center justify-center rounded-sm bg-gold-soft">
          <Sun size={16} className="text-gold" strokeWidth={2} />
        </div>
        <div className="leading-tight">
          <p className="font-display text-[15px] font-semibold tracking-tight text-hi">
            PVProtect
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
            Admin Console
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                "group relative flex items-center gap-3 rounded-sm px-3 py-2.5 text-[13px] font-medium transition-colors",
                isActive
                  ? "bg-gold-soft text-gold"
                  : "text-lo hover:bg-surface2 hover:text-hi"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} strokeWidth={1.75} />
                {label}
                {isActive && <span className="nav-active-underline" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-4">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            clsx(
              "relative flex items-center gap-3 rounded-sm px-3 py-2.5 text-[13px] font-medium transition-colors",
              isActive ? "bg-gold-soft text-gold" : "text-lo hover:bg-surface2 hover:text-hi"
            )
          }
        >
          {({ isActive }) => (
            <>
              <Settings size={16} strokeWidth={1.75} />
              Settings
              {isActive && <span className="nav-active-underline" />}
            </>
          )}
        </NavLink>
        <div className="card-shadow mt-3 flex items-center gap-2 rounded-sm border border-border bg-surface2 px-3 py-2">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-teal" />
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            Backend synced
          </p>
        </div>
      </div>
    </aside>
  );
}
