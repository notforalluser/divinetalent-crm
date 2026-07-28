const DOMAINS = {
  "Software Engineering": [
    "software", "developer", "engineer", "engineering", "programmer",
    "full stack", "fullstack", "frontend", "front end", "backend", "back end",
  ],
  "Data & Analytics": [
    "data", "analyst", "analytics", "data scientist", "machine learning",
    "ml engineer", "ai engineer", "business intelligence", "statistician",
    "data engineer", "data science",
  ],
  "Product & Design": [
    "product manager", "product owner", "ux", "ui", "designer",
    "user experience", "user interface", "product design", "graphic design",
  ],
  "Sales & Business Development": [
    "sales", "account executive", "business development", "bdr", "sdr",
    "account manager", "partnerships",
  ],
  "Marketing & Communications": [
    "marketing", "content", "seo", "social media", "brand",
    "communications", "growth", "copywriter", "public relations",
  ],
  "Finance & Accounting": [
    "finance", "accountant", "accounting", "controller", "financial analyst",
    "auditor", "treasury", "bookkeeper", "fp&a",
  ],
  "Human Resources": [
    "human resources", "recruiter", "recruiting", "talent acquisition",
    "people operations", "hr generalist", "hr business partner",
  ],
  "Operations & Supply Chain": [
    "operations", "supply chain", "logistics", "procurement", "warehouse",
    "project manager", "program manager", "operations manager",
  ],
  "Customer Support": [
    "customer support", "customer service", "support specialist",
    "help desk", "technical support", "customer success",
  ],
  "Legal & Compliance": [
    "legal", "attorney", "paralegal", "compliance", "counsel",
  ],
  "Healthcare": [
    "nurse", "physician", "medical", "clinical", "healthcare", "pharmacist",
    "therapist", "patient care",
  ],
  "Education": [
    "teacher", "instructor", "professor", "education", "curriculum", "tutor",
  ],
  "Executive & Management": [
    "director", "vice president", "chief", "head of", "executive",
    "general manager",
  ],
};

// Job-title "disciplines" nested inside the broad Software Engineering /
// Data domains that we do NOT want to auto-match a generic candidate to
// just because the title contains a bare word like "engineer" or
// "developer". A job carrying one of these tags is only shown to a
// candidate whose own resume (roles/headline or skills) explicitly shows
// the same specialty — e.g. a plain "Software Developer" candidate should
// NOT see "Network Engineer", "Site Reliability Engineer", "AI/ML
// Engineer", or "Salesforce Developer" unless their resume actually
// mentions networking, SRE/devops, AI/ML, or Salesforce respectively.
// There is NO fallback bypass for these — shared generic tech tokens
// (python, sql, aws, etc.) are NOT sufficient evidence on their own,
// because that was previously letting AI/ML Engineer, Network Engineer,
// etc. leak through for candidates with none of that background.
const SPECIALTY_TAGS = {
  network: ["network engineer", "network administrator", "network security", "network"],
  systems: ["systems engineer", "system administrator", "sysadmin"],
  cloud: ["cloud engineer", "cloud architect", "cloud"],
  devops: ["devops", "site reliability", "sre", "platform engineer", "infrastructure engineer"],
  qa: ["qa engineer", "sdet", "test engineer", "quality assurance", "quality analyst"],
  mobile: ["ios developer", "android developer", "mobile developer", "flutter", "react native"],
  ai_ml: ["ai/ml", "ai engineer", "ml engineer", "machine learning engineer", "artificial intelligence", "machine learning"],
  data: ["data engineer", "data scientist", "data analyst", "business intelligence", "data science"],
  salesforce: ["salesforce"],
  sap: ["sap consultant", "sap developer", "sap"],
  security: ["security engineer", "cybersecurity", "penetration tester", "information security"],
};

const TECH_TOKENS = [
  "java", ".net", "c#", "python", "javascript", "typescript",
  "react", "reactjs", "angular", "vue", "node", "node.js", "nodejs",
  "spring boot", "spring", "django", "flask", "php", "ruby", "golang", "go",
  "kotlin", "swift", "salesforce", "sap", "aws", "azure", "gcp",
  "ios", "android", "flutter", "react native", "sql", "snowflake",
];

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function wordBoundaryTest(text, term) {
  if (!term) return false;
  return new RegExp(`\\b${escapeRegExp(term)}\\b`, "i").test(text || "");
}

/** Word-boundary regex per keyword, built once and cached. */
const KEYWORD_PATTERNS = Object.entries(DOMAINS).flatMap(([domain, keywords]) =>
  keywords.map((kw) => ({ domain, re: new RegExp(`\\b${escapeRegExp(kw)}\\b`, "i") }))
);

const SPECIALTY_PATTERNS = Object.entries(SPECIALTY_TAGS).flatMap(([tag, phrases]) =>
  phrases.map((p) => ({ tag, re: new RegExp(`\\b${escapeRegExp(p)}\\b`, "i") }))
);

