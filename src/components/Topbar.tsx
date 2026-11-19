import { useState, useRef, useEffect } from "react";
import { Search, Bell, LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/useAuth";

function getInitials(name?: string, email?: string) {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    const initials =
      parts.length > 1
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`
        : parts[0].slice(0, 2);
    return initials.toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "AD";
}

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const displayName = admin?.name || admin?.name || "Admin";
  const displayRole = admin?.email
    ? admin.email.replace(/\b\w/g, (c) => c.toLowerCase())
    : "Admin";

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-3 border-b border-border bg-bg/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          onClick={onMenuClick}
          className="-ml-2 shrink-0 rounded-sm p-2 text-lo transition-colors hover:text-hi lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} strokeWidth={1.75} />
        </button>

        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <Search
            size={15}
            strokeWidth={1.75}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
          />
          <input
            type="text"
            placeholder="Search clients, plants, booking IDs…"
            className="w-full rounded-sm border border-border bg-surface py-2 pl-9 pr-3 text-[13px] text-hi placeholder:text-faint focus:border-gold-dim focus:outline-none"
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <button
          className="relative rounded-sm p-2 text-lo transition-colors hover:text-hi"
          aria-label="Notifications"
        >
          <Bell size={17} strokeWidth={1.75} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
        </button>
        <div className="hidden h-6 w-px bg-border sm:block" />

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Account menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-2.5 rounded-sm px-1 py-1 transition-colors hover:bg-surface3"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface3 font-mono text-[11px] font-medium text-gold">
              {getInitials(admin?.name, admin?.email)}
            </div>
            <div className="hidden min-w-0 text-left leading-tight sm:block">
              <p className="max-w-40 truncate text-[13px] font-medium font-['Times_New_Roman'] text-hi">
                {displayName}
              </p>
              <p className="max-w-40 truncate text-[10px] font-['Times_New_Roman'] lowecase tracking-wide text-faint">
                {displayRole}
              </p>
            </div>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-sm border border-border bg-surface py-1 shadow-lg">
              <div className="border-b border-border px-3.5 py-2 sm:hidden">
                <p className="truncate text-[13px] font-medium text-hi">
                  {displayName}
                </p>
                <p className="truncate font-mono text-[10px] text-faint">
                  {displayRole}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-[13px] text-lo transition-colors hover:bg-surface3 hover:text-hi"
              >
                <LogOut size={14} strokeWidth={1.75} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}