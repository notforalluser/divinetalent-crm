// A tiny seeded PRNG so illustrative charts (like a single job's applicant
// trend) look plausible and stay stable across renders/refreshes for the
// same job, without needing real day-by-day per-job application records.

function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(h, 31) + str.charCodeAt(i)) | 0;
  return h;
}

/** Deterministic-per-seed daily counts that roughly sum toward `total`. */
export function syntheticDailyCounts(seed, days, total) {
  const rand = mulberry32(hashString(String(seed)));
  const weights = Array.from({ length: days }, () => 0.4 + rand());
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const target = Math.max(total, days);
  return weights.map((w) => Math.max(0, Math.round((w / weightSum) * target)));
}
