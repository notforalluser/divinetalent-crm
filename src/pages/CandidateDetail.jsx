import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft, Bookmark, Search, ChevronDown, CalendarRange, Award, Trophy,
  Mail, UserCog, UserCheck, Stamp,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, ComposedChart, Line, Area,
} from "recharts";
import PageShell from "../components/layout/PageShell";
import { Card, CardHeader, CardBody } from "../components/ui/Card";
import { Heading, Text } from "../components/ui/Typography";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import DataTable from "../components/ui/DataTable";
import { useData } from "../context/DataContext";
import { useSaved } from "../context/SavedContext";
import { dateKey, nowIST, diffInDays, formatShortDate, formatFullDate, effectiveInterviewStatus } from "../lib/time";

// Same soft, airy palette as the Jobs dashboard: light blue as the primary
// signal, light pink/rose as the secondary accent, warm amber as the
// tertiary, and a semantic green reserved for positive / "yes" states.
const BLUE = "#3b82f6";
const PINK = "#ec4899";
const AMBER = "#f59e0b";
const GREEN = "#10b981";
const PALETTE = [BLUE, PINK, AMBER, GREEN];

const STATUS_COLORS = {
  Completed: GREEN,
  Selected: "#059669",
  Rejected: PINK,
  "No-Show": AMBER,
  Rescheduled: BLUE,
  "Pending Feedback": "#86858f",
};

function inRange(dateStr, start, end) {
  const d = new Date(dateStr);
  if (isNaN(d)) return false;
  const k = dateKey(d);
  return (!start || k >= start) && (!end || k <= end);
}

function weekKey(d) {
  const date = new Date(d);
  const onejan = new Date(date.getFullYear(), 0, 1);
  const week = Math.ceil(((date - onejan) / 86400000 + onejan.getDay() + 1) / 7);
  return `W${week} '${String(date.getFullYear()).slice(2)}`;
}

// Same soft, airy background used on the Jobs dashboard: near-white base,
// a light blue dot grid, and gentle floating blobs in blue / pink / amber.
function PageBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#F7FAFF]">
      <style>{`
        @keyframes floatBlobA { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(40px,-30px) scale(1.08); } 66% { transform: translate(-20px,20px) scale(0.96); } }
        @keyframes floatBlobB { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-50px,30px) scale(1.1); } }
        @keyframes floatBlobC { 0%,100% { transform: translate(0,0) scale(1); } 40% { transform: translate(30px,40px) scale(0.94); } 70% { transform: translate(-30px,-10px) scale(1.05); } }
        .cd-blob-a { animation: floatBlobA 22s ease-in-out infinite; }
        .cd-blob-b { animation: floatBlobB 26s ease-in-out infinite; }
        .cd-blob-c { animation: floatBlobC 30s ease-in-out infinite; }
        .cd-grid {
          background-image: radial-gradient(circle, rgba(59,130,246,0.07) 1px, transparent 1px);
          background-size: 22px 22px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 20%, black 40%, transparent 90%);
        }
        @media (prefers-reduced-motion: reduce) {
          .cd-blob-a, .cd-blob-b, .cd-blob-c { animation: none !important; }
        }
      `}</style>
      <div className="cd-grid absolute inset-0" />
      <div
        className="cd-blob-a absolute -top-32 -left-24 h-[26rem] w-[26rem] rounded-full blur-3xl opacity-40"
        style={{ background: "radial-gradient(circle, #93c5fd 0%, transparent 70%)" }}
      />
      <div
        className="cd-blob-b absolute top-10 right-[-6rem] h-[24rem] w-[24rem] rounded-full blur-3xl opacity-30"
        style={{ background: "radial-gradient(circle, #f9a8d4 0%, transparent 70%)" }}
      />
      <div
        className="cd-blob-c absolute bottom-[-8rem] left-1/3 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-25"
        style={{ background: "radial-gradient(circle, #fde68a 0%, transparent 70%)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/70" />
    </div>
  );
}

