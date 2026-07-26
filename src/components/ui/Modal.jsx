import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, subtitle, children, wide = false }) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative w-full ${wide ? "max-w-4xl" : "max-w-2xl"} max-h-[85vh] overflow-hidden rounded-2xl bg-paper shadow-2xl flex flex-col`}
      >
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-line shrink-0">
          <div>
            <p className="text-base font-bold text-ink">{title}</p>
            {subtitle && <p className="text-xs text-slate mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-slate hover:text-ink rounded-lg p-1 hover:bg-cloud shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto scrollbar-thin">{children}</div>
      </div>
    </div>
  );
}
