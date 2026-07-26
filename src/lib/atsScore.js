function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function findOverride(fileName, settings) {
  const normalized = (fileName || "").trim().toLowerCase();
  return (settings.atsFilenameOverrides || []).find(
    (o) => o.filename.trim().toLowerCase() === normalized
  );
}

/**
 * Generates the simulated ATS score for a filename. Called ONCE, at the
 * moment a resume is scanned -- the number itself is a snapshot of "the
 * analysis that already happened" and shouldn't silently change later just
 * because someone tweaks the score range in Settings afterward.
 */
export function generateAtsScore(fileName, settings) {
  const override = findOverride(fileName, settings);
  if (override) {
    const min = clamp(Number(override.minScore) || 80, 0, 100);
    return randomInt(min, 100);
  }
  let min = clamp(Number(settings.atsScoreMin) || 0, 0, 100);
  let max = clamp(Number(settings.atsScoreMax) || 100, 0, 100);
  if (max <= min) max = Math.min(100, min + 1);
  return randomInt(min, max);
}

/**
 * Resolves which profile to display for a filename -- a filename
 * override's own profile if the name matches, otherwise the general
 * "all users" profile. Unlike the score, this is meant to be called on
 * every render (e.g. from a useMemo keyed on `settings`) so that editing
 * a name, job role, or any other profile field in Settings updates
 * whatever's already on screen immediately, with no re-scan required.
 */
export function resolveProfileForFile(fileName, settings) {
  const override = findOverride(fileName, settings);
  return override ? override.profile : settings.atsGeneralProfile;
}

/** Whether a given score clears the (live, adjustable) eligibility bar. */
export function isEligible(score, settings) {
  const threshold = clamp(Number(settings.atsEligibilityThreshold) || 0, 0, 100);
  return score >= threshold;
}
