# InfiJobs Recruiter — Command Center

A recruiter CRM built with **Vite + React + Tailwind CSS v4 + react-router-dom + lucide-react**.
White / black / red theme, data driven entirely by an Excel workbook, and gated by Google Sign-In.

## 1. Run it locally

```bash
npm install
cp .env.example .env      # then fill in the two values described in section 3
npm run dev
```

Open the printed `localhost` URL. `npm run build` produces a production build in `dist/`.

---

## 2. Connecting your own Excel file

The app reads one workbook: **`public/data/crm-data.xlsx`**. On load (and every time you click
**Refresh** in the top bar, or when auto-refresh is on in **Settings**), the app re-fetches that
file and re-parses it — so the flow is genuinely: *edit the Excel file → click Refresh → new data
appears*.

### Option A — replace the demo file (simplest)
1. Open `public/data/crm-data.xlsx` in Excel/Google Sheets.
2. Keep the **sheet names** exactly as-is: `Candidates`, `Jobs`, `Recruiters`, `Interviews`,
   `TechnicalHelp`, `Activity`. Keep the **column headers** in row 1 exactly as-is (see schema
   below) — the app maps columns by header name, not position.
3. Add/edit/delete rows, save the file back to `public/data/crm-data.xlsx`.
4. Rebuild (`npm run build`) or, in dev mode, just click **Refresh** in the app.

### Option B — point at a file somewhere else
Edit `src/lib/excel.js`:
```js
export const DATA_SOURCE_URL = "/data/crm-data.xlsx"; // change this
```
This can be:
- Another path inside `public/` (e.g. `/data/my-workbook.xlsx`)
- A published Google Sheets export link: File → Share → Publish to web → choose **.xlsx**, then
  use that URL (the sheet must be publicly viewable, or you'll need a small backend proxy that
  attaches auth headers).
- Any API/file server that returns an `.xlsx` binary with `Content-Type: application/vnd.openxmlformats...`

### Option C — swap in a real backend later
Replace the body of `loadWorkbook()` in `src/lib/excel.js` with a `fetch()` to your own API that
returns JSON shaped like:
```json
{ "Candidates": [...], "Jobs": [...], "Recruiters": [...], "Interviews": [...], "TechnicalHelp": [...], "Activity": [...] }
```
Nothing else in the app needs to change — every page reads from `useData().data`.

### Excel schema (columns the app expects)

| Sheet | Columns |
|---|---|
| **Candidates** | CandidateID, Name, Email, Phone, Status, Recruiter, TeamLeader, Technology, TargetRole, VisaStatus, MarketingStartDate, PlacementDate, PlacedCompany, PlacedJobTitle, CurrentLocation, ExperienceYears, ResumeLink, Source, Skills, CreatedAt, Saved |
| **Jobs** | JobID, Title, Company, City, State, Country, JobType, RemoteType, PostedDate, SalaryRange, Status, VisaSponsorship, Applicants, Website, Skills, Requirements, Description |
| **Recruiters** | RecruiterID, Name, Title, Email, City, State, Country, LinkedIn, TeamLeader |
| **Interviews** | InterviewID, CandidateID, CandidateName, RecruiterName, TeamLeader, JobRole, ClientName, JobType, Website, InterviewReceivedDate, InterviewDate, InterviewTime, InterviewRound, ModeOfRound, Status |
| **TechnicalHelp** | HelpID, Date, ClientName, JobRole, InterviewRound, JobType, JDLink, TechnicalPerson, StatusOfHelp, Remark |
| **Activity** | ActivityID, Date, User, Action, Entity, Details |
| **MarketingActivity** | ActivityID, CandidateID, CandidateName, Date, ApplicationsCount, CompanyApplications, FastTrackApplications, InterviewsScheduled |

**`MarketingActivity` is one row per candidate per active marketing day** (not one row per
individual application) — `ApplicationsCount` is that day's total (30-40, split into
`CompanyApplications` / `FastTrackApplications`), and `InterviewsScheduled` is how many real rows
that same candidate has in the `Interviews` sheet dated that day. This is what powers the Candidate
Intelligence page's daily marketing table, "marketing vs. interviews" chart, and applications-split
donut. `MarketingStartDate` is always the same as the candidate's enrollment date, and generation
stops at `PlacementDate` for placed candidates (or at today for everyone still being marketed) — so
a candidate's timeline can never show an interview before their marketing started, or marketing
activity beyond their placement.

The bundled demo file contains ~430 candidates, ~610 jobs, ~340 recruiters, ~13,000 interviews,
~220 technical-help rows, ~260 activity events, and ~5,500 daily marketing-activity rows so every
filter, sort, chart, table and pagination control has real volume to work with.

