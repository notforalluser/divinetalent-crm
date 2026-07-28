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
  RadialBarChart,
  RadialBar,
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
// green reserved for "yes" states. No crimson, no black fills in charts.
const BLUE = "#3b82f6";
const PINK = "#ec4899";
const AMBER = "#f59e0b";
const GREEN = "#10b981";
const PALETTE = [BLUE, PINK, AMBER, GREEN, "#60a5fa", "#f9a8d4"];

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

// Meaningful color per visa status, instead of one flat blue for everything.
function visaColor(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("yes")) return GREEN;
  if (n.includes("no")) return PINK;
  if (n.includes("case")) return AMBER;
  return BLUE; // unknown / not specified / other
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

function VisaCard({ data, span, delay = 0 }) {
  const [hovered, setHovered] = useState(null);
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const ringData = data.slice(0, 4).map((d) => ({
    ...d,
    pct: Math.round((d.value / total) * 100),
    fill: visaColor(d.name),
  }));

  return (
    <Card
      className={`jobs-fade-up flex flex-col bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10 ${span}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <Text variant="small" className="font-bold tracking-tight text-ink">
          Visa sponsorship
        </Text>
        <span className="text-[10px] font-semibold text-slate">{total} roles</span>
      </div>
      <CardBody className="!pt-2 !pb-4 flex items-center gap-4" style={{ height: 260 }}>
        <div className="h-full w-[45%] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="28%"
              outerRadius="100%"
              barSize={9}
              data={ringData}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar background={{ fill: "#eef4ff" }} dataKey="pct" cornerRadius={6} animationDuration={900}>
                {ringData.map((d, i) => (
                  <Cell
                    key={d.name}
                    fill={d.fill}
                    fillOpacity={hovered === null || hovered === i ? 1 : 0.2}
                    style={{ transition: "fill-opacity 200ms ease" }}
                  />
                ))}
              </RadialBar>
              <Tooltip content={<CustomTooltip />} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-2 pr-1">
          {ringData.map((d, i) => (
            <div
              key={d.name}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer rounded-lg px-2.5 py-2 transition-colors duration-200"
              style={{ background: hovered === i ? `${d.fill}14` : "transparent" }}
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 font-medium text-ink">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ background: d.fill }} />
                  {d.name}
                </span>
                <span className="font-semibold text-slate">
                  {d.value} <span className="text-[10px] font-normal">({d.pct}%)</span>
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-blue-50">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: hovered === null || hovered === i ? `${d.pct}%` : "6%",
                    background: d.fill,
                    opacity: hovered === null || hovered === i ? 1 : 0.35,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
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

// A soft, airy background: a near-white base with a light blue dot grid,
// and three gentle blobs in light blue, light pink, and light amber so the
// page feels calm rather than saturated.
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

// Same type system as Home: Plus Jakarta Sans for headings, Inter for body,
// IBM Plex Mono reserved for stat figures. Scoped to .app-shell.
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
  const [typeView, setTypeView] = useState("work"); // "work" | "job" — toggled by the two buttons

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
      .sort((a, b) => new Date(b.PostedDate) - new Date(a.PostedDate)); // newest first, by default
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

            <VisaCard data={byVisa} span="col-span-12 lg:col-span-3" delay={280} />

            <ChartCard
              title={typeView === "work" ? "Work type" : "Job type"}
              span="col-span-12 lg:col-span-4"
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
                    Work type
                  </button>
                  <button
                    onClick={() => setTypeView("job")}
                    className={cx(
                      "px-2.5 py-1 rounded-full text-[10px] font-semibold",
                      typeView === "job" ? "bg-blue-500 text-white shadow-sm" : "text-slate hover:text-ink"
                    )}
                  >
                    Job type
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
                <Legend verticalAlign="bottom" height={24} iconSize={8} wrapperStyle={{ fontSize: 11 }} />
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