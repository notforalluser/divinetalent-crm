// import { useEffect, useMemo, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import * as XLSX from "xlsx";
// import {
//   Download, ChevronLeft, Bookmark, Search, ChevronDown, CalendarRange, Award,
// } from "lucide-react";
// import {
//   ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
//   PieChart, Pie, Cell, Legend, ComposedChart, Line, AreaChart, Area,
// } from "recharts";
// import PageShell from "../components/layout/PageShell";
// import { Card, CardHeader, CardBody } from "../components/ui/Card";
// import { Heading, Text } from "../components/ui/Typography";
// import { Input } from "../components/ui/Input";
// import Button from "../components/ui/Button";
// import Badge from "../components/ui/Badge";
// import DataTable from "../components/ui/DataTable";
// import WatchList from "../components/ui/WatchList";
// import { useData } from "../context/DataContext";
// import { useSaved } from "../context/SavedContext";
// import { dateKey, nowIST, diffInDays, formatShortDate, formatFullDate, effectiveInterviewStatus } from "../lib/time";

// const PALETTE = ["#c8102e", "#121214", "#86858f", "#ad0d27"];

// function inRange(dateStr, start, end) {
//   const d = new Date(dateStr);
//   if (isNaN(d)) return false;
//   const k = dateKey(d);
//   return (!start || k >= start) && (!end || k <= end);
// }

// function weekKey(d) {
//   const date = new Date(d);
//   const onejan = new Date(date.getFullYear(), 0, 1);
//   const week = Math.ceil(((date - onejan) / 86400000 + onejan.getDay() + 1) / 7);
//   return `W${week} '${String(date.getFullYear()).slice(2)}`;
// }

// export default function CandidateDetail() {
//   const { candidateId } = useParams();
//   const navigate = useNavigate();
//   const { visible: data } = useData();
//   const { isSaved, toggleSaved } = useSaved();

//   const candidate = data.Candidates.find((c) => c.CandidateID === candidateId) || data.Candidates[0];
//   const isPlaced = candidate?.Status === "Placed";
//   const enrollKey = candidate ? dateKey(candidate.MarketingStartDate) : null;
//   const cappedEndKey = candidate ? (isPlaced ? dateKey(candidate.PlacementDate) : dateKey(nowIST())) : null;

//   const [start, setStart] = useState(enrollKey);
//   const [end, setEnd] = useState(cappedEndKey);
//   const [switcherQuery, setSwitcherQuery] = useState("");
//   const [switcherOpen, setSwitcherOpen] = useState(false);
//   const [granularity, setGranularity] = useState("daily");

//   // Reset the range whenever the candidate changes (switching via search).
//   useEffect(() => {
//     if (!candidate) return;
//     setStart(enrollKey);
//     setEnd(cappedEndKey);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [candidateId]);

//   const switcherMatches = useMemo(() => {
//     if (!switcherQuery) return [];
//     const q = switcherQuery.toLowerCase();
//     return data.Candidates.filter((c) => c.Name.toLowerCase().includes(q)).slice(0, 8);
//   }, [switcherQuery, data.Candidates]);

//   const marketingRows = useMemo(
//     () =>
//       data.MarketingActivity
//         .filter((m) => m.CandidateID === candidate?.CandidateID && inRange(m.Date, start, end))
//         .sort((a, b) => new Date(a.Date) - new Date(b.Date)),
//     [data.MarketingActivity, candidate, start, end]
//   );

//   const interviews = useMemo(
//     () =>
//       data.Interviews
//         .filter((i) => i.CandidateID === candidate?.CandidateID)
//         .sort((a, b) => new Date(a.InterviewDate) - new Date(b.InterviewDate)),
//     [data.Interviews, candidate]
//   );

//   // Split by InterviewDate relative to "today" (IST) -- completed vs still
//   // ongoing/upcoming. This is intentionally independent of the marketing
//   // date-range picker above: an upcoming interview should always be
//   // visible here, even though the marketing chart/table stops at today.
//   const completedInterviews = useMemo(
//     () => interviews.filter((i) => diffInDays(i.InterviewDate, nowIST()) < 0),
//     [interviews]
//   );
//   const upcomingInterviews = useMemo(
//     () => interviews.filter((i) => diffInDays(i.InterviewDate, nowIST()) >= 0),
//     [interviews]
//   );

//   // Single source of truth for "how many interviews landed on day X" --
//   // computed live from this candidate's actual Interviews rows (keyed by
//   // ReceivedDate, so a pending interview received today always counts
//   // today, regardless of its InterviewDate or Status). The sheet's own
//   // MarketingActivity.InterviewsScheduled column is NOT used for display
//   // anywhere below, so this table can never drift out of sync with the
//   // Interview Schedule page or the Completed/Upcoming tables above.
//   const interviewCountByReceivedDay = useMemo(() => {
//     const map = {};
//     interviews.forEach((i) => {
//       const k = dateKey(i.InterviewReceivedDate);
//       if (k) map[k] = (map[k] || 0) + 1;
//     });
//     return map;
//   }, [interviews]);