/**
 * Collapses whitespace around slashes before specialty matching, so
 * "AI/ML Engineer" and "AI / ML Engineer" both normalize to "ai/ml
 * engineer" and match the same "ai/ml" phrase pattern.
 */
function normalizeSpecialtyText(text) {
  return (text || "").toLowerCase().replace(/\s*\/\s*/g, "/");
}

/** Returns the set of domain names whose keywords appear in `text`. */
function detectDomains(text) {
  const found = new Set();
  if (!text) return found;
  for (const { domain, re } of KEYWORD_PATTERNS) {
    if (re.test(text)) found.add(domain);
  }
  return found;
}

/** Returns the set of specialty tags (network, devops, ai_ml, salesforce, ...) present in `text`. */
function detectSpecialtyTags(text) {
  const found = new Set();
  const normalized = normalizeSpecialtyText(text);
  if (!normalized) return found;
  for (const { tag, re } of SPECIALTY_PATTERNS) {
    if (re.test(normalized)) found.add(tag);
  }
  return found;
}

function domainsFromList(items) {
  const found = new Set();
  for (const item of items || []) {
    for (const d of detectDomains(item)) found.add(d);
  }
  return found;
}

/** First technology token (case-insensitive, word-boundary) found in `text`, or null. */
function detectTechToken(text) {
  const lower = (text || "").toLowerCase();
  for (const tech of TECH_TOKENS) {
    if (wordBoundaryTest(lower, tech)) return tech;
  }
  return null;
}

function stripTechFromRole(role, tech) {
  if (!tech) return role;
  return role.replace(new RegExp(`\\b${escapeRegExp(tech)}\\b`, "ig"), "").replace(/\s+/g, " ").trim();
}

function titleCase(word) {
  return word.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function expandRoleVariants(role) {
  if (!role) return [];
  const trimmed = role.trim();
  if (!trimmed) return [];

  const variants = new Set([trimmed]);
  const tech = detectTechToken(trimmed);

  if (tech) {
    const base = stripTechFromRole(trimmed, tech); // e.g. "Full Stack Developer"
    const techTitle = titleCase(tech);
    if (base) variants.add(base);
    variants.add(`${techTitle} Developer`);
    variants.add(`${techTitle} Engineer`);
    variants.add(`Backend ${techTitle} Developer`);
    variants.add(`${techTitle} Full Stack Developer`);
    variants.add(`${techTitle} Full Stack`);
    variants.add(`Senior ${techTitle} Developer`);
  }

  return Array.from(variants).filter(Boolean);
}

export function extractRoleFromHeadline(headline) {
  if (!headline) return "";
  let text = headline.split(/[|•·]|(?:\s[-–—]\s)/)[0] || "";
  text = text.replace(/\b\d+\+?\s*(years?|yrs?)\b.*$/i, "");
  return text.trim();
}

export function deriveCandidateRoles(profile) {
  if (!profile) return { roles: [], domainSources: [], skillsText: "" };

  const rolesSet = new Set();
  for (const r of profile.jobRoles || []) {
    if (r && r.trim()) rolesSet.add(r.trim());
  }
  const fromHeadline = extractRoleFromHeadline(profile.headline);
  if (fromHeadline) rolesSet.add(fromHeadline);

  const roles = Array.from(rolesSet);

  // domainSources drives which broad job *category* is considered a match
  // (Software Engineering, Data & Analytics, etc). It intentionally uses
  // ONLY the clean role phrases, not raw headline/summary text, to avoid
  // stray words in a sentence pulling in unrelated domains.
  const domainSources = roles;

  // skillsText is extra evidence for the specialty gate only (does the
  // resume's skills section actually mention Salesforce, AI/ML,
  // networking, etc) — kept separate so a long skills list can't quietly
  // widen the broad domain match on its own.
  const skillsText = (profile.skills || []).join(" ");

  return { roles, domainSources, skillsText };
}

export function scoreJobRelevance(job, roles, domainSources = roles, skillsText = "") {
  const title = (job.Title || "").toLowerCase();
  if (!title) return 0;

  const jobReqText = `${job.Skills || ""} ${job.Requirements || ""}`.toLowerCase();

  // Hit-and-trial: try every phrasing variant of every configured role.
  const allVariants = (roles || []).flatMap((r) => expandRoleVariants(r));

  let titleScore = 0;
  for (const variant of allVariants) {
    const role = variant.toLowerCase();
    if (!role) continue;
    if (title === role) titleScore = Math.max(titleScore, 100);
    else if (title.includes(role) || role.includes(title)) titleScore = Math.max(titleScore, 80);
  }

  const techTerms = new Set(
    (domainSources || []).map((s) => detectTechToken(s)).filter(Boolean)
  );
  let hasTechOverlap = false;
  for (const term of techTerms) {
    if (wordBoundaryTest(jobReqText, term)) {
      hasTechOverlap = true;
      break;
    }
  }

  // Direct title match (role literally appears on the resume) always wins
  // — the candidate explicitly claimed that title, so the specialty guard
  // below doesn't apply here.
  if (titleScore >= 100) return 100;
  if (titleScore >= 80) return hasTechOverlap ? 95 : 80;

  // --- Specialty guard ---
  // A job whose title belongs to a specific discipline (network, cloud,
  // devops/SRE, QA, mobile, AI/ML, data, Salesforce, SAP, security) is
  // ONLY eligible if the candidate's own roles/headline or skills show
  // that same specialty. No generic-tech-token bypass here on purpose —
  // sharing a common token like "python" or "sql" with the job posting is
  // NOT enough evidence the candidate actually works in that discipline.
  const jobSpecialty = detectSpecialtyTags(title);
  if (jobSpecialty.size > 0) {
    const candidateSpecialtyText = `${(domainSources || []).join(" ")} ${skillsText || ""}`;
    const candidateSpecialty = detectSpecialtyTags(candidateSpecialtyText);
    const specialtyOverlap = [...jobSpecialty].some((t) => candidateSpecialty.has(t));
    if (!specialtyOverlap) return 0;
  }

  // --- Domain-fallback path (generic dev/data roles only) ---
  const jobDomains = detectDomains(title);
  if (jobDomains.size === 0) return 0;

  const candidateDomains = domainsFromList(domainSources);
  for (const d of jobDomains) {
    if (candidateDomains.has(d)) return hasTechOverlap ? 55 : 40;
  }
  return 0;
}

export function jobMatchesAnyRole(job, roles, domainSources = roles, skillsText = "") {
  if (!roles || roles.length === 0) return false;
  return scoreJobRelevance(job, roles, domainSources, skillsText) > 0;
}

export function findMatchingActiveJobs(jobs, roles, limit = Infinity, domainSources = roles, skillsText = "") {
  if (!roles || roles.length === 0) return [];
  return jobs
    .map((j) => ({ job: j, score: scoreJobRelevance(j, roles, domainSources, skillsText) }))
    .filter(({ job, score }) => job.Status === "Active" && score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.job.PostedDate) - new Date(a.job.PostedDate);
    })
    .slice(0, limit)
    .map(({ job }) => job);
}