// Same type system as the Jobs dashboard: Plus Jakarta Sans for headings,
// Inter for body, IBM Plex Mono reserved for stat figures.
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
      .app-shell h1, .app-shell h2, .app-shell h3, .app-shell h4, .app-shell h5, .app-shell h6 {
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

// Confetti + banner celebration, shown once whenever a placed candidate's
// profile is opened. Keyed by candidateId at the call site so switching to
// another placed candidate re-triggers it.
function PlacementCelebration({ name }) {
  const pieces = useMemo(() => {
    const colors = [BLUE, PINK, AMBER, GREEN, "#60a5fa"];
    return Array.from({ length: 70 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: colors[i % colors.length],
      delay: Math.random() * 0.5,
      duration: 2.6 + Math.random() * 1.8,
      size: 5 + Math.random() * 6,
      rotate: Math.random() * 360,
    }));
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0.9; }
        }
        @keyframes bannerPop {
          0% { transform: translate(-50%, -24px); opacity: 0; }
          12% { transform: translate(-50%, 0); opacity: 1; }
          82% { transform: translate(-50%, 0); opacity: 1; }
          100% { transform: translate(-50%, -12px); opacity: 0; }
        }
      `}</style>

      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            top: 0,
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.6,
            background: p.color,
            borderRadius: 2,
            animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}

      <div
        className="absolute left-1/2 top-8 -translate-x-1/2 rounded-full bg-ink text-white px-5 py-2.5 text-sm font-semibold shadow-lg flex items-center gap-2 whitespace-nowrap"
        style={{ animation: "bannerPop 4.5s ease-in-out forwards" }}
      >
        <Trophy className="h-4 w-4 text-amber-400" />
        {name} was placed! 🎉
      </div>
    </div>
  );
}

// One aligned profile field tile — icon, label, value — used in the hero
// card grid so all four fields line up cleanly regardless of value length.
function ProfileField({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-blue-50/40 hover:bg-blue-50/70 transition-colors px-4 py-3">
      <span className="h-9 w-9 rounded-lg bg-white ring-1 ring-blue-500/10 flex items-center justify-center shrink-0 text-blue-600">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <Text variant="micro" color="muted" className="uppercase tracking-wide">
          {label}
        </Text>
        <p className="text-sm font-semibold text-ink mt-0.5 truncate" title={value || "--"}>
          {value || "--"}
        </p>
      </div>
    </div>
  );
}

export default function CandidateDetail() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const { visible: data } = useData();
  const { isSaved, toggleSaved } = useSaved();

  const candidate = data.Candidates.find((c) => c.CandidateID === candidateId) || data.Candidates[0];
  const isPlaced = candidate?.Status === "Placed";
  const enrollKey = candidate ? dateKey(candidate.MarketingStartDate) : null;
  const cappedEndKey = candidate ? (isPlaced ? dateKey(candidate.PlacementDate) : dateKey(nowIST())) : null;

  const [switcherQuery, setSwitcherQuery] = useState("");
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [granularity, setGranularity] = useState("daily");

  // Whenever the candidate actually changes (switcher selection, back button,
  // direct link, etc.) make sure the switcher dropdown is fully closed —
  // otherwise it can linger open showing stale suggestions after a switch.
  useEffect(() => {
    setSwitcherOpen(false);
    setSwitcherQuery("");
  }, [candidateId]);

  const switcherMatches = useMemo(() => {
    if (!switcherQuery) return [];
    const q = switcherQuery.toLowerCase();
    return data.Candidates.filter((c) => c.Name.toLowerCase().includes(q)).slice(0, 8);
  }, [switcherQuery, data.Candidates]);

  // Full marketing window is always enrollment date -> placement (or today).
  const marketingRows = useMemo(
    () =>
      data.MarketingActivity
        .filter((m) => m.CandidateID === candidate?.CandidateID && inRange(m.Date, enrollKey, cappedEndKey))
        .sort((a, b) => new Date(a.Date) - new Date(b.Date)),
    [data.MarketingActivity, candidate, enrollKey, cappedEndKey]
  );

  const interviews = useMemo(
    () =>
      data.Interviews
        .filter((i) => i.CandidateID === candidate?.CandidateID)
        .sort((a, b) => new Date(a.InterviewDate) - new Date(b.InterviewDate)),
    [data.Interviews, candidate]
  );

  const completedInterviews = useMemo(
    () => interviews.filter((i) => diffInDays(i.InterviewDate, nowIST()) < 0),
    [interviews]
  );
  const upcomingInterviews = useMemo(
    () => interviews.filter((i) => diffInDays(i.InterviewDate, nowIST()) >= 0),
    [interviews]
  );

  const interviewCountByReceivedDay = useMemo(() => {
    const map = {};
    interviews.forEach((i) => {
      const k = dateKey(i.InterviewReceivedDate);
      if (k) map[k] = (map[k] || 0) + 1;
    });
    return map;
  }, [interviews]);

  const totalApplications = marketingRows.reduce((s, r) => s + Number(r.ApplicationsCount || 0), 0);
  const totalCompanyApps = marketingRows.reduce((s, r) => s + Number(r.CompanyApplications || 0), 0);
  const totalFastTrackApps = marketingRows.reduce((s, r) => s + Number(r.FastTrackApplications || 0), 0);
  const uniqueCompanies = new Set(interviews.map((i) => i.ClientName)).size;

  const byRound = useMemo(() => {
    const map = {};
    interviews.forEach((i) => (map[i.InterviewRound] = (map[i.InterviewRound] || 0) + 1));
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [interviews]);

  const byMode = useMemo(() => {
    const map = {};
    interviews.forEach((i) => (map[i.ModeOfRound] = (map[i.ModeOfRound] || 0) + 1));
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [interviews]);

  const byStatus = useMemo(() => {
    const map = {};
    interviews.forEach((i) => {
      const s = effectiveInterviewStatus(i);
      map[s] = (map[s] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [interviews]);

  const channelSplit = [
    { name: "Company", value: totalCompanyApps },
    { name: "Fast Track", value: totalFastTrackApps },
  ];

  const dailyTrend = useMemo(
    () =>
      marketingRows.map((m) => ({
        date: formatShortDate(m.Date),
        applications: Number(m.ApplicationsCount) || 0,
        interviews: interviewCountByReceivedDay[dateKey(m.Date)] || 0,
      })),
    [marketingRows, interviewCountByReceivedDay]
  );

  // Single source for the combined momentum chart — daily or weekly.
  const aggregatedTrend = useMemo(() => {
    if (granularity === "daily") return dailyTrend;
    const map = {};
    marketingRows.forEach((m) => {
      const key = weekKey(m.Date);
      if (!map[key]) map[key] = { date: key, applications: 0, interviews: 0 };
      map[key].applications += Number(m.ApplicationsCount) || 0;
      map[key].interviews += interviewCountByReceivedDay[dateKey(m.Date)] || 0;
    });
    return Object.values(map);
  }, [marketingRows, granularity, dailyTrend, interviewCountByReceivedDay]);

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

  if (!candidate) {
    return (
      <PageShell title="Candidate">
        <Text>No candidates found.</Text>
      </PageShell>
    );
  }

  const interviewColumns = [
    { key: "InterviewReceivedDate", label: "Received", sortable: true },
    { key: "InterviewDate", label: "Interview Date", sortable: true },
    { key: "InterviewTime", label: "Time" },
    { key: "JobRole", label: "Job Role" },
    { key: "InterviewRound", label: "Round" },
    { key: "ModeOfRound", label: "Mode" },
    { key: "ClientName", label: "Client" },
    { key: "JobType", label: "Job Type" },
    { key: "Status", label: "Status", render: (r) => <Badge tone={effectiveInterviewStatus(r)}>{effectiveInterviewStatus(r)}</Badge> },
  ];

  const marketingDurationDays = diffInDays(cappedEndKey, enrollKey) + 1;
  const cardCx = "bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10";

  return (
    <PageShell title="Candidate Intelligence">
      <PageTypography />
      <PageBackground />
      {isPlaced && <PlacementCelebration key={candidateId} name={candidate.Name} />}

      {/* Local motion + fade-up keyframes, scoped to this page only */}
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

      <div className="app-shell max-w-7xl mx-auto space-y-5">
        {/* Top bar: back + candidate switcher only */}
        <div className="relative z-40 flex items-center justify-between flex-wrap gap-3 bg-white/80 backdrop-blur-sm px-5 py-2.5 ring-1 ring-blue-500/10">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-slate hover:text-blue-600 transition-colors">
            <ChevronLeft className="h-4 w-4" /> Back
          </button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate" />
            <input
              value={switcherQuery}
              onChange={(e) => {
                setSwitcherQuery(e.target.value);
                setSwitcherOpen(true);
              }}
              onFocus={() => setSwitcherOpen(true)}
              onBlur={() => {
                // Slight delay so a click on a suggestion still registers
                // before the dropdown closes on blur.
                setTimeout(() => setSwitcherOpen(false), 120);
              }}
              placeholder="Switch candidate..."
              className="w-64 rounded-full border border-blue-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-300"
            />
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate pointer-events-none" />
            {switcherOpen && switcherMatches.length > 0 && (
              <div className="absolute z-50 top-full mt-1 w-full rounded-lg border border-blue-100 bg-white shadow-lg py-1">
                {switcherMatches.map((c) => (
                  <button
                    key={c.CandidateID}
                    onMouseDown={(e) => {
                      // onMouseDown fires before the input's onBlur, so the
                      // selection always registers even though the dropdown
                      // is about to close.
                      e.preventDefault();
                      setSwitcherOpen(false);
                      setSwitcherQuery("");
                      navigate(`/candidates/${c.CandidateID}`);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50"
                  >
                    {c.Name} <span className="text-slate text-xs">· {c.Technology}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mx-5 space-y-5">

          {/* Hero: identity row on top, fields as their own clean grid below —
            gives every field equal width and room instead of squeezing next
            to the avatar block. */}
          <Card className={`jobs-fade-up ${cardCx} p-5 sm:p-6 relative overflow-hidden`}>
            <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-blue-400/20 to-transparent blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-gradient-to-tr from-pink-300/20 to-transparent blur-3xl" />

            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-500 text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-sm">
                  {candidate.Name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Heading variant="h3">{candidate.Name}</Heading>
                    <Badge tone={candidate.Status}>{candidate.Status}</Badge>
                  </div>
                  <Text variant="small" color="muted" className="mt-0.5">
                    {candidate.Technology} · {candidate.ExperienceYears} yrs exp · {candidate.CurrentLocation}
                  </Text>
                </div>
              </div>

              <Button
                variant={isSaved("candidates", candidate.CandidateID, candidate.Saved) ? "primary" : "subtle"}
                size="sm"
                icon={Bookmark}
                onClick={() => toggleSaved("candidates", candidate.CandidateID, candidate.Saved)}
              >
                {isSaved("candidates", candidate.CandidateID, candidate.Saved) ? "Saved" : "Save candidate"}
              </Button>
            </div>

            {/* Field grid — each tile is equal width, icon + label + value all
              vertically aligned regardless of how long the value is. */}
            <div className="relative mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <ProfileField icon={Mail} label="Candidate email" value={candidate.Email} />
              <ProfileField icon={UserCog} label="Team leader" value={candidate.TeamLeader} />
              <ProfileField icon={UserCheck} label="Recruiter" value={candidate.Recruiter} />
              <ProfileField icon={Stamp} label="Visa status" value={candidate.VisaStatus} />
            </div>

            <div className="relative mt-5 pt-5 border-t border-blue-100 flex flex-wrap items-center justify-between gap-3">
              <Text variant="small" color="muted" className="flex items-center gap-1.5">
                <CalendarRange className="h-3.5 w-3.5" />
                Marketing window: {formatFullDate(enrollKey)} &rarr; {formatFullDate(cappedEndKey)}
                {isPlaced ? " (placed)" : ""}
              </Text>
              <div className="flex flex-wrap gap-1.5">
                {(candidate.Skills || "").split(",").filter(Boolean).map((s, i) => (
                  <span
                    key={s}
                    className="rounded-full text-xs font-medium px-2.5 py-0.5 border"
                    style={{
                      background: `${PALETTE[i % PALETTE.length]}14`,
                      borderColor: `${PALETTE[i % PALETTE.length]}33`,
                      color: PALETTE[i % PALETTE.length],
                    }}
                  >
                    {s.trim()}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {isPlaced && (
            <Card className="jobs-fade-up p-4 bg-gradient-to-r from-amber-50 via-white to-blue-50 ring-1 ring-amber-200/60 flex items-center gap-3">
              <Award className="h-8 w-8 text-amber-500 shrink-0" />
              <Text variant="body">
                Placed on <strong>{formatFullDate(candidate.PlacementDate)}</strong> after{" "}
                <strong>{marketingDurationDays} days</strong> of active marketing.
              </Text>
            </Card>
          )}

          {/* Stat strip */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className={`jobs-fade-up ${cardCx} p-5`}>
              <Text variant="eyebrow" color="muted">Marketing days</Text>
              <Heading variant="stat" className="mt-1 stat-figure">{marketingRows.length}</Heading>
            </Card>
            <Card className={`jobs-fade-up ${cardCx} p-5`}>
              <Text variant="eyebrow" color="muted">Applications submitted</Text>
              <Heading variant="stat" className="mt-1 stat-figure" style={{ color: BLUE }}>{totalApplications.toLocaleString()}</Heading>
            </Card>
            <Card className={`jobs-fade-up ${cardCx} p-5`}>
              <Text variant="eyebrow" color="muted">Total interviews</Text>
              <Heading variant="stat" className="mt-1 stat-figure">{interviews.length}</Heading>
              <Text variant="small" color="muted" className="mt-1">
                {completedInterviews.length} completed · {upcomingInterviews.length} upcoming
              </Text>
            </Card>
          </div>

          <Card className={`jobs-fade-up ${cardCx}`}>
            <CardHeader>
              <div>
                <Heading variant="h4" className="mt-0.5">
                  Marketing activity, {marketingRows.length} day{marketingRows.length === 1 ? "" : "s"}
                </Heading>
                <Text variant="small" color="muted" className="mt-0.5">
                  Applications (area) against interviews landed (line), per {granularity === "daily" ? "day" : "week"}
                </Text>
              </div>
              <div className="flex rounded-full border border-blue-200 overflow-hidden bg-blue-50/60 p-0.5">
                {["daily", "weekly"].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGranularity(g)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
                      granularity === g ? "bg-blue-500 text-white shadow-sm" : "text-slate hover:text-ink"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardBody className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={aggregatedTrend} margin={{ left: -16 }}>
                  <defs>
                    <linearGradient id="candAppsTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={BLUE} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6eefc" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 9 }}
                    interval={granularity === "daily" ? Math.ceil(aggregatedTrend.length / 10) : 0}
                  />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={28} iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="applications"
                    name="Applications"
                    stroke={BLUE}
                    fill="url(#candAppsTrend)"
                    strokeWidth={2.25}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="interviews"
                    name="Interviews"
                    stroke={GREEN}
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Two-column layout: left = tables stacked, right = charts stacked */}
          <div className="grid lg:grid-cols-[70%_28%] gap-4 items-start">
            {/* Left column — Daily marketing table, Completed, Upcoming */}
            <div className="space-y-4">
              <Card className={`jobs-fade-up ${cardCx}`}>
                <CardHeader>
                  <div>
                    <Heading variant="h4">Daily marketing table</Heading>
                    <Text variant="small" color="muted">
                      Each column is one calendar day, from marketing start through {isPlaced ? "placement" : "today"}
                    </Text>
                  </div>
                </CardHeader>
                <CardBody className="overflow-x-auto scrollbar-thin !p-0 !px-5 !pb-4">
                  <table className="text-sm">
                    <tbody>
                      <tr className="border-b border-blue-50">
                        <td className="sticky left-0 bg-blue-500 z-10 px-4 py-1.5 font-semibold text-white whitespace-nowrap border-r border-blue-400/40">
                          Date
                        </td>
                        {marketingRows.map((m) => (
                          <td key={m.ActivityID} className="px-3 py-1.5 bg-blue-400/80 text-center whitespace-nowrap text-white">
                            {formatShortDate(m.Date)}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-blue-50 bg-blue-50/40">
                        <td className="sticky left-0 bg-blue-50/40 z-10 px-4 py-1 font-semibold text-ink-soft whitespace-nowrap border-r border-blue-100">
                          Day #
                        </td>
                        {marketingRows.map((m, i) => (
                          <td key={m.ActivityID} className="px-3 py-1 text-center text-slate">
                            {i + 1}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-blue-50">
                        <td className="sticky left-0 bg-white z-10 px-4 py-1.5 font-semibold text-ink whitespace-nowrap border-r border-blue-100">
                          Applications
                        </td>
                        {marketingRows.map((m) => (
                          <td key={m.ActivityID} className="px-3 py-1.5 text-center font-semibold text-ink">
                            {m.ApplicationsCount}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-blue-50">
                        <td className="sticky left-0 bg-white z-10 px-4 py-1.5 text-ink-soft whitespace-nowrap border-r border-blue-100">
                          Company
                        </td>
                        {marketingRows.map((m) => (
                          <td key={m.ActivityID} className="px-3 py-1.5 text-center text-ink-soft">
                            {m.CompanyApplications}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-blue-50">
                        <td className="sticky left-0 bg-white z-10 px-4 py-1.5 text-ink-soft whitespace-nowrap border-r border-blue-100">
                          Fast Track
                        </td>
                        {marketingRows.map((m) => (
                          <td key={m.ActivityID} className="px-3 py-1.5 text-center text-ink-soft">
                            {m.FastTrackApplications}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="sticky left-0 bg-emerald-500 z-10 px-4 py-1.5 font-semibold text-white whitespace-nowrap border-r border-emerald-400/40">
                          Interviews
                        </td>
                        {marketingRows.map((m) => (
                          <td key={m.ActivityID} className="px-3 py-1.5 text-center font-semibold text-emerald-600">
                            {interviewCountByReceivedDay[dateKey(m.Date)] || 0}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </CardBody>
              </Card>

              <Card className={`jobs-fade-up ${cardCx}`}>
                <CardHeader>
                  <Heading variant="h4">Completed interviews</Heading>
                  <Badge tone="default">{completedInterviews.length} rows</Badge>
                </CardHeader>
                <div className="!p-0 !px-5">
                  <DataTable columns={interviewColumns} rows={completedInterviews} emptyLabel="No completed interviews yet" />
                </div>
              </Card>

              <Card className={`jobs-fade-up ${cardCx}`}>
                <CardHeader>
                  <div>
                    <Heading variant="h4">Upcoming interviews</Heading>
                    <Text variant="small" color="muted">
                      Scheduled and still ongoing -- never shows a future-dated invite before it's received
                    </Text>
                  </div>
                  <Badge tone="default">{upcomingInterviews.length} rows</Badge>
                </CardHeader>
                <div className="!p-0 !px-5">
                  <DataTable columns={interviewColumns} rows={upcomingInterviews} emptyLabel="No upcoming interviews scheduled" />
                </div>
              </Card>
            </div>

            {/* Right column — charts, single column stacked */}
            <div className="space-y-4">
              <Card className={`jobs-fade-up ${cardCx}`}>
                <CardHeader>
                  <Heading variant="h4">Interviews by round</Heading>
                </CardHeader>
                <CardBody className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byRound} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e6eefc" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill={BLUE} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>

              <Card className={`jobs-fade-up ${cardCx}`}>
                <CardHeader>
                  <Heading variant="h4">Applications split</Heading>
                </CardHeader>
                <CardBody className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={channelSplit} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={3}>
                        {channelSplit.map((_, i) => (
                          <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="#fff" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="bottom" height={24} iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>

              {byMode.length > 0 && (
                <Card className={`jobs-fade-up ${cardCx}`}>
                  <CardHeader>
                    <Heading variant="h4">Interviews by mode</Heading>
                  </CardHeader>
                  <CardBody className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={byMode}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e6eefc" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" fill={PINK} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardBody>
                </Card>
              )}

              {byStatus.length > 0 && (
                <Card className={`jobs-fade-up ${cardCx}`}>
                  <CardHeader>
                    <Heading variant="h4">Interview outcomes</Heading>
                  </CardHeader>
                  <CardBody className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={3}>
                          {byStatus.map((entry, i) => (
                            <Cell key={i} fill={STATUS_COLORS[entry.name] || PALETTE[i % PALETTE.length]} stroke="#fff" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="bottom" height={24} iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardBody>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}