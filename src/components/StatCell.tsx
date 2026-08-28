import type { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface StatCellProps {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "up" | "down" | "flat";
  icon: LucideIcon;
  accent?: "gold" | "teal";
}

export default function StatCell({
  label,
  value,
  delta,
  deltaTone = "flat",
  icon: Icon,
  accent = "gold",
}: StatCellProps) {
  return (
    <div className="card-shadow relative overflow-hidden border border-border bg-surface p-5">
      <div
        className={clsx(
          "absolute -right-6 -top-6 h-24 w-24 rounded-full blur-3xl opacity-20",
          accent === "gold" ? "bg-gold" : "bg-teal"
        )}
      />
      <div className="relative flex items-start justify-between">
        <p className="font-mono text-[11px] uppercase tracking-widest text-lo">{label}</p>
        <Icon
          size={16}
          strokeWidth={1.75}
          className={accent === "gold" ? "text-gold" : "text-teal"}
        />
      </div>
      <p className="relative mt-3 font-display text-[28px] font-medium leading-none text-hi">
        {value}
      </p>
      {delta && (
        <p
          className={clsx("relative mt-2 font-mono text-[11px]", {
            "text-teal": deltaTone === "up",
            "text-danger": deltaTone === "down",
            "text-faint": deltaTone === "flat",
          })}
        >
          {delta}
        </p>
      )}
    </div>
  );
}
