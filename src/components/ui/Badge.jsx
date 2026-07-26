// Single place to control status -> color mapping across the whole CRM.
export const STATUS_COLORS = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Placed: "bg-crimson-50 text-crimson-600 border-crimson-100",
  "On Bench": "bg-amber-50 text-amber-700 border-amber-100",
  "In Marketing": "bg-blue-50 text-blue-700 border-blue-100",
  "Do Not Contact": "bg-ink/5 text-ink-soft border-line",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Selected: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Rejected: "bg-crimson-50 text-crimson-600 border-crimson-100",
  "No-Show": "bg-amber-50 text-amber-700 border-amber-100",
  Rescheduled: "bg-blue-50 text-blue-700 border-blue-100",
  Scheduled: "bg-blue-50 text-blue-700 border-blue-100",
  "Pending Feedback": "bg-ink/5 text-ink-soft border-line",
  Closed: "bg-ink/5 text-ink-soft border-line",
  Pending: "bg-amber-50 text-amber-700 border-amber-100",
  "In Progress": "bg-blue-50 text-blue-700 border-blue-100",
  default: "bg-cloud text-ink-soft border-line",
};

function cx(...args) {
  return args.filter(Boolean).join(" ");
}

export default function Badge({ children, tone, className = "" }) {
  const color = STATUS_COLORS[tone] || STATUS_COLORS[children] || STATUS_COLORS.default;
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        color,
        className
      )}
    >
      {children}
    </span>
  );
}
