import { Search } from "lucide-react";
import clsx from "clsx";

export function ToolbarSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative w-full max-w-xs">
      <Search
        size={14}
        strokeWidth={1.75}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-sm border border-border bg-surface2 py-2 pl-8 pr-3 text-[12.5px] text-hi placeholder:text-faint focus:border-gold-dim focus:outline-none"
      />
    </div>
  );
}

export function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "whitespace-nowrap rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors",
        active
          ? "border-gold-dim bg-gold-soft text-gold"
          : "border-border bg-surface2 text-lo hover:text-hi"
      )}
    >
      {label}
    </button>
  );
}
