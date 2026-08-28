import type { ReactNode } from "react";

export default function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">{eyebrow}</p>
        <h1 className="mt-1 font-display text-2xl font-medium text-hi">{title}</h1>
        {description && <p className="mt-1 max-w-xxl text-sm text-lo">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
