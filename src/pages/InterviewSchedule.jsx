// import { useMemo, useState } from "react";
// import { Link } from "react-router-dom";
// import { CalendarClock, CalendarDays, TrendingUp, Clock3, UserRound, SlidersHorizontal, ChevronRight } from "lucide-react";
// import {
//   ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
//   PieChart, Pie, Cell, Legend, AreaChart, Area,
// } from "recharts";
// import PageShell from "../components/layout/PageShell";
// import { Card, CardHeader, CardBody } from "../components/ui/Card";
// import { Heading, Text } from "../components/ui/Typography";
// import { Select } from "../components/ui/Input";
// import StatCard from "../components/ui/StatCard";
// import Badge from "../components/ui/Badge";
// import Button from "../components/ui/Button";
// import DataTable from "../components/ui/DataTable";
// import Modal from "../components/ui/Modal";
// import SaveButton from "../components/ui/SaveButton";
// import { useData } from "../context/DataContext";
// import { useSettings } from "../context/SettingsContext";
// import {
//   nowIST, startOfDay, addDays, dateKey, diffInDays, formatFullDate, formatShortDate, relativeDayLabel, effectiveInterviewStatus,
// } from "../lib/time";

// const PALETTE = ["#c8102e", "#121214", "#86858f", "#ad0d27", "#4a4a52", "#8c0a1f", "#10b981", "#3b82f6"];
// const RED = "#c8102e";
// const GREEN = "#10b981";
// const BLUE = "#3b82f6";

// const ONLINE_PLATFORMS = ["MS Teams", "Zoom", "Google Meet"];
// const MODE_CATEGORY = {
//   "MS Teams": "Online", "Zoom": "Online", "Google Meet": "Online",
//   "Telephonic": "Phone", "Face to Face": "Face to Face",
// };

// function cx(...args) {
//   return args.filter(Boolean).join(" ");
// }

// function ChartCard({ title, span, children, height = 260, headerExtra }) {
//   return (
//     <Card className={`flex flex-col ${span}`}>
//       <div className="flex items-center justify-between px-4 pt-3.5 pb-1">
//         <Text variant="small" className="font-bold text-ink">
//           {title}
//         </Text>
//         {headerExtra}
//       </div>
//       <CardBody className="!pt-1" style={{ height }}>
//         <ResponsiveContainer width="100%" height="100%">
//           {children}
//         </ResponsiveContainer>
//       </CardBody>
//     </Card>
//   );
// }

// const DETAIL_COLUMNS = [
//   { key: "InterviewReceivedDate", label: "Received", sortable: true },
//   { key: "InterviewDate", label: "Interview Date", sortable: true },
//   { key: "InterviewTime", label: "Time" },
//   { key: "JobRole", label: "Job Role" },
//   { key: "InterviewRound", label: "Round" },
//   { key: "ModeOfRound", label: "Mode" },
//   { key: "ClientName", label: "Client" },
//   { key: "JobType", label: "Job Type" },
//   { key: "Status", label: "Status", render: (r) => <Badge tone={effectiveInterviewStatus(r)}>{effectiveInterviewStatus(r)}</Badge> },
//   {
//     key: "_save",
//     label: "",
//     render: (r) => <SaveButton type="interviews" id={r.InterviewID} sheetValue={r.Saved} />,
//   },
//   {
//     key: "_view",
//     label: "",
//     render: (r) => (
//       <Link to={`/interviews/${r.InterviewID}`} className="text-slate hover:text-crimson-600">
//         <ChevronRight className="h-4 w-4" />
//       </Link>
//     ),
//   },
// ];

// export default function InterviewSchedule() {
//   const { visible: data } = useData();
//   const { settings } = useSettings();
//   const [cell, setCell] = useState(null);
//   const [query, setQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [roundFilter, setRoundFilter] = useState("All");
//   const [modeFilter, setModeFilter] = useState("All");

//   const now = nowIST();
//   const today = startOfDay(now);

//   const allInterviews = data.Interviews || [];

//   // Status options
//   const statuses = ["All", ...new Set(allInterviews.map((i) => effectiveInterviewStatus(i)))];
//   const rounds = ["All", ...new Set(allInterviews.map((i) => i.InterviewRound))];
//   const modes = ["All", ...new Set(allInterviews.map((i) => i.ModeOfRound))];

