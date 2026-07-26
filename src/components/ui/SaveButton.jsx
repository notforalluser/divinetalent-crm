import { Bookmark } from "lucide-react";
import { useSaved } from "../../context/SavedContext";

function cx(...args) {
  return args.filter(Boolean).join(" ");
}

/**
 * type: "candidates" | "jobs" | "recruiters"
 * id: the row's unique ID (CandidateID / JobID / RecruiterID)
 * sheetValue: the row's own Saved column value (used until overridden)
 */
export default function SaveButton({ type, id, sheetValue, size = "md", className = "" }) {
  const { isSaved, toggleSaved } = useSaved();
  const saved = isSaved(type, id, sheetValue);
  const dims = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSaved(type, id, sheetValue);
      }}
      title={saved ? "Remove from saved" : "Save"}
      className={cx(
        "inline-flex items-center justify-center rounded-full transition-colors",
        saved ? "text-crimson-600" : "text-slate hover:text-ink",
        className
      )}
    >
      <Bookmark className={dims} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
