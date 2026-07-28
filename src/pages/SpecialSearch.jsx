import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search, Briefcase, Building2, Users, Trophy, ExternalLink, Sparkles, Filter,
  ChevronRight, TrendingUp, BarChart3, UserCheck,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import PageShell from "../components/layout/PageShell";
import { Card, CardHeader, CardBody } from "../components/ui/Card";
import { Heading, Text } from "../components/ui/Typography";
import Badge from "../components/ui/Badge";
import DataTable from "../components/ui/DataTable";
import { Select } from "../components/ui/Input";
import { useData } from "../context/DataContext";
import { runSpecialSearch, SUGGESTED_QUERIES } from "../lib/specialSearch";

// Same soft, airy palette as Candidates: light blue primary, light pink
// secondary, warm amber tertiary, semantic green for "yes"/placed states.
const BLUE = "#3b82f6";
const PINK = "#ec4899";
const AMBER = "#f59e0b";
const GREEN = "#10b981";
const PALETTE = [BLUE, PINK, AMBER, GREEN, "#60a5fa", "#f9a8d4"];

function cx(...args) {
  return args.filter(Boolean).join(" ");
}

/* ---------- Presentational helpers (shared look with Candidates) ---------- */

function ChartCard({ title, span, children, height = 260, headerExtra, delay = 0 }) {
  return (
    <Card
      className={`jobs-fade-up flex flex-col bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10 ${span}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <Text variant="small" className="font-bold tracking-tight text-ink">
          {title}
        </Text>
        {headerExtra}
      </div>
      <CardBody className="!pt-2 !pb-4" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}

function EmptyState({ message = "No data available", icon: Icon = BarChart3 }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <Icon className="h-10 w-10 text-slate/30 mb-2" />
      <Text variant="small" color="muted" className="text-sm">
        {message}
      </Text>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent, delay = 0 }) {
  return (
    <div
      className="jobs-fade-up group relative overflow-hidden rounded-2xl border border-blue-100 bg-white/85 backdrop-blur-sm p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-[0.10] transition-transform duration-500 group-hover:scale-125"
        style={{ background: accent }}
      />
      <div className="relative flex items-center gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm"
          style={{ background: `${accent}1a` }}
        >
          <Icon className="h-4.5 w-4.5" style={{ color: accent }} />
        </div>
        <Text variant="small" className="truncate font-medium text-slate">
          {label}
        </Text>
      </div>
      <div className="relative mt-3">
        <span className="stat-figure text-[26px] font-extrabold leading-none tracking-tight text-ink">
          {value}
        </span>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-white/95 px-3 py-2 text-xs shadow-lg ring-1 ring-blue-100 backdrop-blur-sm">
      {label && <p className="mb-1 font-semibold text-ink">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-1.5 text-slate">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="font-medium text-ink">{p.value}</span>
          {p.name && <span>{p.name}</span>}
        </p>
      ))}
    </div>
  );
}

// Same calm blob-and-dot-grid background used on Candidates.
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

// Same type system as Candidates: Plus Jakarta Sans for headings, Inter for
// body, IBM Plex Mono reserved for stat figures.
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
      .app-shell h1, .app-shell h2, .app-shell h3,
      .app-shell h4, .app-shell h5, .app-shell h6 {
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

// Same glowing search bar concept, recolored to the blue/pink/amber/green ring.
function SpecialSearchBar({ input, setInput, onSubmit }) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative">
      <style>{`
        .special-halo {
          background: conic-gradient(from 0deg, #3b82f6, #ec4899, #10b981, #f59e0b, #3b82f6);
          filter: blur(22px);
          animation: specialGlowPulse 3.2s ease-in-out infinite;
        }
        .special-border {
          background: conic-gradient(from 0deg, #3b82f6, #60a5fa, #ec4899, #10b981, #3b82f6);
          animation: specialSpin 6s linear infinite;
        }
        .special-border.is-focused { animation-duration: 2.5s; }
        .special-sparkle { animation: specialSparkle 2.2s ease-in-out infinite; }
      `}</style>

      <div
        className={cx(
          "special-halo pointer-events-none absolute -inset-2 rounded-2xl transition-opacity duration-300",
          focused ? "opacity-90" : "opacity-40"
        )}
      />

      <div className={cx("special-border relative rounded-2xl p-[2px]", focused && "is-focused")}>
        <form
          onSubmit={onSubmit}
          className="relative flex gap-2 rounded-[calc(1rem-1px)] bg-white px-1.5 py-1.5 overflow-hidden"
        >
          <div className="relative flex-1 flex items-center">
            <span className="absolute left-3 flex items-center justify-center">
              <Sparkles className={cx("h-4 w-4 special-sparkle", focused ? "text-blue-500" : "text-slate")} />
            </span>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder='Try "H-1B sponsorship", "Data Analyst", or "Beacon Hill"'
              className="w-full rounded-xl bg-transparent pl-9 pr-3 py-2.5 text-sm focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="relative z-10 rounded-xl bg-gradient-to-r from-blue-500 to-blue-400 text-white px-5 text-sm font-semibold shadow-sm hover:shadow-md hover:brightness-110 transition-all inline-flex items-center gap-1.5"
          >
            <Search className="h-3.5 w-3.5" />
            Search
          </button>
        </form>
      </div>
    </div>
  );
}

const CANDIDATE_COLUMNS = [
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
  { key: "TargetRole", label: "Target role", sortable: true },
  { key: "VisaStatus", label: "Visa", render: (r) => <Badge tone="default">{r.VisaStatus}</Badge> },
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

const PLACED_COLUMNS = [
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
  { key: "PlacedJobTitle", label: "Placed as", sortable: true },
  { key: "PlacedCompany", label: "Company", sortable: true },
  { key: "VisaStatus", label: "Visa", render: (r) => <Badge tone="default">{r.VisaStatus}</Badge> },
  { key: "PlacementDate", label: "Placed on", sortable: true },
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

const JOB_COLUMNS = [
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
  { key: "VisaSponsorship", label: "Visa", render: (r) => <Badge tone="default">{r.VisaSponsorship}</Badge> },
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

export default function SpecialSearch() {
  const { visible: data } = useData();
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [secondaryFilter, setSecondaryFilter] = useState("All");

  const result = useMemo(() => runSpecialSearch(query, data), [query, data]);

  useEffect(() => {
    setSecondaryFilter("All");
  }, [result?.type, result?.label]);

  const filterConfig = useMemo(() => {
    if (!result) return null;
    if (result.type === "visa") {
      const options = [...new Set(result.candidatesOnVisa.map((c) => c.TargetRole).filter(Boolean))].sort();
      return { label: "Filter by job role", options };
    }
    if (result.type === "role") {
      const options = [
        ...new Set([...result.marketingInRole, ...result.placedInRole].map((c) => c.VisaStatus).filter(Boolean)),
      ].sort();
      return { label: "Filter by visa status", options };
    }
    if (result.type === "company") {
      const options = [...new Set(result.jobsAtCompany.map((j) => j.VisaSponsorship).filter(Boolean))].sort();
      return { label: "Filter by visa sponsorship", options };
    }
    return null;
  }, [result]);

  const filtered = useMemo(() => {
    if (!result) return null;
    if (result.type === "visa") {
      const byRole = (c) => secondaryFilter === "All" || c.TargetRole === secondaryFilter;
      const byPlacedRole = (c) => secondaryFilter === "All" || c.PlacedJobTitle === secondaryFilter;
      return {
        candidatesOnVisa: result.candidatesOnVisa.filter(byRole),
        placedOnVisa: result.placedOnVisa.filter(byPlacedRole),
      };
    }
    if (result.type === "role") {
      const byVisa = (c) => secondaryFilter === "All" || c.VisaStatus === secondaryFilter;
      return {
        marketingInRole: result.marketingInRole.filter(byVisa),
        placedInRole: result.placedInRole.filter(byVisa),
      };
    }
    if (result.type === "company") {
      const byVisa = (j) => secondaryFilter === "All" || j.VisaSponsorship === secondaryFilter;
      return { jobsAtCompany: result.jobsAtCompany.filter(byVisa) };
    }
    return null;
  }, [result, secondaryFilter]);

  function submit(e) {
    e?.preventDefault();
    setQuery(input);
  }

  const totalCandidates = data.Candidates?.length || 0;
  const totalJobs = data.Jobs?.length || 0;

  return (
    <PageShell title="Special Search">
      <PageTypography />
      <DashboardBackground />

      <div className="app-shell space-y-8">
        {/* Hero — same soft blue/pink glass header as Candidates */}
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm px-6 py-4 ring-1 ring-blue-500/10 shadow-sm">
          <div className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-pink-300/10 blur-3xl" />

          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-3.5">
              <span className="group flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-crimson-500 via-crimson-600 to-crimson-500 ring-1 ring-blue-400/20 transition-transform duration-300 hover:scale-105 hover:rotate-3">
                <Sparkles className="h-4 w-4 text-white transition-transform duration-300 group-hover:scale-110" />
              </span>
              <div>
                <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-ink">
                  Special Search
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex cursor-default items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/70 px-3.5 py-2 text-xs font-semibold text-blue-700">
                <TrendingUp className="h-3.5 w-3.5" />
                {result ? `${result.type} match` : "Ready to search"}
              </div>
              <div className="flex cursor-default items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/60 px-3.5 py-2 text-xs font-semibold text-emerald-700">
                <Users className="h-3.5 w-3.5" />
                <span className="stat-figure">{totalCandidates}</span> candidates
              </div>
              <div className="flex cursor-default items-center gap-1.5 rounded-full border border-pink-200 bg-pink-50/60 px-3.5 py-2 text-xs font-semibold text-pink-700">
                <Briefcase className="h-3.5 w-3.5" />
                <span className="stat-figure">{totalJobs}</span> jobs
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8  px-4 md:px-6">
          {/* Search card */}
          <Card
            className="jobs-fade-up overflow-visible bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10"
            style={{ animationDelay: "120ms" }}
          >
            <CardBody className="space-y-4 overflow-visible">
              <SpecialSearchBar input={input} setInput={setInput} onSubmit={submit} />
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_QUERIES.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setInput(s);
                      setQuery(s);
                    }}
                    className="rounded-full bg-blue-50/70 text-ink-soft text-xs font-medium px-3 py-1.5 border border-blue-100 hover:bg-blue-100/70 hover:border-blue-300 transition-all duration-200 hover:shadow-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>

          {result && filterConfig && (
            <Card
              className="jobs-fade-up p-4 flex items-center gap-3 flex-wrap bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10"
              style={{ animationDelay: "180ms" }}
            >
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                <Filter className="h-4 w-4 text-blue-500" /> {filterConfig.label}
              </span>
              <Select value={secondaryFilter} onChange={(e) => setSecondaryFilter(e.target.value)} className="w-56">
                <option value="All">All</option>
                {filterConfig.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </Select>
              {secondaryFilter !== "All" && (
                <button onClick={() => setSecondaryFilter("All")} className="text-xs font-semibold text-blue-600 hover:underline">
                  Clear filter
                </button>
              )}
            </Card>
          )}

          {!result && (
            <Card
              className="jobs-fade-up p-16 text-center bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10"
              style={{ animationDelay: "220ms" }}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 rounded-full bg-blue-50">
                  <Search className="h-8 w-8 text-blue-500" />
                </div>
                <Heading variant="h4" className="font-extrabold text-ink">Search for insights</Heading>
                <Text variant="body" color="muted" className="max-w-md">
                  Enter a visa type, job role, or company name above to see cross-referenced results across candidates, jobs, and placements.
                </Text>
              </div>
            </Card>
          )}

          {result?.type === "visa" && (
            <>
              <div className="grid sm:grid-cols-3 gap-4">
                <StatCard icon={UserCheck} label={`Candidates on ${result.label}`} value={result.candidatesOnVisa.length} accent={BLUE} delay={100} />
                <StatCard icon={Briefcase} label={`Jobs offering ${result.label}`} value={result.jobsOffering.length} accent={PINK} delay={180} />
                <StatCard icon={Trophy} label={`Placed under ${result.label}`} value={result.placedOnVisa.length} accent={GREEN} delay={260} />
              </div>

              <div className="grid grid-cols-12 gap-4">
                <ChartCard title={`Companies offering ${result.label}`} span="col-span-12 lg:col-span-6" height={260} delay={320}>
                  {result.companiesOffering.length > 0 ? (
                    <BarChart data={result.companiesOffering.slice(0, 8)} layout="vertical" margin={{ left: 4, right: 24, top: 8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e6eefc" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill={BLUE} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  ) : (
                    <EmptyState message="No companies offering this visa" />
                  )}
                </ChartCard>
                <ChartCard title={`Companies placed under ${result.label}`} span="col-span-12 lg:col-span-6" height={260} delay={380}>
                  {result.placedByCompany.length > 0 ? (
                    <BarChart data={result.placedByCompany.slice(0, 8)} layout="vertical" margin={{ left: 4, right: 24, top: 8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e6eefc" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill={GREEN} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  ) : (
                    <EmptyState message="No placements under this visa" />
                  )}
                </ChartCard>
              </div>

              <Card className="jobs-fade-up bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10" style={{ animationDelay: "420ms" }}>
                <CardHeader>
                  <Heading variant="h4" className="font-extrabold">Candidates on {result.label}</Heading>
                  <Badge tone="default" className="border border-blue-100">{filtered.candidatesOnVisa.length}</Badge>
                </CardHeader>
                <DataTable columns={CANDIDATE_COLUMNS} rows={filtered.candidatesOnVisa} emptyLabel="No candidates found" />
              </Card>

              <Card className="jobs-fade-up bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10" style={{ animationDelay: "460ms" }}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-blue-500" />
                    <Heading variant="h4" className="font-extrabold">Placed under {result.label}</Heading>
                  </div>
                  <Badge tone="default" className="border border-blue-100">{filtered.placedOnVisa.length}</Badge>
                </CardHeader>
                <DataTable columns={PLACED_COLUMNS} rows={filtered.placedOnVisa} emptyLabel="No placements under this visa yet" />
              </Card>

              <Card className="jobs-fade-up bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10" style={{ animationDelay: "500ms" }}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-blue-500" />
                    <Heading variant="h4" className="font-extrabold">Jobs offering {result.label}</Heading>
                  </div>
                  <Badge tone="default" className="border border-blue-100">{result.jobsOffering.length}</Badge>
                </CardHeader>
                <DataTable columns={JOB_COLUMNS} rows={result.jobsOffering} emptyLabel="No open jobs offer this sponsorship" />
              </Card>
            </>
          )}

          {result?.type === "role" && (
            <>
              <div className="grid sm:grid-cols-3 gap-4">
                <StatCard icon={Building2} label={`Companies hiring for ${result.label}`} value={result.companiesHiring.length} accent={BLUE} delay={100} />
                <StatCard icon={Trophy} label="Already placed" value={result.placedInRole.length} accent={GREEN} delay={180} />
                <StatCard icon={Users} label="Currently marketing" value={result.marketingInRole.length} accent={PINK} delay={260} />
              </div>

              <div className="grid grid-cols-12 gap-4">
                <ChartCard title={`Companies hiring for ${result.label}`} span="col-span-12 lg:col-span-6" height={260} delay={320}>
                  {result.companiesHiring.length > 0 ? (
                    <BarChart data={result.companiesHiring.slice(0, 8)} layout="vertical" margin={{ left: 4, right: 24, top: 8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e6eefc" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill={BLUE} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  ) : (
                    <EmptyState message="No companies hiring for this role" />
                  )}
                </ChartCard>
                <ChartCard title="Visa mix among candidates marketing" span="col-span-12 lg:col-span-6" height={260} delay={380}>
                  {result.visaMixMarketing.length > 0 ? (
                    <PieChart>
                      <Pie data={result.visaMixMarketing} dataKey="count" nameKey="name" innerRadius={40} outerRadius={68} paddingAngle={2}>
                        {result.visaMixMarketing.map((_, i) => (
                          <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="#fff" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="bottom" height={24} iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  ) : (
                    <EmptyState message="No candidates marketing for this role" />
                  )}
                </ChartCard>
              </div>

              <Card className="jobs-fade-up bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10" style={{ animationDelay: "420ms" }}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-blue-500" />
                    <Heading variant="h4" className="font-extrabold">Candidates already placed as {result.label}</Heading>
                  </div>
                  <Badge tone="default" className="border border-blue-100">{filtered.placedInRole.length}</Badge>
                </CardHeader>
                <DataTable columns={PLACED_COLUMNS} rows={filtered.placedInRole} emptyLabel="No placements in this role yet" />
              </Card>

              <Card className="jobs-fade-up bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10" style={{ animationDelay: "460ms" }}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <Heading variant="h4" className="font-extrabold">Candidates currently marketing for {result.label}</Heading>
                  </div>
                  <Badge tone="default" className="border border-blue-100">{filtered.marketingInRole.length}</Badge>
                </CardHeader>
                <DataTable columns={CANDIDATE_COLUMNS} rows={filtered.marketingInRole} emptyLabel="No one is currently marketing for this role" />
              </Card>

              <Card className="jobs-fade-up bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10" style={{ animationDelay: "500ms" }}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-blue-500" />
                    <Heading variant="h4" className="font-extrabold">Open jobs for {result.label}</Heading>
                  </div>
                  <Badge tone="default" className="border border-blue-100">{result.jobsForRole.length}</Badge>
                </CardHeader>
                <DataTable columns={JOB_COLUMNS} rows={result.jobsForRole} emptyLabel="No open jobs for this role" />
              </Card>
            </>
          )}

          {result?.type === "company" && (
            <>
              <div className="grid sm:grid-cols-3 gap-4">
                <StatCard icon={Building2} label={`Open roles at ${result.label}`} value={result.jobsAtCompany.length} accent={BLUE} delay={100} />
                <StatCard icon={Trophy} label="Candidates placed here" value={result.placedAtCompany.length} accent={GREEN} delay={180} />
                <StatCard icon={UserCheck} label="Interviews on record" value={result.interviewsAtCompany.length} accent={AMBER} delay={260} />
              </div>

              <div className="grid grid-cols-12 gap-4">
                <ChartCard title="Roles open" span="col-span-12 lg:col-span-6" height={260} delay={320}>
                  {result.rolesOpen.length > 0 ? (
                    <BarChart data={result.rolesOpen.slice(0, 8)} layout="vertical" margin={{ left: 4, right: 24, top: 8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e6eefc" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill={BLUE} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  ) : (
                    <EmptyState message="No open roles" />
                  )}
                </ChartCard>
                <ChartCard title="Visa sponsorship offered" span="col-span-12 lg:col-span-6" height={260} delay={380}>
                  {result.visaSponsorshipOffered.length > 0 ? (
                    <PieChart>
                      <Pie data={result.visaSponsorshipOffered} dataKey="count" nameKey="name" innerRadius={40} outerRadius={68} paddingAngle={2}>
                        {result.visaSponsorshipOffered.map((_, i) => (
                          <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="#fff" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="bottom" height={24} iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  ) : (
                    <EmptyState message="No visa sponsorship data" />
                  )}
                </ChartCard>
              </div>

              <Card className="jobs-fade-up bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10" style={{ animationDelay: "420ms" }}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-blue-500" />
                    <Heading variant="h4" className="font-extrabold">Candidates placed at {result.label}</Heading>
                  </div>
                  <Badge tone="default" className="border border-blue-100">{result.placedAtCompany.length}</Badge>
                </CardHeader>
                <DataTable columns={PLACED_COLUMNS} rows={result.placedAtCompany} emptyLabel="No placements at this company yet" />
              </Card>

              <Card className="jobs-fade-up bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10" style={{ animationDelay: "460ms" }}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-500" />
                    <Heading variant="h4" className="font-extrabold">Open jobs at {result.label}</Heading>
                  </div>
                  <Badge tone="default" className="border border-blue-100">{filtered.jobsAtCompany.length}</Badge>
                </CardHeader>
                <DataTable columns={JOB_COLUMNS} rows={filtered.jobsAtCompany} emptyLabel="No open jobs at this company" />
              </Card>
            </>
          )}

          {result?.type === "general" && (
            <>
              <Card
                className="jobs-fade-up p-4 bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10 border-l-4 border-l-blue-400"
                style={{ animationDelay: "100ms" }}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <Search className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <Text variant="small" className="font-semibold text-ink">
                      General search results
                    </Text>
                    <Text variant="small" color="muted">
                      No visa, role, or company matched "{result.query}" exactly — showing a general match across candidates, jobs, and recruiters.
                    </Text>
                  </div>
                </div>
              </Card>

              <Card className="jobs-fade-up bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10" style={{ animationDelay: "180ms" }}>
                <CardHeader>
                  <Heading variant="h4" className="font-extrabold">Candidates</Heading>
                  <Badge tone="default" className="border border-blue-100">{result.candidateMatches.length}</Badge>
                </CardHeader>
                <DataTable columns={CANDIDATE_COLUMNS} rows={result.candidateMatches} emptyLabel="No matching candidates" />
              </Card>

              <Card className="jobs-fade-up bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10" style={{ animationDelay: "240ms" }}>
                <CardHeader>
                  <Heading variant="h4" className="font-extrabold">Jobs</Heading>
                  <Badge tone="default" className="border border-blue-100">{result.jobMatches.length}</Badge>
                </CardHeader>
                <DataTable columns={JOB_COLUMNS} rows={result.jobMatches} emptyLabel="No matching jobs" />
              </Card>

              <Card className="jobs-fade-up bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10" style={{ animationDelay: "300ms" }}>
                <CardHeader>
                  <Heading variant="h4" className="font-extrabold">Recruiters</Heading>
                  <Badge tone="default" className="border border-blue-100">{result.recruiterMatches.length}</Badge>
                </CardHeader>
                <DataTable
                  columns={[
                    { key: "Name", label: "Name", sortable: true },
                    { key: "Title", label: "Title" },
                    {
                      key: "LinkedIn",
                      label: "LinkedIn",
                      render: (r) => (
                        <a href={r.LinkedIn} target="_blank" rel="noreferrer" className="text-blue-600 inline-flex items-center gap-1 hover:underline">
                          Profile <ExternalLink className="h-3 w-3" />
                        </a>
                      ),
                    },
                    { key: "City", label: "City" },
                    { key: "Country", label: "Country", render: (r) => <Badge tone="default">{r.Country}</Badge> },
                    {
                      key: "_view",
                      label: "",
                      render: (r) => (
                        <Link to={`/recruiters/${r.RecruiterID}`} className="text-slate transition-colors hover:text-blue-600">
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      ),
                    },
                  ]}
                  rows={result.recruiterMatches}
                  emptyLabel="No matching recruiters"
                />
              </Card>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}