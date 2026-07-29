// ---------------------------------------------------------------------------
// Role matching — strict, domain-first.
//
// The problem this solves: generic role NOUNS ("Engineer", "Analyst",
// "Developer", "Manager", "Specialist", "Consultant"...) appear in almost
// every job family. If matching logic treats those words as domain
// evidence, a "Data Analyst" candidate ends up matched to "Java Developer"
// or "Salesforce Developer" jobs — they share nothing except the fact that
// both titles happen to be a kind of "-ist/-er" role.
//
// Fix: every title is decomposed into
//   1) a set of DOMAIN TAGS (data, finance, java, salesforce, network, …)
//      detected from specific/meaningful phrases only, and
//   2) a "core" and "qualifier" string used purely for exact/near-exact
//      title comparison.
// Generic role nouns and seniority words (Engineer, Analyst, Senior, Lead,
// II, …) are stripped before any domain decision is made — they only help
// decide whether two titles are literally the *same* title, never whether
// they're the *same field*.
//
// Candidate roles are read ONLY from profile.headline and profile.jobRoles
// — the same two fields rendered as the headline text and the role badges
// on the profile card — so the matcher is judging exactly what the person
// sees on screen.
// ---------------------------------------------------------------------------

// ---------- Text normalization ----------

function normalizeText(text) {
  let t = (text || "").toLowerCase();
  t = t.replace(/c#/g, "csharp");
  t = t.replace(/\.net\b/g, "dotnet");
  t = t.replace(/node\.js/g, "nodejs");
  t = t.replace(/react\.js/g, "reactjs");
  t = t.replace(/vue\.js/g, "vuejs");
  t = t.replace(/&/g, " and ");
  t = t.replace(/[-_/.]+/g, " ");
  t = t.replace(/\s+/g, " ").trim();
  return t;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function wordBoundaryTest(text, phrase) {
  if (!phrase) return false;
  return new RegExp(`\\b${escapeRegExp(phrase)}\\b`, "i").test(text || "");
}

function removeWords(text, wordSet) {
  let t = text;
  for (const w of wordSet) {
    t = t.replace(new RegExp(`\\b${escapeRegExp(w)}\\b`, "gi"), " ");
  }
  return t.replace(/\s+/g, " ").trim();
}

function titleCase(word) {
  return word.replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------- Words that describe the TYPE of role, not the field ----------
// Stripped before deciding whether two titles are "the same core title" or
// share a meaningful qualifier. NEVER used as domain evidence themselves.
const GENERIC_ROLE_WORDS = new Set([
  "engineer", "engineering", "developer", "development", "programmer",
  "analyst", "manager", "management", "specialist", "consultant", "consulting",
  "administrator", "administration", "coordinator", "representative", "officer",
  "technician", "associate", "assistant", "executive", "architect", "scientist",
  "advisor", "strategist", "practitioner", "professional",
]);

// Seniority / level words — stripped only when comparing whether two titles
// are literally the same role at different levels ("Senior Data Analyst"
// vs "Data Analyst"). Never touches domain-tag detection.
const SENIORITY_WORDS = new Set([
  "senior", "sr", "junior", "jr", "lead", "principal", "staff", "chief",
  "entry", "entrylevel", "mid", "midlevel", "ii", "iii", "iv",
]);

// ---------- Domain taxonomy ----------
// Each tag lists the SPECIFIC phrases that identify it. Deliberately no
// bare "engineer" / "analyst" / "developer" / "manager" anywhere in here —
// those words are meaningless as field identifiers on their own.
const TAXONOMY = {
  // -- Software engineering: specific language/platform tags first --
  java: ["java"],
  dotnet: ["dotnet"],
  csharp: ["csharp"],
  python: ["python"],
  javascript: ["javascript", "typescript", "nodejs"],
  react: ["react", "reactjs"],
  angular: ["angular"],
  vue: ["vue", "vuejs"],
  php: ["php"],
  ruby: ["ruby", "ruby on rails"],
  golang: ["golang", "go lang"],
  kotlin: ["kotlin"],
  swift: ["swift"],
  ios: ["ios developer", "ios engineer", "ios"],
  android: ["android developer", "android engineer", "android"],
  flutter: ["flutter"],
  react_native: ["react native"],
  mainframe: ["mainframe", "cobol", "cics"],
  salesforce: ["salesforce"],
  sap: ["sap"],
  // Generic software bucket — only for titles with NO specific language,
  // e.g. plain "Software Engineer" / "Full Stack Developer".
  software_generic: [
    "software", "full stack", "fullstack", "front end", "frontend",
    "back end", "backend", "web developer", "web development",
    "application developer", "programmer",
  ],

  network: ["network engineer", "network administrator", "networking", "network"],
  systems: ["systems administrator", "system administrator", "sysadmin", "systems engineer"],
  cloud: ["cloud engineer", "cloud architect", "cloud"],
  devops: ["devops", "site reliability", "sre", "platform engineer", "infrastructure engineer"],
  qa: ["qa engineer", "quality assurance", "sdet", "test engineer", "quality analyst"],
  security: ["cybersecurity", "cyber security", "information security", "penetration test", "infosec", "security engineer", "security analyst"],
  database: ["database administrator", "dba", "database"],

  ai_ml: ["machine learning", "artificial intelligence", "deep learning", "computer vision", "ai engineer", "ml engineer", "nlp engineer", "nlp"],
  data: ["data analyst", "data scientist", "data engineer", "data science", "business intelligence", "big data", "data analytics", "data"],

  product: ["product manager", "product owner", "product management", "product analyst", "product"],
  design: ["ux designer", "ui designer", "user experience", "user interface", "product design", "graphic design", "visual design", "ux", "ui"],

  sales: ["account executive", "business development", "account manager", "partnerships", "sales"],
  marketing: ["digital marketing", "content marketing", "social media", "seo", "brand marketing", "public relations", "growth marketing", "copywriter", "marketing"],

  finance: ["financial analyst", "accounting", "accountant", "controller", "treasury", "bookkeeping", "fp&a", "auditor", "audit", "financial", "finance"],

  hr: ["human resources", "talent acquisition", "recruiter", "recruiting", "people operations", "hr generalist", "hr business partner", "hr"],

  operations: ["supply chain", "logistics", "procurement", "warehouse operations", "operations"],
  project_program: ["project manager", "program manager", "project management", "program management", "scrum master"],

  customer_support: ["customer support", "customer service", "help desk", "technical support", "customer success", "it support"],

  legal: ["attorney", "paralegal", "compliance", "counsel", "legal"],

  healthcare: ["registered nurse", "physician", "clinical", "healthcare", "pharmacist", "physical therapist", "patient care", "dental", "veterinary", "nurse", "medical"],

  education: ["teacher", "instructor", "professor", "curriculum", "tutor", "education"],

  executive: ["chief executive", "vice president", "general manager", "president"],
};

// Software-family tags that count as "children" of software_generic — a
// plain "Software Engineer" can reasonably match a "Java Developer" posting
// and vice versa, at a moderate (not top-tier) score. Salesforce/SAP are
// deliberately EXCLUDED from this — those are platform specialties, not
// interchangeable with a generic software title.
const SOFTWARE_LANG_TAGS = new Set([
  "java", "dotnet", "csharp", "python", "javascript", "react", "angular",
  "vue", "php", "ruby", "golang", "kotlin", "swift", "ios", "android",
  "flutter", "react_native", "mainframe",
]);

const LANG_LABELS = {
  java: "Java", dotnet: ".NET", csharp: "C#", python: "Python",
  javascript: "JavaScript", react: "React", angular: "Angular", vue: "Vue",
  php: "PHP", ruby: "Ruby", golang: "Go", kotlin: "Kotlin", swift: "Swift",
  ios: "iOS", android: "Android", flutter: "Flutter", react_native: "React Native",
  mainframe: "Mainframe",
};

const TAXONOMY_ENTRIES = Object.entries(TAXONOMY);

/** Full set of domain tags present in `text` (phrase-based, word-boundary safe). */
function getTags(text) {
  const tags = new Set();
  const normalized = normalizeText(text);
  if (!normalized) return tags;
  for (const [tag, phrases] of TAXONOMY_ENTRIES) {
    for (const phrase of phrases) {
      if (wordBoundaryTest(normalized, phrase)) {
        tags.add(tag);
        break;
      }
    }
  }
  return tags;
}

/** Normalized title with seniority/level words removed (generic role nouns kept). */
function coreTitle(text) {
  return removeWords(normalizeText(text), SENIORITY_WORDS);
}

/** Core title with generic role nouns ALSO removed — the "meat" of the title. */
function qualifierCore(text) {
  return removeWords(coreTitle(text), GENERIC_ROLE_WORDS);
}

/**
 * Decides whether two tag sets represent the same field.
 * - Direct tag overlap -> match, "specific" if the shared tag isn't the
 *   generic software bucket.
 * - software_generic on one side + any specific language tag on the other
 *   -> match, but never "specific" (moderate confidence only).
 */
function tagsRelated(tagsA, tagsB) {
  const shared = [...tagsA].filter((t) => tagsB.has(t));
  if (shared.length > 0) {
    const specific = shared.some((t) => t !== "software_generic");
    return { match: true, specific };
  }
  const aGeneric = tagsA.has("software_generic");
  const bGeneric = tagsB.has("software_generic");
  const aLang = [...tagsA].some((t) => SOFTWARE_LANG_TAGS.has(t));
  const bLang = [...tagsB].some((t) => SOFTWARE_LANG_TAGS.has(t));
  if ((aGeneric && bLang) || (bGeneric && aLang)) {
    return { match: true, specific: false };
  }
  return { match: false, specific: false };
}

// ---------- Public: role variant expansion (kept for compatibility) ----------

export function expandRoleVariants(role) {
  if (!role) return [];
  const trimmed = role.trim();
  if (!trimmed) return [];
  const variants = new Set([trimmed]);
  const tags = getTags(trimmed);
  const lang = [...tags].find((t) => SOFTWARE_LANG_TAGS.has(t));
  if (lang) {
    const label = LANG_LABELS[lang] || titleCase(lang);
    variants.add(`${label} Developer`);
    variants.add(`${label} Engineer`);
  }
  return Array.from(variants);
}

// ---------- Public: extracting candidate roles ----------
// Pulled ONLY from profile.headline and profile.jobRoles — the exact two
// fields shown as the headline text and the role badges in the UI.

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

  // skillsText is weak/supporting evidence only (tier 4 below) — it can
  // never by itself unlock a domain the candidate's actual title/headline
  // doesn't show.
  const skillsText = (profile.skills || []).join(" ");

  return { roles, domainSources: roles, skillsText };
}

// ---------- Public: scoring ----------
//
// Tiers (highest confidence first):
//   100  Exact title match, seniority-insensitive
//         ("Senior Data Analyst" == "Data Analyst")
//    92  Meaningful qualifier text matches/contains the other, with generic
//         role nouns stripped from both sides
//         ("Data Analyst" -> "data" is contained in "Business Data Analyst" -> "business data")
//    85  Shared SPECIFIC domain tag between candidate title and job title
//         (both "data", both "salesforce", both "java", ...)
//    60  Shared but only the generic software bucket (two different plain
//         "Software/Full Stack/Backend..." titles with no language named),
//         OR one side is generic-software and the other names a specific
//         language (parent/child relationship)
//    45  Weak fallback: a SPECIFIC tag from the candidate's title appears in
//         the job's Skills/Requirements text, or a specific tag from the
//         candidate's own Skills list appears in the job title. Generic
//         "software" alone never qualifies here.
//     0  No shared field -> excluded entirely. There is intentionally NO
//         bypass based on shared generic words (Engineer/Analyst/Developer/
//         Manager) anywhere in this scoring path.

export function scoreJobRelevance(job, roles, domainSources = roles, skillsText = "") {
  const jobTitleRaw = job.Title || "";
  if (!jobTitleRaw) return 0;

  const roleList = Array.from(
    new Set([...(roles || []), ...(domainSources || [])].filter(Boolean))
  );
  if (roleList.length === 0) return 0;

  const jobCore = coreTitle(jobTitleRaw);
  const jobQualifier = qualifierCore(jobTitleRaw);
  const jobTags = getTags(jobTitleRaw);
  const jobWeakTags = getTags(`${job.Skills || ""} ${job.Requirements || ""}`);
  const candidateSkillTags = getTags(skillsText);

  let best = 0;

  for (const role of roleList) {
    const roleCore = coreTitle(role);
    if (!roleCore) continue;
    if (roleCore === jobCore) {
      best = Math.max(best, 100);
      continue;
    }

    const roleQualifier = qualifierCore(role);
    if (
      roleQualifier &&
      jobQualifier &&
      (roleQualifier === jobQualifier ||
        jobQualifier.includes(roleQualifier) ||
        roleQualifier.includes(jobQualifier))
    ) {
      best = Math.max(best, 92);
      continue;
    }

    const roleTags = getTags(role);
    const rel = tagsRelated(roleTags, jobTags);
    if (rel.match) {
      best = Math.max(best, rel.specific ? 85 : 60);
      continue;
    }

    const weakShared = new Set([
      ...[...roleTags].filter((t) => t !== "software_generic" && jobWeakTags.has(t)),
      ...[...candidateSkillTags].filter((t) => t !== "software_generic" && jobTags.has(t)),
    ]);
    if (weakShared.size > 0) {
      best = Math.max(best, 45);
    }
  }

  return best;
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

// ---------- Salary parsing & eligibility (unchanged) ----------

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

  const eligibleRow = tagged.find((j) => j.rowEligible);
  const rest = tagged.filter((j) => !j.rowEligible);
  return eligibleRow ? [eligibleRow, ...rest] : tagged;
}