//   const totalApplications = marketingRows.reduce((s, r) => s + Number(r.ApplicationsCount || 0), 0);
//   const totalCompanyApps = marketingRows.reduce((s, r) => s + Number(r.CompanyApplications || 0), 0);
//   const totalFastTrackApps = marketingRows.reduce((s, r) => s + Number(r.FastTrackApplications || 0), 0);
//   const uniqueCompanies = new Set(interviews.map((i) => i.ClientName)).size;

//   const byRound = useMemo(() => {
//     const map = {};
//     interviews.forEach((i) => (map[i.InterviewRound] = (map[i.InterviewRound] || 0) + 1));
//     return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
//   }, [interviews]);

//   const byMode = useMemo(() => {
//     const map = {};
//     interviews.forEach((i) => (map[i.ModeOfRound] = (map[i.ModeOfRound] || 0) + 1));
//     return Object.entries(map).map(([name, value]) => ({ name, value }));
//   }, [interviews]);

//   const channelSplit = [
//     { name: "Company", value: totalCompanyApps },
//     { name: "Fast Track", value: totalFastTrackApps },
//   ];

//   const dailyTrend = useMemo(
//     () =>
//       marketingRows.map((m) => ({
//         date: formatShortDate(m.Date),
//         applications: Number(m.ApplicationsCount) || 0,
//         interviews: interviewCountByReceivedDay[dateKey(m.Date)] || 0,
//       })),
//     [marketingRows, interviewCountByReceivedDay]
//   );

//   const aggregatedTrend = useMemo(() => {
//     if (granularity === "daily") return dailyTrend;
//     const map = {};
//     marketingRows.forEach((m) => {
//       const key = weekKey(m.Date);
//       if (!map[key]) map[key] = { date: key, applications: 0, interviews: 0 };
//       map[key].applications += Number(m.ApplicationsCount) || 0;
//       map[key].interviews += interviewCountByReceivedDay[dateKey(m.Date)] || 0;
//     });
//     return Object.values(map);
//   }, [marketingRows, granularity, dailyTrend, interviewCountByReceivedDay]);

//   function downloadExcel() {
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([candidate]), "Profile");
//     XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(marketingRows), "MarketingActivity");
//     XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(interviews), "Interviews");
//     XLSX.writeFile(wb, `${candidate?.Name?.replace(/\s+/g, "_") || "candidate"}_report.xlsx`);
//   }

//   if (!candidate) {
//     return (
//       <PageShell title="Candidate">
//         <Text>No candidates found.</Text>
//       </PageShell>
//     );
//   }

//   const interviewColumns = [
//     { key: "InterviewReceivedDate", label: "Received", sortable: true },
//     { key: "InterviewDate", label: "Interview Date", sortable: true },
//     { key: "InterviewTime", label: "Time" },
//     { key: "JobRole", label: "Job Role" },
//     { key: "InterviewRound", label: "Round" },
//     { key: "ModeOfRound", label: "Mode" },
//     { key: "ClientName", label: "Client" },
//     { key: "JobType", label: "Job Type" },
//     { key: "Status", label: "Status", render: (r) => <Badge tone={effectiveInterviewStatus(r)}>{effectiveInterviewStatus(r)}</Badge> },
//   ];

//   const marketingDurationDays = diffInDays(cappedEndKey, enrollKey) + 1;

//   return (
//     <PageShell title="Candidate Intelligence">
//       <div className="max-w-7xl mx-auto space-y-5">
//         <div className="flex items-center justify-between flex-wrap gap-3">
//           <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-slate hover:text-ink">
//             <ChevronLeft className="h-4 w-4" /> Back
//           </button>

//           <div className="flex items-center gap-2 flex-wrap">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate" />
//               <input
//                 value={switcherQuery}
//                 onChange={(e) => {
//                   setSwitcherQuery(e.target.value);
//                   setSwitcherOpen(true);
//                 }}
//                 onFocus={() => setSwitcherOpen(true)}
//                 placeholder="Switch candidate..."
//                 className="w-56 rounded-lg border border-line bg-paper pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-500/40"
//               />
//               <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate pointer-events-none" />
//               {switcherOpen && switcherMatches.length > 0 && (
//                 <div className="absolute z-30 mt-1 w-full rounded-lg border border-line bg-paper shadow-lg py-1">
//                   {switcherMatches.map((c) => (
//                     <button
//                       key={c.CandidateID}
//                       onClick={() => {
//                         navigate(`/candidates/${c.CandidateID}`);
//                         setSwitcherQuery("");
//                         setSwitcherOpen(false);
//                       }}
//                       className="w-full text-left px-3 py-2 text-sm hover:bg-cloud"
//                     >
//                       {c.Name} <span className="text-slate text-xs">· {c.Technology}</span>
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>
//             <Input type="date" value={start} min={enrollKey} max={cappedEndKey} onChange={(e) => setStart(e.target.value)} className="w-40" />
//             <Input type="date" value={end} min={enrollKey} max={cappedEndKey} onChange={(e) => setEnd(e.target.value)} className="w-40" />
//             <Button variant="dark" size="sm" icon={Download} onClick={downloadExcel}>
//               Download Excel
//             </Button>
//           </div>
//         </div>