//   const upcoming = useMemo(
//     () =>
//       allInterviews
//         .filter((i) => !isNaN(new Date(i.InterviewDate)) && startOfDay(i.InterviewDate) >= today)
//         .filter((i) => statusFilter === "All" || effectiveInterviewStatus(i) === statusFilter)
//         .filter((i) => roundFilter === "All" || i.InterviewRound === roundFilter)
//         .filter((i) => modeFilter === "All" || i.ModeOfRound === modeFilter)
//         .sort((a, b) => new Date(a.InterviewDate) - new Date(b.InterviewDate)),
//     [allInterviews, today, statusFilter, roundFilter, modeFilter]
//   );

//   const todayCount = upcoming.filter((i) => diffInDays(i.InterviewDate, now) === 0).length;
//   const tomorrowCount = upcoming.filter((i) => diffInDays(i.InterviewDate, now) === 1).length;
//   const thisWeekCount = upcoming.filter((i) => diffInDays(i.InterviewDate, now) <= 6).length;

//   // --- columns: every date (from today onward) that actually has >=1 interview scheduled ---
//   const dateColumns = useMemo(() => {
//     const keys = [...new Set(upcoming.map((i) => dateKey(i.InterviewDate)))].sort();
//     return keys.map((k) => ({
//       key: k,
//       label: relativeDayLabel(k, now) || formatShortDate(k),
//       sub: relativeDayLabel(k, now) ? formatShortDate(k) : null,
//       count: upcoming.filter((i) => dateKey(i.InterviewDate) === k).length,
//     }));
//   }, [upcoming, now]);

//   // --- rows: every candidate with at least one upcoming interview ---
//   const matrix = useMemo(() => {
//     const byCandidate = {};
//     upcoming.forEach((i) => {
//       if (!byCandidate[i.CandidateName]) {
//         byCandidate[i.CandidateName] = {
//           candidate: i.CandidateName,
//           candidateId: i.CandidateID,
//           soonest: i.InterviewDate,
//           counts: {},
//           statuses: new Set()
//         };
//       }
//       const row = byCandidate[i.CandidateName];
//       const k = dateKey(i.InterviewDate);
//       row.counts[k] = (row.counts[k] || 0) + 1;
//       row.statuses.add(effectiveInterviewStatus(i));
//       if (new Date(i.InterviewDate) < new Date(row.soonest)) row.soonest = i.InterviewDate;
//     });
//     return Object.values(byCandidate)
//       .map(row => ({ ...row, statusCount: row.statuses.size }))
//       .sort((a, b) => new Date(a.soonest) - new Date(b.soonest));
//   }, [upcoming]);

//   const filteredMatrix = useMemo(() => {
//     if (!query.trim()) return matrix;
//     const q = query.trim().toLowerCase();
//     return matrix.filter((row) => row.candidate.toLowerCase().includes(q));
//   }, [matrix, query]);

//   const cellInterviews = useMemo(() => {
//     if (!cell) return [];
//     return upcoming
//       .filter((i) => i.CandidateName === cell.candidate && dateKey(i.InterviewDate) === cell.dateKey)
//       .sort((a, b) => new Date(a.InterviewDate) - new Date(b.InterviewDate));
//   }, [cell, upcoming]);

//   // --- charts ---
//   const trendDays = settings.upcomingInterviewWindowDays || 14;
//   const next14Trend = useMemo(
//     () =>
//       Array.from({ length: trendDays }, (_, i) => {
//         const k = dateKey(addDays(today, i));
//         return {
//           date: formatShortDate(k),
//           count: upcoming.filter((iv) => dateKey(iv.InterviewDate) === k).length,
//         };
//       }),
//     [upcoming, today, trendDays]
//   );

//   const byRoundOverall = useMemo(() => {
//     const map = {};
//     upcoming.forEach((i) => (map[i.InterviewRound] = (map[i.InterviewRound] || 0) + 1));
//     return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
//   }, [upcoming]);

//   const todayInterviews = useMemo(() => upcoming.filter((i) => diffInDays(i.InterviewDate, now) === 0), [upcoming, now]);
//   const byRoundToday = useMemo(() => {
//     const map = {};
//     todayInterviews.forEach((i) => (map[i.InterviewRound] = (map[i.InterviewRound] || 0) + 1));
//     return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
//   }, [todayInterviews]);

