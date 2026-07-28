import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, CalendarDays, TrendingUp, Clock3, UserRound, SlidersHorizontal, ChevronRight } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area,
} from "recharts";
import PageShell from "../components/layout/PageShell";
import { Card, CardBody } from "../components/ui/Card";
import { Text } from "../components/ui/Typography";
import { Select } from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import DataTable from "../components/ui/DataTable";
import Modal from "../components/ui/Modal";
import SaveButton from "../components/ui/SaveButton";
import { useData } from "../context/DataContext";
import { useSettings } from "../context/SettingsContext";
import {
  nowIST, startOfDay, addDays, dateKey, diffInDays, formatFullDate, formatShortDate, relativeDayLabel, effectiveInterviewStatus,
} from "../lib/time";

// Same soft, airy palette as Candidates / Special Search.
const BLUE = "#3b82f6";
const PINK = "#ec4899";
const AMBER = "#f59e0b";
const GREEN = "#10b981";

const ONLINE_PLATFORMS = ["MS Teams", "Zoom", "Google Meet"];
const MODE_CATEGORY = {
  "MS Teams": "Online", "Zoom": "Online", "Google Meet": "Online",
  "Telephonic": "Phone", "Face to Face": "Face to Face",
};

function cx(...args) {
  return args.filter(Boolean).join(" ");
}

/* ---------- Shared presentational helpers ---------- */

