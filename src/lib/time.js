// ============================================================================
// Relative time formatting ("6h ago", "20m ago", "2d ago", "20d ago"...)
// and helpers to hide records dated in the future until that date arrives.
//
// "Now" is always computed in IST (UTC+5:30) regardless of the machine's
// local timezone, so "today" means the same thing everywhere in the app --
// on the dashboard, in the Excel-driven data, and in every chart -- instead
// of silently drifting by a few hours depending on where it's opened from.
// ============================================================================

const IST_OFFSET_MINUTES = 5 * 60 + 30;

export function nowIST() {
  const utcMs = Date.now() + new Date().getTimezoneOffset() * 60000;
  return new Date(utcMs + IST_OFFSET_MINUTES * 60000);
}

export function timeAgo(dateInput, now = nowIST()) {
  const d = new Date(dateInput);
  if (isNaN(d)) return "--";
  const diffMs = now - d;
  const future = diffMs < 0;
  const abs = Math.abs(diffMs);

  const sec = Math.floor(abs / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  const week = Math.floor(day / 7);
  const month = Math.floor(day / 30);
  const year = Math.floor(day / 365);

  let label;
  if (sec < 45) label = "just now";
  else if (min < 60) label = `${min}m`;
  else if (hr < 24) label = `${hr}h`;
  else if (day < 7) label = `${day}d`;
  else if (day < 30) label = `${week}w`;
  else if (day < 365) label = `${month}mo`;
  else label = `${year}y`;

  if (label === "just now") return label;
  return future ? `in ${label}` : `${label} ago`;
}

export function isFutureDated(dateInput, now = nowIST()) {
  const d = new Date(dateInput);
  if (isNaN(d)) return false;
  return d.getTime() > now.getTime();
}

/** Filters out rows whose `field` date is later than right now (IST). */
export function excludeFutureDated(rows, field, now = nowIST()) {
  return rows.filter((r) => !isFutureDated(r[field], now));
}

// ---------------------------------------------------------------------------
// Day-grained helpers ("Today", "Tomorrow", date columns/keys...)
// ---------------------------------------------------------------------------
export function startOfDay(dateInput) {
  const d = new Date(dateInput);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(dateInput, n) {
  const d = new Date(dateInput);
  d.setDate(d.getDate() + n);
  return d;
}

export function diffInDays(a, b) {
  return Math.round((startOfDay(a) - startOfDay(b)) / 86400000);
}

export function dateKey(dateInput) {
  const d = startOfDay(dateInput);
  if (isNaN(d)) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatFullDate(dateInput) {
  const d = new Date(dateInput);
  if (isNaN(d)) return "--";
  return d.toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
}

export function formatShortDate(dateInput) {
  const d = new Date(dateInput);
  if (isNaN(d)) return "--";
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
}

export function weekdayName(dateInput) {
  const d = new Date(dateInput);
  if (isNaN(d)) return "";
  return d.toLocaleDateString(undefined, { weekday: "long" });
}

/**
 * Human label for a date relative to today (IST): "Today", "Tomorrow", or
 * null for anything else -- callers should show the plain date in that case.
 */
export function relativeDayLabel(dateInput, now = nowIST()) {
  const diffDays = diffInDays(dateInput, now);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return null;
}

/**
 * The status an interview should DISPLAY as, computed live -- not just
 * whatever's baked into the sheet. A real outcome (Completed/Selected/
 * Rejected/No-Show/Rescheduled) only ever shows once the interview date
 * has actually passed relative to right now; today-or-future always shows
 * "Pending Feedback", matching the same Completed/Upcoming split used on
 * a candidate's own profile. This is what keeps every view of an
 * interview's status in agreement with each other, regardless of when the
 * underlying workbook was generated.
 */
export function effectiveInterviewStatus(interview, now = nowIST()) {
  return diffInDays(interview.InterviewDate, now) < 0 ? interview.Status : "Pending Feedback";
}