**Daily counts are deliberately smooth, not random noise.** Candidate enrollment and job postings
use a gently-wandering day-to-day count (e.g. today ~9-15, yesterday ~9-15, and so on) instead of
pure randomness, so a chart of "postings per day" looks like a real, consistent pace of business
rather than a spiky 76-then-1-then-50 pattern. The same smoothing applies to the near-future batch
of jobs/candidates (still hidden until their date arrives) and to the 14-day upcoming-interview
tail, so the Interview page's date columns fill in with plausible, human-scale numbers.

**Placement durations are curated for variety**, not purely random: placed candidates are spread
across marketing windows of 15, 18, 20, 22, 25, 28, 30, 33, 35, 37, 40, 42, 45, 50, 55, and 60 days,
so you'll see the "placed in 15 days" alongside "placed in 37 days" mix you'd expect. A separate
"still marketing, not yet placed" cohort is enrolled 15-45 days ago and keeps running up to today.
`Do Not Contact` is deliberately a small cohort (its marketing stops almost immediately after
enrollment), while `On Bench` candidates have their marketing pause a few days in.

### Future-dated rows are hidden automatically, and "today" always means IST

`Jobs.PostedDate` and `Candidates.CreatedAt` in the future are filtered out everywhere (Home, Jobs,
Candidates, Reports, AI Match) until that date/time actually arrives — so you can add tomorrow's
job posting today and it simply won't appear until tomorrow. This is intentional and handled in
`src/context/DataContext.jsx` (`visible.Jobs` / `visible.Candidates`). **Interviews** are the one
exception: future-dated interviews (upcoming scheduled interviews) are always shown on the
Interview page and in a candidate's interview list, since those are genuinely useful to see ahead
of time. The demo workbook includes future-dated jobs and candidates spread over the next 1-2 weeks
on purpose so you can see this behavior working immediately.

Every "now"/"today" comparison in the app (`src/lib/time.js`'s `nowIST()`) is explicitly anchored to
**India Standard Time**, regardless of the machine or browser's own timezone — so "today" always
means the same calendar day everywhere in the UI, in the demo data, and in every chart.

---

## 3. Setting up Google Sign-In (required to view the dashboard)

Only Google accounts you explicitly allow can see the dashboard — everyone else gets an
"isn't on the access list" message on the login screen.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) → create (or pick) a project.
2. **APIs & Services → OAuth consent screen** → configure it (External is fine for testing) → add
   your own email as a test user if the app is in "Testing" mode.
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID** → Application type
   **Web application**.
4. Under **Authorized JavaScript origins**, add:
   - `http://localhost:5173` (Vite dev server)
   - your production URL once you deploy (e.g. `https://your-domain.com`)
5. Copy the generated **Client ID** into `.env`:
   ```
   VITE_GOOGLE_CLIENT_ID=xxxxxxxxxx.apps.googleusercontent.com
   ```
6. In the same `.env`, list every email allowed to log in:
   ```
   VITE_ALLOWED_EMAILS=you@company.com,teammate@company.com
   ```
7. Restart `npm run dev` (Vite only reads `.env` at startup).

**Security note:** this check happens in the browser (it decodes the Google-signed JWT and
compares the email against the list). That's enough to keep casual/unauthorized users out of an
internal tool, but it is not a substitute for server-side authorization if this app will ever sit
behind sensitive data or a public URL — for that, verify the JWT and the email allow-list on a
backend before returning any data.

---

## 4. One button, one place, everywhere

