const SECTION_HEADERS = {
  summary: ["summary", "professional summary", "profile", "objective", "career objective", "about me", "about", "professional profile", "executive profile", "professional overview"],
  skills: ["skills", "technical skills", "core competencies", "key skills", "skill set", "areas of expertise", "technologies", "technical competencies", "expertise", "specializations"],
  experience: ["experience", "work experience", "professional experience", "employment history", "work history", "career history", "professional background", "work background", "career experience", "job history"],
  education: ["education", "academic background", "academic qualifications", "educational qualifications", "academics", "qualification", "qualifications"],
  projects: ["projects", "personal projects", "academic projects", "key projects", "portfolio projects", "technical projects", "work on projects"],
  certifications: ["certifications", "certificates", "licenses & certifications", "licenses and certifications", "certifications & licenses", "professional certifications", "credentials"],
  achievements: ["achievements", "awards", "honors", "honors & awards", "honours", "accomplishments", "awards & achievements", "awards and achievements"],
  languages: ["languages", "language proficiency", "languages known"],
};

const SENIORITY_WORDS = [
  "senior", "sr", "junior", "jr", "lead", "principal", "staff", "associate",
  "intern", "trainee", "chief", "head", "assistant", "i", "ii", "iii", "iv", "v",
];
const SENIORITY_RE = new RegExp(`\\b(${SENIORITY_WORDS.join("|")})\\.?\\b`, "gi");

const ROLE_NOUN_RE = /\b([A-Z][a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*){0,3}\s+(?:Engineer|Developer|Analyst|Manager|Designer|Consultant|Architect|Administrator|Specialist|Scientist|Lead|Director|Coordinator|Executive))\b/;

const MONTHS = "jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec";
const MONTH_TOKEN = `(?:${MONTHS})[a-z]*\\.?\\s+\\d{4}`;
const YEAR_TOKEN = `\\d{4}`;
const DATE_TOKEN = `(?:${MONTH_TOKEN}|\\d{1,2}[\\/.]\\d{4}|${YEAR_TOKEN})`;
const DATE_RANGE_RE = new RegExp(
  `(${DATE_TOKEN})\\s*(?:-|–|—|to|~)\\s*(${DATE_TOKEN}|present|current|now|ongoing)`,
  "i"
);
const YEAR_RE = /\b(19|20)\d{2}\b/g;

const DEGREE_KEYWORDS = [
  "bachelor", "master", "b\\.?tech", "m\\.?tech", "b\\.?e\\.?", "m\\.?e\\.?",
  "b\\.?sc", "m\\.?sc", "bca", "mca", "mba", "phd", "ph\\.d", "doctorate",
  "associate degree", "diploma", "high school", "b\\.?a\\.?", "m\\.?a\\.?",
];
const DEGREE_RE = new RegExp(`\\b(${DEGREE_KEYWORDS.join("|")})\\b`, "i");
const INSTITUTION_RE = /\b(university|college|institute|school|academy|polytechnic)\b/i;

function clean(s) {
  return (s || "").replace(/\s+/g, " ").trim();
}

function splitLines(text) {
  return (text || "")
    .split(/\r?\n/)
    .map((l) => l.replace(/\u0000/g, "").trim())
    .filter((l) => l.length > 0);
}

function stripBullet(line) {
  return line.replace(/^[\s•\-*▪◦·➤►‣o]+/, "").trim();
}

function normalizeHeader(line) {
  return clean(line)
    .toLowerCase()
    .replace(/[:.]+$/, "")
    .replace(/[^a-z& ]/g, "")
    .trim();
}

function matchSectionHeader(line) {
  const norm = normalizeHeader(line);
  if (!norm || norm.length > 40) return null;
  for (const [section, phrases] of Object.entries(SECTION_HEADERS)) {
    for (const phrase of phrases) {
      const normPhrase = phrase.replace(/ /g, "");
      // Exact match, starts with, or contains the phrase
      if (norm === phrase || norm.startsWith(phrase + " ") || norm === normPhrase || norm.includes(normPhrase)) {
        return section;
      }
    }
  }
  return null;
}

function splitSections(lines) {
  const sections = { _top: [] };
  let current = "_top";
  for (const rawLine of lines) {
    const header = matchSectionHeader(rawLine);
    if (header) {
      current = header;
      if (!sections[current]) sections[current] = [];
      continue;
    }
    if (!sections[current]) sections[current] = [];
    sections[current].push(rawLine);
  }
  return sections;
}

function extractEmail(text) {
  const m = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return m ? m[0] : "";
}

function extractPhone(text) {
  // Matches +91 98765 43210, (555) 123-4567, 555-123-4567, 555.123.4567, etc.
  const m = text.match(/(\+?\d{1,3}[\s.-]?)?(\(?\d{3,4}\)?[\s.-]?)\d{3}[\s.-]?\d{3,4}(?!\d)/);
  return m ? clean(m[0]) : "";
}

