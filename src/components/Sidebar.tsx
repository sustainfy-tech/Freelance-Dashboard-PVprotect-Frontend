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
  X,
  ChevronsLeft,
  ChevronsRight,
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

type SidebarProps = {
  open: boolean; 
  onClose: () => void;
  collapsed: boolean; 
  onToggleCollapse: () => void;
};

export default function Sidebar({
  open,
  onClose,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const c = collapsed;

  const linkClass = (isActive: boolean) =>
    clsx(
      "group relative flex items-center gap-3 rounded-sm px-3 py-3 text-[13px] font-medium transition-colors lg:py-2.5",
      c && "lg:justify-center lg:px-0",
      isActive
        ? "bg-gold-soft text-gold"
        : "text-lo hover:bg-surface2 hover:text-hi",
    );

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 flex w-64 max-w-[85vw] flex-col border-r border-border bg-surface transition-[transform,width] duration-200 ease-out lg:z-20 lg:translate-x-0",
          c ? "lg:w-16" : "lg:w-64",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div
          className={clsx(
            "flex h-16 shrink-0 items-center justify-between gap-2.5 border-b border-border px-5",
            c && "lg:justify-center lg:px-0",
          )}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="brand-glow flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-gold-soft">
              <Sun size={16} className="text-gold" strokeWidth={2} />
            </div>
            <div className={clsx("min-w-0 leading-tight", c && "lg:hidden")}>
              <p className="truncate font-display text-[15px] font-semibold tracking-tight text-hi">
                PVProtect
              </p>
              <p className="truncate font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
                Admin Console
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 rounded-sm p-2 text-lo hover:text-hi lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav
          className={clsx(
            "flex-1 space-y-0.5 overflow-y-auto px-3 py-4",
            c && "lg:px-2",
          )}
        >
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              title={c ? label : undefined}
              aria-label={label}
              className={({ isActive }) => linkClass(isActive)}
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} strokeWidth={1.75} className="shrink-0" />
                  <span className={clsx("truncate", c && "lg:hidden")}>
                    {label}
                  </span>
                  {isActive && <span className="nav-active-underline" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div
          className={clsx(
            "shrink-0 space-y-3 border-t border-border p-4",
            c && "lg:p-2",
          )}
        >
          <NavLink
            to="/settings"
            onClick={onClose}
            title={c ? "Settings" : undefined}
            aria-label="Settings"
            className={({ isActive }) => linkClass(isActive)}
          >
            {({ isActive }) => (
              <>
                <Settings size={16} strokeWidth={1.75} className="shrink-0" />
                <span className={clsx("truncate", c && "lg:hidden")}>
                  Settings
                </span>
                {isActive && <span className="nav-active-underline" />}
              </>
            )}
          </NavLink>

          <div
            title={c ? "Backend synced" : undefined}
            className={clsx(
              "card-shadow flex items-center gap-2 rounded-sm border border-border bg-surface2 px-3 py-2",
              c && "lg:justify-center lg:px-0",
            )}
          >
            <span className="pulse-dot h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
            <p
              className={clsx(
                "font-mono text-[10px] uppercase tracking-widest text-faint",
                c && "lg:hidden",
              )}
            >
              Backend synced
            </p>
          </div>

          {/* Collapse toggle: desktop only */}
          <button
            type="button"
            onClick={onToggleCollapse}
            title={c ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={c ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!c}
            className={clsx(
              "hidden w-full items-center gap-3 rounded-sm px-3 py-2.5 text-[13px] font-medium text-lo transition-colors hover:bg-surface2 hover:text-hi lg:flex",
              c && "lg:justify-center lg:px-0",
            )}
          >
            {c ? (
              <ChevronsRight size={16} strokeWidth={1.75} />
            ) : (
              <>
                <ChevronsLeft size={16} strokeWidth={1.75} />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}