//         <Text variant="small" color="muted" className="flex items-center gap-1.5">
//           <CalendarRange className="h-3.5 w-3.5" />
//           Marketing window: {formatFullDate(enrollKey)} &rarr; {formatFullDate(cappedEndKey)}
//           {isPlaced ? " (placed)" : " (today -- no future dates shown, even if the sheet has them)"}
//         </Text>

//         <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
//           <div className="space-y-5">
//             <Card>
//               <CardHeader>
//                 <Heading variant="h3">Candidate profile</Heading>
//                 <Badge tone={candidate.Status}>{candidate.Status}</Badge>
//               </CardHeader>
//               <CardBody className="grid sm:grid-cols-3 gap-4">
//                 {[
//                   ["Candidate name", candidate.Name],
//                   ["Candidate email", candidate.Email],
//                   ["Team leader", candidate.TeamLeader],
//                   ["Recruiter", candidate.Recruiter],
//                   ["Technology", candidate.Technology],
//                   ["Visa status", candidate.VisaStatus],
//                   ["Marketing start date", formatFullDate(candidate.MarketingStartDate)],
//                   ["Placement date", candidate.PlacementDate ? formatFullDate(candidate.PlacementDate) : "Not yet placed"],
//                   ["Current location", candidate.CurrentLocation],
//                 ].map(([label, value]) => (
//                   <div key={label}>
//                     <Text variant="micro" color="muted" className="uppercase tracking-wide">
//                       {label}
//                     </Text>
//                     <p className="text-sm font-semibold text-ink mt-0.5">{value || "--"}</p>
//                   </div>
//                 ))}
//                 <div className="sm:col-span-3">
//                   <Text variant="micro" color="muted" className="uppercase tracking-wide">
//                     Skills
//                   </Text>
//                   <div className="flex flex-wrap gap-1.5 mt-1.5">
//                     {(candidate.Skills || "").split(",").filter(Boolean).map((s) => (
//                       <span key={s} className="rounded-full bg-cloud text-ink-soft text-xs font-medium px-2.5 py-0.5">
//                         {s.trim()}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               </CardBody>
//             </Card>

//             {isPlaced && (
//               <Card className="p-4 bg-ink text-white flex items-center gap-3">
//                 <Award className="h-8 w-8 text-crimson-500 shrink-0" />
//                 <Text variant="body" color="onDark">
//                   Placed on <strong>{formatFullDate(candidate.PlacementDate)}</strong> after{" "}
//                   <strong>{marketingDurationDays} days</strong> of active marketing.
//                 </Text>
//               </Card>
//             )}

//             <div className="grid sm:grid-cols-4 gap-4">
//               <Card className="p-5">
//                 <Text variant="eyebrow" color="muted">
//                   Marketing days
//                 </Text>
//                 <Heading variant="stat" className="mt-1">
//                   {marketingRows.length}
//                 </Heading>
//               </Card>
//               <Card className="p-5">
//                 <Text variant="eyebrow" color="muted">
//                   Applications submitted
//                 </Text>
//                 <Heading variant="stat" color="accent" className="mt-1">
//                   {totalApplications.toLocaleString()}
//                 </Heading>
//               </Card>
//               <Card className="p-5">
//                 <Text variant="eyebrow" color="muted">
//                   Total interviews
//                 </Text>
//                 <Heading variant="stat" className="mt-1">
//                   {interviews.length}
//                 </Heading>
//                 <Text variant="small" color="muted" className="mt-1">
//                   {completedInterviews.length} completed · {upcomingInterviews.length} upcoming
//                 </Text>
//               </Card>
//               <Card className="p-5">
//                 <Text variant="eyebrow" color="muted">
//                   Unique companies
//                 </Text>
//                 <Heading variant="stat" className="mt-1">
//                   {uniqueCompanies}
//                 </Heading>
//               </Card>
//             </div>

