import SectionHeader from "../components/SectionHeader";

const admins = [
  {
    name: "S. Kulkarni",
    email: "s.kulkarni@pvprotect.in",
    role: "Super Admin",
  },
  { name: "R. Mehta", email: "r.mehta@pvprotect.in", role: "Ops Admin" },
  { name: "N. Iyer", email: "n.iyer@pvprotect.in", role: "Finance Admin" },
];

export default function Settings() {
  return (
    <div>
      <SectionHeader
        eyebrow="Auth · Access control"
        title="Admin settings"
        description="Manage admin accounts, roles, and platform-wide preferences."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card-shadow rounded-md border border-border bg-surface p-6">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-widest text-lo">
            Admin accounts
          </p>
          <div className="space-y-3">
            {admins.map((a) => (
              <div
                key={a.email}
                className="flex items-center justify-between border border-border bg-surface2 px-4 py-3"
              >
                <div>
                  <p className="text-[13px] text-hi">{a.name}</p>
                  <p className="font-mono text-[11px] text-faint">{a.email}</p>
                </div>
                <span className="rounded-full border border-gold-dim/40 bg-gold-soft px-2.5 py-1 font-mono text-[10.5px] uppercase text-gold">
                  {a.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-shadow rounded-md border border-border bg-surface p-6">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-widest text-lo">
            Platform preferences
          </p>
          <div className="space-y-4 text-[13px]">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-lo">Require OTP on payment closure</span>
              <span className="font-mono text-teal">Enabled</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-lo">
                Auto-reassign on technician rejection
              </span>
              <span className="font-mono text-teal">Enabled</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-lo">Push notifications</span>
              <span className="font-mono text-teal">Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lo">Audit log retention</span>
              <span className="font-mono text-hi">365 days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
