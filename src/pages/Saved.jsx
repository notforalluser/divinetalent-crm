import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Users, Briefcase, UsersRound, ChevronRight } from "lucide-react";
import PageShell from "../components/layout/PageShell";
import { Card, CardBody } from "../components/ui/Card";
import { Heading, Text } from "../components/ui/Typography";
import DataTable from "../components/ui/DataTable";
import Badge from "../components/ui/Badge";
import SaveButton from "../components/ui/SaveButton";
import { useData } from "../context/DataContext";
import { useSaved } from "../context/SavedContext";

const RED = "#c8102e";
const BLUE = "#3b82f6";
const GREEN = "#10b981";

const TABS = [
  { key: "candidates", label: "Candidates", icon: Users },
  { key: "jobs", label: "Jobs", icon: Briefcase },
  { key: "recruiters", label: "Recruiters", icon: UsersRound },
];

function StatCard({ icon: Icon, label, value, accent, delay = 0 }) {
  return (
    <div
      className="jobs-fade-up group relative overflow-hidden rounded-2xl border border-blue-100 bg-white/85 backdrop-blur-sm p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative flex items-center justify-between">
        <div>
          <Text variant="small" className="font-semibold text-slate">{label}</Text>
          <span className="stat-figure mt-1 block text-[26px] font-extrabold leading-none tracking-tight text-ink">
            {value}
          </span>
        </div>
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl shadow-sm transition-colors"
          style={{ background: `${accent}1a` }}
        >
          <Icon className="h-5 w-5" style={{ color: accent }} />
        </div>
      </div>
    </div>
  );
}

function DashboardBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#F7FAFF]">
      <style>{`
        @keyframes floatBlobA {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -30px) scale(1.08); }
          66% { transform: translate(-20px, 20px) scale(0.96); }
        }
        @keyframes floatBlobB {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-50px, 30px) scale(1.1); }
        }
        @keyframes floatBlobC {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(30px, 40px) scale(0.94); }
          70% { transform: translate(-30px, -10px) scale(1.05); }
        }
        .dash-blob-a { animation: floatBlobA 22s ease-in-out infinite; }
        .dash-blob-b { animation: floatBlobB 26s ease-in-out infinite; }
        .dash-blob-c { animation: floatBlobC 30s ease-in-out infinite; }
        .dash-grid {
          background-image: radial-gradient(circle, rgba(59,130,246,0.07) 1px, transparent 1px);
          background-size: 22px 22px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 20%, black 40%, transparent 90%);
        }
        @media (prefers-reduced-motion: reduce) {
          .dash-blob-a, .dash-blob-b, .dash-blob-c { animation: none !important; }
        }
      `}</style>

      <div className="dash-grid absolute inset-0" />

      <div
        className="dash-blob-a absolute -top-32 -left-24 h-[26rem] w-[26rem] rounded-full blur-3xl opacity-40"
        style={{ background: "radial-gradient(circle, #93c5fd 0%, transparent 70%)" }}
      />
      <div
        className="dash-blob-b absolute top-10 right-[-6rem] h-[24rem] w-[24rem] rounded-full blur-3xl opacity-30"
        style={{ background: "radial-gradient(circle, #f9a8d4 0%, transparent 70%)" }}
      />
      <div
        className="dash-blob-c absolute bottom-[-8rem] left-1/3 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-25"
        style={{ background: "radial-gradient(circle, #fde68a 0%, transparent 70%)" }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/70" />
    </div>
  );
}

