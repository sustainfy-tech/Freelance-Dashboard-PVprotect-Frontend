import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./Context/Authcontext";
import ProtectedRoute from "./components/ProtectedRoutes";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Overview from "./pages/Overview";
import Bookings from "./pages/Bookings";
import Clients from "./pages/Clients";
import Technicians from "./pages/Technicians";
import Plants from "./pages/Plants";
import Payments from "./pages/Payments";
import AuditLogs from "./pages/AuditLogs";
import Settings from "./pages/Settings";
import Services from "./pages/Services";
import SiteVisitForm from "./components/SiteVisitForm";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Overview />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/services" element={<Services />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/technicians" element={<Technicians />} />
              <Route path="/plants" element={<Plants />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
              <Route path="/settings" element={<Settings />} />
              <Route
                path="/form"
                element={<SiteVisitForm serviceId={""} bookingId={""} />}
              />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