/**
 * Extracts a representative numeric value from a free-text salary range
 * string (e.g. "$50,000 - $70,000", "$50K-$70K", "60000"). Returns the
 * average of all numbers found, or null if nothing parseable is found
 * (e.g. "Competitive", empty string).
 */
export function parseSalaryValue(salaryRange) {
  if (!salaryRange || typeof salaryRange !== "string") return null;
  const matches = salaryRange.match(/[\d,]+(\.\d+)?\s*(k|K)?/g);
  if (!matches || matches.length === 0) return null;

  const numbers = matches
    .map((m) => {
      const isK = /k/i.test(m);
      const num = parseFloat(m.replace(/[^\d.]/g, ""));
      if (Number.isNaN(num) || num <= 0) return null;
      return isK ? num * 1000 : num;
    })
    .filter((n) => n !== null);

  if (numbers.length === 0) return null;
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}

/**
 * Assigns per-row eligibility for the matched jobs table.
 *
 * - If the candidate is overall eligible, every matched job is eligible.
 * - If the candidate is NOT overall eligible: exactly ONE row is marked
 *   eligible — the single lowest-salary match, tagged
 *   eligibilityReason: "low-salary" — and that row is pinned to the very
 *   front of the returned array so it's guaranteed visible on the FIRST
 *   PAGE of the results table, regardless of page size or where it
 *   originally ranked. Every other row is "not-eligible". Jobs with an
 *   unparseable salary are treated as high (never chosen) since we can't
 *   verify they're actually low.
 */
export function assignCompanyEligibility(matchedJobs, overallEligible) {
  if (overallEligible) {
    return matchedJobs.map((j) => ({ ...j, rowEligible: true, eligibilityReason: "qualified" }));
  }

  const n = matchedJobs.length;
  if (n === 0) return [];

  const bySalary = [...matchedJobs].sort((a, b) => {
    const aVal = parseSalaryValue(a.SalaryRange);
    const bVal = parseSalaryValue(b.SalaryRange);
    const aSafe = aVal == null ? Infinity : aVal;
    const bSafe = bVal == null ? Infinity : bVal;
    return aSafe - bSafe;
  });

  const eligibleId = bySalary[0].JobID;

  const tagged = matchedJobs.map((j) => ({
    ...j,
    rowEligible: j.JobID === eligibleId,
    eligibilityReason: j.JobID === eligibleId ? "low-salary" : "not-eligible",
  }));

  // Pin the single eligible row to the front so it always lands on page 1.
  const eligibleRow = tagged.find((j) => j.rowEligible);
  const rest = tagged.filter((j) => !j.rowEligible);
  return eligibleRow ? [eligibleRow, ...rest] : tagged;
}