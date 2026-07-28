import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  UsersRound,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal,
  MapPin,
  Mail,
  Globe,
  UserCheck,
  TrendingUp,
  Award,
  Briefcase,
  BarChart3,
  PieChartIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import PageShell from "../components/layout/PageShell";
import { Card, CardBody } from "../components/ui/Card";
import { Text } from "../components/ui/Typography";
import { Select } from "../components/ui/Input";
import DataTable from "../components/ui/DataTable";
import SaveButton from "../components/ui/SaveButton";
import Badge from "../components/ui/Badge";
import { useData } from "../context/DataContext";

const RED = "#c8102e";
const BLUE = "#3b82f6";
const PINK = "#ec4899";
const AMBER = "#f59e0b";
const GREEN = "#10b981";
// Red-first, minimal palette — no black.
const PALETTE = [RED, BLUE, AMBER, GREEN, PINK];

function cx(...args) {
  return args.filter(Boolean).join(" ");
}

/* ---------- Shared presentational helpers (matches Candidates page) ---------- */

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

function EmptyState({ message = "No data available", icon: Icon = UsersRound }) {
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
      className="jobs-fade-up group relative overflow-hidden rounded-2xl border border-blue-100 bg-white/85 backdrop-blur-sm p-4"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-10 w-10 rounded-full opacity-[0.10] transition-transform duration-500 group-hover:scale-125"
        style={{ background: accent }}
      />
      <div className="relative flex items-center gap-2.5">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm"
          style={{ background: `${accent}1a` }}
        >
          <Icon className="h-4 w-4" style={{ color: accent }} />
        </div>
        <div className="min-w-0">
          <Text variant="small" className="truncate font-medium text-slate">
            {label}
          </Text>
        </div>
      </div>
      <div className="relative mt-2 flex items-baseline gap-2">
        <span className="stat-figure text-[22px] font-extrabold leading-none tracking-tight text-ink">
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

export default function Recruiters() {
  const { visible: data } = useData();
  const [query, setQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("All");
  const [titleFilter, setTitleFilter] = useState("All");
  const [activeChart, setActiveChart] = useState("country");

  const recruiters = data.Recruiters || [];

  const countries = ["All", ...new Set(recruiters.map((r) => r.Country))];
  const titles = ["All", ...new Set(recruiters.map((r) => r.Title))];

  const filtered = useMemo(() => {
    return recruiters
      .filter((r) => countryFilter === "All" || r.Country === countryFilter)
      .filter((r) => titleFilter === "All" || r.Title === titleFilter)
      .sort((a, b) => a.Name.localeCompare(b.Name));
  }, [recruiters, countryFilter, titleFilter]);

  const totalRecruiters = recruiters.length;
  const filteredCount = filtered.length;

  const byCountry = useMemo(() => {
    const map = {};
    recruiters.forEach((r) => (map[r.Country] = (map[r.Country] || 0) + 1));
    return Object.entries(map)
      .map(([name, count]) => ({ name, count, pct: ((count / (recruiters.length || 1)) * 100).toFixed(1) }))
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
        const key = `${r.State}${r.Country ? `, ${r.Country}` : ""}`;
        map[key] = (map[key] || 0) + 1;
      }
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [recruiters]);

  const byEmailDomain = useMemo(() => {
    const map = {};
    recruiters.forEach((r) => {
      if (r.Email) {
        const domain = r.Email.split("@")[1];
        if (domain) map[domain] = (map[domain] || 0) + 1;
      }
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [recruiters]);

  // Chart registry — drives the button switcher on the left.
  const chartOptions = [
    { key: "country", label: "By country", icon: Globe },
    { key: "title", label: "By title", icon: PieChartIcon },
    { key: "domain", label: "Email domains", icon: Mail },
    { key: "state", label: "Top states", icon: MapPin },
    { key: "distribution", label: "Distribution", icon: BarChart3 },
  ];

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
        <Link to={`/recruiters/${r.RecruiterID}`} className="font-semibold text-ink transition-colors hover:text-blue-600">
          {r.Name}
        </Link>
      ),
    },
    { key: "Title", label: "Title" },
    {
      key: "LinkedIn",
      label: "LinkedIn",
      render: (r) => (
        <a href={r.LinkedIn} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-crimson-600 hover:underline">
          Profile <ExternalLink className="h-3 w-3" />
        </a>
      ),
    },
    {
      key: "Email",
      label: "Email",
      render: (r) => (
        <a href={`mailto:${r.Email}`} className="text-sm text-blue-600 hover:underline">
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
      render: (r) => <Badge tone="default">{r.Country}</Badge>,
    },
    {
      key: "_view",
      label: "",
      render: (r) => (
        <Link to={`/recruiters/${r.RecruiterID}`} className="text-slate transition-colors hover:text-blue-600">
          <ChevronRight className="h-4 w-4" />
        </Link>
      ),
    },
  ];

  function renderActiveChart() {
    switch (activeChart) {
      case "country":
        return byCountry.length > 0 ? (
          <BarChart data={byCountry} layout="vertical" margin={{ left: 4, right: 20, top: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6eefc" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
            <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill={RED} radius={[0, 6, 6, 0]} barSize={14} animationDuration={700} />
          </BarChart>
        ) : (
          <EmptyState message="No country data available" icon={Globe} />
        );
      case "title":
        return byTitle.length > 0 ? (
          <PieChart>
            <Pie data={byTitle} dataKey="count" nameKey="name" innerRadius={38} outerRadius={64} paddingAngle={2}>
              {byTitle.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="#fff" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={24} iconSize={8} wrapperStyle={{ fontSize: 10 }} />
          </PieChart>
        ) : (
          <EmptyState message="No title data available" icon={Briefcase} />
        );
      case "domain":
        return byEmailDomain.length > 0 ? (
          <BarChart data={byEmailDomain} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6eefc" />
            <XAxis dataKey="name" tick={{ fontSize: 8 }} interval={0} angle={-20} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 9 }} allowDecimals={false} width={24} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill={RED} radius={[4, 4, 0, 0]} animationDuration={700} />
          </BarChart>
        ) : (
          <EmptyState message="No email domain data" icon={Mail} />
        );
      case "state":
        return byState.length > 0 ? (
          <BarChart data={byState} layout="vertical" margin={{ left: 4, right: 20, top: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6eefc" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 9 }} />
            <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 9 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill={RED} radius={[0, 6, 6, 0]} barSize={13} animationDuration={700} />
          </BarChart>
        ) : (
          <EmptyState message="No state/region data available" icon={MapPin} />
        );
      case "distribution":
        return byCountry.length > 0 ? (
          <PieChart>
            <Pie data={byCountry} dataKey="count" nameKey="name" innerRadius={38} outerRadius={62} paddingAngle={2}>
              {byCountry.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="#fff" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={24} iconSize={8} wrapperStyle={{ fontSize: 10 }} />
          </PieChart>
        ) : (
          <EmptyState message="No distribution data available" icon={UsersRound} />
        );
      default:
        return null;
    }
  }

  const activeMeta = chartOptions.find((c) => c.key === activeChart);

  return (
    <PageShell title="Recruiters" searchPlaceholder="Search recruiters by name, title, location..." onSearch={setQuery}>
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
                <UsersRound className="h-4 w-4 text-white transition-transform duration-300 group-hover:scale-110" />
              </span>
              <div>
                <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-ink">
                  Recruiters
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex cursor-default items-center gap-1.5 rounded-full border border-crimson-200 bg-crimson-50/70 px-3.5 py-2 text-xs font-semibold text-crimson-700">
                <UsersRound className="h-3.5 w-3.5" />
                <span className="stat-figure">{totalRecruiters}</span> total
              </div>
              <div className="flex cursor-default items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/70 px-3.5 py-2 text-xs font-semibold text-blue-700">
                <Globe className="h-3.5 w-3.5" />
                <span className="stat-figure">{byCountry.length}</span> countries
              </div>
              <div className="flex cursor-default items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/60 px-3.5 py-2 text-xs font-semibold text-emerald-700">
                <Briefcase className="h-3.5 w-3.5" />
                <span className="stat-figure">{byTitle.length}</span> roles
              </div>
            </div>
          </div>
        </div>

        {/* 28 / 70 split: statistics on the left, table on the right */}
        <div className="flex flex-col lg:flex-row gap-4 px-4 md:px-6">
          <div className="w-full lg:basis-[28%] lg:max-w-[28%] space-y-4">
            {/* Quick stat cards */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={UsersRound} label="Total" value={totalRecruiters} accent={RED} delay={60} />
              <StatCard icon={Globe} label="Countries" value={byCountry.length} accent={BLUE} delay={100} />
              <StatCard icon={Briefcase} label="Roles" value={byTitle.length} accent={GREEN} delay={140} />
              <StatCard icon={Mail} label="Domains" value={byEmailDomain.length} accent={AMBER} delay={180} />
            </div>

            {/* Chart switcher + active chart */}
            <Card
              className="jobs-fade-up flex flex-col bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10"
              style={{ animationDelay: "220ms" }}
            >
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <Text variant="small" className="font-bold tracking-tight text-ink">
                  {activeMeta?.label}
                </Text>
              </div>

              {/* Button group to switch charts */}
              <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                {chartOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isActive = opt.key === activeChart;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setActiveChart(opt.key)}
                      className={cx(
                        "flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all duration-200",
                        isActive
                          ? "bg-crimson-600 text-white shadow-sm"
                          : "border border-blue-200 bg-white text-slate hover:border-crimson-300 hover:text-crimson-600"
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              <CardBody className="!pt-1 !pb-4" style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  {renderActiveChart()}
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </div>

          <div className="w-full lg:basis-[70%] lg:max-w-[70%]">
            <Card
              className="jobs-fade-up !rounded-2xl bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10 shadow-[0_1px_2px_rgba(20,20,40,0.04)] h-full"
              style={{ animationDelay: "160ms" }}
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
              </div>
              <DataTable columns={columns} rows={filtered} searchTerm={query} emptyLabel="No recruiters match your filters" />
            </Card>
          </div>
        </div>
      </div>
    </PageShell>
  );
}