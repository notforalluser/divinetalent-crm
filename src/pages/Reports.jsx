import { useMemo, useState } from "react";
import {
  BarChart3, Users, Briefcase, Calendar, Award,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import PageShell from "../components/layout/PageShell";
import { Card, CardBody } from "../components/ui/Card";
import { Text } from "../components/ui/Typography";
import { Select } from "../components/ui/Input";
import { useData } from "../context/DataContext";
import { dateKey, nowIST, addDays } from "../lib/time";

const RED = "#c8102e";
const BLUE = "#3b82f6";
const GREEN = "#10b981";
const AMBER = "#f59e0b";
const PINK = "#ec4899";
// Red-first, minimal palette — no black.
const PALETTE = [RED, BLUE, AMBER, GREEN, PINK];

function ChartCard({ title, span, children, height = 280, headerExtra, delay = 0 }) {
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
      <Icon className="h-9 w-9 text-slate/30 mb-2" />
      <Text variant="small" color="muted" className="text-sm">
        {message}
      </Text>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, accent, delay = 0 }) {
  return (
    <div
      className="jobs-fade-up group relative overflow-hidden rounded-2xl border border-blue-100 bg-white/85 backdrop-blur-sm p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
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

function groupCount(rows, key) {
  const map = {};
  rows.forEach((r) => {
    const k = r[key] || "Unknown";
    map[k] = (map[k] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

export default function Reports() {
  const { visible: data } = useData();
  const [timeRange, setTimeRange] = useState("30");

  const candidates = data.Candidates || [];
  const jobs = data.Jobs || [];
  const interviews = data.Interviews || [];
  const marketingActivity = data.MarketingActivity || [];

  const totalCandidates = candidates.length;
  const totalJobs = jobs.length;
  const totalInterviews = interviews.length;
  const placedCount = candidates.filter((c) => c.Status === "Placed").length;
  const placementRate = totalCandidates > 0 ? Math.round((placedCount / totalCandidates) * 100) : 0;

  const byStatus = useMemo(() => groupCount(candidates, "Status"), [candidates]);
  const byTech = useMemo(
    () => groupCount(candidates, "Technology").sort((a, b) => b.value - a.value).slice(0, 8),
    [candidates]
  );
  const byCountry = useMemo(() => groupCount(jobs, "Country"), [jobs]);
  const byVisa = useMemo(
    () => groupCount(jobs, "VisaSponsorship").sort((a, b) => b.value - a.value),
    [jobs]
  );
  const topCompaniesByPlacements = useMemo(
    () =>
      groupCount(
        candidates.filter((c) => c.Status === "Placed" && c.PlacedCompany),
        "PlacedCompany"
      )
        .sort((a, b) => b.value - a.value)
        .slice(0, 8),
    [candidates]
  );

  const interviewsByMonth = useMemo(() => {
    const map = {};
    interviews.forEach((i) => {
      const d = new Date(i.InterviewDate);
      if (isNaN(d)) return;
      const key = `${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}`;
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => new Date(a.name) - new Date(b.name));
  }, [interviews]);

  const applicationsTrend = useMemo(() => {
    const days = parseInt(timeRange);
    const map = {};
    const now = nowIST();
    for (let i = days - 1; i >= 0; i--) {
      const d = addDays(now, -i);
      map[dateKey(d)] = 0;
    }
    marketingActivity.forEach((a) => {
      const key = dateKey(a.Date);
      if (key in map) map[key] += Number(a.ApplicationsCount) || 0;
    });
    return Object.entries(map).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      count,
    }));
  }, [marketingActivity, timeRange]);

  const jobsByType = useMemo(() => groupCount(jobs, "JobType"), [jobs]);

  return (
    <PageShell title="Reports">
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
                <BarChart3 className="h-4 w-4 text-white transition-transform duration-300 group-hover:scale-110" />
              </span>
              <div>
                <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-ink">
                  Reports & Analytics
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex cursor-default items-center gap-1.5 rounded-full border border-crimson-200 bg-crimson-50/70 px-3.5 py-2 text-xs font-semibold text-crimson-700">
                <Users className="h-3.5 w-3.5" />
                <span className="stat-figure">{totalCandidates}</span> candidates
              </div>
              <div className="flex cursor-default items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/70 px-3.5 py-2 text-xs font-semibold text-blue-700">
                <Briefcase className="h-3.5 w-3.5" />
                <span className="stat-figure">{totalJobs}</span> jobs
              </div>
              <div className="flex cursor-default items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/60 px-3.5 py-2 text-xs font-semibold text-emerald-700">
                <Award className="h-3.5 w-3.5" />
                <span className="stat-figure">{placementRate}%</span> placed
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-6 space-y-8">
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Users} label="Total candidates" value={totalCandidates.toLocaleString()} sub="Active" accent={RED} delay={80} />
            <StatCard icon={Briefcase} label="Total jobs" value={totalJobs.toLocaleString()} sub="Open" accent={BLUE} delay={140} />
            <StatCard icon={Calendar} label="Interviews" value={totalInterviews.toLocaleString()} sub="Scheduled" accent={GREEN} delay={200} />
            <StatCard icon={Award} label="Placement rate" value={`${placementRate}%`} sub={`${placedCount} placed`} accent={AMBER} delay={260} />
          </div>

          {/* Charts grid */}
          <div className="grid grid-cols-12 gap-4">
            <ChartCard title="Candidates by status" span="col-span-12 lg:col-span-4" height={260} delay={100}>
              {byStatus.length > 0 ? (
                <PieChart>
                  <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={42} outerRadius={70} paddingAngle={2}>
                    {byStatus.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              ) : (
                <EmptyState message="No candidate data" />
              )}
            </ChartCard>

            <ChartCard title="Top technologies" span="col-span-12 lg:col-span-4" height={260} delay={160}>
              {byTech.length > 0 ? (
                <BarChart data={byTech} layout="vertical" margin={{ left: 4, right: 20, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6eefc" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={86} tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill={RED} radius={[0, 6, 6, 0]} />
                </BarChart>
              ) : (
                <EmptyState message="No technology data" />
              )}
            </ChartCard>

            <ChartCard title="Jobs by country" span="col-span-12 lg:col-span-4" height={260} delay={220}>
              {byCountry.length > 0 ? (
                <BarChart data={byCountry} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6eefc" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={45} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} width={28} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill={BLUE} radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <EmptyState message="No country data" />
              )}
            </ChartCard>

            <ChartCard title="Interviews over time" span="col-span-12 lg:col-span-6" height={260} delay={100}>
              {interviewsByMonth.length > 0 ? (
                <AreaChart data={interviewsByMonth} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="interviewTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={RED} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={RED} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6eefc" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={1} angle={-15} textAnchor="end" height={45} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} width={28} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" stroke={RED} fill="url(#interviewTrend)" strokeWidth={2} activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }} />
                </AreaChart>
              ) : (
                <EmptyState message="No interview data" />
              )}
            </ChartCard>

            <ChartCard
              title={`Applications (${timeRange}d)`}
              span="col-span-12 lg:col-span-6"
              height={260}
              delay={160}
              headerExtra={
                <Select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="w-24 !py-0.5 !text-[10px] !rounded-full !border-blue-200 focus:ring-2 focus:ring-blue-400/30"
                >
                  <option value="15">15 days</option>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                </Select>
              }
            >
              {applicationsTrend.some((d) => d.count > 0) ? (
                <AreaChart data={applicationsTrend} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="appTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={RED} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={RED} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6eefc" />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={3} angle={-35} textAnchor="end" height={45} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} width={28} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" stroke={RED} fill="url(#appTrend)" strokeWidth={2} activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }} />
                </AreaChart>
              ) : (
                <EmptyState message="No application data" />
              )}
            </ChartCard>

            <ChartCard title="Jobs by visa sponsorship" span="col-span-12 lg:col-span-4" height={260} delay={220}>
              {byVisa.length > 0 ? (
                <PieChart>
                  <Pie data={byVisa} dataKey="value" nameKey="name" innerRadius={42} outerRadius={70} paddingAngle={2}>
                    {byVisa.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              ) : (
                <EmptyState message="No visa data" />
              )}
            </ChartCard>

            <ChartCard title="Jobs by type" span="col-span-12 lg:col-span-4" height={260} delay={280}>
              {jobsByType.length > 0 ? (
                <BarChart data={jobsByType} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6eefc" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={45} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} width={28} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill={GREEN} radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <EmptyState message="No job type data" />
              )}
            </ChartCard>

            <ChartCard title="Top companies by placements" span="col-span-12 lg:col-span-4" height={260} delay={340}>
              {topCompaniesByPlacements.length > 0 ? (
                <BarChart data={topCompaniesByPlacements} layout="vertical" margin={{ left: 4, right: 20, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6eefc" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={86} tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill={RED} radius={[0, 6, 6, 0]} />
                </BarChart>
              ) : (
                <EmptyState message="No placement data" />
              )}
            </ChartCard>
          </div>
        </div>
      </div>
    </PageShell>
  );
}