import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Users, ChevronRight, SlidersHorizontal } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
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

// Red / green / blue only — no black or grey fills in charts.
const RED = "#c8102e";
const GREEN = "#10b981";
const BLUE = "#3b82f6";
const PALETTE = [RED, GREEN, BLUE, "#f59e0b", "#8c0a1f", "#0ea5e9"];

function cx(...args) {
  return args.filter(Boolean).join(" ");
}

function ChartCard({ title, span, children, height = 260, headerExtra }) {
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
  const visaOptions = ["All", ...new Set(candidates.map((c) => c.VisaStatus))];

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

  // Trend data for last 30 days
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

  // Status split for the pie chart (only this statistic)
  const byStatus = useMemo(() => {
    const map = {};
    filtered.forEach((c) => (map[c.Status] = (map[c.Status] || 0) + 1));
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  // All three filters — short labels, small fixed width, single row.
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
        <Link to={`/candidates/${r.CandidateID}`} className="font-semibold text-ink hover:text-crimson-600">
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
        <Link to={`/candidates/${r.CandidateID}`} className="text-slate hover:text-crimson-600">
          <ChevronRight className="h-4 w-4" />
        </Link>
      ),
    },
  ];

  return (
    <PageShell title="Candidates" onSearch={setQuery}>
      <div className="max-w-7xl mx-auto space-y-5 bg-white">
        {/* Heading — white → red gradient banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-white via-white to-white px-6 py-6">
          <div className="pointer-events-none absolute bottom-0 left-1 h-24 w-20 rounded-full bg-crimson-600/30 blur-xl" />
          <div className="relative flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="mt-1 flex items-center gap-2.5 text-2xl font-extrabold text-ink">
                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-crimson-600 shadow-sm ring-1 ring-crimson-700/30">
                  <Users className="h-5 w-5 text-white" />
                </span>
                {candidates.length.toLocaleString()} candidates
              </h2>
            </div>
            <div className="flex items-center gap-1.5 text-crimson-700 text-xs font-semibold bg-white/70 rounded-full px-3 py-1.5 ring-1 ring-crimson-200">
              <Users className="h-3.5 w-3.5" />
              {trend.reduce((s, t) => s + t.count, 0)} added in last 30 days
            </div>
          </div>
        </div>

        {/* Table with filters */}
        <div className="mx-5">
          <Card>
            <div className="flex items-center flex-nowrap gap-2 px-3 py-2.5 border-b border-line bg-gradient-to-r from-cloud/70 to-cloud/30 rounded-t-xl overflow-x-auto scrollbar-thin">
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
                    "!py-1 !pl-2 !pr-5 !text-[10px] !rounded-full !border-line truncate",
                    "shrink-0 shadow-sm hover:shadow transition-shadow hover:border-crimson-300",
                    "hover:ring-2 hover:ring-crimson-500/20 focus:ring-2 focus:ring-crimson-500/30"
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
            <DataTable columns={columns} rows={filtered} searchTerm={query} emptyLabel="No candidates match your filters" />
          </Card>

          {/* Statistics below table - Trend chart and Status split in single row */}
          <div className="grid grid-cols-12 gap-3">
            <ChartCard title="Candidates added, last 30 days" span="col-span-12 lg:col-span-8" height={260}>
              <AreaChart data={trend} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="candidateTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={RED} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={RED} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={2} angle={-35} textAnchor="end" height={45} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} width={30} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke={RED} fill="url(#candidateTrend)" strokeWidth={2} />
              </AreaChart>
            </ChartCard>

            {/* Status split card */}
            <Card className="col-span-12 lg:col-span-4">
              <div className="px-4 pt-3.5 pb-1">
                <Text variant="small" className="font-bold text-ink">
                  Status Split
                </Text>
              </div>
              <CardBody className="!pt-1">
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={byStatus}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={2}
                        labelLine={false}
                      >
                        {byStatus.map((_, i) => (
                          <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1 mt-1">
                  {byStatus.map((s, i) => (
                    <div key={s.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-ink-soft">
                        <span className="h-2 w-2 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
                        {s.name}
                      </span>
                      <span className="font-semibold text-ink">{s.value}</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </PageShell>
  );
}