//             <Card>
//               <CardHeader>
//                 <div>
//                   <Text variant="eyebrow" color="accent">
//                     Momentum
//                   </Text>
//                   <Heading variant="h4" className="mt-0.5">
//                     Marketing activity, {marketingRows.length} day{marketingRows.length === 1 ? "" : "s"}
//                   </Heading>
//                 </div>
//               </CardHeader>
//               <CardBody className="h-56">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <AreaChart data={dailyTrend} margin={{ left: -20 }}>
//                     <defs>
//                       <linearGradient id="candAppsTrend" x1="0" y1="0" x2="0" y2="1">
//                         <stop offset="5%" stopColor="#c8102e" stopOpacity={0.35} />
//                         <stop offset="95%" stopColor="#c8102e" stopOpacity={0} />
//                       </linearGradient>
//                     </defs>
//                     <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" />
//                     <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={Math.ceil(dailyTrend.length / 10)} />
//                     <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
//                     <Tooltip />
//                     <Area type="monotone" dataKey="applications" stroke="#c8102e" fill="url(#candAppsTrend)" strokeWidth={2} />
//                   </AreaChart>
//                 </ResponsiveContainer>
//               </CardBody>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <div>
//                   <Heading variant="h4">Marketing vs. interviews</Heading>
//                   <Text variant="small" color="muted">
//                     Applications (bars) against interviews landed (line), per {granularity === "daily" ? "day" : "week"}
//                   </Text>
//                 </div>
//                 <div className="flex rounded-lg border border-line overflow-hidden">
//                   {["daily", "weekly"].map((g) => (
//                     <button
//                       key={g}
//                       onClick={() => setGranularity(g)}
//                       className={`px-3 py-1.5 text-xs font-semibold capitalize ${
//                         granularity === g ? "bg-ink text-white" : "bg-paper text-ink-soft hover:bg-cloud"
//                       }`}
//                     >
//                       {g}
//                     </button>
//                   ))}
//                 </div>
//               </CardHeader>
//               <CardBody className="h-56">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <ComposedChart data={aggregatedTrend}>
//                     <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" />
//                     <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={granularity === "daily" ? Math.ceil(aggregatedTrend.length / 10) : 0} />
//                     <YAxis yAxisId="left" tick={{ fontSize: 10 }} allowDecimals={false} />
//                     <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} allowDecimals={false} />
//                     <Tooltip />
//                     <Bar yAxisId="left" dataKey="applications" fill="#121214" radius={[3, 3, 0, 0]} />
//                     <Line yAxisId="right" type="monotone" dataKey="interviews" stroke="#c8102e" strokeWidth={2.5} dot={false} />
//                   </ComposedChart>
//                 </ResponsiveContainer>
//               </CardBody>
//             </Card>

//             <div className="grid sm:grid-cols-2 gap-4">
//               <Card>
//                 <CardHeader>
//                   <Heading variant="h4">Interviews by round</Heading>
//                 </CardHeader>
//                 <CardBody className="h-56">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <BarChart data={byRound} layout="vertical" margin={{ left: 10 }}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" horizontal={false} />
//                       <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
//                       <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} />
//                       <Tooltip />
//                       <Bar dataKey="value" fill="#c8102e" radius={[0, 4, 4, 0]} />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </CardBody>
//               </Card>

//               <Card>
//                 <CardHeader>
//                   <Heading variant="h4">Applications split</Heading>
//                 </CardHeader>
//                 <CardBody className="h-56">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <PieChart>
//                       <Pie data={channelSplit} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={3}>
//                         {channelSplit.map((_, i) => (
//                           <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
//                         ))}
//                       </Pie>
//                       <Tooltip />
//                       <Legend verticalAlign="bottom" height={24} iconSize={8} wrapperStyle={{ fontSize: 11 }} />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 </CardBody>
//               </Card>
//             </div>

//             {byMode.length > 0 && (
//               <Card>
//                 <CardHeader>
//                   <Heading variant="h4">Interviews by mode</Heading>
//                 </CardHeader>
//                 <CardBody className="h-48">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <BarChart data={byMode}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" />
//                       <XAxis dataKey="name" tick={{ fontSize: 10 }} />
//                       <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
//                       <Tooltip />
//                       <Bar dataKey="value" fill="#ad0d27" radius={[4, 4, 0, 0]} />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </CardBody>
//               </Card>
//             )}

//             <Card>
//               <CardHeader>
//                 <div>
//                   <Heading variant="h4">Daily marketing table</Heading>
//                   <Text variant="small" color="muted">
//                     Each column is one calendar day, from marketing start through {isPlaced ? "placement" : "today"}
//                   </Text>
//                 </div>
//               </CardHeader>
//               <CardBody className="overflow-x-auto scrollbar-thin !p-0">
//                 <table className="text-sm">
//                   <tbody>
//                     <tr className="border-b border-line">
//                       <td className="sticky left-0 bg-paper z-10 px-4 py-2.5 font-semibold text-ink-soft whitespace-nowrap border-r border-line">
//                         Date
//                       </td>
//                       {marketingRows.map((m) => (
//                         <td key={m.ActivityID} className="px-3 py-2.5 text-center whitespace-nowrap text-ink-soft">
//                           {formatShortDate(m.Date)}
//                         </td>
//                       ))}
//                     </tr>
//                     <tr className="border-b border-line bg-cloud/40">
//                       <td className="sticky left-0 bg-cloud/40 z-10 px-4 py-2.5 font-semibold text-ink-soft whitespace-nowrap border-r border-line">
//                         Day #
//                       </td>
//                       {marketingRows.map((m, i) => (
//                         <td key={m.ActivityID} className="px-3 py-2.5 text-center text-slate">
//                           {i + 1}
//                         </td>
//                       ))}
//                     </tr>
//                     <tr className="border-b border-line">
//                       <td className="sticky left-0 bg-paper z-10 px-4 py-2.5 font-semibold text-ink whitespace-nowrap border-r border-line">
//                         Applications
//                       </td>
//                       {marketingRows.map((m) => (
//                         <td key={m.ActivityID} className="px-3 py-2.5 text-center font-semibold text-ink">
//                           {m.ApplicationsCount}
//                         </td>
//                       ))}
//                     </tr>
//                     <tr className="border-b border-line">
//                       <td className="sticky left-0 bg-paper z-10 px-4 py-2.5 text-ink-soft whitespace-nowrap border-r border-line">
//                         Company
//                       </td>
//                       {marketingRows.map((m) => (
//                         <td key={m.ActivityID} className="px-3 py-2.5 text-center text-ink-soft">
//                           {m.CompanyApplications}
//                         </td>
//                       ))}
//                     </tr>
//                     <tr className="border-b border-line">
//                       <td className="sticky left-0 bg-paper z-10 px-4 py-2.5 text-ink-soft whitespace-nowrap border-r border-line">
//                         Fast Track
//                       </td>
//                       {marketingRows.map((m) => (
//                         <td key={m.ActivityID} className="px-3 py-2.5 text-center text-ink-soft">
//                           {m.FastTrackApplications}
//                         </td>
//                       ))}
//                     </tr>
//                     <tr>
//                       <td className="sticky left-0 bg-paper z-10 px-4 py-2.5 font-semibold text-crimson-600 whitespace-nowrap border-r border-line">
//                         Interviews
//                       </td>
//                       {marketingRows.map((m) => (
//                         <td key={m.ActivityID} className="px-3 py-2.5 text-center font-semibold text-crimson-600">
//                           {interviewCountByReceivedDay[dateKey(m.Date)] || 0}
//                         </td>
//                       ))}
//                     </tr>
//                   </tbody>
//                 </table>
//               </CardBody>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <Heading variant="h4">Completed interviews</Heading>
//                 <Badge tone="default">{completedInterviews.length} rows</Badge>
//               </CardHeader>
//               <DataTable columns={interviewColumns} rows={completedInterviews} emptyLabel="No completed interviews yet" />
//             </Card>

