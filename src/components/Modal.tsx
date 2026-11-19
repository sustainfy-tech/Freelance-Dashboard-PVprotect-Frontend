import { X } from "lucide-react";
import clsx from "clsx";
import type { ReactNode } from "react";

type ModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  widthClassName?: string;
};

export default function Modal({
  title,
  onClose,
  children,
  widthClassName = "max-w-lg",
}: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className={clsx(
          "flex max-h-[92dvh] w-full flex-col rounded-t-md border border-border bg-surface sm:max-h-[90dvh] sm:rounded-sm",
          widthClassName,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
          <h2 className="min-w-0 truncate font-mono text-sm uppercase tracking-wide text-hi">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="-mr-2 shrink-0 rounded-sm p-2 text-faint hover:text-hi"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        {/* The modal body is the single scroll area */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {children}
        </div>
      </div>
    </div>
  );
}