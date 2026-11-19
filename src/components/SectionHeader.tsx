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
    <div className="mb-5 flex flex-col gap-4 border-b border-border pb-4 sm:mb-6 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:pb-5">
      <div className="min-w-0">
        <p className="wrap-break-word font-mono text-[10px] uppercase tracking-[0.2em] text-gold sm:text-[11px]">
          {eyebrow}
        </p>
        <h1 className="mt-1 font-display text-xl font-medium text-hi sm:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-3xl text-[13px] text-lo sm:text-sm">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}