//             <Card>
//               <CardHeader>
//                 <div>
//                   <Heading variant="h4">Upcoming interviews</Heading>
//                   <Text variant="small" color="muted">
//                     Scheduled and still ongoing -- never shows a future-dated invite before it's received
//                   </Text>
//                 </div>
//                 <Badge tone="default">{upcomingInterviews.length} rows</Badge>
//               </CardHeader>
//               <DataTable columns={interviewColumns} rows={upcomingInterviews} emptyLabel="No upcoming interviews scheduled" />
//             </Card>
//           </div>

//           <div className="space-y-5">
//             <Card className="p-5 text-center">
//               <div className="h-16 w-16 rounded-full bg-crimson-50 text-crimson-600 flex items-center justify-center text-lg font-bold mx-auto">
//                 {candidate.Name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
//               </div>
//               <Heading variant="h4" className="mt-3">
//                 {candidate.Name}
//               </Heading>
//               <Text variant="small" color="muted">
//                 {candidate.Technology} · {candidate.ExperienceYears} yrs exp
//               </Text>
//               <Button
//                 variant={isSaved("candidates", candidate.CandidateID, candidate.Saved) ? "primary" : "subtle"}
//                 size="sm"
//                 icon={Bookmark}
//                 className="mt-4 w-full justify-center"
//                 onClick={() => toggleSaved("candidates", candidate.CandidateID, candidate.Saved)}
//               >
//                 {isSaved("candidates", candidate.CandidateID, candidate.Saved) ? "Saved" : "Save candidate"}
//               </Button>
//             </Card>
//             <WatchList />
//           </div>
//         </div>
//       </div>
//     </PageShell>
//   );
// }









import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft, Bookmark, Search, ChevronDown, Award,
  Calendar, Briefcase, MapPin, Mail, User, Code, Building,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, ComposedChart, Line, AreaChart, Area,
  RadialBarChart, RadialBar,
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

const PALETTE = ["#c8102e", "#121214", "#86858f", "#ad0d27", "#10b981", "#3b82f6"];
const RED = "#c8102e";
const GREEN = "#10b981";
const BLUE = "#3b82f6";
const ORANGE = "#f59e0b";
const PURPLE = "#8b5cf6";
const TEAL = "#14b8a6";
const PINK = "#ec4899";

const ONLINE_PLATFORMS = ["MS Teams", "Zoom", "Google Meet"];
const MODE_CATEGORY = {
  "MS Teams": "Online", "Zoom": "Online", "Google Meet": "Online",
  "Telephonic": "Phone", "Face to Face": "Face to Face",
};

