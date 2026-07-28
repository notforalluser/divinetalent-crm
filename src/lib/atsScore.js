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

export function resolveProfileForFile(fileName, settings) {
  const override = findOverride(fileName, settings);
  return override ? override.profile : settings.atsGeneralProfile;
}

export function isEligible(score, settings) {
  const threshold = clamp(Number(settings.atsEligibilityThreshold) || 0, 0, 100);
  return score >= threshold;
}
