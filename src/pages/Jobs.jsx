import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, ChevronRight, SlidersHorizontal, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend, LabelList,
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

// Red / green / blue only — no black or grey fills in charts.
const RED = "#c8102e";
const GREEN = "#10b981";
const BLUE = "#3b82f6";
const PALETTE = [RED, GREEN, BLUE, "#f59e0b", "#8c0a1f", "#0ea5e9"];

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

  // All four filters — short labels, small fixed width, single row.
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
        <Link to={`/jobs/${r.JobID}`} className="font-semibold text-ink hover:text-crimson-600">
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
        <Link to={`/jobs/${r.JobID}`} className="text-slate hover:text-crimson-600">
          <ChevronRight className="h-4 w-4" />
        </Link>
      ),
    },
  ];

  const typeData = typeView === "work" ? byRemoteType : byJobType;

  return (
    <PageShell title="Jobs" onSearch={setQuery}>
      <div className="max-w-7xl mx-auto space-y-5 bg-white">
        {/* Heading — white → red gradient banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-white via-white to-white px-6 py-6 border-l-6 border-crimson-500">
          {/* <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-20 rounded-full bg-crimson-600/60 blur-2xl" /> */}
          {/* <div className="pointer-events-none absolute bottom-0 left-1 h-24 w-20 rounded-full bg-crimson-600/30 blur-xl" /> */}
          <div className="relative flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="mt-1 flex items-center gap-2.5 text-2xl font-extrabold text-ink">
                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-crimson-600 shadow-sm ring-1 ring-crimson-700/30">
                  <Briefcase className="h-5 w-5 text-white" />
                </span>
                {jobs.length.toLocaleString()} jobs
              </h2>
            </div>
            <div className="flex items-center gap-1.5 text-crimson-700 text-xs font-semibold bg-white/70 rounded-full px-3 py-1.5 ring-1 ring-crimson-200">
              <TrendingUp className="h-3.5 w-3.5" />
              {trend.reduce((s, t) => s + t.count, 0)} posted in last 30 days
            </div>
          </div>
        </div>

        <div className="mx-5">
          {/* Stats + charts: Postings -> Visa -> Work/Job toggle (in that order) */}
          <div className="grid grid-cols-12 gap-3">
            <ChartCard title="Postings, last 30 days" span="col-span-12 lg:col-span-5" height={260}>
              <AreaChart data={trend} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="jobsTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={RED} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={RED} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={2} angle={-35} textAnchor="end" height={45} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} width={30} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke={RED} fill="url(#jobsTrend)" strokeWidth={2} />
              </AreaChart>
            </ChartCard>

            <ChartCard title="Visa sponsorship" span="col-span-12 lg:col-span-3" height={260}>
              <BarChart data={byVisa} layout="vertical" margin={{ left: 4, right: 24, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill={BLUE} radius={[0, 4, 4, 0]}>
                  {/* <LabelList dataKey="value" position="right" style={{ fontSize: 10, fill: "#121214" }} /> */}
                </Bar>
              </BarChart>
            </ChartCard>

            {/* Work type / Job type toggle card — last */}
            <ChartCard
              title={typeView === "work" ? "Work type" : "Job type"}
              span="col-span-12 lg:col-span-4"
              height={260}
              headerExtra={
                <div className="flex items-center gap-1 rounded-full bg-cloud p-0.5 ring-1 ring-line">
                  <button
                    onClick={() => setTypeView("work")}
                    className={cx(
                      "px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors",
                      typeView === "work" ? "bg-crimson-600 text-white shadow-sm" : "text-slate hover:text-ink"
                    )}
                  >
                    Work type
                  </button>
                  <button
                    onClick={() => setTypeView("job")}
                    className={cx(
                      "px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors",
                      typeView === "job" ? "bg-crimson-600 text-white shadow-sm" : "text-slate hover:text-ink"
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
                  // label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {typeData.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={24} iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ChartCard>
          </div>

          {/* Table with a compact, interactive filter row above it — all four in one line */}
          <Card className="m-5">
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
            <DataTable columns={columns} rows={filtered} searchTerm={query} emptyLabel="No jobs match your filters" />
          </Card>
        </div>
      </div>
    </PageShell>
  );
}