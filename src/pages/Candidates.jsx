import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  ChevronRight,
  SlidersHorizontal,
  TrendingUp,
  BadgeCheck,
  UserCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import PageShell from "../components/layout/PageShell";
import { Card, CardBody } from "../components/ui/Card";
import { Text } from "../components/ui/Typography";
import { Select } from "../components/ui/Input";
import DataTable from "../components/ui/DataTable";
import Badge from "../components/ui/Badge";
import SaveButton from "../components/ui/SaveButton";
import { useData } from "../context/DataContext";
import { useSettings } from "../context/SettingsContext";
import { timeAgo, dateKey, nowIST, addDays } from "../lib/time";

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

function visaColor(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("citizen") || n.includes("green") || n.includes("yes")) return GREEN;
  if (n.includes("h1b") || n.includes("h-1b")) return BLUE;
  if (n.includes("opt") || n.includes("cpt")) return AMBER;
  if (n.includes("no") || n.includes("not")) return PINK;
  return BLUE;
}

/* ---------- Presentational helpers ---------- */

function ChartCard({ title, span, children, height = 220, headerExtra, delay = 0 }) {
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

// Different presentation than before: a horizontal bar comparison instead of
// radial rings, plus a headline "most common status" stat underneath.
function VisaStatsCard({ data, span, delay = 0 }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const chartData = useMemo(
    () =>
      [...data]
        .sort((a, b) => b.value - a.value)
        .map((d) => ({ ...d, pct: Math.round((d.value / total) * 100), fill: visaColor(d.name) })),
    [data, total]
  );
  const top = chartData[0];

  return (
    <Card
      className={`jobs-fade-up flex flex-col bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10 ${span}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <Text variant="small" className="font-bold tracking-tight text-ink">
          Visa status
        </Text>
        <span className="text-[10px] font-semibold text-slate">{total} candidates</span>
      </div>
      <CardBody className="!pt-1 !pb-1" style={{ height: 190 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 4, right: 16, top: 4, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e6eefc" horizontal={false} />
            <XAxis type="number" hide allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={92}
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={14} animationDuration={800}>
              {chartData.map((d) => (
                <Cell key={d.name} fill={d.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardBody>
      {top && (
        <div className="flex items-center justify-between px-5 pb-4 pt-1 text-[11px]">
          <span className="text-slate">Most common</span>
          <span className="flex items-center gap-1.5 font-semibold text-ink">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: top.fill }} />
            {top.name} <span className="font-normal text-slate">({top.pct}%)</span>
          </span>
        </div>
      )}
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

export default function Candidates() {
  const { visible: data } = useData();
  const { settings } = useSettings();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(settings.defaultCandidateStatusFilter || "All");
  const [tech, setTech] = useState("All");
  const [visa, setVisa] = useState("All");

  const candidates = data.Candidates;
  const statuses = ["All", ...new Set(candidates.map((c) => c.Status))];
  const techs = ["All", ...new Set(candidates.map((c) => c.Technology))];
  const visaOptions = ["All", ...new Set(candidates.map((c) => c.VisaStatus).filter(Boolean))];

  const filtered = useMemo(() => {
    return candidates
      .filter(
        (c) =>
          (status === "All" || c.Status === status) &&
          (tech === "All" || c.Technology === tech) &&
          (visa === "All" || c.VisaStatus === visa)
      )
      .sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
  }, [candidates, status, tech, visa]);

  const trend = useMemo(() => {
    const days = 30;
    const map = {};
    const now = nowIST();
    for (let i = days - 1; i >= 0; i--) {
      map[dateKey(addDays(now, -i))] = 0;
    }
    candidates.forEach((c) => {
      const key = dateKey(c.CreatedAt);
      if (key in map) map[key] += 1;
    });
    return Object.entries(map).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      count,
    }));
  }, [candidates]);

  const byStatus = useMemo(() => groupCount(candidates, "Status"), [candidates]);
  const byVisa = useMemo(
    () => groupCount(candidates, "VisaStatus").sort((a, b) => b.value - a.value),
    [candidates]
  );

  const stats = useMemo(() => {
    const total = candidates.length || 1;
    const addedLast30 = trend.reduce((s, t) => s + t.count, 0);
    const active = candidates.filter((c) => c.Status === "Active" || c.Status === "Marketing").length;
    const placed = candidates.filter((c) => c.Status === "Placed").length;
    return { total, addedLast30, active, placed };
  }, [candidates, trend]);

  const filterFields = [
    { value: status, set: setStatus, options: statuses, prefix: "Status" },
    { value: tech, set: setTech, options: techs, prefix: "Tech" },
    { value: visa, set: setVisa, options: visaOptions, prefix: "Visa" },
  ];

  const columns = [
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
    { key: "VisaStatus", label: "Visa", render: (r) => <Badge tone="default">{r.VisaStatus}</Badge> },
    { key: "CurrentLocation", label: "Location" },
    { key: "ExperienceYears", label: "Exp (yrs)", sortable: true },
    {
      key: "CreatedAt",
      label: "Added",
      sortable: true,
      render: (r) => <span className="text-slate">{timeAgo(r.CreatedAt)}</span>,
    },
    { key: "Status", label: "Status", render: (r) => <Badge tone={r.Status}>{r.Status}</Badge> },
    {
      key: "_save",
      label: "",
      render: (r) => <SaveButton type="candidates" id={r.CandidateID} sheetValue={r.Saved} />,
    },
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

  return (
    <PageShell title="Candidates" onSearch={setQuery}>
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

      <div className="app-shell space-y-8 ">
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm px-6 py-4 ring-1 ring-blue-500/10 shadow-sm">
          <div className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-pink-300/10 blur-3xl" />

          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-3.5">
              <span className="group flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-crimson-500 via-crimson-600 to-crimson-500 ring-1 ring-blue-400/20 transition-transform duration-300 hover:scale-105 hover:rotate-3">
                <Users className="h-4 w-4 text-white transition-transform duration-300 group-hover:scale-110" />
              </span>
              <div>
                <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-ink">
                  Candidates
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex cursor-default items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/70 px-3.5 py-2 text-xs font-semibold text-blue-700">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="stat-figure">{stats.addedLast30}</span> added in 30 days
              </div>
              <div className="flex cursor-default items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/60 px-3.5 py-2 text-xs font-semibold text-emerald-700">
                <BadgeCheck className="h-3.5 w-3.5" />
                <span className="stat-figure">{stats.placed}</span> placed
              </div>
            </div>
          </div>
        </div>

        {/* 70 / 28 split: table on the left, stacked two-up charts on the right */}
        <div className="flex flex-col lg:flex-row gap-4 px-4 md:px-6">
          <div className="w-full lg:basis-[70%] lg:max-w-[70%]">
            <Card
              className="jobs-fade-up !rounded-2xl bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10 shadow-[0_1px_2px_rgba(20,20,40,0.04)] h-full"
              style={{ animationDelay: "220ms" }}
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
                <div className="flex-1" />
                <Badge tone="default" className="shrink-0 border border-blue-100">
                  {filtered.length} candidates
                </Badge>
              </div>
              <DataTable columns={columns} rows={filtered} searchTerm={query} emptyLabel="No candidates match your filters" />
            </Card>
          </div>

          <div className="w-full lg:basis-[28%] lg:max-w-[28%]">
            <div className="grid grid-cols-2 gap-4">
              <ChartCard title="Added, last 30 days" span="col-span-2" height={170} delay={280}>
                <AreaChart data={trend} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="candidateTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={BLUE} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6eefc" />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={5} angle={-35} textAnchor="end" height={35} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} width={24} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke={BLUE}
                    fill="url(#candidateTrend)"
                    strokeWidth={2}
                    animationDuration={900}
                    activeDot={{ r: 3, strokeWidth: 2, stroke: "#fff" }}
                  />
                </AreaChart>
              </ChartCard>

              <VisaStatsCard data={byVisa} span="col-span-2" delay={340} />
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}