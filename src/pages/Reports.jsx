import { useMemo, useState } from "react";
import {
  BarChart3, TrendingUp, Users, Briefcase, Calendar,
  Award, Globe, Filter, ChevronDown, Sparkles
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
} from "recharts";
import PageShell from "../components/layout/PageShell";
import { Card, CardHeader, CardBody } from "../components/ui/Card";
import { Heading, Text } from "../components/ui/Typography";
import { Select } from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import StatCard from "../components/ui/StatCard";
import { useData } from "../context/DataContext";
import { dateKey, nowIST, addDays } from "../lib/time";

const PALETTE = ["#c8102e", "#121214", "#86858f", "#ad0d27", "#4a4a52", "#8c0a1f", "#10b981", "#3b82f6"];
const RED = "#c8102e";
const GREEN = "#10b981";
const BLUE = "#3b82f6";
const DARK = "#121214";

function cx(...args) {
  return args.filter(Boolean).join(" ");
}

function ChartCard({ title, span, children, height = 300, headerExtra }) {
  return (
    <Card className={`flex flex-col ${span}`}>
      <div className="flex items-center justify-between px-4 pt-3.5 pb-1">
        <Text variant="small" className="font-bold text-ink">
          {title}
        </Text>
        {headerExtra}
      </div>
      <CardBody className="!pt-1" style={{ height }}>
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

  // Stats
  const totalCandidates = candidates.length;
  const totalJobs = jobs.length;
  const totalInterviews = interviews.length;
  const placedCount = candidates.filter(c => c.Status === "Placed").length;
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
  const jobsByStatus = useMemo(() => groupCount(jobs, "Status"), [jobs]);

  return (
    <PageShell title="Reports">
      <div className="max-w-7xl mx-auto space-y-5 bg-white">
        {/* Heading */}
        <div className="relative overflow-hidden bg-gradient-to-r from-white via-white to-white px-6 py-6">
          <div className="pointer-events-none absolute bottom-0 left-1 h-24 w-20 rounded-full bg-crimson-600/30 blur-xl" />
          <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-20 rounded-full bg-crimson-600/60 blur-2xl" />
          <div className="relative flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="mt-1 flex items-center gap-2.5 text-2xl font-extrabold text-ink">
                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-crimson-600 shadow-sm ring-1 ring-crimson-700/30">
                  <BarChart3 className="h-5 w-5 text-white" />
                </span>
                Reports & Analytics
              </h2>
              <Text variant="body" color="muted" className="mt-1">
                Pipeline insights and performance metrics
              </Text>
            </div>
            <div className="flex items-center gap-1.5 text-crimson-700 text-xs font-semibold bg-white/70 rounded-full px-3 py-1.5 ring-1 ring-crimson-200">
              <Sparkles className="h-3.5 w-3.5" />
              Live dashboard
            </div>
          </div>
        </div>

        <div className="mx-5">
          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Candidates" value={totalCandidates.toLocaleString()} sub="In pipeline" icon={Users} accent />
            <StatCard label="Total Jobs" value={totalJobs.toLocaleString()} sub="Active openings" icon={Briefcase} />
            <StatCard label="Interviews" value={totalInterviews.toLocaleString()} sub="Scheduled" icon={Calendar} />
            <StatCard label="Placement Rate" value={`${placementRate}%`} sub={`${placedCount} placed`} icon={Award} />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-12 gap-3">
            {/* Candidates by Status */}
            <ChartCard title="Candidates by Status" span="col-span-12 lg:col-span-4" height={280}>
              {byStatus.length > 0 ? (
                <PieChart>
                  <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                    {byStatus.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              ) : (
                <EmptyState message="No candidate data" />
              )}
            </ChartCard>

            {/* Top Technologies */}
            <ChartCard title="Top Technologies" span="col-span-12 lg:col-span-4" height={280}>
              {byTech.length > 0 ? (
                <BarChart data={byTech} layout="vertical" margin={{ left: 4, right: 24, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill={RED} radius={[0, 4, 4, 0]} />
                </BarChart>
              ) : (
                <EmptyState message="No technology data" />
              )}
            </ChartCard>

            {/* Jobs by Country */}
            <ChartCard title="Jobs by Country" span="col-span-12 lg:col-span-4" height={280}>
              {byCountry.length > 0 ? (
                <BarChart data={byCountry} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={45} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} width={30} />
                  <Tooltip />
                  <Bar dataKey="value" fill={BLUE} radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <EmptyState message="No country data" />
              )}
            </ChartCard>

            {/* Interviews Trend */}
            <ChartCard title="Interviews Over Time" span="col-span-12 lg:col-span-6" height={280}>
              {interviewsByMonth.length > 0 ? (
                <AreaChart data={interviewsByMonth} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="interviewTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={RED} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={RED} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={1} angle={-15} textAnchor="end" height={45} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} width={30} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke={RED} fill="url(#interviewTrend)" strokeWidth={2} />
                </AreaChart>
              ) : (
                <EmptyState message="No interview data" />
              )}
            </ChartCard>

            {/* Applications Trend */}
            <ChartCard
              title={`Applications (last ${timeRange} days)`}
              span="col-span-12 lg:col-span-6"
              height={280}
              headerExtra={
                <Select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="w-24 !py-0.5 !text-[10px]"
                >
                  <option value="15">15 days</option>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                </Select>
              }
            >
              {applicationsTrend.some(d => d.count > 0) ? (
                <AreaChart data={applicationsTrend} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="appTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={RED} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={RED} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={3} angle={-35} textAnchor="end" height={45} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} width={30} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke={RED} fill="url(#appTrend)" strokeWidth={2} />
                </AreaChart>
              ) : (
                <EmptyState message="No application data" />
              )}
            </ChartCard>

            {/* Jobs by Visa Sponsorship */}
            <ChartCard title="Jobs by Visa Sponsorship" span="col-span-12 lg:col-span-4" height={280}>
              {byVisa.length > 0 ? (
                <PieChart>
                  <Pie data={byVisa} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                    {byVisa.map((_, i) => (
                      <Cell key={i} fill={PALETTE[(i + 2) % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              ) : (
                <EmptyState message="No visa data" />
              )}
            </ChartCard>

            {/* Jobs by Type */}
            <ChartCard title="Jobs by Type" span="col-span-12 lg:col-span-4" height={280}>
              {jobsByType.length > 0 ? (
                <BarChart data={jobsByType} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={45} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} width={30} />
                  <Tooltip />
                  <Bar dataKey="value" fill={GREEN} radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <EmptyState message="No job type data" />
              )}
            </ChartCard>

            {/* Top Companies by Placements */}
            <ChartCard title="Top Companies by Placements" span="col-span-12 lg:col-span-4" height={280}>
              {topCompaniesByPlacements.length > 0 ? (
                <BarChart data={topCompaniesByPlacements} layout="vertical" margin={{ left: 4, right: 24, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill={DARK} radius={[0, 4, 4, 0]} />
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