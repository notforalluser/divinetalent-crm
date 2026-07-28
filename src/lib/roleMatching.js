const DOMAINS = {
  "Software Engineering": [
    "software", "developer", "engineer", "engineering", "programmer",
    "full stack", "fullstack", "frontend", "front end", "backend", "back end",
    "devops", "site reliability", "sre", "mobile", "ios", "android",
    "qa engineer", "sdet", "cloud engineer", "systems engineer",
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

/** Returns the set of domain names whose keywords appear in `text`. */
function detectDomains(text) {
  const found = new Set();
  if (!text) return found;
  for (const { domain, re } of KEYWORD_PATTERNS) {
    if (re.test(text)) found.add(domain);
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
  if (!profile) return { roles: [], domainSources: [] };

  const rolesSet = new Set();
  for (const r of profile.jobRoles || []) {
    if (r && r.trim()) rolesSet.add(r.trim());
  }
  const fromHeadline = extractRoleFromHeadline(profile.headline);
  if (fromHeadline) rolesSet.add(fromHeadline);

  const roles = Array.from(rolesSet);

  // IMPORTANT: domainSources drives which job *categories* are considered a
  // match. It intentionally uses ONLY the clean role phrases (not the raw
  // headline/summary text), because free-text fields often mention adjacent
  // tools/skills (e.g. "Data Analyst | data engineering, SQL, Python") that
  // would otherwise leak into unrelated domains — e.g. the word
  // "engineering" pulling in Software Engineering jobs like "Java
  // Developer" for a candidate who is really a Data Analyst. Restricting
  // the source to the role titles themselves keeps matches tightly within
  // the candidate's actual field (Senior Data Analyst -> Data Analyst,
  // Data Engineer, Data Scientist, etc.), not the whole document.
  const domainSources = roles;

  return { roles, domainSources };
}

export function scoreJobRelevance(job, roles, domainSources = roles) {
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

  if (titleScore >= 100) return 100;
  if (titleScore >= 80) return hasTechOverlap ? 95 : 80;

  const jobDomains = detectDomains(title);
  if (jobDomains.size === 0) return 0;

  const candidateDomains = domainsFromList(domainSources);
  for (const d of jobDomains) {
    if (candidateDomains.has(d)) return hasTechOverlap ? 55 : 40;
  }
  return 0;
}

export function jobMatchesAnyRole(job, roles, domainSources = roles) {
  if (!roles || roles.length === 0) return false;
  return scoreJobRelevance(job, roles, domainSources) > 0;
}

export function findMatchingActiveJobs(jobs, roles, limit = Infinity, domainSources = roles) {
  if (!roles || roles.length === 0) return [];
  return jobs
    .map((j) => ({ job: j, score: scoreJobRelevance(j, roles, domainSources) }))
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
 * - If the candidate is NOT overall eligible, we still surface a small
 *   number of "eligible" rows so the table isn't a wall of red — but those
 *   rows are deliberately the lowest-salary matches (not random), with
 *   eligibilityReason: "low-salary" so the UI can label them clearly.
 *   Jobs with an unparseable salary are treated as high (never chosen as
 *   the low-salary exception) since we can't verify they're actually low.
 */
export function assignCompanyEligibility(matchedJobs, overallEligible) {
  if (overallEligible) {
    return matchedJobs.map((j) => ({ ...j, rowEligible: true, eligibilityReason: "qualified" }));
  }

  const n = matchedJobs.length;
  if (n === 0) return [];

  const bySalary = matchedJobs
    .map((job) => ({ job, salary: parseSalaryValue(job.SalaryRange) }))
    .sort((a, b) => {
      const aVal = a.salary == null ? Infinity : a.salary;
      const bVal = b.salary == null ? Infinity : b.salary;
      return aVal - bVal;
    });

  const eligibleCount = Math.min(3, Math.max(1, Math.round(n * 0.2)));
  const eligibleIds = new Set(
    bySalary.slice(0, eligibleCount).map(({ job }) => job.JobID)
  );

  return matchedJobs.map((j) => ({
    ...j,
    rowEligible: eligibleIds.has(j.JobID),
    eligibilityReason: eligibleIds.has(j.JobID) ? "low-salary" : "not-eligible",
  }));
}