// ============================================================================
// Special Search: a single query box that understands three concept types
// found across the workbook -- visa/sponsorship terms, job roles, and
// companies -- and returns grouped, cross-referenced results instead of a
// flat list. E.g. searching "H-1B" surfaces candidates on that visa status,
// companies whose job postings offer that sponsorship, AND companies where
// candidates have actually been placed under that visa -- three different
// sheets, one query.
//
// Matching strategy for roles/companies is strict-first, relevant-fallback:
//   1. exact match
//   2. substring match (either direction)
//   3. word-overlap match -- only used if 1 & 2 find nothing, and returns
//      every role/company that shares a significant word with the query
//      (so "software developer" surfaces "Full Stack Developer",
//      "Java Developer", "React Developer", etc. instead of nothing).
// ============================================================================

// Canonical visa terms and every alias a person might type for them.
const VISA_ALIASES = [
  { canonical: "H1B", labels: ["H1B", "H-1B"], match: ["h1b", "h-1b"] },
  { canonical: "H4-EAD", labels: ["H4-EAD", "H-4 EAD", "H4"], match: ["h4-ead", "h4 ead", "h-4", "h4"] },
  { canonical: "STEM OPT", labels: ["STEM OPT"], match: ["stem opt", "stem-opt"] },
  { canonical: "Initial OPT", labels: ["OPT", "Initial OPT"], match: ["opt"] },
  { canonical: "CPT", labels: ["CPT"], match: ["cpt"] },
  { canonical: "GC-EAD", labels: ["GC-EAD", "Green Card"], match: ["gc-ead", "gc ead", "green card"] },
  { canonical: "Citizen", labels: ["Citizen", "US Citizen"], match: ["citizen"] },
  { canonical: "L2-EAD", labels: ["L2-EAD", "L2"], match: ["l2-ead", "l2 ead", "l2"] },
];

// Job-sheet sponsorship values that correspond to each candidate-visa concept.
const VISA_TO_JOB_SPONSORSHIP = {
  H1B: ["H-1B", "Any / Open"],
  "H4-EAD": ["H-4 EAD", "Any / Open"],
  "STEM OPT": ["OPT", "Any / Open"],
  "Initial OPT": ["OPT", "Any / Open"],
  CPT: ["CPT", "Any / Open"],
  "GC-EAD": ["GC-EAD", "Any / Open"],
  Citizen: ["Citizen Only", "Any / Open"],
  "L2-EAD": ["Any / Open"],
};

function detectVisa(query) {
  const q = query.toLowerCase();
  return VISA_ALIASES.find((v) => v.match.some((m) => q.includes(m))) || null;
}

// Normalize for comparison: lowercase, trim, collapse whitespace.
function normalize(str) {
  return (str || "").toLowerCase().trim().replace(/\s+/g, " ");
}

// Word tokens for overlap scoring, ignoring very short/noisy words like "a", "of".
function tokens(str) {
  return normalize(str)
    .split(" ")
    .filter((t) => t.length > 2);
}

/**
 * Finds every value in `values` that plausibly matches `query`.
 * Strict-first: exact match, then substring match (either direction).
 * Only if BOTH of those come up empty does it fall back to word-overlap
 * matching, returning every value tied for the highest overlap score.
 * This guarantees a query like "software developer" -- which matches no
 * exact role -- still surfaces every "...Developer" role instead of nothing.
 */
function matchValues(query, values) {
  const q = normalize(query);
  if (!q) return [];

  const exact = values.filter((v) => normalize(v) === q);
  if (exact.length) return exact;

  const substr = values.filter((v) => {
    const nv = normalize(v);
    return q.includes(nv) || nv.includes(q);
  });
  if (substr.length) return substr;

  const qTokens = tokens(q);
  if (!qTokens.length) return [];

  const scored = values
    .map((v) => {
      const vTokens = tokens(v);
      const overlap = qTokens.filter((t) => vTokens.includes(t)).length;
      return { value: v, overlap };
    })
    .filter((s) => s.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap);

  if (!scored.length) return [];
  const topScore = scored[0].overlap;
  return scored.filter((s) => s.overlap === topScore).map((s) => s.value);
}

