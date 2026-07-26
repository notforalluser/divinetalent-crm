// Helpers for the Interview page -- grouping upcoming interviews by day and
// producing a friendly "Today / Tomorrow / Wednesday / full date" label.

export function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function dayDiff(date, now = new Date()) {
  return Math.round((startOfDay(date) - startOfDay(now)) / 86400000);
}

/** Returns null for "today/tomorrow/weekday" cases (handled separately) and
 *  a short label once we're more than a week out. */
export function relativeDayLabel(date, now = new Date()) {
  const diff = dayDiff(date, now);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff > 1 && diff <= 7) return new Date(date).toLocaleDateString(undefined, { weekday: "long" });
  if (diff < 0) return "Past";
  return null; // beyond a week -- just show the full date, no relative tag
}

export function fullDate(date) {
  return new Date(date).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

export function dateKey(date) {
  return startOfDay(date).toDateString();
}
