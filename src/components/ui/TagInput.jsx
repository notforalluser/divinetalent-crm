import { useState } from "react";
import { X } from "lucide-react";

/**
 * Tag/chip input used for multi-value fields like job roles and skills.
 * Type a value and press Enter or comma to add it as a chip; press
 * Backspace on an empty input to remove the last chip. An optional
 * `suggestions` list renders as a native <datalist>, so the field behaves
 * like both a free-text box and a dropdown of common values.
 */
export default function TagInput({ value = [], onChange, placeholder, suggestions, listId }) {
  const [draft, setDraft] = useState("");

  function commit(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    if (value.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...value, trimmed]);
    setDraft("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(draft);
    } else if (e.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-line bg-paper px-2 py-1.5 focus-within:ring-2 focus-within:ring-crimson-500/40 focus-within:border-crimson-500">
        {value.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 rounded-full bg-crimson-50 text-crimson-600 text-xs font-semibold px-2 py-1">
            {v}
            <button onClick={() => onChange(value.filter((x) => x !== v))} className="hover:text-crimson-800">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => commit(draft)}
          placeholder={value.length === 0 ? placeholder : ""}
          list={listId}
          className="flex-1 min-w-[100px] text-sm py-0.5 focus:outline-none placeholder:text-slate"
        />
      </div>
      {suggestions && (
        <datalist id={listId}>
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}
    </div>
  );
}