function PageTypography() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');

      .app-shell {
        --font-display: 'Plus Jakarta Sans', 'Inter', sans-serif;
        --font-body: 'Inter', 'Plus Jakarta Sans', sans-serif;
        --font-mono: 'IBM Plex Mono', 'Menlo', monospace;
        font-family: var(--font-body);
      }
      .app-shell h1,
      .app-shell h2,
      .app-shell h3,
      .app-shell h4,
      .app-shell h5,
      .app-shell h6 {
        font-family: var(--font-display);
        letter-spacing: -0.012em;
      }
      .app-shell .stat-figure {
        font-family: var(--font-mono);
        letter-spacing: -0.02em;
        font-variant-numeric: tabular-nums;
      }
    `}</style>
  );
}

export default function Saved() {
  const { visible: data } = useData();
  const { isSaved } = useSaved();
  const [tab, setTab] = useState("candidates");
  const [query, setQuery] = useState("");

  const savedCandidates = useMemo(
    () => data.Candidates.filter((c) => isSaved("candidates", c.CandidateID, c.Saved)),
    [data.Candidates, isSaved]
  );
  const savedJobs = useMemo(
    () => data.Jobs.filter((j) => isSaved("jobs", j.JobID, j.Saved)),
    [data.Jobs, isSaved]
  );
  const savedRecruiters = useMemo(
    () => data.Recruiters.filter((r) => isSaved("recruiters", r.RecruiterID, r.Saved)),
    [data.Recruiters, isSaved]
  );

  const totalSaved = savedCandidates.length + savedJobs.length + savedRecruiters.length;

  const candidateColumns = [
    {
      key: "_saved",
      label: "",
      render: (r) => <SaveButton type="candidates" id={r.CandidateID} sheetValue={r.Saved} />,
    },
    {
      key: "Name",
      label: "Candidate",
      sortable: true,
      render: (r) => (
        <Link to={`/candidates/${r.CandidateID}`} className="font-semibold text-ink transition-colors hover:text-blue-600">
          {r.Name}
        </Link>
      ),
    },
    { key: "Technology", label: "Technology", sortable: true },
    { key: "Recruiter", label: "Recruiter" },
    { key: "CurrentLocation", label: "Location" },
    { key: "Status", label: "Status", render: (r) => <Badge tone={r.Status}>{r.Status}</Badge> },
    {
      key: "_view",
      label: "",
      render: (r) => (
        <Link to={`/candidates/${r.CandidateID}`} className="text-slate transition-colors hover:text-blue-600">
          <ChevronRight className="h-4 w-4" />
        </Link>
      ),
    },
  ];

  const jobColumns = [
    {
      key: "_saved",
      label: "",
      render: (r) => <SaveButton type="jobs" id={r.JobID} sheetValue={r.Saved} />,
    },
    {
      key: "Title",
      label: "Role",
      sortable: true,
      render: (r) => (
        <Link to={`/jobs/${r.JobID}`} className="font-semibold text-ink transition-colors hover:text-blue-600">
          {r.Title}
        </Link>
      ),
    },
    { key: "Company", label: "Company", sortable: true },
    { key: "City", label: "Location", render: (r) => `${r.City}, ${r.State}` },
    { key: "JobType", label: "Type" },
    { key: "Status", label: "Status", render: (r) => <Badge tone={r.Status}>{r.Status}</Badge> },
    {
      key: "_view",
      label: "",
      render: (r) => (
        <Link to={`/jobs/${r.JobID}`} className="text-slate transition-colors hover:text-blue-600">
          <ChevronRight className="h-4 w-4" />
        </Link>
      ),
    },
  ];

  const recruiterColumns = [
    {
      key: "_saved",
      label: "",
      render: (r) => <SaveButton type="recruiters" id={r.RecruiterID} sheetValue={r.Saved} />,
    },
    { key: "Name", label: "Name", sortable: true },
    { key: "Title", label: "Title" },
    { key: "Email", label: "Email" },
    { key: "City", label: "City" },
    { key: "Country", label: "Country", sortable: true },
    {
      key: "_view",
      label: "",
      render: (r) => (
        <Link to={`/recruiters/${r.RecruiterID}`} className="text-slate transition-colors hover:text-blue-600">
          <ChevronRight className="h-4 w-4" />
        </Link>
      ),
    },
  ];

  const rowsByTab = { candidates: savedCandidates, jobs: savedJobs, recruiters: savedRecruiters };
  const columnsByTab = { candidates: candidateColumns, jobs: jobColumns, recruiters: recruiterColumns };
  const emptyByTab = {
    candidates: "No saved candidates yet -- bookmark one from the Candidates page.",
    jobs: "No saved jobs yet -- bookmark one from the Jobs page.",
    recruiters: "No saved recruiters yet -- bookmark one from the Recruiters page.",
  };

  return (
    <PageShell title="Saved" onSearch={setQuery} searchPlaceholder={`Search ${tab}...`}>
      <PageTypography />
      <DashboardBackground />

      <style>{`
        @keyframes jobsFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .jobs-fade-up {
          animation: jobsFadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .jobs-fade-up { animation: none !important; }
        }
      `}</style>

      <div className="app-shell space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm px-6 py-4 ring-1 ring-blue-500/10 shadow-sm">
          <div className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-pink-300/10 blur-3xl" />

          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-3.5">
              <span className="group flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-crimson-500 via-crimson-600 to-crimson-500 ring-1 ring-blue-400/20 transition-transform duration-300 hover:scale-105 hover:rotate-3">
                <Bookmark className="h-4 w-4 text-white transition-transform duration-300 group-hover:scale-110" />
              </span>
              <div>
                <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-ink">
                  Saved Items
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex cursor-default items-center gap-1.5 rounded-full border border-crimson-200 bg-crimson-50/70 px-3.5 py-2 text-xs font-semibold text-crimson-700">
                <Users className="h-3.5 w-3.5" />
                <span className="stat-figure">{savedCandidates.length}</span> candidates
              </div>
              <div className="flex cursor-default items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/70 px-3.5 py-2 text-xs font-semibold text-blue-700">
                <Briefcase className="h-3.5 w-3.5" />
                <span className="stat-figure">{savedJobs.length}</span> jobs
              </div>
              <div className="flex cursor-default items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/60 px-3.5 py-2 text-xs font-semibold text-emerald-700">
                <UsersRound className="h-3.5 w-3.5" />
                <span className="stat-figure">{savedRecruiters.length}</span> recruiters
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-6 space-y-8">
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard icon={Users} label="Candidates" value={savedCandidates.length} accent={RED} delay={80} />
            <StatCard icon={Briefcase} label="Jobs" value={savedJobs.length} accent={BLUE} delay={140} />
            <StatCard icon={UsersRound} label="Recruiters" value={savedRecruiters.length} accent={GREEN} delay={200} />
          </div>

          {/* Tabs */}
          <div
            className="jobs-fade-up flex gap-2 rounded-t-2xl bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10 px-1 pt-1"
            style={{ animationDelay: "240ms" }}
          >
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 rounded-t-lg border-b-2 -mb-px px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  tab === key
                    ? "border-crimson-500 bg-crimson-50/50 text-crimson-600"
                    : "border-transparent text-slate hover:bg-blue-50/40 hover:text-ink"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                <span
                  className={`ml-1 rounded-full px-2 py-0.5 text-xs ${
                    tab === key ? "bg-crimson-100 text-crimson-700" : "bg-blue-50 text-slate"
                  }`}
                >
                  {rowsByTab[key].length}
                </span>
              </button>
            ))}
          </div>

          {/* Table */}
          <Card
            className="jobs-fade-up !rounded-2xl bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10 shadow-[0_1px_2px_rgba(20,20,40,0.04)]"
            style={{ animationDelay: "280ms" }}
          >
            <div className="border-b border-blue-100 bg-gradient-to-r from-blue-50/70 via-pink-50/40 to-transparent rounded-t-2xl px-4 py-2.5">
              <div className="flex items-center justify-between">
                <Text variant="small" className="font-semibold text-ink">
                  {TABS.find((t) => t.key === tab)?.label}
                </Text>
                <Badge tone="default" className="border border-blue-100">
                  {rowsByTab[tab].length} items
                </Badge>
              </div>
            </div>
            <DataTable
              columns={columnsByTab[tab]}
              rows={rowsByTab[tab]}
              searchTerm={query}
              emptyLabel={emptyByTab[tab]}
            />
          </Card>

          {/* Empty state */}
          {totalSaved === 0 && (
            <Card
              className="jobs-fade-up bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10 border-2 border-dashed border-blue-200 !rounded-2xl"
              style={{ animationDelay: "320ms" }}
            >
              <CardBody className="text-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="rounded-full bg-crimson-50 p-4">
                    <Bookmark className="h-10 w-10 text-crimson-500" />
                  </div>
                  <Heading variant="h4" className="font-extrabold text-ink">Start saving items</Heading>
                  <Text variant="body" color="muted" className="max-w-md">
                    Click the bookmark icon on any candidate, job, or recruiter card to save it here for quick access.
                  </Text>
                  <div className="mt-2 flex flex-wrap justify-center gap-2">
                    <Link to="/candidates">
                      <Badge tone="default" className="cursor-pointer border border-blue-100 px-3 py-1.5 transition-colors hover:bg-crimson-50">
                        Browse Candidates
                      </Badge>
                    </Link>
                    <Link to="/jobs">
                      <Badge tone="default" className="cursor-pointer border border-blue-100 px-3 py-1.5 transition-colors hover:bg-crimson-50">
                        Browse Jobs
                      </Badge>
                    </Link>
                    <Link to="/recruiters">
                      <Badge tone="default" className="cursor-pointer border border-blue-100 px-3 py-1.5 transition-colors hover:bg-crimson-50">
                        Browse Recruiters
                      </Badge>
                    </Link>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </PageShell>
  );
}