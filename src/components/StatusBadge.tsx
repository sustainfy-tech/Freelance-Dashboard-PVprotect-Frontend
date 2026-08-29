import clsx from "clsx";

type Tone = "gold" | "teal" | "danger" | "neutral";

const toneClasses: Record<Tone, string> = {
  gold: "bg-gold-soft text-gold border-gold-dim/40",
  teal: "bg-teal-soft text-teal border-teal-dim/40",
  danger: "bg-danger-soft text-danger border-danger/30",
  neutral: "bg-surface3 text-lo border-border",
};

const statusToneMap: Record<string, Tone> = {
  requested: "neutral",
  assigned: "gold",
  en_route: "gold",
  in_progress: "gold",
  completed: "teal",
  closed: "teal",
  payment_pending: "danger",
  rejected: "danger",
  available: "teal",
  on_job: "gold",
  off_duty: "neutral",
  suspended: "danger",
  active: "teal",
  inactive: "neutral",
  pending: "gold",
  submit_for_review: "gold",
  received: "gold",
  otp_verified: "teal",
  verified: "teal",
  failed: "danger",
  approved: "teal",
  unknown: "neutral",
};

function label(status: string) {
  if (!status) return "Unknown";
  return status
    .split("_")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

export default function StatusBadge({ status }: { status: string }) {
  const safeStatus = status || "unknown";
  const tone = statusToneMap[safeStatus] ?? "neutral";
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-mono font-medium uppercase tracking-wide",
        toneClasses[tone],
      )}
    >
      <span
        className={clsx("h-1.5 w-1.5 rounded-full", {
          "bg-gold": tone === "gold",
          "bg-teal": tone === "teal",
          "bg-danger": tone === "danger",
          "bg-faint": tone === "neutral",
        })}
      />
      {label(safeStatus)}
    </span>
  );
}