`src/config/buttonVariants.js` is the only file that defines button colors, radius, sizes and
hover states. Every `<Button>` used across every page imports from
`src/components/ui/Button.jsx`, which reads from that config — so changing a value there (say,
`primary`'s background color) updates every primary button on the whole site at once. The same
pattern applies to:

- **Text sizes** → `src/config/typography.js` (used by the shared `<Heading>` / `<Text>` components)
- **Status colors** (badges) → `STATUS_COLORS` in `src/components/ui/Badge.jsx`
- **Page layout** → `src/components/layout/PageShell.jsx` (topbar + content padding, used by every page)
- **Tables** → `src/components/ui/DataTable.jsx` (search/sort/pagination, used by Jobs, Candidates, Recruiters, Interviews, Activity)

---

## 5. Settings that actually do something

The **Settings** page (`src/pages/Settings.jsx` + `src/context/SettingsContext.jsx`) controls, live:
- Rows per page for every table
- Table density (comfortable/compact)
- Default status filter when opening Candidates
- Auto-refresh from Excel on/off + interval

Everything persists to `localStorage` so it survives a page reload.

---

## 6. Interview schedule page

The **Interview** nav item (`/interviews`) is a candidate-by-date pivot over the `Interviews`
sheet, restricted to today and every date after it:
- KPI cards: total upcoming, today, tomorrow, this week
- Charts: next-14-days volume; by mode (Face to Face / Online / Phone) plus a dedicated
  online-platform breakdown (MS Teams / Zoom / Google Meet); by round split into **today** and
  **overall**
- A matrix table — **one row per candidate, one column per date** (Today, Tomorrow, then every
  other date that actually has an interview scheduled, however far out — no 7-day cutoff). Each
  cell is the count of that candidate's interviews on that date; clicking a non-zero count opens
  a modal with the full detail (received date, interview date, time, job role, round, mode,
  client, job type, status) for every interview in that cell

Unlike Jobs/Candidates, this page intentionally reads the **unfiltered** interview data (see
section 2) so upcoming/future interviews always show — and because `MarketingActivity` and
`Interviews` are generated together per candidate (section 2), an interview can never appear
before that candidate's own marketing actually started.

## 6b. AI Match: ATS score simulation

AI Match accepts real resume files -- **PDF, DOCX, DOC, TXT, or MD** -- and runs an animated
"scanning" sequence. What it shows afterward comes entirely from **Settings → AI Match**, not from
whatever is actually written in the file:

- **Score**: general resumes land randomly inside `atsScoreMin`–`atsScoreMax`. Specific filenames
  can be configured with their own minimum (e.g. `ramesh_resume.pdf` → always ≥ 80, randomized up
  to 100) via "ATS score overrides — specific filenames".
- **Displayed profile**: name, job role(s), experience, location, mobile, email, and skills are all
  configured in Settings, not parsed from the resume. There are two levels:
  - **"Displayed profile — all users"**: shown for any resume that doesn't match a filename override.
  - **Per-filename overrides**: click **Add filename** (or **Edit** on an existing one) to open a
    modal and set that filename's own minimum score *and* its own full profile — multiple filenames
    can each have completely different details. Any field left blank is simply omitted from the
    result instead of showing an empty placeholder. Everything persists in `localStorage`, so it's
    still there next time you open the app.
- **Eligibility threshold** (default 75, adjustable) decides the overall score outcome, shown
  immediately with no extra click:
  - **Score ≥ threshold** → "Eligible" overall
  - **Score < threshold** → "Not Eligible" overall
  Either way, **matching companies show immediately** — Active jobs whose title fuzzily matches
  the profile's configured job role(s) (`src/lib/roleMatching.js`), so "Data Engineer" also matches
  postings like "Senior Data Engineer". This is fully automatic; there's no separate curated list
  to maintain. Each company row gets its **own** Eligible/Not Eligible tag rather than one blanket
  label: when the overall score is a miss, most companies show Not Eligible but a small, realistic
  subset (still the same matched roles) is tagged Eligible anyway — a low ATS score rarely means
  literally zero good fits (`assignCompanyEligibility` in `src/lib/roleMatching.js`).

PDF/DOCX parsing (`pdfjs-dist` and `mammoth`) is lazy-loaded only when someone actually uploads
one of those file types, so the rest of the app's bundle size isn't affected.

**Live, not cached.** The name/job roles/experience/location/mobile/email/skills shown for an
already-scanned resume are re-derived from Settings on every render (`resolveProfileForFile` in
`src/lib/atsScore.js`) — so editing a profile field, or the eligibility threshold, updates whatever's
already on screen immediately, with no re-scan or page refresh needed. The ATS **score** itself is
the one exception: it's generated once, at the moment of scanning, and deliberately doesn't re-roll
on its own afterward (a resume that's already been "analyzed" shouldn't silently get a new random
number just because the score range changed later).

**Cross-device note.** All of this lives in this browser's `localStorage` — there's no shared
server, so a change made on one laptop won't automatically appear on another. Settings → "Sync
across devices" adds an **Export/Import** pair: export downloads a small JSON file with every
setting (profiles, overrides, score ranges, everything on the Settings page); import loads that
file on another device to bring it up to date. That's a manual step, not live push-sync — a static
frontend genuinely can't do real-time cross-device sync without a backend or a third-party
database, so this is the honest, working alternative rather than something that only looks live in
a demo.

## 6d. One source of truth for interview counts

Every interview count on the site — the Interview Schedule page's KPIs and matrix, a candidate's
"Total interviews" / Completed / Upcoming tables, the Daily marketing table's "Interviews" row, and
the Home page's "Interview sheet (recent)" — is now computed **live from the same `Interviews`
array** (`data.Interviews`, ReceivedDate-filtered once in `DataContext`), grouped the same way
everywhere. The Daily marketing table used to trust a precomputed `InterviewsScheduled` number
baked into the `MarketingActivity` sheet, which could drift out of sync with the real `Interviews`
rows (e.g. a pending interview received today wasn't always reflected). It's now grouped live by
`InterviewReceivedDate` instead, so it can't disagree with any other view — and a pending interview
received today always counts today, everywhere.

Home's "Interview sheet (recent)" is sorted strictly by **Received Date, most recent first**
(e.g. all of the 25th, then the 24th, then the 23rd...), and includes a **Candidate** column
linking straight to that person's profile — where the same interview always appears in their
Completed/Upcoming tables.

**Status is also computed live, not trusted from the sheet.** A real outcome (Completed / Selected
/ Rejected / No-Show / Rescheduled) only ever displays once an interview's date has actually passed
relative to right now; anything dated today-or-later always shows "Pending Feedback" — regardless
of whatever the workbook's `Status` column happens to say. This is `effectiveInterviewStatus()` in
`src/lib/time.js`, applied everywhere an interview's status is shown (Home, the Interview Schedule
page's detail modal, and a candidate's Completed/Upcoming tables), so a status can never disagree
with the same interview's classification somewhere else in the app — and it can never show a "real"
outcome for an interview that, from the viewer's current moment, hasn't happened yet.

AI Match's matched-companies list links each company's arrow directly to `/jobs/:jobId` (the real
job detail page) instead of an external URL, so every claim it makes is checkable in the app itself.

The **Path** nav item (`/path`) is a self-contained, interactively explorable visa/career journey
map — F-1/M-1/J-1 through OPT, STEM OPT, H-1B, PERM, I-140, Green Card, and Citizenship — with
click-to-lock routing, a step-by-step detail panel, and animated flow lines. It's a standalone
component (`src/pages/Path.jsx`) styled independently of the rest of the app's design tokens.

## 7. Saved page

`/saved` is tabbed across the three bookmarkable entity types — **Candidates**, **Jobs**, and
**Recruiters** — each backed by a `Saved` column on that entity's sheet. The Home page also shows a
"Saved items" shortcut card with live counts for each.

## 7b. Special Search

The **Special Search** nav item (right after AI Match) is a single query box that understands
three concept types and cross-references them instead of returning a flat list:
- **Visa terms** (e.g. "H-1B sponsorship", "OPT", "Green Card") → candidates on that visa status,
  jobs whose `VisaSponsorship` covers it, and companies where candidates have actually been
  **placed** under that visa
- **Job roles** (e.g. "Data Analyst") → companies hiring for that role, candidates already placed
  in it, and candidates currently being marketed for it
- **Company names** (e.g. "Beacon Hill") → open roles there, candidates placed there, and visa
  sponsorship offered
- Anything else falls back to a general fuzzy match across candidates/jobs/recruiters

This relies on three new `Candidates` columns: **`TargetRole`** (the role a candidate is being
marketed for), **`PlacedCompany`**, and **`PlacedJobTitle`** (filled in only for `Placed`
candidates). See the schema table in section 2. The matching logic lives in
`src/lib/specialSearch.js`.

## 8. Uploading your own workbook from Settings

Settings → **Data source** has an **Upload & replace** control: pick an `.xlsx` file (same sheet
names/columns as the current file) and every page immediately starts reading from it instead of
the bundled demo data. Since this is a static frontend with no backend, "replace" happens in the
browser — the file's bytes are stored in IndexedDB (see `src/lib/localWorkbookStore.js`) and
`src/lib/excel.js` prefers that stored file over `/data/crm-data.xlsx` whenever one is present. It
persists across reloads on that device; use **Reset to bundled demo data** to go back to the
original file. For a "real" server-side replace (e.g. multiple users sharing one dataset), you'd
point `DATA_SOURCE_URL` at an API endpoint instead (see section 2, Option C).

## 9. Project structure

```
src/
  config/            # buttonVariants.js, typography.js  <- the "one place" configs
  context/           # AuthContext, DataContext, SettingsContext
  lib/                # excel.js (workbook loader), googleAuth.js, matching.js (AI Match scoring)
  components/
    ui/               # Button, Card, Badge, Input, DataTable, StatCard, WatchList, Typography
    layout/           # Sidebar, Topbar, PageShell, DashboardLayout
    ProtectedRoute.jsx
  pages/              # Login, Home, Jobs, AIMatch, Candidates, CandidateDetail, Saved,
                      # Activity, Reports, Recruiters, Settings, NotFound
public/data/crm-data.xlsx   # demo workbook — replace or repoint per section 2
```

## 10. Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |

## 11. Deploying

`npm run build` outputs static files in `dist/` — deploy that folder to Netlify, Vercel, S3/CloudFront,
GitHub Pages, or any static host. Remember to set `VITE_GOOGLE_CLIENT_ID` and `VITE_ALLOWED_EMAILS`
as environment variables in your hosting provider's build settings (Vite bakes them in at build time),
and add your production URL to the OAuth client's Authorized JavaScript origins (section 3, step 4).