//   const byModeCategory = useMemo(() => {
//     const map = {};
//     upcoming.forEach((i) => {
//       const cat = MODE_CATEGORY[i.ModeOfRound] || i.ModeOfRound;
//       map[cat] = (map[cat] || 0) + 1;
//     });
//     return Object.entries(map).map(([name, value]) => ({ name, value }));
//   }, [upcoming]);

//   const byOnlinePlatform = useMemo(() => {
//     const map = {};
//     upcoming
//       .filter((i) => ONLINE_PLATFORMS.includes(i.ModeOfRound))
//       .forEach((i) => (map[i.ModeOfRound] = (map[i.ModeOfRound] || 0) + 1));
//     return Object.entries(map).map(([name, value]) => ({ name, value }));
//   }, [upcoming]);

//   const byStatus = useMemo(() => {
//     const map = {};
//     upcoming.forEach((i) => {
//       const status = effectiveInterviewStatus(i);
//       map[status] = (map[status] || 0) + 1;
//     });
//     return Object.entries(map).map(([name, value]) => ({ name, value }));
//   }, [upcoming]);

//   // Filter fields for the table filter bar
//   const filterFields = [
//     { value: statusFilter, set: setStatusFilter, options: statuses, prefix: "Status" },
//     { value: roundFilter, set: setRoundFilter, options: rounds, prefix: "Round" },
//     { value: modeFilter, set: setModeFilter, options: modes, prefix: "Mode" },
//   ];

//   return (
//     <PageShell title="Interviews" onSearch={setQuery} searchPlaceholder="Search by candidate name...">
//       <div className="max-w-7xl mx-auto space-y-5 bg-white">
//         {/* Heading — white → red gradient banner */}
//         <div className="relative overflow-hidden bg-gradient-to-r from-white via-white to-white px-6 py-6">
//           <div className="pointer-events-none absolute bottom-0 left-1 h-24 w-20 rounded-full bg-crimson-600/30 blur-xl" />
//           <div className="relative flex items-center justify-between flex-wrap gap-3">
//             <div>
//               <h2 className="mt-1 flex items-center gap-2.5 text-2xl font-extrabold text-ink">
//                 <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-crimson-600 shadow-sm ring-1 ring-crimson-700/30">
//                   <CalendarClock className="h-5 w-5 text-white" />
//                 </span>
//                 {upcoming.length.toLocaleString()} upcoming interviews
//               </h2>
//             </div>
//             <div className="flex items-center gap-1.5 text-crimson-700 text-xs font-semibold bg-white/70 rounded-full px-3 py-1.5 ring-1 ring-crimson-200">
//               <Clock3 className="h-3.5 w-3.5" />
//               {todayCount} today · {tomorrowCount} tomorrow
//             </div>
//           </div>
//         </div>

//         {/* Charts row */}
//         <div className="grid grid-cols-12 gap-3">
//           <ChartCard title={`Next ${trendDays} days trend`} span="col-span-12 lg:col-span-5" height={260}>
//             <AreaChart data={next14Trend} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
//               <defs>
//                 <linearGradient id="interviewTrend" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%" stopColor={RED} stopOpacity={0.35} />
//                   <stop offset="95%" stopColor={RED} stopOpacity={0} />
//                 </linearGradient>
//               </defs>
//               <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" />
//               <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={2} angle={-35} textAnchor="end" height={45} />
//               <YAxis tick={{ fontSize: 11 }} allowDecimals={false} width={30} />
//               <Tooltip />
//               <Area type="monotone" dataKey="count" stroke={RED} fill="url(#interviewTrend)" strokeWidth={2} />
//             </AreaChart>
//           </ChartCard>

//           <ChartCard title="Interview mode" span="col-span-12 lg:col-span-4" height={260}>
//             <BarChart data={byModeCategory} layout="vertical" margin={{ left: 4, right: 24, top: 8, bottom: 0 }}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" horizontal={false} />
//               <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
//               <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
//               <Tooltip />
//               <Bar dataKey="value" fill={BLUE} radius={[0, 4, 4, 0]} />
//             </BarChart>
//           </ChartCard>

//           <ChartCard title="By round — today" span="col-span-12 lg:col-span-4" height={220}>
//             <BarChart data={byRoundToday} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" />
//               <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-15} textAnchor="end" height={45} />
//               <YAxis tick={{ fontSize: 10 }} allowDecimals={false} width={25} />
//               <Tooltip />
//               <Bar dataKey="value" fill={RED} radius={[4, 4, 0, 0]} />
//             </BarChart>
//           </ChartCard>

