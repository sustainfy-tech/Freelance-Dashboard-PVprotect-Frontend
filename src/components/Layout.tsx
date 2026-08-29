import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout() {
  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <div className="pl-64">
        <Topbar />
        <main className="mx-auto max-w-350 px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
