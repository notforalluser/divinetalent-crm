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

// Broad job-family categories for terms whose word FORM varies across the
// sheets in a way plain substring matching can't catch (e.g. "Finance" the
// noun vs. "Financial" the adjective vs. "Accountant"/"Payroll" which don't
// share letters with "finance" at all). Keep this list for genuine synonym /
// stemming cases only -- everything else is handled by the generic matcher
// below, which is now broad enough that most queries never need a category.
const ROLE_CATEGORIES = [
  {
    name: "Finance",
    regex: /finance|financial|accounting|accountant|payroll|investment|treasury/i,
  },
  {
    name: "Marketing",
    regex: /marketing|seo\b|social media|content strategy|digital marketing|brand/i,
  },
];

function detectCategory(query) {
  const q = query.toLowerCase();
  return (
    ROLE_CATEGORIES.find((cat) => q.includes(cat.name.toLowerCase()) || cat.regex.test(q)) || null
  );
}

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

// Generic "is this string relevant to the query" test, used consistently
// against Jobs.Title, Candidates.TargetRole, and Candidates.PlacedJobTitle.
// This replaces the old approach of first shrinking the query down to a
// handful of exact role strings pulled only from the Candidates sheet, then
// requiring Jobs.Title to equal one of those exactly -- which is why
// "analyst" only found jobs whose title exactly matched one of the ~5
// canonical analyst roles that happened to appear in Candidates, even though
// hundreds more analyst jobs existed in the Jobs sheet under other titles.
// Matching every sheet directly against the query keeps every card/table on
// the page (open jobs, companies hiring, placements, marketing) built from
// the *same* underlying set, so their counts can never disagree.
function isRelevant(str, query) {
  const v = normalize(str);
  const q = normalize(query);
  if (!v || !q) return false;
  if (v === q) return true;
  if (v.includes(q) || q.includes(v)) return true;

  const qTokens = tokens(q);
  if (!qTokens.length) return false;
  const vTokens = tokens(v);
  // Any shared meaningful word counts as relevant (e.g. "analyst" matches
  // "Data Analyst", "Business Analyst", "Reporting Analyst", ...). This is
  // intentionally inclusive -- the goal of Special Search is to surface
  // everything plausibly related to what was typed, not just a narrow exact
  // match.
  return qTokens.some((t) => vTokens.includes(t));
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

function buildRoleResult(label, query, matcher, data) {
  const jobsForRole = data.Jobs.filter((j) => matcher(j.Title || ""));
  const placedInRole = data.Candidates.filter(
    (c) => c.Status === "Placed" && matcher(c.PlacedJobTitle || "")
  );
  const marketingInRole = data.Candidates.filter(
    (c) => matcher(c.TargetRole || "") && (c.Status === "Active" || c.Status === "In Marketing")
  );

  if (!jobsForRole.length && !placedInRole.length && !marketingInRole.length) return null;

  const matchedRoles = [
    ...new Set([
      ...jobsForRole.map((j) => j.Title),
      ...placedInRole.map((c) => c.PlacedJobTitle),
      ...marketingInRole.map((c) => c.TargetRole),
    ]),
  ].filter(Boolean);

  return {
    type: "role",
    label: label || (matchedRoles.length === 1 ? matchedRoles[0] : query),
    matchedRoles,
    query,
    jobsForRole,
    placedInRole,
    marketingInRole,
    // Built from the exact same jobsForRole array shown in the table, so the
    // "Companies hiring" count and the open-jobs table total always agree --
    // sum(companiesHiring[*].count) === jobsForRole.length by construction.
    companiesHiring: groupCount(jobsForRole, (j) => j.Company),
    visaMixMarketing: groupCount(marketingInRole, (c) => c.VisaStatus),
  };
}

/**
 * Runs a special search against the workbook data and returns a structured
 * result the page can render section-by-section.
 */
export function runSpecialSearch(query, data) {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const visa = detectVisa(trimmed);
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

  // Known synonym/stemming categories first (Finance, Marketing, ...).
  const category = detectCategory(trimmed);
  if (category) {
    const result = buildRoleResult(category.name, trimmed, (str) => category.regex.test(str), data);
    if (result) return result;
  }

  // Generic role match: works directly against Jobs/Candidates text, so it
  // scales to any term ("analyst", "engineer", "manager", "recruiter", ...)
  // without needing a hardcoded category, and never undercounts relative to
  // what the table displays.
  const roleResult = buildRoleResult(null, trimmed, (str) => isRelevant(str, trimmed), data);
  if (roleResult) return roleResult;

  // Company match -- only reached when nothing above found a single related
  // job title or target role.
  const allCompanies = [...new Set(data.Jobs.map((j) => j.Company).filter(Boolean))];
  const matchedCompanies = allCompanies.filter((c) => isRelevant(c, trimmed));

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
  ).slice(0, 100);
  const jobMatches = data.Jobs.filter(
    (j) =>
      j.Title.toLowerCase().includes(q) ||
      j.Company.toLowerCase().includes(q) ||
      (j.Skills || "").toLowerCase().includes(q) ||
      `${j.City} ${j.State}`.toLowerCase().includes(q)
  ).slice(0, 100);
  const recruiterMatches = data.Recruiters.filter(
    (r) => r.Name.toLowerCase().includes(q) || (r.Title || "").toLowerCase().includes(q)
  ).slice(0, 100);

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
  "Finance",
  "Marketing",
  "Analyst",
  "Data Analyst",
  "DevOps Engineer",
  "Beacon Hill",
];