//           <ChartCard title="Online platforms" span="col-span-12 lg:col-span-4" height={220}>
//             <BarChart data={byOnlinePlatform} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" />
//               <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-15} textAnchor="end" height={45} />
//               <YAxis tick={{ fontSize: 10 }} allowDecimals={false} width={25} />
//               <Tooltip />
//               <Bar dataKey="value" fill={GREEN} radius={[4, 4, 0, 0]} />
//             </BarChart>
//           </ChartCard>
//         </div>

//         {/* Table with filters */}
//         <Card>
//           <div className="flex items-center flex-nowrap gap-2 px-3 py-2.5 border-b border-line bg-gradient-to-r from-cloud/70 to-cloud/30 rounded-t-xl overflow-x-auto scrollbar-thin">
//             <span className="flex items-center gap-1 text-[10px] font-semibold text-slate shrink-0 pr-1">
//               <SlidersHorizontal className="h-3.5 w-3.5" />
//               Filters
//             </span>
//             {filterFields.map((f) => (
//               <Select
//                 key={f.prefix}
//                 value={f.value}
//                 title={`${f.prefix}: ${f.value}`}
//                 onChange={(e) => f.set(e.target.value)}
//                 className={cx(
//                   "!py-1 !pl-2 !pr-5 !text-[10px] !rounded-full !border-line truncate",
//                   "shrink-0 shadow-sm hover:shadow transition-shadow hover:border-crimson-300",
//                   "hover:ring-2 hover:ring-crimson-500/20 focus:ring-2 focus:ring-crimson-500/30"
//                 )}
//                 style={{ width: 96 }}
//               >
//                 {f.options.map((s) => (
//                   <option key={s} value={s}>
//                     {f.prefix}: {s}
//                   </option>
//                 ))}
//               </Select>
//             ))}
//             <div className="flex-1" />
//             <Badge tone="default" className="shrink-0">
//               {dateColumns.length} dates · {matrix.length} candidates
//             </Badge>
//           </div>

//           <div className="overflow-x-auto scrollbar-thin">
//             {filteredMatrix.length === 0 ? (
//               <Text variant="small" color="muted" className="px-5 py-10 text-center block">
//                 {matrix.length === 0 ? "No upcoming interviews scheduled." : "No candidates match your filters."}
//               </Text>
//             ) : (
//               <table className="text-sm min-w-full">
//                 <thead>
//                   <tr className="border-b border-line bg-cloud/50">
//                     <th className="sticky left-0 bg-cloud/50 z-10 px-4 py-3 text-left font-semibold text-ink-soft whitespace-nowrap border-r border-line">
//                       Candidate
//                     </th>
//                     {dateColumns.map((col) => (
//                       <th key={col.key} className="px-3 py-2 text-center whitespace-nowrap min-w-[84px]">
//                         <p className={`text-xs font-bold ${col.label === "Today" ? "text-crimson-600" : "text-ink"}`}>{col.label}</p>
//                         {col.sub && <p className="text-[10px] text-slate font-normal">{col.sub}</p>}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredMatrix.map((row) => (
//                     <tr key={row.candidate} className="border-b border-line last:border-0 hover:bg-cloud/40">
//                       <td className="sticky left-0 bg-paper z-10 px-4 py-2.5 whitespace-nowrap border-r border-line">
//                         <div className="flex items-center gap-2">
//                           <Link to={`/candidates/${row.candidateId}`} className="font-semibold text-ink hover:text-crimson-600">
//                             {row.candidate}
//                           </Link>
//                           {row.statusCount > 1 && (
//                             <Badge tone="default" size="sm">{row.statusCount} statuses</Badge>
//                           )}
//                         </div>
//                       </td>
//                       {dateColumns.map((col) => {
//                         const count = row.counts[col.key] || 0;
//                         return (
//                           <td key={col.key} className="px-3 py-2.5 text-center">
//                             {count > 0 ? (
//                               <button
//                                 onClick={() => setCell({ candidate: row.candidate, candidateId: row.candidateId, dateKey: col.key })}
//                                 className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-crimson-50 text-crimson-600 font-semibold hover:bg-crimson-500 hover:text-white transition-colors shadow-sm hover:shadow"
//                               >
//                                 {count}
//                               </button>
//                             ) : (
//                               <span className="text-slate">—</span>
//                             )}
//                           </td>
//                         );
//                       })}
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </Card>
//       </div>

