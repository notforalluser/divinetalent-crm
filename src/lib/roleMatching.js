/**
 * True if `job.Title` fuzzily matches any of the given role strings --
 * substring match in either direction, so a configured role of "Data
 * Engineer" also matches postings titled "Senior Data Engineer" or "Lead
 * Data Engineer", and a configured "Senior Data Engineer" still matches a
 * plain "Data Engineer" posting.
 */
export function jobMatchesAnyRole(job, roles) {
  if (!roles || roles.length === 0) return false;
  const title = (job.Title || "").toLowerCase();
  return roles.some((r) => {
    const role = r.toLowerCase();
    return title.includes(role) || role.includes(title);
  });
}

export function findMatchingActiveJobs(jobs, roles, limit = 20) {
  return jobs
    .filter((j) => j.Status === "Active" && jobMatchesAnyRole(j, roles))
    .sort((a, b) => new Date(b.PostedDate) - new Date(a.PostedDate))
    .slice(0, limit);
}

function shuffled(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Attaches a per-company `rowEligible` flag to each matched job -- every
 * company shown is already filtered to the same configured job role(s), so
 * this only decides which ones get tagged Eligible vs Not Eligible:
 * - Overall Eligible: every matching company is tagged Eligible.
 * - Overall Not Eligible: most are tagged Not Eligible, but a small,
 *   realistic subset (still the same matched roles) is tagged Eligible
 *   anyway -- a low ATS score rarely means literally zero good fits.
 */
export function assignCompanyEligibility(matchedJobs, overallEligible) {
  if (overallEligible) {
    return matchedJobs.map((j) => ({ ...j, rowEligible: true }));
  }
  const n = matchedJobs.length;
  const eligibleCount = n === 0 ? 0 : Math.min(3, Math.max(1, Math.round(n * 0.2)));
  const eligibleIds = new Set(shuffled(matchedJobs).slice(0, eligibleCount).map((j) => j.JobID));
  return matchedJobs.map((j) => ({ ...j, rowEligible: eligibleIds.has(j.JobID) }));
}
