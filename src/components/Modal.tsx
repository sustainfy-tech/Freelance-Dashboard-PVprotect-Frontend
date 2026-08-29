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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={clsx(
          "w-full border border-border bg-surface1 p-5",
          widthClassName,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-sm uppercase tracking-wide text-hi">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-faint hover:text-hi"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