function extractUrlContaining(text, keyword) {
  const re = new RegExp(`(https?:\\/\\/)?(www\\.)?${keyword}\\.com\\/[a-zA-Z0-9_\\-\\/.]+`, "i");
  const m = text.match(re);
  if (!m) return "";
  let url = m[0];
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  return url.replace(/[),.]+$/, "");
}

function extractPortfolio(text, linkedin, github) {
  const urls = text.match(/(https?:\/\/)[^\s,)]+/gi) || [];
  const other = urls.find(
    (u) => u !== linkedin && u !== github && !/linkedin\.com|github\.com/i.test(u)
  );
  return other ? other.replace(/[),.]+$/, "") : "";
}

function extractLocation(topLines) {
  const locationLike = /\b[A-Z][a-zA-Z.'\s]{2,25},\s?[A-Z]{2}\b|\b[A-Z][a-zA-Z.'\s]{2,25},\s?[A-Z][a-zA-Z]{3,20}\b/;
  for (const line of topLines) {
    if (/@/.test(line)) continue; // email line
    if (/\d{3,}/.test(line) && !/,/.test(line)) continue; // pure phone-ish line
    const m = line.match(locationLike);
    if (m) return clean(m[0]);
  }
  return "";
}

function extractName(topLines, fileName) {
  for (const line of topLines.slice(0, 5)) {
    if (/@/.test(line)) continue;
    if (/^https?:\/\//i.test(line)) continue;
    if (/\d{3,}/.test(line)) continue;
    if (line.length > 40 || line.split(" ").length > 5) continue;
    if (/^[a-z\s]+$/.test(line)) continue; // no capitals -> probably not a name
    return clean(line).replace(/[|,]+$/, "");
  }
  // Fallback: derive something readable from the filename.
  const base = (fileName || "").replace(/\.[^.]+$/, "");
  return clean(base.replace(/[_\-.]+/g, " ")).replace(/\b\w/g, (c) => c.toUpperCase()) || "Candidate";
}

function extractSkills(sectionLines) {
  if (!sectionLines || sectionLines.length === 0) return [];
  const raw = sectionLines
    .flatMap(line => {
      const stripped = stripBullet(line);
      // Split by common delimiters
      return stripped.split(/,|;|•|\u2022|(?:^|\s)\|(?:\s|$)|\s{2,}/)
        .map(s => clean(s).replace(/^[:\-–]+/, "").trim())
        .filter(s => s.length > 1 && s.length <= 50 && !/^[:.\-–|]+$/.test(s));
    });
  
  return [...new Set(raw.filter(s => s))];
}

function parseEntries(sectionLines, { requireDate = false } = {}) {
  const entries = [];
  let current = null;

  const pushCurrent = () => {
    if (current && (current.title || current.description.length)) {
      current.description = current.description.join(" ");
      entries.push(current);
    }
  };

  for (const rawLine of sectionLines) {
    const line = clean(rawLine);
    if (!line) continue;
    const dateMatch = line.match(DATE_RANGE_RE);
    const isBullet = /^[\s•\-*▪◦·➤►‣o]/.test(rawLine);
    const looksLikeTitle = !isBullet && line.length <= 90 && /[A-Z]/.test(line);

    if (dateMatch || (!requireDate && looksLikeTitle && (!current || current.description.length > 0))) {
      pushCurrent();
      const withoutDate = clean(line.replace(DATE_RANGE_RE, ""));
      current = {
        title: withoutDate,
        duration: dateMatch ? clean(`${dateMatch[1]} - ${dateMatch[2]}`) : "",
        company: "",
        description: [],
      };
      const splitMatch = withoutDate.match(/^(.+?)\s*(?:@|,|\|| at | - )\s*(.+)$/);
      if (splitMatch) {
        current.title = clean(splitMatch[1]);
        current.company = clean(splitMatch[2]);
      }
    } else if (current) {
      current.description.push(stripBullet(line));
    } else {
      current = { title: line, duration: "", company: "", description: [] };
    }
  }
  pushCurrent();
  return entries.filter((e) => e.title);
}

function parseExperience(sectionLines) {
  return parseEntries(sectionLines);
}

function parseProjects(sectionLines) {
  return parseEntries(sectionLines).map((e) => ({
    name: e.title,
    tech: e.company, // reused slot: text after a separator on the title line, often the stack
    description: e.description,
  }));
}

function parseEducation(sectionLines) {
  const entries = [];
  let current = null;

  const pushCurrent = () => {
    if (current && (current.degree || current.institution)) entries.push(current);
  };

  for (const rawLine of sectionLines) {
    const line = clean(rawLine);
    if (!line) continue;
    
    // Detect education entries by degree keywords or institution keywords or year patterns
    const hasDegree = DEGREE_RE.test(line);
    const hasInstitution = INSTITUTION_RE.test(line);
    const hasYear = YEAR_RE.test(line);
    
    if (hasDegree || hasInstitution || (hasYear && line.length > 10)) {
      pushCurrent();
      const dateMatch = line.match(DATE_RANGE_RE) || line.match(YEAR_RE);
      current = {
        degree: hasDegree ? (line.match(DEGREE_RE) || [])[0] : "",
        institution: hasInstitution ? line.replace(DATE_RANGE_RE, "").replace(DEGREE_RE, "").trim() : "",
        duration: dateMatch ? (Array.isArray(dateMatch) && dateMatch[2] ? `${dateMatch[1]} - ${dateMatch[2]}` : dateMatch[0]) : "",
      };
      // If degree not found but line looks like education, use it as degree
      if (!current.degree && !current.institution) {
        current.degree = clean(line.replace(DATE_RANGE_RE, ""));
      }
    } else if (current) {
      // Continue building current education entry
      if (!current.institution && line.length > 3) {
        current.institution = clean(line);
      } else if (!current.duration && hasYear) {
        const d = line.match(DATE_RANGE_RE) || line.match(YEAR_RE);
        if (d) current.duration = Array.isArray(d) && d[2] ? `${d[1]} - ${d[2]}` : d[0];
      }
    }
  }
  pushCurrent();
  return entries.filter(e => e.degree || e.institution);
}

function extractHeadline(topLines, name) {
  const candidate = (topLines || [])
    .filter((line) => line && line !== name)
    .find((line) => !/@/.test(line) && !/^https?:\/\//i.test(line) && !/\d{3,}/.test(line) && !/^[a-z\s]+$/.test(line) && line.length <= 90);

  return clean(candidate || "");
}

function parseSummary(sectionLines, topLines = []) {
  const summary = clean(sectionLines.map(stripBullet).join(" "));
  if (summary) return summary;

  const fallback = (topLines || [])
    .filter((line) => line && !/@/.test(line) && !/^https?:\/\//i.test(line) && !/\d{3,}/.test(line))
    .slice(0, 6)
    .join(" ");

  return clean(fallback);
}

function parseListSection(sectionLines) {
  return sectionLines
    .map(stripBullet)
    .map(clean)
    .filter(Boolean);
}

function estimateExperienceYears(fullText) {
  const now = new Date().getFullYear();
  const ranges = [...fullText.matchAll(new RegExp(DATE_RANGE_RE.source, "gi"))];
  if (ranges.length === 0) return 0;

  let earliest = null;
  let latest = null;
  for (const r of ranges) {
    const startYear = (r[1].match(/\d{4}/) || [])[0];
    const endToken = r[2].toLowerCase();
    const endYear = /present|current|now|ongoing/.test(endToken)
      ? now
      : (r[2].match(/\d{4}/) || [])[0];
    if (startYear) earliest = earliest === null ? Number(startYear) : Math.min(earliest, Number(startYear));
    if (endYear) latest = latest === null ? Number(endYear) : Math.max(latest, Number(endYear));
  }
  if (earliest === null || latest === null || latest < earliest) return 0;
  return Math.max(0, latest - earliest);
}

function normalizeTitle(title) {
  return clean(title.replace(SENIORITY_RE, " ")).replace(/^[-,|]+|[-,|]+$/g, "").trim();
}

function guessJobRoles(experience, summary) {
  const roles = [];
  for (const e of experience) {
    if (!e.title) continue;
    roles.push(e.title);
    const normalized = normalizeTitle(e.title);
    if (normalized && normalized.toLowerCase() !== e.title.toLowerCase()) roles.push(normalized);
  }
  if (summary) {
    const m = summary.match(ROLE_NOUN_RE);
    if (m) roles.push(clean(m[1]));
  }
  return [...new Set(roles.filter(Boolean))].slice(0, 6);
}

export function parseResumeProfile(text, fileName = "") {
  const fullText = text || "";
  const lines = splitLines(fullText);
  const sections = splitSections(lines);

  const topLines = sections._top || [];
  const email = extractEmail(fullText);
  const phone = extractPhone(fullText);
  const linkedin = extractUrlContaining(fullText, "linkedin");
  const github = extractUrlContaining(fullText, "github");
  const portfolio = extractPortfolio(fullText, linkedin, github);
  const location = extractLocation(topLines.length ? topLines : lines.slice(0, 8));
  const name = extractName(topLines.length ? topLines : lines.slice(0, 8), fileName);
  const headline = extractHeadline(topLines.length ? topLines : lines.slice(0, 8), name);

  const experience = parseExperience(sections.experience || []);
  const education = parseEducation(sections.education || []);
  const projects = parseProjects(sections.projects || []);
  const skills = extractSkills(sections.skills || []);
  const summary = parseSummary(sections.summary || [], topLines.length ? topLines : lines.slice(0, 8));
  const certifications = parseListSection(sections.certifications || []);
  const achievements = parseListSection(sections.achievements || []);
  const languages = parseListSection(sections.languages || []);

  const experienceYears = estimateExperienceYears(fullText);
  const jobRoles = guessJobRoles(experience, summary);

  return {
    name,
    headline,
    email,
    mobile: phone,
    location,
    linkedin,
    github,
    portfolio,
    summary,
    skills,
    experience,
    education,
    projects,
    certifications,
    achievements,
    languages,
    experienceYears,
    jobRoles,
  };
}