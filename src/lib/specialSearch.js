// ============================================================================
// Special Search: a single query box that understands three concept types
// found across the workbook -- visa/sponsorship terms, job roles, and
// companies -- and returns grouped, cross-referenced results instead of a
// flat list. E.g. searching "H-1B" surfaces candidates on that visa status,
// companies whose job postings offer that sponsorship, AND companies where
// candidates have actually been placed under that visa -- three different
// sheets, one query.
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

function detectJobRole(query, jobRoles) {
  const q = query.toLowerCase().trim();
  // exact/substring match against known role titles, longest match wins
  const hits = jobRoles.filter((r) => q.includes(r.toLowerCase()) || r.toLowerCase().includes(q));
  if (hits.length === 0) return null;
  return hits.sort((a, b) => b.length - a.length)[0];
}

function detectCompany(query, companies) {
  const q = query.toLowerCase().trim();
  const hits = companies.filter((c) => q.includes(c.toLowerCase()) || c.toLowerCase().includes(q));
  if (hits.length === 0) return null;
  return hits.sort((a, b) => b.length - a.length)[0];
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
  const role = !visa ? detectJobRole(trimmed, allRoles) : null;
  const company = !visa && !role ? detectCompany(trimmed, allCompanies) : null;

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

  if (role) {
    const jobsForRole = data.Jobs.filter((j) => j.Title === role);
    const placedInRole = data.Candidates.filter((c) => c.Status === "Placed" && c.PlacedJobTitle === role);
    const marketingInRole = data.Candidates.filter(
      (c) => c.TargetRole === role && (c.Status === "Active" || c.Status === "In Marketing")
    );

    return {
      type: "role",
      label: role,
      query: trimmed,
      jobsForRole,
      placedInRole,
      marketingInRole,
      companiesHiring: groupCount(jobsForRole, (j) => j.Company),
      visaMixMarketing: groupCount(marketingInRole, (c) => c.VisaStatus),
    };
  }

  if (company) {
    const jobsAtCompany = data.Jobs.filter((j) => j.Company === company);
    const placedAtCompany = data.Candidates.filter((c) => c.Status === "Placed" && c.PlacedCompany === company);
    const interviewsAtCompany = data.Interviews.filter((i) => i.ClientName === company);

    return {
      type: "company",
      label: company,
      query: trimmed,
      jobsAtCompany,
      placedAtCompany,
      interviewsAtCompany,
      rolesOpen: groupCount(jobsAtCompany, (j) => j.Title),
      visaSponsorshipOffered: groupCount(jobsAtCompany, (j) => j.VisaSponsorship),
    };
  }

  // Fallback: general fuzzy match across candidates / jobs / recruiters by name/title/skill/location.
  const q = trimmed.toLowerCase();
  const candidateMatches = data.Candidates.filter(
    (c) =>
      c.Name.toLowerCase().includes(q) ||
      (c.Technology || "").toLowerCase().includes(q) ||
      (c.Skills || "").toLowerCase().includes(q) ||
      (c.CurrentLocation || "").toLowerCase().includes(q)
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
