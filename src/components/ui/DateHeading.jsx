import { formatFullDate, relativeDayLabel } from "../../lib/time";

export default function DateHeading({ date, count, size = "md" }) {
  const label = relativeDayLabel(date);
  const big = size === "lg" ? "text-xl" : "text-base";
  return (
    <div className="flex items-center gap-3">
      <div>
        <p className={`${big} font-bold text-ink leading-tight`}>{formatFullDate(date)}</p>
        {label && (
          <span
            className={`inline-block mt-0.5 text-[11px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 ${
              label === "Today" ? "bg-crimson-50 text-crimson-600" : "bg-cloud text-ink-soft"
            }`}
          >
            {label}
          </span>
        )}
      </div>
      {typeof count === "number" && (
        <span className="ml-auto text-xs font-semibold text-slate">
          {count} interview{count === 1 ? "" : "s"}
        </span>
      )}
    </div>
  );
}