//       <Modal
//         open={!!cell}
//         onClose={() => setCell(null)}
//         title={cell?.candidate}
//         subtitle={cell ? `${formatFullDate(cell.dateKey)} · ${cellInterviews.length} interview${cellInterviews.length === 1 ? "" : "s"}` : ""}
//         wide
//       >
//         <DataTable columns={DETAIL_COLUMNS} rows={cellInterviews} emptyLabel="No interviews found" />
//         {cell?.candidateId && (
//           <div className="flex justify-end px-5 py-3 border-t border-line">
//             <Link to={`/candidates/${cell.candidateId}`}>
//               <Button variant="dark" size="sm" icon={UserRound}>
//                 View candidate profile
//               </Button>
//             </Link>
//           </div>
//         )}
//       </Modal>
//     </PageShell>
//   );
// }


import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, CalendarDays, TrendingUp, Clock3, UserRound, SlidersHorizontal, ChevronRight } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";
import PageShell from "../components/layout/PageShell";
import { Card, CardHeader, CardBody } from "../components/ui/Card";
import { Heading, Text } from "../components/ui/Typography";
import { Select } from "../components/ui/Input";
import StatCard from "../components/ui/StatCard";
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

const PALETTE = ["#c8102e", "#121214", "#86858f", "#ad0d27", "#4a4a52", "#8c0a1f", "#10b981", "#3b82f6"];
const RED = "#c8102e";
const GREEN = "#10b981";
const BLUE = "#3b82f6";

