import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search, Briefcase, Building2, Users, Trophy, ExternalLink, Sparkles, Filter,
  ChevronRight, SlidersHorizontal, TrendingUp, Award, BarChart3, PieChartIcon,
  UserCheck, Clock, MapPin, Mail, Phone
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";
import PageShell from "../components/layout/PageShell";
import { Card, CardHeader, CardBody } from "../components/ui/Card";
import { Heading, Text } from "../components/ui/Typography";
import Badge from "../components/ui/Badge";
import DataTable from "../components/ui/DataTable";
import { Select } from "../components/ui/Input";
import StatCard from "../components/ui/StatCard";
import { useData } from "../context/DataContext";
import { runSpecialSearch, SUGGESTED_QUERIES } from "../lib/specialSearch";

const PALETTE = ["#c8102e", "#121214", "#86858f", "#ad0d27", "#4a4a52", "#8c0a1f", "#10b981", "#3b82f6"];
const RED = "#c8102e";
const GREEN = "#10b981";
const BLUE = "#3b82f6";
const DARK = "#121214";

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

const CANDIDATE_COLUMNS = [
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
  { key: "TargetRole", label: "Target role", sortable: true },
  { key: "VisaStatus", label: "Visa", render: (r) => <Badge tone="default">{r.VisaStatus}</Badge> },
  { key: "CurrentLocation", label: "Location" },
  { key: "Status", label: "Status", render: (r) => <Badge tone={r.Status}>{r.Status}</Badge> },
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

const PLACED_COLUMNS = [
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
  { key: "PlacedJobTitle", label: "Placed as", sortable: true },
  { key: "PlacedCompany", label: "Company", sortable: true },
  { key: "VisaStatus", label: "Visa", render: (r) => <Badge tone="default">{r.VisaStatus}</Badge> },
  { key: "PlacementDate", label: "Placed on", sortable: true },
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

const JOB_COLUMNS = [
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
  { key: "VisaSponsorship", label: "Visa", render: (r) => <Badge tone="default">{r.VisaSponsorship}</Badge> },
  { key: "Status", label: "Status", render: (r) => <Badge tone={r.Status}>{r.Status}</Badge> },
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

function GroupBarCard({ title, data }) {
  return (
    <Card>
      <CardHeader>
        <Heading variant="h4">{title}</Heading>
      </CardHeader>
      <CardBody className="h-56">
        {data.length === 0 ? (
          <EmptyState message="No matches found" icon={BarChart3} />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.slice(0, 8)} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 9 }} />
              <Tooltip />
              <Bar dataKey="count" fill={RED} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardBody>
    </Card>
  );
}

export default function SpecialSearch() {
  const { visible: data } = useData();
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [secondaryFilter, setSecondaryFilter] = useState("All");

  const result = useMemo(() => runSpecialSearch(query, data), [query, data]);

  // Reset the contextual filter whenever a new search runs.
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

  // Filtered views the tables actually render -- narrowed by whatever
  // secondary filter is selected, on top of the primary search match.
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

  // Calculate total counts for stats
  const totalCandidates = data.Candidates?.length || 0;
  const totalJobs = data.Jobs?.length || 0;
  const totalPlacements = data.Candidates?.filter(c => c.Status === "Placed").length || 0;

  return (
    <PageShell title="Special Search">
      <div className="max-w-7xl mx-auto space-y-5 bg-white">
        {/* Heading — white → red gradient banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-white via-white to-white px-6 py-6">
          {/* <div className="pointer-events-none absolute bottom-0 left-1 h-24 w-20 rounded-full bg-crimson-600/30 blur-xl" /> */}
          {/* <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-20 rounded-full bg-crimson-600/60 blur-2xl" /> */}
          <div className="relative flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="mt-1 flex items-center gap-2.5 text-2xl font-extrabold text-ink">
                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-crimson-600 shadow-sm ring-1 ring-crimson-700/30">
                  <Sparkles className="h-5 w-5 text-white" />
                </span>
                Special Search
              </h2>
              <Text variant="body" color="muted" className="mt-1">
                Cross-reference search across candidates, jobs, and placements
              </Text>
            </div>
            <div className="flex items-center gap-1.5 text-crimson-700 text-xs font-semibold bg-white/70 rounded-full px-3 py-1.5 ring-1 ring-crimson-200">
              <TrendingUp className="h-3.5 w-3.5" />
              {result ? `${result.type} match` : "Ready to search"}
            </div>
          </div>
        </div>
        
        <div className="mx-5">

          {/* Search Card */}
          <Card>
            <CardBody className="space-y-3">
              <form onSubmit={submit} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate" />
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder='Try "H-1B sponsorship", "Data Analyst", or "Beacon Hill"'
                    className="w-full rounded-lg border border-line bg-cloud pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-500/40"
                  />
                </div>
                <button type="submit" className="rounded-lg bg-ink text-white px-5 text-sm font-semibold hover:bg-black transition-colors">
                  Search
                </button>
              </form>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_QUERIES.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setInput(s);
                      setQuery(s);
                    }}
                    className="rounded-full bg-cloud text-ink-soft text-xs font-medium px-3 py-1 hover:bg-cloud-dark transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>

          {result && filterConfig && (
            <Card className="p-4 flex items-center gap-3 flex-wrap bg-gradient-to-r from-cloud/50 to-cloud/30">
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                <Filter className="h-4 w-4 text-crimson-500" /> {filterConfig.label}
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
                <button onClick={() => setSecondaryFilter("All")} className="text-xs font-semibold text-crimson-600 hover:underline">
                  Clear filter
                </button>
              )}
            </Card>
          )}

          {!result && (
            <Card className="p-16 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 rounded-full bg-crimson-50">
                  <Search className="h-8 w-8 text-crimson-500" />
                </div>
                <Heading variant="h4" className="text-ink">Search for insights</Heading>
                <Text variant="body" color="muted" className="max-w-md">
                  Enter a visa type, job role, or company name above to see cross-referenced results across candidates, jobs, and placements.
                </Text>
              </div>
            </Card>
          )}

          {result?.type === "visa" && (
            <>
              {/* Stats Row */}
              <div className="grid sm:grid-cols-3 gap-4">
                <Card className="p-5 border-l-4 border-l-crimson-500">
                  <Text variant="eyebrow" color="muted">
                    Candidates on {result.label}
                  </Text>
                  <Heading variant="stat" className="mt-1">
                    {result.candidatesOnVisa.length}
                  </Heading>
                </Card>
                <Card className="p-5 border-l-4 border-l-blue-500">
                  <Text variant="eyebrow" color="muted">
                    Jobs offering {result.label}
                  </Text>
                  <Heading variant="stat" className="mt-1">
                    {result.jobsOffering.length}
                  </Heading>
                </Card>
                <Card className="p-5 border-l-4 border-l-emerald-500">
                  <Text variant="eyebrow" color="accent">
                    Placed under {result.label}
                  </Text>
                  <Heading variant="stat" color="accent" className="mt-1">
                    {result.placedOnVisa.length}
                  </Heading>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-12 gap-3">
                <ChartCard title={`Companies offering ${result.label}`} span="col-span-12 lg:col-span-6" height={260}>
                  {result.companiesOffering.length > 0 ? (
                    <BarChart data={result.companiesOffering.slice(0, 8)} layout="vertical" margin={{ left: 4, right: 24, top: 8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill={BLUE} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  ) : (
                    <EmptyState message="No companies offering this visa" />
                  )}
                </ChartCard>
                <ChartCard title={`Companies placed under ${result.label}`} span="col-span-12 lg:col-span-6" height={260}>
                  {result.placedByCompany.length > 0 ? (
                    <BarChart data={result.placedByCompany.slice(0, 8)} layout="vertical" margin={{ left: 4, right: 24, top: 8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill={GREEN} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  ) : (
                    <EmptyState message="No placements under this visa" />
                  )}
                </ChartCard>
              </div>

              {/* Tables */}
              <Card>
                <CardHeader>
                  <Heading variant="h4">Candidates on {result.label}</Heading>
                  <Badge tone="default">{filtered.candidatesOnVisa.length}</Badge>
                </CardHeader>
                <DataTable columns={CANDIDATE_COLUMNS} rows={filtered.candidatesOnVisa} emptyLabel="No candidates found" />
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-crimson-500" />
                    <Heading variant="h4">Placed under {result.label}</Heading>
                  </div>
                  <Badge tone="default">{filtered.placedOnVisa.length}</Badge>
                </CardHeader>
                <DataTable columns={PLACED_COLUMNS} rows={filtered.placedOnVisa} emptyLabel="No placements under this visa yet" />
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-crimson-500" />
                    <Heading variant="h4">Jobs offering {result.label}</Heading>
                  </div>
                  <Badge tone="default">{result.jobsOffering.length}</Badge>
                </CardHeader>
                <DataTable columns={JOB_COLUMNS} rows={result.jobsOffering} emptyLabel="No open jobs offer this sponsorship" />
              </Card>
            </>
          )}

          {result?.type === "role" && (
            <>
              {/* Stats Row */}
              <div className="grid sm:grid-cols-3 gap-4">
                <Card className="p-5 border-l-4 border-l-blue-500">
                  <Text variant="eyebrow" color="muted">
                    Companies hiring for {result.label}
                  </Text>
                  <Heading variant="stat" className="mt-1">
                    {result.companiesHiring.length}
                  </Heading>
                </Card>
                <Card className="p-5 border-l-4 border-l-emerald-500">
                  <Text variant="eyebrow" color="accent">
                    Already placed
                  </Text>
                  <Heading variant="stat" color="accent" className="mt-1">
                    {result.placedInRole.length}
                  </Heading>
                </Card>
                <Card className="p-5 border-l-4 border-l-crimson-500">
                  <Text variant="eyebrow" color="muted">
                    Currently marketing
                  </Text>
                  <Heading variant="stat" className="mt-1">
                    {result.marketingInRole.length}
                  </Heading>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-12 gap-3">
                <ChartCard title={`Companies hiring for ${result.label}`} span="col-span-12 lg:col-span-6" height={260}>
                  {result.companiesHiring.length > 0 ? (
                    <BarChart data={result.companiesHiring.slice(0, 8)} layout="vertical" margin={{ left: 4, right: 24, top: 8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill={BLUE} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  ) : (
                    <EmptyState message="No companies hiring for this role" />
                  )}
                </ChartCard>
                <ChartCard title="Visa mix among candidates marketing" span="col-span-12 lg:col-span-6" height={260}>
                  {result.visaMixMarketing.length > 0 ? (
                    <PieChart>
                      <Pie data={result.visaMixMarketing} dataKey="count" nameKey="name" innerRadius={40} outerRadius={68} paddingAngle={2}>
                        {result.visaMixMarketing.map((_, i) => (
                          <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={24} iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  ) : (
                    <EmptyState message="No candidates marketing for this role" />
                  )}
                </ChartCard>
              </div>

              {/* Tables */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-crimson-500" />
                    <Heading variant="h4">Candidates already placed as {result.label}</Heading>
                  </div>
                  <Badge tone="default">{filtered.placedInRole.length}</Badge>
                </CardHeader>
                <DataTable columns={PLACED_COLUMNS} rows={filtered.placedInRole} emptyLabel="No placements in this role yet" />
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-crimson-500" />
                    <Heading variant="h4">Candidates currently marketing for {result.label}</Heading>
                  </div>
                  <Badge tone="default">{filtered.marketingInRole.length}</Badge>
                </CardHeader>
                <DataTable columns={CANDIDATE_COLUMNS} rows={filtered.marketingInRole} emptyLabel="No one is currently marketing for this role" />
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-crimson-500" />
                    <Heading variant="h4">Open jobs for {result.label}</Heading>
                  </div>
                  <Badge tone="default">{result.jobsForRole.length}</Badge>
                </CardHeader>
                <DataTable columns={JOB_COLUMNS} rows={result.jobsForRole} emptyLabel="No open jobs for this role" />
              </Card>
            </>
          )}

          {result?.type === "company" && (
            <>
              {/* Stats Row */}
              <div className="grid sm:grid-cols-3 gap-4">
                <Card className="p-5 border-l-4 border-l-blue-500">
                  <Text variant="eyebrow" color="muted">
                    Open roles at {result.label}
                  </Text>
                  <Heading variant="stat" className="mt-1">
                    {result.jobsAtCompany.length}
                  </Heading>
                </Card>
                <Card className="p-5 border-l-4 border-l-emerald-500">
                  <Text variant="eyebrow" color="accent">
                    Candidates placed here
                  </Text>
                  <Heading variant="stat" color="accent" className="mt-1">
                    {result.placedAtCompany.length}
                  </Heading>
                </Card>
                <Card className="p-5 border-l-4 border-l-crimson-500">
                  <Text variant="eyebrow" color="muted">
                    Interviews on record
                  </Text>
                  <Heading variant="stat" className="mt-1">
                    {result.interviewsAtCompany.length}
                  </Heading>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-12 gap-3">
                <ChartCard title="Roles open" span="col-span-12 lg:col-span-6" height={260}>
                  {result.rolesOpen.length > 0 ? (
                    <BarChart data={result.rolesOpen.slice(0, 8)} layout="vertical" margin={{ left: 4, right: 24, top: 8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill={BLUE} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  ) : (
                    <EmptyState message="No open roles" />
                  )}
                </ChartCard>
                <ChartCard title="Visa sponsorship offered" span="col-span-12 lg:col-span-6" height={260}>
                  {result.visaSponsorshipOffered.length > 0 ? (
                    <PieChart>
                      <Pie data={result.visaSponsorshipOffered} dataKey="count" nameKey="name" innerRadius={40} outerRadius={68} paddingAngle={2}>
                        {result.visaSponsorshipOffered.map((_, i) => (
                          <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={24} iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  ) : (
                    <EmptyState message="No visa sponsorship data" />
                  )}
                </ChartCard>
              </div>

              {/* Tables */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-crimson-500" />
                    <Heading variant="h4">Candidates placed at {result.label}</Heading>
                  </div>
                  <Badge tone="default">{result.placedAtCompany.length}</Badge>
                </CardHeader>
                <DataTable columns={PLACED_COLUMNS} rows={result.placedAtCompany} emptyLabel="No placements at this company yet" />
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-crimson-500" />
                    <Heading variant="h4">Open jobs at {result.label}</Heading>
                  </div>
                  <Badge tone="default">{filtered.jobsAtCompany.length}</Badge>
                </CardHeader>
                <DataTable columns={JOB_COLUMNS} rows={filtered.jobsAtCompany} emptyLabel="No open jobs at this company" />
              </Card>
            </>
          )}

          {result?.type === "general" && (
            <>
              <Card className="p-4 bg-gradient-to-r from-cloud/50 to-cloud/30 border-l-4 border-l-crimson-500">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-crimson-50">
                    <Search className="h-5 w-5 text-crimson-500" />
                  </div>
                  <div>
                    <Text variant="small" className="font-semibold text-ink">
                      General Search Results
                    </Text>
                    <Text variant="small" color="muted">
                      No visa, role, or company matched "{result.query}" exactly — showing a general match across candidates, jobs, and recruiters.
                    </Text>
                  </div>
                </div>
              </Card>

              <Card>
                <CardHeader>
                  <Heading variant="h4">Candidates</Heading>
                  <Badge tone="default">{result.candidateMatches.length}</Badge>
                </CardHeader>
                <DataTable columns={CANDIDATE_COLUMNS} rows={result.candidateMatches} emptyLabel="No matching candidates" />
              </Card>

              <Card>
                <CardHeader>
                  <Heading variant="h4">Jobs</Heading>
                  <Badge tone="default">{result.jobMatches.length}</Badge>
                </CardHeader>
                <DataTable columns={JOB_COLUMNS} rows={result.jobMatches} emptyLabel="No matching jobs" />
              </Card>

              <Card>
                <CardHeader>
                  <Heading variant="h4">Recruiters</Heading>
                  <Badge tone="default">{result.recruiterMatches.length}</Badge>
                </CardHeader>
                <DataTable
                  columns={[
                    { key: "Name", label: "Name", sortable: true },
                    { key: "Title", label: "Title" },
                    {
                      key: "LinkedIn",
                      label: "LinkedIn",
                      render: (r) => (
                        <a href={r.LinkedIn} target="_blank" rel="noreferrer" className="text-crimson-600 inline-flex items-center gap-1 hover:underline">
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
                        <Link to={`/recruiters/${r.RecruiterID}`} className="text-slate hover:text-crimson-600">
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