import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft, MapPin, Briefcase, DollarSign, ShieldCheck, Globe2, Users, Clock, ExternalLink, Bookmark,
  Building2, Calendar, ChevronRight, TrendingUp, Award, Zap, Sparkles, UserCheck, BarChart3
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import PageShell from "../components/layout/PageShell";
import { Card, CardHeader, CardBody } from "../components/ui/Card";
import { Heading, Text } from "../components/ui/Typography";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { useData } from "../context/DataContext";
import { useSaved } from "../context/SavedContext";
import { timeAgo, addDays, nowIST } from "../lib/time";
import { syntheticDailyCounts } from "../lib/synthetic";

// Same soft, airy palette as the Jobs dashboard: light blue as the primary
// signal, light pink/rose as the secondary accent, warm amber as the
// tertiary, and a semantic green reserved for "yes" / positive states.
const BLUE = "#3b82f6";
const PINK = "#ec4899";
const AMBER = "#f59e0b";
const GREEN = "#10b981";
const PALETTE = [BLUE, PINK, AMBER, GREEN, "#60a5fa", "#f9a8d4"];

function cx(...args) {
  return args.filter(Boolean).join(" ");
}

/* ---------- Presentational helpers (mirrors Jobs.jsx) ---------- */

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

function StatCardCustom({ icon: Icon, label, value, sub, accent, delay = 0 }) {
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
        <div className="min-w-0">
          <Text variant="small" className="truncate font-medium text-slate">
            {label}
          </Text>
        </div>
      </div>
      <div className="relative mt-3 flex items-baseline gap-2">
        <span className="stat-figure text-[26px] font-extrabold leading-none tracking-tight text-ink">
          {value}
        </span>
        {sub && (
          <span className="text-[11px] font-semibold" style={{ color: accent }}>
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}

// Same soft, airy background used on the Jobs dashboard: near-white base,
// a light blue dot grid, and three gentle floating blobs.
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

// Same type system as the Jobs dashboard: Plus Jakarta Sans for headings,
// Inter for body, IBM Plex Mono reserved for stat figures.
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

export default function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { visible: data } = useData();
  const { isSaved, toggleSaved } = useSaved();

  const job = data.Jobs.find((j) => j.JobID === jobId);

  const applicantTrend = useMemo(() => {
    if (!job) return [];
    const days = 14;
    const now = nowIST();
    const counts = syntheticDailyCounts(job.JobID, days, Math.round(Number(job.Applicants) * 0.18));
    return counts.map((count, i) => ({
      date: addDays(now, -(days - 1 - i)).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      count,
    }));
  }, [job]);

  const similarJobs = useMemo(() => {
    if (!job) return [];
    const jobSkills = new Set((job.Skills || "").split(",").map((s) => s.trim()));
    return data.Jobs
      .filter((j) => j.JobID !== job.JobID)
      .map((j) => {
        const overlap = (j.Skills || "").split(",").map((s) => s.trim()).filter((s) => jobSkills.has(s)).length;
        const titleMatch = j.Title === job.Title ? 3 : 0;
        return { ...j, relevance: overlap + titleMatch };
      })
      .filter((j) => j.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5);
  }, [job, data.Jobs]);

  const matchingCandidates = useMemo(() => {
    if (!job) return [];
    const jobSkills = new Set((job.Skills || "").split(",").map((s) => s.trim().toLowerCase()));
    return data.Candidates
      .filter((c) => {
        const candidateSkills = (c.Skills || "").split(",").map((s) => s.trim().toLowerCase());
        const match = candidateSkills.filter((s) => jobSkills.has(s)).length;
        return match >= 2;
      })
      .slice(0, 5);
  }, [job, data.Candidates]);

  if (!job) {
    return (
      <PageShell title="Job">
        <div className="app-shell max-w-3xl mx-auto text-center py-24">
          <PageTypography />
          <DashboardBackground />
          <Text>Job not found.</Text>
          <Link to="/jobs">
            <Button variant="outline" className="mt-4">Back to jobs</Button>
          </Link>
        </div>
      </PageShell>
    );
  }

  const requirements = (job.Requirements || "").split(";").map((r) => r.trim()).filter(Boolean);
  const skills = (job.Skills || "").split(",").map((s) => s.trim()).filter(Boolean);
  const totalApplicants30d = applicantTrend.reduce((s, d) => s + d.count, 0);

  const visaData = [
    { name: "Offers Sponsorship", value: job.VisaSponsorship === "Yes" ? 1 : 0 },
    { name: "No Sponsorship", value: job.VisaSponsorship === "No" ? 1 : 0 },
  ].filter((d) => d.value > 0);

  const workTypeData = [
    { name: "Remote", value: job.RemoteType === "Remote" ? 1 : 0 },
    { name: "Hybrid", value: job.RemoteType === "Hybrid" ? 1 : 0 },
    { name: "On-site", value: job.RemoteType === "On-site" ? 1 : 0 },
  ].filter((d) => d.value > 0);

  return (
    <PageShell title="Job Detail">
      <PageTypography />
      <DashboardBackground />

      {/* Local motion + fade-up keyframes, scoped to this page only */}
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
        {/* Hero */}
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm px-6 py-4 ring-1 ring-blue-500/10 shadow-sm">
          <div className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-pink-300/10 blur-3xl" />

          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-3.5">
              <button
                onClick={() => navigate(-1)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/70 ring-1 ring-blue-100 transition-colors hover:bg-blue-50 hover:ring-blue-300"
              >
                <ChevronLeft className="h-5 w-5 text-slate transition-colors hover:text-blue-600" />
              </button>
              <span className="group flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 via-blue-600 to-blue-500 ring-1 ring-blue-400/20 transition-transform duration-300 hover:scale-105 hover:rotate-3">
                <Briefcase className="h-6 w-6 text-white transition-transform duration-300 group-hover:scale-110" />
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-ink">
                    {job.Title}
                  </h2>
                  <Badge tone={job.Status}>{job.Status}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate mt-0.5 flex-wrap">
                  <span className="font-medium text-ink">{job.Company}</span>
                  <span className="w-px h-3 bg-blue-100" />
                  <span>{job.City}, {job.State}</span>
                  <span className="w-px h-3 bg-blue-100" />
                  <span>{job.Country}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex cursor-default items-center gap-1.5 rounded-full border border-pink-200 bg-pink-50/70 px-3.5 py-2 text-xs font-semibold text-pink-700">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="stat-figure">{totalApplicants30d}</span> applicants in 14 days
              </div>
              <div className="flex cursor-default items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/70 px-3.5 py-2 text-xs font-semibold text-blue-700">
                <Users className="h-3.5 w-3.5" />
                <span className="stat-figure">{Number(job.Applicants).toLocaleString()}</span> total applicants
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8 px-5">
          {/* Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCardCustom label="Total Applicants" value={Number(job.Applicants).toLocaleString()} sub="applicants" icon={Users} accent={BLUE} delay={100} />
            <StatCardCustom label="Posted" value={timeAgo(job.PostedDate)} sub={new Date(job.PostedDate).toLocaleDateString()} icon={Calendar} accent={PINK} delay={180} />
            <StatCardCustom label="Job Type" value={job.JobType} sub="employment type" icon={Briefcase} accent={GREEN} delay={260} />
            <StatCardCustom label="Visa Sponsorship" value={job.VisaSponsorship} sub="available" icon={ShieldCheck} accent={AMBER} delay={340} />
          </div>

          {/* Main content */}
          <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
            <div className="space-y-5">
              <Card className="jobs-fade-up bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10" style={{ animationDelay: "100ms" }}>
                <CardHeader>
                  <Heading variant="h4" className="font-extrabold text-ink">Job Description</Heading>
                </CardHeader>
                <CardBody>
                  <Text variant="body" color="soft" className="leading-relaxed">
                    {job.Description}
                  </Text>
                </CardBody>
              </Card>

              <Card className="jobs-fade-up bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10" style={{ animationDelay: "180ms" }}>
                <CardHeader>
                  <Heading variant="h4" className="font-extrabold text-ink">Requirements</Heading>
                </CardHeader>
                <CardBody>
                  <ul className="space-y-2">
                    {requirements.map((r, i) => (
                      <li key={i} className="flex gap-2 text-sm text-ink-soft">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                        {r}
                      </li>
                    ))}
                    {requirements.length === 0 && (
                      <Text variant="small" color="muted">No specific requirements listed.</Text>
                    )}
                  </ul>
                </CardBody>
              </Card>

              <Card className="jobs-fade-up bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10" style={{ animationDelay: "260ms" }}>
                <CardHeader>
                  <Heading variant="h4" className="font-extrabold text-ink">Skills</Heading>
                </CardHeader>
                <CardBody className="flex flex-wrap gap-2">
                  {skills.map((s, i) => (
                    <span
                      key={s}
                      className="rounded-full text-xs font-semibold px-3 py-1.5 border transition-colors"
                      style={{
                        background: `${PALETTE[i % PALETTE.length]}14`,
                        borderColor: `${PALETTE[i % PALETTE.length]}33`,
                        color: PALETTE[i % PALETTE.length],
                      }}
                    >
                      {s}
                    </span>
                  ))}
                  {skills.length === 0 && (
                    <Text variant="small" color="muted">No skills listed.</Text>
                  )}
                </CardBody>
              </Card>

              {matchingCandidates.length > 0 && (
                <Card className="jobs-fade-up bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10" style={{ animationDelay: "340ms" }}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-blue-500" />
                      <Heading variant="h4" className="font-extrabold text-ink">Matching Candidates</Heading>
                    </div>
                    <span className="text-[10px] font-semibold text-slate">{matchingCandidates.length} candidates</span>
                  </CardHeader>
                  <CardBody className="!p-0">
                    <div className="divide-y divide-blue-50">
                      {matchingCandidates.map((c) => (
                        <Link
                          key={c.CandidateID}
                          to={`/candidates/${c.CandidateID}`}
                          className="group flex items-center justify-between gap-3 px-5 py-3 hover:bg-blue-50/50 transition-colors"
                        >
                          <div>
                            <p className="text-sm font-semibold text-ink">{c.Name}</p>
                            <p className="text-xs text-slate">{c.Technology} · {c.CurrentLocation}</p>
                          </div>
                          <Badge tone="default">{c.Status}</Badge>
                          <ChevronRight className="h-4 w-4 text-slate transition-colors group-hover:text-blue-600" />
                        </Link>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <Card className="jobs-fade-up p-5 text-center bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10" style={{ animationDelay: "100ms" }}>
                <Button
                  variant={isSaved("jobs", job.JobID, job.Saved) ? "primary" : "subtle"}
                  icon={Bookmark}
                  className="w-full justify-center"
                  onClick={() => toggleSaved("jobs", job.JobID, job.Saved)}
                >
                  {isSaved("jobs", job.JobID, job.Saved) ? "Saved" : "Save Job"}
                </Button>
                <a href={job.Website} target="_blank" rel="noreferrer" className="block mt-2">
                  <Button variant="dark" icon={ExternalLink} className="w-full justify-center">
                    Apply on company site
                  </Button>
                </a>
              </Card>

              <Card className="jobs-fade-up bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10" style={{ animationDelay: "180ms" }}>
                <CardHeader>
                  <Heading variant="h4" className="font-extrabold text-ink">Quick Info</Heading>
                </CardHeader>
                <CardBody className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-1.5 text-slate">
                      <DollarSign className="h-3.5 w-3.5" /> Salary
                    </span>
                    <span className="font-semibold text-ink">{job.SalaryRange}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-1.5 text-slate">
                      <Globe2 className="h-3.5 w-3.5" /> Work Type
                    </span>
                    <span className="font-semibold text-ink">{job.RemoteType}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-1.5 text-slate">
                      <Building2 className="h-3.5 w-3.5" /> Company
                    </span>
                    <span className="font-semibold text-ink">{job.Company}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-1.5 text-slate">
                      <MapPin className="h-3.5 w-3.5" /> Location
                    </span>
                    <span className="font-semibold text-ink">{job.City}, {job.State}</span>
                  </div>
                </CardBody>
              </Card>

              <ChartCard
                title="Applicant Trend"
                span=""
                height={200}
                headerExtra={<Text variant="small" color="muted">Last 14 days</Text>}
                delay={260}
              >
                {applicantTrend.some((d) => d.count > 0) ? (
                  <AreaChart data={applicantTrend} margin={{ left: -20, right: 0, top: 8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="applicantTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={BLUE} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e6eefc" />
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={2} angle={-15} textAnchor="end" height={35} />
                    <YAxis tick={{ fontSize: 9 }} allowDecimals={false} width={25} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="count" stroke={BLUE} fill="url(#applicantTrend)" strokeWidth={2.25} activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }} />
                  </AreaChart>
                ) : (
                  <EmptyState message="No application data" icon={Users} />
                )}
              </ChartCard>

              <Card className="jobs-fade-up bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10" style={{ animationDelay: "340ms" }}>
                <CardHeader>
                  <Heading variant="h4" className="font-extrabold text-ink">Similar Jobs</Heading>
                </CardHeader>
                <CardBody className="!p-0">
                  <div className="divide-y divide-blue-50">
                    {similarJobs.length === 0 && (
                      <Text variant="small" color="muted" className="px-5 py-4 block text-center">
                        No close matches found.
                      </Text>
                    )}
                    {similarJobs.map((j) => (
                      <Link
                        key={j.JobID}
                        to={`/jobs/${j.JobID}`}
                        className="group flex items-center justify-between gap-3 px-5 py-3 hover:bg-blue-50/50 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ink truncate group-hover:text-blue-600 transition-colors">{j.Title}</p>
                          <p className="text-xs text-slate truncate">{j.Company}</p>
                        </div>
                        <Badge tone="default" className="shrink-0">{j.relevance} match</Badge>
                      </Link>
                    ))}
                  </div>
                </CardBody>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                {visaData.length > 0 && (
                  <Card className="jobs-fade-up bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10" style={{ animationDelay: "420ms" }}>
                    <CardHeader className="!pb-1">
                      <Text variant="small" className="font-bold tracking-tight text-ink text-xs">Visa</Text>
                    </CardHeader>
                    <CardBody className="h-28">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={visaData} dataKey="value" nameKey="name" innerRadius={20} outerRadius={35} paddingAngle={3}>
                            {visaData.map((_, i) => (
                              <Cell key={i} fill={i === 0 ? GREEN : PINK} stroke="#fff" strokeWidth={2} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardBody>
                  </Card>
                )}

                {workTypeData.length > 0 && (
                  <Card className="jobs-fade-up bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10" style={{ animationDelay: "500ms" }}>
                    <CardHeader className="!pb-1">
                      <Text variant="small" className="font-bold tracking-tight text-ink text-xs">Work Type</Text>
                    </CardHeader>
                    <CardBody className="h-28">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={workTypeData} dataKey="value" nameKey="name" innerRadius={20} outerRadius={35} paddingAngle={3}>
                            {workTypeData.map((_, i) => (
                              <Cell key={i} fill={[BLUE, AMBER, PINK][i % 3]} stroke="#fff" strokeWidth={2} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardBody>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}