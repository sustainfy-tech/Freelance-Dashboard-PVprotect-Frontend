import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="card-shadow flex items-center justify-center gap-2.5 rounded-md border border-border bg-surface py-16 text-lo">
      <Loader2 size={16} className="animate-spin" />
      <span className="font-mono text-[12px]">{label}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="card-shadow flex flex-col items-center gap-3 rounded-md border border-danger/30 bg-danger-soft px-6 py-12 text-center">
      <AlertTriangle size={20} className="text-danger" />
      <p className="max-w-md text-[13px] text-hi">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 flex items-center gap-1.5 rounded-sm border border-border bg-surface2 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-lo transition-colors hover:text-hi"
        >
          <RefreshCw size={12} /> Retry
        </button>
      )}
    </div>
  );
}