function ChartCard({ title, span, children, height = 200, headerExtra, delay = 0 }) {
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

// Same calm blob-and-dot-grid background used on Candidates / Special Search.
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

// Same type system as Candidates / Special Search.
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
      .app-shell h1, .app-shell h2, .app-shell h3,
      .app-shell h4, .app-shell h5, .app-shell h6 {
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

const DETAIL_COLUMNS = [
  { key: "InterviewReceivedDate", label: "Received", sortable: true },
  { key: "InterviewDate", label: "Interview Date", sortable: true },
  { key: "InterviewTime", label: "Time" },
  { key: "JobRole", label: "Job Role" },
  { key: "InterviewRound", label: "Round" },
  { key: "ModeOfRound", label: "Mode" },
  { key: "ClientName", label: "Client" },
  { key: "JobType", label: "Job Type" },
  { key: "Status", label: "Status", render: (r) => <Badge tone={effectiveInterviewStatus(r)}>{effectiveInterviewStatus(r)}</Badge> },
  {
    key: "_save",
    label: "",
    render: (r) => <SaveButton type="interviews" id={r.InterviewID} sheetValue={r.Saved} />,
  },
  {
    key: "_view",
    label: "",
    render: (r) => (
      <Link to={`/interviews/${r.InterviewID}`} className="text-slate transition-colors hover:text-blue-600">
        <ChevronRight className="h-4 w-4" />
      </Link>
    ),
  },
];

export default function InterviewSchedule() {
  const { visible: data } = useData();
  const { settings } = useSettings();
  const [cell, setCell] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roundFilter, setRoundFilter] = useState("All");
  const [modeFilter, setModeFilter] = useState("All");

  const now = nowIST();
  const today = startOfDay(now);

  const allInterviews = data.Interviews || [];

  const statuses = ["All", ...new Set(allInterviews.map((i) => effectiveInterviewStatus(i)))];
  const rounds = ["All", ...new Set(allInterviews.map((i) => i.InterviewRound))];
  const modes = ["All", ...new Set(allInterviews.map((i) => i.ModeOfRound))];

  const upcoming = useMemo(
    () =>
      allInterviews
        .filter((i) => !isNaN(new Date(i.InterviewDate)) && startOfDay(i.InterviewDate) >= today)
        .filter((i) => statusFilter === "All" || effectiveInterviewStatus(i) === statusFilter)
        .filter((i) => roundFilter === "All" || i.InterviewRound === roundFilter)
        .filter((i) => modeFilter === "All" || i.ModeOfRound === modeFilter)
        .sort((a, b) => new Date(a.InterviewDate) - new Date(b.InterviewDate)),
    [allInterviews, today, statusFilter, roundFilter, modeFilter]
  );

  const todayCount = upcoming.filter((i) => diffInDays(i.InterviewDate, now) === 0).length;
  const tomorrowCount = upcoming.filter((i) => diffInDays(i.InterviewDate, now) === 1).length;
  const thisWeekCount = upcoming.filter((i) => diffInDays(i.InterviewDate, now) <= 6).length;

  const dateColumns = useMemo(() => {
    const keys = [...new Set(upcoming.map((i) => dateKey(i.InterviewDate)))].sort();
    return keys.map((k) => ({
      key: k,
      label: relativeDayLabel(k, now) || formatShortDate(k),
      sub: relativeDayLabel(k, now) ? formatShortDate(k) : null,
      count: upcoming.filter((i) => dateKey(i.InterviewDate) === k).length,
    }));
  }, [upcoming, now]);

  const matrix = useMemo(() => {
    const byCandidate = {};
    upcoming.forEach((i) => {
      if (!byCandidate[i.CandidateName]) {
        byCandidate[i.CandidateName] = {
          candidate: i.CandidateName,
          candidateId: i.CandidateID,
          soonest: i.InterviewDate,
          counts: {},
          statuses: new Set()
        };
      }
      const row = byCandidate[i.CandidateName];
      const k = dateKey(i.InterviewDate);
      row.counts[k] = (row.counts[k] || 0) + 1;
      row.statuses.add(effectiveInterviewStatus(i));
      if (new Date(i.InterviewDate) < new Date(row.soonest)) row.soonest = i.InterviewDate;
    });
    return Object.values(byCandidate)
      .map(row => ({ ...row, statusCount: row.statuses.size }))
      .sort((a, b) => new Date(a.soonest) - new Date(b.soonest));
  }, [upcoming]);

  const filteredMatrix = useMemo(() => {
    if (!query.trim()) return matrix;
    const q = query.trim().toLowerCase();
    return matrix.filter((row) => row.candidate.toLowerCase().includes(q));
  }, [matrix, query]);

  const cellInterviews = useMemo(() => {
    if (!cell) return [];
    return upcoming
      .filter((i) => i.CandidateName === cell.candidate && dateKey(i.InterviewDate) === cell.dateKey)
      .sort((a, b) => new Date(a.InterviewDate) - new Date(b.InterviewDate));
  }, [cell, upcoming]);

  const trendDays = settings.upcomingInterviewWindowDays || 14;
  const next14Trend = useMemo(
    () =>
      Array.from({ length: trendDays }, (_, i) => {
        const k = dateKey(addDays(today, i));
        return {
          date: formatShortDate(k),
          count: upcoming.filter((iv) => dateKey(iv.InterviewDate) === k).length,
        };
      }),
    [upcoming, today, trendDays]
  );

  const todayInterviews = useMemo(() => upcoming.filter((i) => diffInDays(i.InterviewDate, now) === 0), [upcoming, now]);

  const byRoundToday = useMemo(() => {
    const map = {};
    todayInterviews.forEach((i) => (map[i.InterviewRound] = (map[i.InterviewRound] || 0) + 1));
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [todayInterviews]);

  const byModeToday = useMemo(() => {
    const map = {};
    todayInterviews.forEach((i) => {
      const cat = MODE_CATEGORY[i.ModeOfRound] || i.ModeOfRound;
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [todayInterviews]);

  const byOnlinePlatformToday = useMemo(() => {
    const map = {};
    todayInterviews
      .filter((i) => ONLINE_PLATFORMS.includes(i.ModeOfRound))
      .forEach((i) => (map[i.ModeOfRound] = (map[i.ModeOfRound] || 0) + 1));
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [todayInterviews]);

  const filterFields = [
    { value: statusFilter, set: setStatusFilter, options: statuses, prefix: "Status" },
    { value: roundFilter, set: setRoundFilter, options: rounds, prefix: "Round" },
    { value: modeFilter, set: setModeFilter, options: modes, prefix: "Mode" },
  ];

  return (
    <PageShell title="Interviews" onSearch={setQuery} searchPlaceholder="Search by candidate name...">
      <PageTypography />
      <DashboardBackground />

      <style>{`
        @keyframes jobsFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .jobs-fade-up { animation: jobsFadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .jobs-fade-up { animation: none !important; }
        }
      `}</style>

      <div className="app-shell space-y-8">
        {/* Hero */}
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm px-6 py-4 ring-1 ring-blue-500/10 shadow-sm">
          <div className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-pink-300/10 blur-3xl" />

          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-3.5">
              <span className="group flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-crimson-500 via-crimson-600 to-crimson-500 ring-1 ring-blue-400/20 transition-transform duration-300 hover:scale-105 hover:rotate-3">
                <CalendarClock className="h-4 w-4 text-white transition-transform duration-300 group-hover:scale-110" />
              </span>
              <div>
                <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-ink">
                  Interviews
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex cursor-default items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/70 px-3.5 py-2 text-xs font-semibold text-blue-700">
                <Clock3 className="h-3.5 w-3.5" />
                <span className="stat-figure">{todayCount}</span> today
              </div>
              <div className="flex cursor-default items-center gap-1.5 rounded-full border border-pink-200 bg-pink-50/60 px-3.5 py-2 text-xs font-semibold text-pink-700">
                <CalendarDays className="h-3.5 w-3.5" />
                <span className="stat-figure">{tomorrowCount}</span> tomorrow
              </div>
              <div className="flex cursor-default items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/60 px-3.5 py-2 text-xs font-semibold text-emerald-700">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="stat-figure">{thisWeekCount}</span> this week
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8  px-4 md:px-6">
          {/* Charts row — all four today-scoped views */}
          <div className="grid grid-cols-12 gap-4">
            <ChartCard title={`Next ${trendDays} days trend`} span="col-span-12 sm:col-span-6 lg:col-span-3" height={200} delay={100}>
              <AreaChart data={next14Trend} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="interviewTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BLUE} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6eefc" />
                <XAxis dataKey="date" tick={{ fontSize: 8 }} interval={2} angle={-35} textAnchor="end" height={35} />
                <YAxis tick={{ fontSize: 9 }} allowDecimals={false} width={25} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" stroke={BLUE} fill="url(#interviewTrend)" strokeWidth={2} />
              </AreaChart>
            </ChartCard>

            <ChartCard title="Interview mode (today)" span="col-span-12 sm:col-span-6 lg:col-span-3" height={200} delay={180}>
              <BarChart data={byModeToday} layout="vertical" margin={{ left: 4, right: 24, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6eefc" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 8 }} />
                <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 8 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill={PINK} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartCard>

            <ChartCard title="By round (today)" span="col-span-12 sm:col-span-6 lg:col-span-3" height={200} delay={260}>
              <BarChart data={byRoundToday} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6eefc" />
                <XAxis dataKey="name" tick={{ fontSize: 8 }} interval={0} angle={-15} textAnchor="end" height={35} />
                <YAxis tick={{ fontSize: 9 }} allowDecimals={false} width={20} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill={AMBER} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartCard>

            <ChartCard title="Online platforms (today)" span="col-span-12 sm:col-span-6 lg:col-span-3" height={200} delay={340}>
              <BarChart data={byOnlinePlatformToday} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6eefc" />
                <XAxis dataKey="name" tick={{ fontSize: 8 }} interval={0} angle={-15} textAnchor="end" height={35} />
                <YAxis tick={{ fontSize: 9 }} allowDecimals={false} width={20} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill={GREEN} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartCard>
          </div>

          {/* Matrix table with filters */}
          <Card
            className="jobs-fade-up !rounded-2xl bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10 shadow-[0_1px_2px_rgba(20,20,40,0.04)]"
            style={{ animationDelay: "420ms" }}
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
                {dateColumns.length} dates · {matrix.length} candidates
              </Badge>
            </div>

            <div className="overflow-x-auto scrollbar-thin">
              {filteredMatrix.length === 0 ? (
                <Text variant="small" color="muted" className="px-5 py-10 text-center block">
                  {matrix.length === 0 ? "No upcoming interviews scheduled." : "No candidates match your filters."}
                </Text>
              ) : (
                <table className="text-sm min-w-full">
                  <thead>
                    <tr className="border-b border-blue-100 bg-blue-50/40">
                      <th className="sticky left-0 bg-blue-50/60 backdrop-blur-sm z-10 px-4 py-3 text-left font-semibold text-ink-soft whitespace-nowrap border-r border-blue-100">
                        Candidate
                      </th>
                      {dateColumns.map((col) => (
                        <th key={col.key} className="px-3 py-2 text-center whitespace-nowrap min-w-[84px]">
                          <p className={`text-xs font-bold ${col.label === "Today" ? "text-blue-600" : "text-ink"}`}>{col.label}</p>
                          {col.sub && <p className="text-[10px] text-slate font-normal">{col.sub}</p>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMatrix.map((row) => (
                      <tr key={row.candidate} className="border-b border-blue-50 last:border-0 hover:bg-blue-50/30 transition-colors">
                        <td className="sticky left-0 bg-white/95 backdrop-blur-sm z-10 px-4 py-2.5 whitespace-nowrap border-r border-blue-100">
                          <div className="flex items-center gap-2">
                            <Link to={`/candidates/${row.candidateId}`} className="font-semibold text-ink transition-colors hover:text-blue-600">
                              {row.candidate}
                            </Link>
                            {row.statusCount > 1 && (
                              <Badge tone="default" size="sm" className="border border-blue-100">{row.statusCount} statuses</Badge>
                            )}
                          </div>
                        </td>
                        {dateColumns.map((col) => {
                          const count = row.counts[col.key] || 0;
                          return (
                            <td key={col.key} className="px-3 py-2.5 text-center">
                              {count > 0 ? (
                                <button
                                  onClick={() => setCell({ candidate: row.candidate, candidateId: row.candidateId, dateKey: col.key })}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-semibold hover:bg-blue-500 hover:text-white transition-all shadow-sm hover:shadow-md"
                                >
                                  {count}
                                </button>
                              ) : (
                                <span className="text-slate">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={!!cell}
        onClose={() => setCell(null)}
        title={cell?.candidate}
        subtitle={cell ? `${formatFullDate(cell.dateKey)} · ${cellInterviews.length} interview${cellInterviews.length === 1 ? "" : "s"}` : ""}
        wide
      >
        <DataTable columns={DETAIL_COLUMNS} rows={cellInterviews} emptyLabel="No interviews found" />
        {cell?.candidateId && (
          <div className="flex justify-end px-5 py-3 border-t border-blue-100 bg-blue-50/30 rounded-b-2xl">
            <Link to={`/candidates/${cell.candidateId}`}>
              <Button variant="primary" size="sm" icon={UserRound}>
                View candidate profile
              </Button>
            </Link>
          </div>
        )}
      </Modal>
    </PageShell>
  );
}