function ChartCard({ title, span, children, height = 200, headerExtra }) {
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

function StatCard({ label, value, subtext, color = "crimson" }) {
  const colorMap = {
    crimson: "text-crimson-600",
    green: "text-green-600",
    blue: "text-blue-600",
    orange: "text-orange-600",
    ink: "text-ink",
  };
  return (
    <Card className="p-4">
      <Text variant="eyebrow" color="muted" className="text-xs">
        {label}
      </Text>
      <Heading variant="stat" className={`mt-1 ${colorMap[color]}`}>
        {value}
      </Heading>
      {subtext && <Text variant="small" color="muted" className="mt-1">{subtext}</Text>}
    </Card>
  );
}

function SmallChartCard({ title, children, height = 120 }) {
  return (
    <Card className="flex flex-col">
      <div className="px-4 pt-2.5 pb-1">
        <Text variant="micro" color="muted" className="uppercase tracking-wide font-bold">
          {title}
        </Text>
      </div>
      <CardBody className="!pt-0" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}

export default function CandidateDetail() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const { visible: data } = useData();
  const { isSaved, toggleSaved } = useSaved();

  const candidate = data.Candidates.find((c) => c.CandidateID === candidateId);
  const isPlaced = candidate?.Status === "Placed";
  const enrollKey = candidate ? dateKey(candidate.MarketingStartDate) : null;
  const cappedEndKey = candidate ? (isPlaced ? dateKey(candidate.PlacementDate) : dateKey(nowIST())) : null;

  const [switcherQuery, setSwitcherQuery] = useState("");
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [granularity, setGranularity] = useState("daily");

  const switcherMatches = useMemo(() => {
    if (!switcherQuery) return [];
    const q = switcherQuery.toLowerCase();
    return data.Candidates.filter((c) => c.Name.toLowerCase().includes(q)).slice(0, 8);
  }, [switcherQuery, data.Candidates]);

  const marketingRows = useMemo(
    () =>
      data.MarketingActivity
        .filter((m) => m.CandidateID === candidate?.CandidateID)
        .sort((a, b) => new Date(a.Date) - new Date(b.Date)),
    [data.MarketingActivity, candidate]
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

  const todayInterviews = useMemo(
    () => interviews.filter((i) => diffInDays(i.InterviewDate, nowIST()) === 0),
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

  const byModeToday = useMemo(() => {
    const map = {};
    todayInterviews.forEach((i) => {
      const cat = MODE_CATEGORY[i.ModeOfRound] || i.ModeOfRound;
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [todayInterviews]);

  const byRoundToday = useMemo(() => {
    const map = {};
    todayInterviews.forEach((i) => (map[i.InterviewRound] = (map[i.InterviewRound] || 0) + 1));
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [todayInterviews]);

  const byOnlinePlatformToday = useMemo(() => {
    const map = {};
    todayInterviews
      .filter((i) => ONLINE_PLATFORMS.includes(i.ModeOfRound))
      .forEach((i) => (map[i.ModeOfRound] = (map[i.ModeOfRound] || 0) + 1));
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [todayInterviews]);

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

  const aggregatedTrend = useMemo(() => {
    if (granularity === "daily") return dailyTrend;
    const map = {};
    marketingRows.forEach((m) => {
      const date = new Date(m.Date);
      const week = `W${Math.ceil(((date - new Date(date.getFullYear(), 0, 1)) / 86400000 + new Date(date.getFullYear(), 0, 1).getDay() + 1) / 7)}`;
      const key = `${week} '${String(date.getFullYear()).slice(2)}`;
      if (!map[key]) map[key] = { date: key, applications: 0, interviews: 0 };
      map[key].applications += Number(m.ApplicationsCount) || 0;
      map[key].interviews += interviewCountByReceivedDay[dateKey(m.Date)] || 0;
    });
    return Object.values(map);
  }, [marketingRows, granularity, interviewCountByReceivedDay]);

  const trendDays = 14;
  const next14Trend = useMemo(() => {
    const now = nowIST();
    return Array.from({ length: trendDays }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      const k = dateKey(date);
      return {
        date: formatShortDate(k),
        count: interviews.filter((iv) => dateKey(iv.InterviewReceivedDate) === k).length,
      };
    });
  }, [interviews]);

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

  // Sample data for radial charts
  const roundData = byRound.map((item, index) => ({
    ...item,
    fill: [RED, PURPLE, TEAL, ORANGE, PINK, BLUE][index % 6]
  }));

  return (
    <PageShell title="Candidate Intelligence">
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="mx-5">
          {/* Header with back and search */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-slate hover:text-ink">
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
                placeholder="Switch candidate..."
                className="w-56 rounded-lg border border-line bg-paper pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-500/40"
              />
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate pointer-events-none" />
              {switcherOpen && switcherMatches.length > 0 && (
                <div className="absolute z-30 mt-1 w-full rounded-lg border border-line bg-paper shadow-lg py-1">
                  {switcherMatches.map((c) => (
                    <button
                      key={c.CandidateID}
                      onClick={() => {
                        navigate(`/candidates/${c.CandidateID}`);
                        setSwitcherQuery("");
                        setSwitcherOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-cloud"
                    >
                      {c.Name} <span className="text-slate text-xs">· {c.Technology}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Two column layout - Profile + Stats */}
          <div className="grid lg:grid-cols-2 gap-5">
            {/* Left Column - Candidate Profile */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-crimson-50 text-crimson-600 flex items-center justify-center text-lg font-bold shrink-0">
                    {candidate.Name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Heading variant="h3" className="truncate">{candidate.Name}</Heading>
                      <Badge tone={candidate.Status}>{candidate.Status}</Badge>
                    </div>
                    <Text variant="small" color="muted">
                      {candidate.Technology} · {candidate.ExperienceYears} yrs exp
                    </Text>
                  </div>
                  <Button
                    variant={isSaved("candidates", candidate.CandidateID, candidate.Saved) ? "primary" : "subtle"}
                    size="sm"
                    icon={Bookmark}
                    onClick={() => toggleSaved("candidates", candidate.CandidateID, candidate.Saved)}
                  >
                    {isSaved("candidates", candidate.CandidateID, candidate.Saved) ? "Saved" : "Save"}
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 text-slate mt-0.5 shrink-0" />
                      <div>
                        <Text variant="micro" color="muted" className="uppercase tracking-wide">Recruiter</Text>
                        <p className="text-sm font-medium text-ink">{candidate.Recruiter || "--"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-slate mt-0.5 shrink-0" />
                      <div>
                        <Text variant="micro" color="muted" className="uppercase tracking-wide">Email</Text>
                        <p className="text-sm font-medium text-ink break-all">{candidate.Email || "--"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Code className="h-4 w-4 text-slate mt-0.5 shrink-0" />
                      <div>
                        <Text variant="micro" color="muted" className="uppercase tracking-wide">Technology</Text>
                        <p className="text-sm font-medium text-ink">{candidate.Technology || "--"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Building className="h-4 w-4 text-slate mt-0.5 shrink-0" />
                      <div>
                        <Text variant="micro" color="muted" className="uppercase tracking-wide">Team Leader</Text>
                        <p className="text-sm font-medium text-ink">{candidate.TeamLeader || "--"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-slate mt-0.5 shrink-0" />
                      <div>
                        <Text variant="micro" color="muted" className="uppercase tracking-wide">Location</Text>
                        <p className="text-sm font-medium text-ink">{candidate.CurrentLocation || "--"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-slate mt-0.5 shrink-0" />
                      <div>
                        <Text variant="micro" color="muted" className="uppercase tracking-wide">Marketing Start</Text>
                        <p className="text-sm font-medium text-ink">{formatFullDate(candidate.MarketingStartDate)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <Text variant="micro" color="muted" className="uppercase tracking-wide">Skills</Text>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {(candidate.Skills || "").split(",").filter(Boolean).map((s) => (
                        <span key={s} className="rounded-full bg-cloud text-ink-soft text-xs font-medium px-2.5 py-0.5">
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                  {candidate.VisaStatus && (
                    <div className="sm:col-span-2">
                      <Text variant="micro" color="muted" className="uppercase tracking-wide">Visa Status</Text>
                      <Badge tone="default" className="mt-1">{candidate.VisaStatus}</Badge>
                    </div>
                  )}
                  {isPlaced && (
                    <div className="sm:col-span-2 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
                      <Award className="h-5 w-5 text-green-600 shrink-0" />
                      <Text variant="small" className="text-green-800">
                        Placed on <strong>{formatFullDate(candidate.PlacementDate)}</strong> after <strong>{marketingDurationDays} days</strong>
                      </Text>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Right Column - Stats Cards */}
            <div className="grid grid-cols-2 gap-4 content-start">
              <StatCard label="Marketing Days" value={marketingRows.length} color="crimson" />
              <StatCard
                label="Applications Submitted"
                value={totalApplications.toLocaleString()}
                subtext={`${totalCompanyApps} Company · ${totalFastTrackApps} Fast Track`}
                color="blue"
              />
              <StatCard
                label="Total Interviews"
                value={interviews.length}
                subtext={`${completedInterviews.length} completed · ${upcomingInterviews.length} upcoming · ${todayInterviews.length} today`}
                color="green"
              />
              <StatCard label="Unique Companies" value={uniqueCompanies} color="orange" />
            </div>
          </div>

          {/* Statistics Row - Today's Data (only if today has interviews) */}
          {todayInterviews.length > 0 && (
            <div className="grid grid-cols-12 gap-3">
              <ChartCard title={`Next ${trendDays} days trend`} span="col-span-12 sm:col-span-6 lg:col-span-3" height={200}>
                <AreaChart data={next14Trend} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="candidateTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={RED} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={RED} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" />
                  <XAxis dataKey="date" tick={{ fontSize: 8 }} interval={2} angle={-35} textAnchor="end" height={35} />
                  <YAxis tick={{ fontSize: 9 }} allowDecimals={false} width={25} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke={RED} fill="url(#candidateTrend)" strokeWidth={2} />
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
                  <Bar dataKey="value" fill={PURPLE} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartCard>

              <ChartCard title="Online platforms (today)" span="col-span-12 sm:col-span-6 lg:col-span-3" height={200}>
                <BarChart data={byOnlinePlatformToday} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" />
                  <XAxis dataKey="name" tick={{ fontSize: 8 }} interval={0} angle={-15} textAnchor="end" height={35} />
                  <YAxis tick={{ fontSize: 9 }} allowDecimals={false} width={20} />
                  <Tooltip />
                  <Bar dataKey="value" fill={TEAL} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartCard>
            </div>
          )}

          {/* Marketing Activity with enhanced graph - Single line with shadow effect */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <Text variant="eyebrow" color="accent">Momentum</Text>
                  <Heading variant="h4" className="mt-0.5">
                    Marketing activity, {marketingRows.length} day{marketingRows.length === 1 ? "" : "s"}
                  </Heading>
                </div>
                <div className="flex rounded-lg border border-line overflow-hidden">
                  {["daily", "weekly"].map((g) => (
                    <button
                      key={g}
                      onClick={() => setGranularity(g)}
                      className={`px-3 py-1.5 text-xs font-semibold capitalize ${granularity === g ? "bg-ink text-white" : "bg-paper text-ink-soft hover:bg-cloud"
                        }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="h-56 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={aggregatedTrend}>
                    <defs>
                      <linearGradient id="applicationGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={RED} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={RED} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="interviewGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={GREEN} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" opacity={0.5} />
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={granularity === "daily" ? Math.ceil(aggregatedTrend.length / 10) : 0} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10 }} allowDecimals={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip />
                    {/* Line with gradient shadow for Applications */}
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="applications"
                      stroke={RED}
                      strokeWidth={2.5}
                      fill="url(#applicationGradient)"
                      dot={{ r: 3, fill: RED, strokeWidth: 1 }}
                    />
                    {/* Line with gradient shadow for Interviews */}
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="interviews"
                      stroke={GREEN}
                      strokeWidth={2.5}
                      fill="url(#interviewGradient)"
                      dot={{ r: 3, fill: GREEN, strokeWidth: 1 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Daily Marketing Table - Restored to original style */}
              <div className="overflow-x-auto scrollbar-thin">
                <table className="text-sm w-full">
                  <tbody>
                    <tr className="border-b border-line bg-cloud/30">
                      <td className="sticky left-0 bg-cloud/30 z-10 px-4 py-2.5 font-semibold text-ink whitespace-nowrap border-r border-line">
                        Date
                      </td>
                      {marketingRows.map((m) => (
                        <td key={m.ActivityID} className="px-3 py-2.5 text-center whitespace-nowrap text-ink-soft">
                          {formatShortDate(m.Date)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-line bg-cloud/20">
                      <td className="sticky left-0 bg-cloud/20 z-10 px-4 py-2.5 font-semibold text-ink-soft whitespace-nowrap border-r border-line">
                        Day #
                      </td>
                      {marketingRows.map((m, i) => (
                        <td key={m.ActivityID} className="px-3 py-2.5 text-center text-slate">
                          {i + 1}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-line">
                      <td className="sticky left-0 bg-paper z-10 px-4 py-2.5 font-semibold text-ink whitespace-nowrap border-r border-line">
                        Applications
                      </td>
                      {marketingRows.map((m) => (
                        <td key={m.ActivityID} className="px-3 py-2.5 text-center font-semibold text-ink">
                          {m.ApplicationsCount || 0}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-line">
                      <td className="sticky left-0 bg-paper z-10 px-4 py-2.5 text-ink-soft whitespace-nowrap border-r border-line">
                        Company
                      </td>
                      {marketingRows.map((m) => (
                        <td key={m.ActivityID} className="px-3 py-2.5 text-center text-ink-soft">
                          {m.CompanyApplications || 0}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-line">
                      <td className="sticky left-0 bg-paper z-10 px-4 py-2.5 text-ink-soft whitespace-nowrap border-r border-line">
                        Fast Track
                      </td>
                      {marketingRows.map((m) => (
                        <td key={m.ActivityID} className="px-3 py-2.5 text-center text-ink-soft">
                          {m.FastTrackApplications || 0}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-green-50/30">
                      <td className="sticky left-0 bg-green-50/30 z-10 px-4 py-2.5 font-semibold text-green-600 whitespace-nowrap border-r border-green-200">
                        Interviews
                      </td>
                      {marketingRows.map((m) => (
                        <td key={m.ActivityID} className="px-3 py-2.5 text-center font-bold text-green-600">
                          {interviewCountByReceivedDay[dateKey(m.Date)] || 0}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>

          {/* Additional Statistics - Small attractive charts */}
          <div className="grid grid-cols-2 gap-4">
            <SmallChartCard title="Interviews by round" height={160}>
              <PieChart>
                <Pie
                  data={roundData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={60}
                  paddingAngle={2}
                >
                  {roundData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  height={24}
                  iconSize={8}
                  iconType="circle"
                  wrapperStyle={{ fontSize: 10 }}
                />
              </PieChart>
            </SmallChartCard>

            <SmallChartCard title="Applications split" height={160}>
              <PieChart>
                <Pie
                  data={channelSplit}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={60}
                  paddingAngle={2}
                >
                  {channelSplit.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? BLUE : ORANGE} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  height={24}
                  iconSize={8}
                  iconType="circle"
                  wrapperStyle={{ fontSize: 10 }}
                />
              </PieChart>
            </SmallChartCard>
          </div>

          {/* Interview Tables */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <Heading variant="h4">Completed interviews</Heading>
                  <Text variant="small" color="muted">Interviews that have already happened</Text>
                </div>
                <Badge tone="default">{completedInterviews.length} rows</Badge>
              </div>
            </CardHeader>
            <DataTable columns={interviewColumns} rows={completedInterviews} emptyLabel="No completed interviews yet" />
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <Heading variant="h4">Upcoming interviews</Heading>
                  <Text variant="small" color="muted">Scheduled and still ongoing</Text>
                </div>
                <Badge tone="default">{upcomingInterviews.length} rows</Badge>
              </div>
            </CardHeader>
            <DataTable columns={interviewColumns} rows={upcomingInterviews} emptyLabel="No upcoming interviews scheduled" />
          </Card>
        </div>
      </div>
    </PageShell>
  );
}