import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { UsersRound, ExternalLink, ChevronRight, SlidersHorizontal, Building2, MapPin, Mail, Globe, UserCheck, TrendingUp, Award, Briefcase } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";
import PageShell from "../components/layout/PageShell";
import { Card, CardHeader, CardBody } from "../components/ui/Card";
import { Heading, Text } from "../components/ui/Typography";
import { Select } from "../components/ui/Input";
import DataTable from "../components/ui/DataTable";
import SaveButton from "../components/ui/SaveButton";
import Badge from "../components/ui/Badge";
import StatCard from "../components/ui/StatCard";
import { useData } from "../context/DataContext";

const PALETTE = ["#c8102e", "#121214", "#86858f", "#ad0d27", "#4a4a52", "#8c0a1f", "#10b981", "#3b82f6", "#f59e0b", "#0ea5e9"];
const RED = "#c8102e";
const BLUE = "#3b82f6";
const GREEN = "#10b981";
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

function EmptyState({ message = "No data available", icon: Icon = UsersRound }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <Icon className="h-10 w-10 text-slate/30 mb-2" />
      <Text variant="small" color="muted" className="text-sm">
        {message}
      </Text>
    </div>
  );
}

export default function Recruiters() {
  const { visible: data } = useData();
  const [query, setQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("All");
  const [titleFilter, setTitleFilter] = useState("All");

  const recruiters = data.Recruiters || [];

  // Filter options
  const countries = ["All", ...new Set(recruiters.map((r) => r.Country))];
  const titles = ["All", ...new Set(recruiters.map((r) => r.Title))];

  const filtered = useMemo(() => {
    return recruiters
      .filter((r) => countryFilter === "All" || r.Country === countryFilter)
      .filter((r) => titleFilter === "All" || r.Title === titleFilter)
      .sort((a, b) => a.Name.localeCompare(b.Name));
  }, [recruiters, countryFilter, titleFilter]);

  // Statistics
  const totalRecruiters = recruiters.length;
  const filteredCount = filtered.length;

  const byCountry = useMemo(() => {
    const map = {};
    recruiters.forEach((r) => (map[r.Country] = (map[r.Country] || 0) + 1));
    return Object.entries(map)
      .map(([name, count]) => ({ name, count, pct: ((count / recruiters.length) * 100).toFixed(1) }))
      .sort((a, b) => b.count - a.count);
  }, [recruiters]);

  const byTitle = useMemo(() => {
    const map = {};
    recruiters.forEach((r) => (map[r.Title] = (map[r.Title] || 0) + 1));
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [recruiters]);

  const byState = useMemo(() => {
    const map = {};
    recruiters.forEach((r) => {
      if (r.State) {
        const key = `${r.State}${r.Country ? `, ${r.Country}` : ''}`;
        map[key] = (map[key] || 0) + 1;
      }
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [recruiters]);

  // Email domain distribution
  const byEmailDomain = useMemo(() => {
    const map = {};
    recruiters.forEach((r) => {
      if (r.Email) {
        const domain = r.Email.split('@')[1];
        if (domain) {
          map[domain] = (map[domain] || 0) + 1;
        }
      }
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [recruiters]);

  // Filter fields for the table filter bar
  const filterFields = [
    { value: countryFilter, set: setCountryFilter, options: countries, prefix: "Country" },
    { value: titleFilter, set: setTitleFilter, options: titles, prefix: "Title" },
  ];

  const columns = [
    {
      key: "_saved",
      label: "",
      render: (r) => <SaveButton type="recruiters" id={r.RecruiterID} sheetValue={r.Saved} />,
    },
    {
      key: "Name",
      label: "Name",
      sortable: true,
      render: (r) => (
        <Link to={`/recruiters/${r.RecruiterID}`} className="font-semibold text-ink hover:text-crimson-600">
          {r.Name}
        </Link>
      ),
    },
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
    {
      key: "Email",
      label: "Email",
      render: (r) => (
        <a href={`mailto:${r.Email}`} className="text-blue-600 hover:underline text-sm">
          {r.Email}
        </a>
      ),
    },
    { key: "City", label: "City" },
    { key: "State", label: "State" },
    {
      key: "Country",
      label: "Country",
      sortable: true,
      render: (r) => <Badge tone="default">{r.Country}</Badge>
    },
    {
      key: "_view",
      label: "",
      render: (r) => (
        <Link to={`/recruiters/${r.RecruiterID}`} className="text-slate hover:text-crimson-600">
          <ChevronRight className="h-4 w-4" />
        </Link>
      ),
    },
  ];

  return (
    <PageShell title="Recruiters" searchPlaceholder="Search recruiters by name, title, location..." onSearch={setQuery}>
      <div className="max-w-7xl mx-auto space-y-5 bg-white">
        {/* Heading — white → red gradient banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-white via-white to-white px-6 py-6">
          <div className="pointer-events-none absolute bottom-0 left-1 h-24 w-20 rounded-full bg-crimson-600/30 blur-xl" />
          <div className="relative flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="mt-1 flex items-center gap-2.5 text-2xl font-extrabold text-ink">
                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-crimson-600 shadow-sm ring-1 ring-crimson-700/30">
                  <UsersRound className="h-5 w-5 text-white" />
                </span>
                {totalRecruiters.toLocaleString()} recruiters
              </h2>
            </div>
            <div className="flex items-center gap-1.5 text-crimson-700 text-xs font-semibold bg-white/70 rounded-full px-3 py-1.5 ring-1 ring-crimson-200">
              <Globe className="h-3.5 w-3.5" />
              {byCountry.length} countries · {byTitle.length} roles
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className="mx-5">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total recruiters" value={totalRecruiters.toLocaleString()} sub="In your network" icon={UsersRound} accent />
            <StatCard label="Countries" value={byCountry.length} sub="Global presence" icon={Globe} />
            <StatCard label="Unique roles" value={byTitle.length} sub="Job titles" icon={Briefcase} />
            <StatCard label="Email domains" value={byEmailDomain.length} sub="Unique domains" icon={Mail} />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-12 gap-3">
            <ChartCard title="Recruiters by country" span="col-span-12 lg:col-span-5" height={260}>
              {byCountry.length > 0 ? (
                <BarChart data={byCountry} layout="vertical" margin={{ left: 4, right: 24, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill={BLUE} radius={[0, 4, 4, 0]} />
                </BarChart>
              ) : (
                <EmptyState message="No country data available" icon={Globe} />
              )}
            </ChartCard>

            <ChartCard title="Recruiters by title" span="col-span-12 lg:col-span-4" height={260}>
              {byTitle.length > 0 ? (
                <PieChart>
                  <Pie data={byTitle} dataKey="count" nameKey="name" innerRadius={40} outerRadius={68} paddingAngle={2}>
                    {byTitle.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={24} iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              ) : (
                <EmptyState message="No title data available" icon={Briefcase} />
              )}
            </ChartCard>

            <ChartCard title="Email domains" span="col-span-12 lg:col-span-3" height={260}>
              {byEmailDomain.length > 0 ? (
                <BarChart data={byEmailDomain} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" />
                  <XAxis dataKey="name" tick={{ fontSize: 8 }} interval={0} angle={-15} textAnchor="end" height={55} />
                  <YAxis tick={{ fontSize: 9 }} allowDecimals={false} width={25} />
                  <Tooltip />
                  <Bar dataKey="count" fill={GREEN} radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <EmptyState message="No email domain data" icon={Mail} />
              )}
            </ChartCard>
          </div>

          {/* Additional charts row */}
          <div className="grid grid-cols-12 gap-3">
            <ChartCard title="Top 10 states/regions" span="col-span-12 lg:col-span-6" height={220}>
              {byState.length > 0 ? (
                <BarChart data={byState} layout="vertical" margin={{ left: 4, right: 24, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 9 }} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 9 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill={DARK} radius={[0, 4, 4, 0]} />
                </BarChart>
              ) : (
                <EmptyState message="No state/region data available" icon={MapPin} />
              )}
            </ChartCard>

            <ChartCard title="Recruiter distribution" span="col-span-12 lg:col-span-6" height={220}>
              {byCountry.length > 0 ? (
                <PieChart>
                  <Pie data={byCountry} dataKey="count" nameKey="name" innerRadius={40} outerRadius={65} paddingAngle={2}>
                    {byCountry.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={24} iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              ) : (
                <EmptyState message="No distribution data available" icon={UsersRound} />
              )}
            </ChartCard>
          </div>

          {/* Table with filters */}
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
              <div className="flex-1" />
              <Badge tone="default" className="shrink-0">
                {filteredCount} of {totalRecruiters} recruiters
              </Badge>
            </div>
            <DataTable columns={columns} rows={filtered} searchTerm={query} emptyLabel="No recruiters match your filters" />
          </Card>

          {/* Footer info card */}
          <Card className="bg-gradient-to-r from-ink/5 to-ink/10 border-ink/10">
            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-crimson-600/10">
                  <UserCheck className="h-5 w-5 text-crimson-600" />
                </div>
                <div>
                  <Text variant="small" className="font-bold text-ink">
                    Recruiter network insights
                  </Text>
                  <Text variant="small" color="muted" className="mt-1">
                    This dataset represents {totalRecruiters} recruiters across {byCountry.length} countries with {byTitle.length} different roles.
                    {byEmailDomain.length > 0 && ` Top email domain: ${byEmailDomain[0]?.name || 'N/A'}`}
                  </Text>
                  <div className="flex gap-3 mt-2 flex-wrap">
                    <Badge tone="default" size="sm">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {byCountry.length} countries
                    </Badge>
                    <Badge tone="default" size="sm">
                      <Award className="h-3 w-3 mr-1" />
                      {byTitle.length} roles
                    </Badge>
                    <Badge tone="default" size="sm">
                      <Mail className="h-3 w-3 mr-1" />
                      {byEmailDomain.length} domains
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}