import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  ChevronRight,
  SlidersHorizontal,
  TrendingUp,
  Users,
  Globe2,
  BadgeCheck,
  Sparkles,
  CheckCircle,
  XCircle,
  Clock,
  HelpCircle,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  Scatter,
} from "recharts";
import PageShell from "../components/layout/PageShell";
import { Card, CardBody } from "../components/ui/Card";
import { Heading, Text } from "../components/ui/Typography";
import { Select } from "../components/ui/Input";
import DataTable from "../components/ui/DataTable";
import Badge from "../components/ui/Badge";
import SaveButton from "../components/ui/SaveButton";
import { useData } from "../context/DataContext";
import { timeAgo, dateKey, nowIST, addDays } from "../lib/time";

// Soft, airy palette: light blue as the primary signal, light pink/rose as
// the secondary accent, warm amber/yellow as the tertiary, and a semantic
// green reserved for "yes" states.
const BLUE = "#3b82f6";
const PINK = "#ec4899";
const AMBER = "#f59e0b";
const GREEN = "#10b981";
const PURPLE = "#8b5cf6";
const CYAN = "#06b6d4";
const PALETTE = [BLUE, PINK, AMBER, GREEN, PURPLE, CYAN];

function groupCount(rows, key) {
  const map = {};
  rows.forEach((r) => {
    const k = r[key] || "Unknown";
    map[k] = (map[k] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

function cx(...args) {
  return args.filter(Boolean).join(" ");
}

// Meaningful color per visa status
function visaColor(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("yes")) return GREEN;
  if (n.includes("no")) return PINK;
  if (n.includes("case")) return AMBER;
  return BLUE;
}

/* ---------- Presentational helpers ---------- */

function ChartCard({ title, span, children, height = 260, headerExtra, delay = 0 }) {
  return (
    <Card
      className={`jobs-fade-up flex flex-col bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10 ${span} `}
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

// New Visa Statistics Component with Histogram and Bar Chart
function VisaStatistics({ data, jobs, span, delay = 0 }) {
  const [view, setView] = useState("distribution"); // "distribution" | "byIndustry" | "bySalary"
  
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  
  // Calculate visa statistics
  const yesCount = data.find(d => d.name.toLowerCase().includes('yes'))?.value || 0;
  const noCount = data.find(d => d.name.toLowerCase().includes('no'))?.value || 0;
  const caseCount = data.find(d => d.name.toLowerCase().includes('case'))?.value || 0;
  
  const yesPercentage = Math.round((yesCount / total) * 100);
  const noPercentage = Math.round((noCount / total) * 100);
  const casePercentage = Math.round((caseCount / total) * 100);

  // By Industry (simulated data - in real app, this would come from data)
  const byIndustry = useMemo(() => {
    const industries = {};
    jobs.forEach(job => {
      const industry = job.Industry || 'Unknown';
      if (!industries[industry]) {
        industries[industry] = { yes: 0, no: 0, case: 0 };
      }
      const visa = job.VisaSponsorship || '';
      if (visa.toLowerCase().includes('yes')) industries[industry].yes++;
      else if (visa.toLowerCase().includes('no')) industries[industry].no++;
      else if (visa.toLowerCase().includes('case')) industries[industry].case++;
      else industries[industry].unknown = (industries[industry].unknown || 0) + 1;
    });
    return Object.entries(industries)
      .map(([name, values]) => ({
        name,
        yes: values.yes || 0,
        no: values.no || 0,
        case: values.case || 0,
        total: (values.yes || 0) + (values.no || 0) + (values.case || 0) + (values.unknown || 0)
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [jobs]);

  // By Salary Range (simulated data)
  const bySalary = useMemo(() => {
    const ranges = {
      '0-50k': { yes: 0, no: 0, case: 0 },
      '50k-100k': { yes: 0, no: 0, case: 0 },
      '100k-150k': { yes: 0, no: 0, case: 0 },
      '150k-200k': { yes: 0, no: 0, case: 0 },
      '200k+': { yes: 0, no: 0, case: 0 }
    };
    
    jobs.forEach(job => {
      const salary = job.SalaryRange || '';
      let range = '0-50k';
      if (salary.includes('50k') || salary.includes('50K')) range = '50k-100k';
      else if (salary.includes('100k') || salary.includes('100K')) range = '100k-150k';
      else if (salary.includes('150k') || salary.includes('150K')) range = '150k-200k';
      else if (salary.includes('200k') || salary.includes('200K')) range = '200k+';
      
      const visa = job.VisaSponsorship || '';
      if (visa.toLowerCase().includes('yes')) ranges[range].yes++;
      else if (visa.toLowerCase().includes('no')) ranges[range].no++;
      else if (visa.toLowerCase().includes('case')) ranges[range].case++;
    });
    
    return Object.entries(ranges).map(([name, values]) => ({
      name,
      yes: values.yes || 0,
      no: values.no || 0,
      case: values.case || 0,
      total: values.yes + values.no + values.case
    }));
  }, [jobs]);

  // By Experience Level
  const byExperience = useMemo(() => {
    const levels = {};
    jobs.forEach(job => {
      const level = job.ExperienceLevel || 'Entry Level';
      if (!levels[level]) {
        levels[level] = { yes: 0, no: 0, case: 0 };
      }
      const visa = job.VisaSponsorship || '';
      if (visa.toLowerCase().includes('yes')) levels[level].yes++;
      else if (visa.toLowerCase().includes('no')) levels[level].no++;
      else if (visa.toLowerCase().includes('case')) levels[level].case++;
    });
    return Object.entries(levels)
      .map(([name, values]) => ({
        name,
        yes: values.yes || 0,
        no: values.no || 0,
        case: values.case || 0
      }));
  }, [jobs]);

  // By Location
  const byLocation = useMemo(() => {
    const locations = {};
    jobs.forEach(job => {
      const city = job.City || 'Unknown';
      if (!locations[city]) {
        locations[city] = { yes: 0, no: 0, case: 0 };
      }
      const visa = job.VisaSponsorship || '';
      if (visa.toLowerCase().includes('yes')) locations[city].yes++;
      else if (visa.toLowerCase().includes('no')) locations[city].no++;
      else if (visa.toLowerCase().includes('case')) locations[city].case++;
    });
    return Object.entries(locations)
      .map(([name, values]) => ({
        name,
        yes: values.yes || 0,
        no: values.no || 0,
        case: values.case || 0,
        total: values.yes + values.no + values.case
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [jobs]);

  const renderChart = () => {
    switch(view) {
      case "distribution":
        return (
          <BarChart data={data} layout="vertical" margin={{ left: 4, right: 20, top: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6eefc" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
            <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill={BLUE} radius={[0, 6, 6, 0]} barSize={20} animationDuration={700}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={visaColor(entry.name)} />
              ))}
            </Bar>
          </BarChart>
        );
      case "byIndustry":
        return (
          <BarChart data={byIndustry} margin={{ left: 0, right: 12, top: 8, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6eefc" />
            <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" height={50} interval={0} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} width={30} />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={30} iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="yes" stackId="a" fill={GREEN} radius={[4, 4, 0, 0]} />
            <Bar dataKey="case" stackId="a" fill={AMBER} />
            <Bar dataKey="no" stackId="a" fill={PINK} radius={[0, 0, 4, 4]} />
          </BarChart>
        );
      case "bySalary":
        return (
          <BarChart data={bySalary} margin={{ left: 0, right: 12, top: 8, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6eefc" />
            <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" height={50} interval={0} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} width={30} />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={30} iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="yes" fill={GREEN} radius={[4, 4, 0, 0]} />
            <Bar dataKey="case" fill={AMBER} />
            <Bar dataKey="no" fill={PINK} radius={[0, 0, 4, 4]} />
          </BarChart>
        );
      default:
        return null;
    }
  };

  return (
    <Card
      className={`jobs-fade-up flex flex-col bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10 ${span}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <Text variant="small" className="font-bold tracking-tight text-ink">
          Visa Sponsorship Analysis
        </Text>
        <div className="flex items-center gap-1 rounded-full bg-blue-50/80 p-0.5">
          <button
            onClick={() => setView("distribution")}
            className={cx(
              "px-2 py-1 rounded-full text-[9px] font-semibold transition-all",
              view === "distribution" ? "bg-blue-500 text-white shadow-sm" : "text-slate hover:text-ink"
            )}
          >
            Distribution
          </button>
        </div>
      </div>

      <CardBody className="!pt-1 !pb-4" style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}

function StatCard({ icon: Icon, label, value, sub, accent, delay = 0 }) {
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

export default function Jobs() {
  const { visible: data } = useData();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [jobType, setJobType] = useState("All");
  const [visa, setVisa] = useState("All");
  const [remote, setRemote] = useState("All");
  const [typeView, setTypeView] = useState("work");

  const jobs = data.Jobs;
  const statuses = ["All", ...new Set(jobs.map((j) => j.Status))];
  const jobTypes = ["All", ...new Set(jobs.map((j) => j.JobType))];
  const visaOptions = ["All", ...new Set(jobs.map((j) => j.VisaSponsorship).filter(Boolean))];
  const remoteOptions = ["All", ...new Set(jobs.map((j) => j.RemoteType).filter(Boolean))];

  const filtered = useMemo(() => {
    return jobs
      .filter(
        (j) =>
          (status === "All" || j.Status === status) &&
          (jobType === "All" || j.JobType === jobType) &&
          (visa === "All" || j.VisaSponsorship === visa) &&
          (remote === "All" || j.RemoteType === remote)
      )
      .sort((a, b) => new Date(b.PostedDate) - new Date(a.PostedDate));
  }, [jobs, status, jobType, visa, remote]);

  const trend = useMemo(() => {
    const days = 30;
    const map = {};
    const now = nowIST();
    for (let i = days - 1; i >= 0; i--) {
      map[dateKey(addDays(now, -i))] = 0;
    }
    jobs.forEach((j) => {
      const key = dateKey(j.PostedDate);
      if (key in map) map[key] += 1;
    });
    return Object.entries(map).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      count,
    }));
  }, [jobs]);

  const byRemoteType = useMemo(() => groupCount(jobs, "RemoteType"), [jobs]);
  const byJobType = useMemo(() => groupCount(jobs, "JobType"), [jobs]);
  const byVisa = useMemo(
    () => groupCount(jobs, "VisaSponsorship").sort((a, b) => b.value - a.value),
    [jobs]
  );

  const stats = useMemo(() => {
    const total = jobs.length || 1;
    const postedLast30 = trend.reduce((s, t) => s + t.count, 0);
    const totalApplicants = jobs.reduce((s, j) => s + (Number(j.Applicants) || 0), 0);
    const avgApplicants = total ? Math.round(totalApplicants / total) : 0;
    const remoteCount = jobs.filter((j) => /remote/i.test(j.RemoteType || "")).length;
    const remotePct = Math.round((remoteCount / total) * 100);
    const visaCount = jobs.filter((j) => j.VisaSponsorship && !/no/i.test(j.VisaSponsorship)).length;
    const visaPct = Math.round((visaCount / total) * 100);
    return { postedLast30, avgApplicants, remotePct, visaPct };
  }, [jobs, trend]);

  const filterFields = [
    { value: status, set: setStatus, options: statuses, prefix: "Status" },
    { value: jobType, set: setJobType, options: jobTypes, prefix: "Type" },
    { value: remote, set: setRemote, options: remoteOptions, prefix: "Work" },
    { value: visa, set: setVisa, options: visaOptions, prefix: "Visa" },
  ];

  const columns = [
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
    {
      key: "PostedDate",
      label: "Posted",
      sortable: true,
      render: (r) => <span className="text-slate">{timeAgo(r.PostedDate)}</span>,
    },
    { key: "RemoteType", label: "Work type" },
    { key: "JobType", label: "Type" },
    { key: "VisaSponsorship", label: "Visa", render: (r) => <Badge tone="default">{r.VisaSponsorship}</Badge> },
    { key: "SalaryRange", label: "Salary" },
    { key: "Applicants", label: "Applicants", sortable: true },
    { key: "Status", label: "Status", render: (r) => <Badge tone={r.Status}>{r.Status}</Badge> },
    {
      key: "_save",
      label: "",
      render: (r) => <SaveButton type="jobs" id={r.JobID} sheetValue={r.Saved} />,
    },
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

  const typeData = typeView === "work" ? byRemoteType : byJobType;

  return (
    <PageShell title="Jobs" onSearch={setQuery}>
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
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm px-6 py-4 ring-1 ring-blue-500/10 shadow-sm">
          <div className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-pink-300/10 blur-3xl" />

          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-3.5">
              <span className="group flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-crimson-500 via-crimson-600 to-crimson-500 ring-1 ring-blue-400/20 transition-transform duration-300 hover:scale-105 hover:rotate-3">
                <Briefcase className="h-4 w-4 text-white transition-transform duration-300 group-hover:scale-110" />
              </span>
              <div>
                <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-ink">
                  Jobs
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex cursor-default items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/70 px-3.5 py-2 text-xs font-semibold text-blue-700">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="stat-figure">{stats.postedLast30}</span> posted in 30 days
              </div>
              <div className="flex cursor-default items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/60 px-3.5 py-2 text-xs font-semibold text-emerald-700">
                <BadgeCheck className="h-3.5 w-3.5" />
                <span className="stat-figure">{jobs.length.toLocaleString()}</span> open roles
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8 px-5">
          <div className="grid grid-cols-12 gap-4">
            <ChartCard title="Postings, last 30 days" span="col-span-12 lg:col-span-5" height={260} delay={220}>
              <AreaChart data={trend} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="jobsTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BLUE} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6eefc" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={2} angle={-35} textAnchor="end" height={45} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} width={30} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={BLUE}
                  fill="url(#jobsTrend)"
                  strokeWidth={2.25}
                  animationDuration={900}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
                />
              </AreaChart>
            </ChartCard>

            <VisaStatistics data={byVisa} jobs={jobs} span="col-span-12 lg:col-span-4" delay={280} />

            <ChartCard
              title={typeView === "work" ? "Work type" : "Job type"}
              span="col-span-12 lg:col-span-3"
              height={260}
              delay={340}
              headerExtra={
                <div className="flex items-center gap-1 rounded-full bg-blue-50/80 p-0.5">
                  <button
                    onClick={() => setTypeView("work")}
                    className={cx(
                      "px-2.5 py-1 rounded-full text-[10px] font-semibold",
                      typeView === "work" ? "bg-blue-500 text-white shadow-sm" : "text-slate hover:text-ink"
                    )}
                  >
                    Work
                  </button>
                  <button
                    onClick={() => setTypeView("job")}
                    className={cx(
                      "px-2.5 py-1 rounded-full text-[10px] font-semibold",
                      typeView === "job" ? "bg-blue-500 text-white shadow-sm" : "text-slate hover:text-ink"
                    )}
                  >
                    Job
                  </button>
                </div>
              }
            >
              <PieChart>
                <Pie
                  data={typeData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={40}
                  outerRadius={68}
                  paddingAngle={2}
                  labelLine={false}
                  animationDuration={800}
                >
                  {typeData.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={24} iconSize={8} wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ChartCard>
          </div>

          <Card
            className="jobs-fade-up !rounded-2xl bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10 shadow-[0_1px_2px_rgba(20,20,40,0.04)]"
            style={{ animationDelay: "400ms" }}
          >
            <div className="flex items-center flex-nowrap gap-2.5 px-4 py-3 border-b border-blue-100 bg-gradient-to-r from-blue-50/70 via-pink-50/40 to-transparent rounded-t-2xl overflow-x-auto scrollbar-thin">
              <span className="flex items-center gap-1 text-[10px] font-semibold text-slate shrink-0 pr-1">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters
              </span>
              {filterFields.map((f) => (
                <Select
                  key={f.prefix}
                  value={f.value}
                  title={`${f.prefix}: ${f.value}`}
                  onChange={(e) => f.set(e.target.value)}
                  className={cx(
                    "!py-1 !pl-2 !pr-5 !text-[10px] !rounded-full !border-blue-200 truncate",
                    "shrink-0 shadow-sm hover:shadow transition-shadow hover:border-blue-300",
                    "hover:ring-2 hover:ring-blue-400/20 focus:ring-2 focus:ring-blue-400/30"
                  )}
                  style={{ width: 96 }}
                >
                  {f.options.map((s) => (
                    <option key={s} value={s}>
                      {f.prefix}: {s}
                    </option>
                  ))}
                </Select>
              ))}
            </div>
            <DataTable columns={columns} rows={filtered} searchTerm={query} emptyLabel="No jobs match your filters" />
          </Card>
        </div>
      </div>
    </PageShell>
  );
}