// Single place to control status -> color mapping across the whole CRM.
// Grayscale by design: status is conveyed through weight (solid black vs.
// outlined vs. muted gray), not hue, so nothing here competes with data.
export const STATUS_COLORS = {
  // Strong / resolved-positive states — solid black fill
  Active: "bg-neutral-900 text-white border-neutral-900",
  Placed: "bg-neutral-900 text-white border-neutral-900",
  Completed: "bg-neutral-900 text-white border-neutral-900",
  Selected: "bg-neutral-900 text-white border-neutral-900",
  "In Progress": "bg-neutral-900 text-white border-neutral-900",

  // In-flight / neutral states — outlined, mid gray
  "On Bench": "bg-neutral-100 text-neutral-700 border-neutral-300",
  "In Marketing": "bg-neutral-100 text-neutral-700 border-neutral-300",
  Rescheduled: "bg-neutral-100 text-neutral-700 border-neutral-300",
  Scheduled: "bg-neutral-100 text-neutral-700 border-neutral-300",
  Pending: "bg-neutral-100 text-neutral-700 border-neutral-300",
  "No-Show": "bg-neutral-100 text-neutral-600 border-neutral-300",

  // Closed / negative / inactive states — faint, low-emphasis
  "Do Not Contact": "bg-neutral-50 text-neutral-400 border-neutral-200",
  Rejected: "bg-white text-neutral-500 border-neutral-300 line-through decoration-neutral-300",
  "Pending Feedback": "bg-neutral-50 text-neutral-500 border-neutral-200",
  Closed: "bg-neutral-50 text-neutral-400 border-neutral-200",

  default: "bg-neutral-100 text-neutral-600 border-neutral-200",
};

function cx(...args) {
  return args.filter(Boolean).join(" ");
}

export default function Badge({ children, tone, className = "" }) {
  const color = STATUS_COLORS[tone] || STATUS_COLORS[children] || STATUS_COLORS.default;
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-tight",
        color,
        className
      )}
    >
      {children}
    </span>
  );
}