function groupCount(items, keyFn) {
  const map = {};
  items.forEach((item) => {
    const k = keyFn(item);
    if (!k) return;
    map[k] = (map[k] || 0) + 1;
  });
  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Runs a special search against the workbook data and returns a structured
 * result the page can render section-by-section.
 */
export function runSpecialSearch(query, data) {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const allRoles = [...new Set(data.Candidates.map((c) => c.TargetRole).filter(Boolean))];
  const allCompanies = [...new Set(data.Jobs.map((j) => j.Company).filter(Boolean))];

  const visa = detectVisa(trimmed);
  const matchedRoles = !visa ? matchValues(trimmed, allRoles) : [];
  const matchedCompanies = !visa && !matchedRoles.length ? matchValues(trimmed, allCompanies) : [];

  if (visa) {
    const sponsorshipValues = VISA_TO_JOB_SPONSORSHIP[visa.canonical] || [];
    const candidatesOnVisa = data.Candidates.filter((c) => c.VisaStatus === visa.canonical);
    const jobsOffering = data.Jobs.filter((j) => sponsorshipValues.includes(j.VisaSponsorship));
    const placedOnVisa = candidatesOnVisa.filter((c) => c.Status === "Placed" && c.PlacedCompany);

    return {
      type: "visa",
      label: visa.labels[0],
      query: trimmed,
      candidatesOnVisa,
      jobsOffering,
      placedOnVisa,
      companiesOffering: groupCount(jobsOffering, (j) => j.Company),
      placedByCompany: groupCount(placedOnVisa, (c) => c.PlacedCompany),
      visaBreakdownOfCandidates: groupCount(candidatesOnVisa, (c) => c.Status),
    };
  }

  if (matchedRoles.length) {
    const jobsForRole = data.Jobs.filter((j) => matchedRoles.includes(j.Title));
    const placedInRole = data.Candidates.filter(
      (c) => c.Status === "Placed" && matchedRoles.includes(c.PlacedJobTitle)
    );
    const marketingInRole = data.Candidates.filter(
      (c) => matchedRoles.includes(c.TargetRole) && (c.Status === "Active" || c.Status === "In Marketing")
    );

    return {
      type: "role",
      // Show the exact role name when there's one clean match; otherwise
      // show what the person typed, since we're covering several roles.
      label: matchedRoles.length === 1 ? matchedRoles[0] : trimmed,
      matchedRoles,
      query: trimmed,
      jobsForRole,
      placedInRole,
      marketingInRole,
      companiesHiring: groupCount(jobsForRole, (j) => j.Company),
      visaMixMarketing: groupCount(marketingInRole, (c) => c.VisaStatus),
    };
  }

  if (matchedCompanies.length) {
    const jobsAtCompany = data.Jobs.filter((j) => matchedCompanies.includes(j.Company));
    const placedAtCompany = data.Candidates.filter(
      (c) => c.Status === "Placed" && matchedCompanies.includes(c.PlacedCompany)
    );
    const interviewsAtCompany = data.Interviews.filter((i) => matchedCompanies.includes(i.ClientName));

    return {
      type: "company",
      label: matchedCompanies.length === 1 ? matchedCompanies[0] : trimmed,
      matchedCompanies,
      query: trimmed,
      jobsAtCompany,
      placedAtCompany,
      interviewsAtCompany,
      rolesOpen: groupCount(jobsAtCompany, (j) => j.Title),
      visaSponsorshipOffered: groupCount(jobsAtCompany, (j) => j.VisaSponsorship),
    };
  }

  // Fallback: general fuzzy match across candidates / jobs / recruiters by
  // name/title/skill/location/role -- this only runs if nothing above matched.
  const q = trimmed.toLowerCase();
  const candidateMatches = data.Candidates.filter(
    (c) =>
      c.Name.toLowerCase().includes(q) ||
      (c.Technology || "").toLowerCase().includes(q) ||
      (c.Skills || "").toLowerCase().includes(q) ||
      (c.CurrentLocation || "").toLowerCase().includes(q) ||
      (c.TargetRole || "").toLowerCase().includes(q) ||
      (c.PlacedJobTitle || "").toLowerCase().includes(q)
  ).slice(0, 25);
  const jobMatches = data.Jobs.filter(
    (j) =>
      j.Title.toLowerCase().includes(q) ||
      j.Company.toLowerCase().includes(q) ||
      (j.Skills || "").toLowerCase().includes(q) ||
      `${j.City} ${j.State}`.toLowerCase().includes(q)
  ).slice(0, 25);
  const recruiterMatches = data.Recruiters.filter(
    (r) => r.Name.toLowerCase().includes(q) || (r.Title || "").toLowerCase().includes(q)
  ).slice(0, 25);

  return {
    type: "general",
    label: trimmed,
    query: trimmed,
    candidateMatches,
    jobMatches,
    recruiterMatches,
  };
}

export const SUGGESTED_QUERIES = [
  "H-1B sponsorship",
  "OPT",
  "Green Card",
  "Data Analyst",
  "DevOps Engineer",
  "Beacon Hill",
];