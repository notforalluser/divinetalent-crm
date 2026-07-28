import { useMemo, useState } from "react";
import {
  Activity as ActivityIcon,
  User,
  Calendar,
  Clock,
  FileText,
  Users,
  Briefcase,
  UserCheck,
  Filter,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import PageShell from "../components/layout/PageShell";
import { Card, CardBody } from "../components/ui/Card";
import { Heading, Text } from "../components/ui/Typography";
import { Select } from "../components/ui/Input";
import DataTable from "../components/ui/DataTable";
import Badge from "../components/ui/Badge";
import { useData } from "../context/DataContext";

const RED = "#c8102e";
const BLUE = "#3b82f6";
const GREEN = "#10b981";
const AMBER = "#f59e0b";

function cx(...args) {
  return args.filter(Boolean).join(" ");
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

export default function Activity() {
  const { visible: data } = useData();
  const [query, setQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [entityFilter, setEntityFilter] = useState("All");

  const allActivities = data.Activity || [];

  const actions = ["All", ...new Set(allActivities.map((a) => a.Action).filter(Boolean))];
  const entities = ["All", ...new Set(allActivities.map((a) => a.Entity).filter(Boolean))];

  const filteredRows = useMemo(() => {
    return allActivities
      .filter((a) => actionFilter === "All" || a.Action === actionFilter)
      .filter((a) => entityFilter === "All" || a.Entity === entityFilter)
      .sort((a, b) => new Date(b.Date) - new Date(a.Date));
  }, [allActivities, actionFilter, entityFilter]);

  const totalEvents = allActivities.length;
  const uniqueUsers = new Set(allActivities.map((a) => a.User)).size;
  const todayEvents = allActivities.filter((a) => {
    const today = new Date();
    const eventDate = new Date(a.Date);
    return eventDate.toDateString() === today.toDateString();
  }).length;

  const columns = [
    {
      key: "Date",
      label: "Date",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-slate" />
          <span className="text-sm">{new Date(r.Date).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: "Time",
      label: "Time",
      render: (r) => {
        const date = new Date(r.Date);
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-slate" />
            <span className="text-sm">{date.toLocaleTimeString()}</span>
          </div>
        );
      },
    },
    {
      key: "User",
      label: "User",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2">
          <User className="h-3.5 w-3.5 text-slate" />
          <span className="font-medium text-ink">{r.User}</span>
        </div>
      ),
    },
    {
      key: "Action",
      label: "Action",
      render: (r) => {
        const actionColors = {
          Created: "emerald",
          Updated: "blue",
          Deleted: "crimson",
          Viewed: "gray",
          Applied: "purple",
          Interview: "orange",
          Hired: "green",
          Rejected: "red",
        };
        const color = actionColors[r.Action] || "default";
        return <Badge tone={color}>{r.Action}</Badge>;
      },
    },
    {
      key: "Entity",
      label: "Entity",
      render: (r) => {
        const entityIcons = {
          Candidate: Users,
          Job: Briefcase,
          Recruiter: UserCheck,
          Interview: Calendar,
        };
        const Icon = entityIcons[r.Entity] || FileText;
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-3.5 w-3.5 text-slate" />
            <span className="text-sm">{r.Entity}</span>
          </div>
        );
      },
    },
    { key: "Details", label: "Details", render: (r) => <span className="text-sm text-slate">{r.Details}</span> },
    {
      key: "_view",
      label: "",
      render: () => (
        <button className="text-slate transition-colors hover:text-blue-600">
          <ChevronRight className="h-4 w-4" />
        </button>
      ),
    },
  ];

  const filterFields = [
    { value: actionFilter, set: setActionFilter, options: actions, prefix: "Action" },
    { value: entityFilter, set: setEntityFilter, options: entities, prefix: "Entity" },
  ];

  return (
    <PageShell title="Activity" searchPlaceholder="Search activity log..." onSearch={setQuery}>
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
                <ActivityIcon className="h-4 w-4 text-white transition-transform duration-300 group-hover:scale-110" />
              </span>
              <div>
                <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-ink">
                  Activity Log
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex cursor-default items-center gap-1.5 rounded-full border border-crimson-200 bg-crimson-50/70 px-3.5 py-2 text-xs font-semibold text-crimson-700">
                <ActivityIcon className="h-3.5 w-3.5" />
                <span className="stat-figure">{totalEvents}</span> events
              </div>
              <div className="flex cursor-default items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/70 px-3.5 py-2 text-xs font-semibold text-blue-700">
                <Users className="h-3.5 w-3.5" />
                <span className="stat-figure">{uniqueUsers}</span> users
              </div>
              <div className="flex cursor-default items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/60 px-3.5 py-2 text-xs font-semibold text-emerald-700">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="stat-figure">{todayEvents}</span> today
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-6 space-y-8">
          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={ActivityIcon} label="Total events" value={totalEvents} accent={RED} delay={60} />
            <StatCard icon={Users} label="Unique users" value={uniqueUsers} accent={BLUE} delay={100} />
            <StatCard icon={TrendingUp} label="Today" value={todayEvents} accent={GREEN} delay={140} />
            <StatCard icon={FileText} label="Actions tracked" value={actions.length - 1} accent={AMBER} delay={180} />
          </div>

          {/* Table with filters */}
          <Card
            className="jobs-fade-up !rounded-2xl bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10 shadow-[0_1px_2px_rgba(20,20,40,0.04)]"
            style={{ animationDelay: "220ms" }}
          >
            <div className="flex items-center flex-nowrap gap-2.5 px-4 py-3 border-b border-blue-100 bg-gradient-to-r from-blue-50/70 via-pink-50/40 to-transparent rounded-t-2xl overflow-x-auto scrollbar-thin">
              <span className="flex items-center gap-1 text-[10px] font-semibold text-slate shrink-0 pr-1">
                <Filter className="h-3.5 w-3.5" />
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
                {filteredRows.length} events
              </Badge>
            </div>
            <DataTable
              columns={columns}
              rows={filteredRows}
              searchTerm={query}
              emptyLabel="No activity recorded yet"
            />
          </Card>

          {/* Empty state */}
          {totalEvents === 0 && (
            <Card
              className="jobs-fade-up bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10 border-2 border-dashed border-blue-200 !rounded-2xl"
              style={{ animationDelay: "280ms" }}
            >
              <CardBody className="text-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="rounded-full bg-crimson-50 p-4">
                    <ActivityIcon className="h-10 w-10 text-crimson-500" />
                  </div>
                  <Heading variant="h4" className="font-extrabold text-ink">No activity recorded</Heading>
                  <Text variant="body" color="muted" className="max-w-md">
                    Activity will appear here as users interact with the platform.
                  </Text>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </PageShell>
  );
}