const ONLINE_PLATFORMS = ["MS Teams", "Zoom", "Google Meet"];
const MODE_CATEGORY = {
  "MS Teams": "Online", "Zoom": "Online", "Google Meet": "Online",
  "Telephonic": "Phone", "Face to Face": "Face to Face",
};

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
      <Link to={`/interviews/${r.InterviewID}`} className="text-slate hover:text-crimson-600">
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

  // Status options
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

  // --- columns: every date (from today onward) that actually has >=1 interview scheduled ---
  const dateColumns = useMemo(() => {
    const keys = [...new Set(upcoming.map((i) => dateKey(i.InterviewDate)))].sort();
    return keys.map((k) => ({
      key: k,
      label: relativeDayLabel(k, now) || formatShortDate(k),
      sub: relativeDayLabel(k, now) ? formatShortDate(k) : null,
      count: upcoming.filter((i) => dateKey(i.InterviewDate) === k).length,
    }));
  }, [upcoming, now]);

  // --- rows: every candidate with at least one upcoming interview ---
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

  // --- charts ---
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

  // TODAY'S interviews only
  const todayInterviews = useMemo(() => upcoming.filter((i) => diffInDays(i.InterviewDate, now) === 0), [upcoming, now]);

  const byRoundToday = useMemo(() => {
    const map = {};
    todayInterviews.forEach((i) => (map[i.InterviewRound] = (map[i.InterviewRound] || 0) + 1));
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [todayInterviews]);

  // Interview mode - TODAY only
  const byModeToday = useMemo(() => {
    const map = {};
    todayInterviews.forEach((i) => {
      const cat = MODE_CATEGORY[i.ModeOfRound] || i.ModeOfRound;
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [todayInterviews]);

  // Online platforms - TODAY only
  const byOnlinePlatformToday = useMemo(() => {
    const map = {};
    todayInterviews
      .filter((i) => ONLINE_PLATFORMS.includes(i.ModeOfRound))
      .forEach((i) => (map[i.ModeOfRound] = (map[i.ModeOfRound] || 0) + 1));
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [todayInterviews]);

  // Filter fields for the table filter bar
  const filterFields = [
    { value: statusFilter, set: setStatusFilter, options: statuses, prefix: "Status" },
    { value: roundFilter, set: setRoundFilter, options: rounds, prefix: "Round" },
    { value: modeFilter, set: setModeFilter, options: modes, prefix: "Mode" },
  ];

  return (
    <PageShell title="Interviews" onSearch={setQuery} searchPlaceholder="Search by candidate name...">
      <div className="max-w-7xl mx-auto space-y-5 bg-white">
        {/* Heading — white → red gradient banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-white via-white to-white px-6 py-6">
          <div className="pointer-events-none absolute bottom-0 left-1 h-24 w-20 rounded-full bg-crimson-600/30 blur-xl" />
          <div className="relative flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="mt-1 flex items-center gap-2.5 text-2xl font-extrabold text-ink">
                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-crimson-600 shadow-sm ring-1 ring-crimson-700/30">
                  <CalendarClock className="h-5 w-5 text-white" />
                </span>
                {upcoming.length.toLocaleString()} upcoming interviews
              </h2>
            </div>
            <div className="flex items-center gap-1.5 text-crimson-700 text-xs font-semibold bg-white/70 rounded-full px-3 py-1.5 ring-1 ring-crimson-200">
              <Clock3 className="h-3.5 w-3.5" />
              {todayCount} today · {tomorrowCount} tomorrow
            </div>
          </div>
        </div>

        {/* All statistics in a single row - 4 charts horizontally - ALL SHOW TODAY'S DATA */}
        <div className="mx-5">
          <div className="grid grid-cols-12 gap-3">
            <ChartCard title={`Next ${trendDays} days trend`} span="col-span-12 sm:col-span-6 lg:col-span-3" height={200}>
              <AreaChart data={next14Trend} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="interviewTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={RED} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={RED} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" />
                <XAxis dataKey="date" tick={{ fontSize: 8 }} interval={2} angle={-35} textAnchor="end" height={35} />
                <YAxis tick={{ fontSize: 9 }} allowDecimals={false} width={25} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke={RED} fill="url(#interviewTrend)" strokeWidth={2} />
              </AreaChart>
            </ChartCard>

            <ChartCard title="Interview mode (today)" span="col-span-12 sm:col-span-6 lg:col-span-3" height={200}>
              <BarChart data={byModeToday} layout="vertical" margin={{ left: 4, right: 24, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 8 }} />
                <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 8 }} />
                <Tooltip />
                <Bar dataKey="value" fill={BLUE} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartCard>

            <ChartCard title="By round (today)" span="col-span-12 sm:col-span-6 lg:col-span-3" height={200}>
              <BarChart data={byRoundToday} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" />
                <XAxis dataKey="name" tick={{ fontSize: 8 }} interval={0} angle={-15} textAnchor="end" height={35} />
                <YAxis tick={{ fontSize: 9 }} allowDecimals={false} width={20} />
                <Tooltip />
                <Bar dataKey="value" fill={RED} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartCard>

            <ChartCard title="Online platforms (today)" span="col-span-12 sm:col-span-6 lg:col-span-3" height={200}>
              <BarChart data={byOnlinePlatformToday} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" />
                <XAxis dataKey="name" tick={{ fontSize: 8 }} interval={0} angle={-15} textAnchor="end" height={35} />
                <YAxis tick={{ fontSize: 9 }} allowDecimals={false} width={20} />
                <Tooltip />
                <Bar dataKey="value" fill={GREEN} radius={[4, 4, 0, 0]} />
              </BarChart>
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
                    <tr className="border-b border-line bg-cloud/50">
                      <th className="sticky left-0 bg-cloud/50 z-10 px-4 py-3 text-left font-semibold text-ink-soft whitespace-nowrap border-r border-line">
                        Candidate
                      </th>
                      {dateColumns.map((col) => (
                        <th key={col.key} className="px-3 py-2 text-center whitespace-nowrap min-w-[84px]">
                          <p className={`text-xs font-bold ${col.label === "Today" ? "text-crimson-600" : "text-ink"}`}>{col.label}</p>
                          {col.sub && <p className="text-[10px] text-slate font-normal">{col.sub}</p>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMatrix.map((row) => (
                      <tr key={row.candidate} className="border-b border-line last:border-0 hover:bg-cloud/40">
                        <td className="sticky left-0 bg-paper z-10 px-4 py-2.5 whitespace-nowrap border-r border-line">
                          <div className="flex items-center gap-2">
                            <Link to={`/candidates/${row.candidateId}`} className="font-semibold text-ink hover:text-crimson-600">
                              {row.candidate}
                            </Link>
                            {row.statusCount > 1 && (
                              <Badge tone="default" size="sm">{row.statusCount} statuses</Badge>
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
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-crimson-50 text-crimson-600 font-semibold hover:bg-crimson-500 hover:text-white transition-colors shadow-sm hover:shadow"
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
          <div className="flex justify-end px-5 py-3 border-t border-line">
            <Link to={`/candidates/${cell.candidateId}`}>
              <Button variant="dark" size="sm" icon={UserRound}>
                View candidate profile
              </Button>
            </Link>
          </div>
        )}
      </Modal>
    </PageShell>
  );
}