import { X } from "lucide-react";
import clsx from "clsx";
import type { ReactNode } from "react";

type ModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Tailwind max-width class for the panel, e.g. "max-w-lg" (default) or "max-w-3xl". */
  widthClassName?: string;
};

export default function Modal({ title, onClose, children, widthClassName = "max-w-lg" }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose} // click on backdrop closes the modal
    >
      <div
        className={clsx("w-full border border-border bg-surface1 p-5", widthClassName)}
        onClick={(e) => e.stopPropagation()} // clicks inside the panel must not bubble to the backdrop
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-sm uppercase tracking-wide text-hi">{title}</h2>
          <button onClick={onClose} className="text-faint hover:text-hi" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}