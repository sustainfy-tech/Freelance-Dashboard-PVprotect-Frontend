import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import clsx from "clsx";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const COLLAPSE_KEY = "pvprotect:sidebar-collapsed";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile / tablet drawer
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === "1";
    } catch {
      return false;
    }
  }); 

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
      }
      return next;
    });
  }

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setSidebarOpen(false);
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="min-h-dvh bg-bg">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapsed}
      />

      {/* Content shifts with the sidebar width from lg up only */}
      <div
        className={clsx(
          "min-w-0 transition-[padding] duration-200 ease-out",
          collapsed ? "lg:pl-16" : "lg:pl-64",
        )}
      >
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="mx-auto w-full min-w-0 max-w-350 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}