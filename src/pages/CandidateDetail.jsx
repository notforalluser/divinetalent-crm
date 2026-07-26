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

const PALETTE = ["#c8102e", "#121214", "#86858f", "#ad0d27"];

const STATUS_COLORS = {
  Completed: "#10b981",
  Selected: "#059669",
  Rejected: "#c8102e",
  "No-Show": "#f59e0b",
  Rescheduled: "#3b82f6",
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

// Lightweight page background — same language as the Home dashboard, so
// candidate detail feels like part of the same modern CRM product.
function PageBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#f7f7fb]">
      <style>{`
        @keyframes floatBlobA { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-20px) scale(1.06); } }
        @keyframes floatBlobB { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-40px,20px) scale(1.08); } }
        .cd-blob-a { animation: floatBlobA 24s ease-in-out infinite; }
        .cd-blob-b { animation: floatBlobB 28s ease-in-out infinite; }
        .cd-grid {
          background-image: radial-gradient(circle, rgba(15,15,20,0.06) 1px, transparent 1px);
          background-size: 22px 22px;
          mask-image: radial-gradient(ellipse 80% 55% at 50% 10%, black 40%, transparent 90%);
        }
      `}</style>
      <div className="cd-grid absolute inset-0" />
      <div
        className="cd-blob-a absolute -top-28 -left-20 h-[24rem] w-[24rem] rounded-full blur-3xl opacity-30"
        style={{ background: "radial-gradient(circle, #c8102e 0%, transparent 70%)" }}
      />
      <div
        className="cd-blob-b absolute top-0 right-[-6rem] h-[22rem] w-[22rem] rounded-full blur-3xl opacity-25"
        style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/70" />
    </div>
  );
}

// Confetti + banner celebration, shown once whenever a placed candidate's
// profile is opened. Keyed by candidateId at the call site so switching to
// another placed candidate re-triggers it.
function PlacementCelebration({ name }) {
  const pieces = useMemo(() => {
    const colors = ["#c8102e", "#f59e0b", "#10b981", "#3b82f6", "#a855f7"];
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
        <Trophy className="h-4 w-4 text-crimson-500" />
        {name} was placed! 🎉
      </div>
    </div>
  );
}

// One aligned profile field tile — icon, label, value — used in the hero
// card grid so all four fields line up cleanly regardless of value length.
function ProfileField({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-cloud/40 hover:bg-cloud/70 transition-colors px-4 py-3">
      <span className="h-9 w-9 rounded-lg bg-white ring-1 ring-black/5 flex items-center justify-center shrink-0 text-crimson-600">
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
  const cardCx = "bg-white/85 backdrop-blur-sm ring-1 ring-black/5";

  return (
    <PageShell title="Candidate Intelligence">
      <PageBackground />
      {isPlaced && <PlacementCelebration key={candidateId} name={candidate.Name} />}

      <div className="max-w-7xl mx-auto space-y-5">
        {/* Top bar: back + candidate switcher only */}
        <div className="flex items-center justify-between flex-wrap gap-3 bg-white py-2">
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
              className="w-64 rounded-lg border border-line bg-paper pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-500/40"
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

        <div className="mx-5 space-y-3">

          {/* Hero: identity row on top, fields as their own clean grid below —
            gives every field equal width and room instead of squeezing next
            to the avatar block. */}
          <Card className={`${cardCx} p-5 sm:p-6 relative overflow-hidden`}>
            <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-crimson-500/20 to-transparent blur-3xl" />

            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-crimson-50 text-crimson-600 flex items-center justify-center text-lg font-bold shrink-0">
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

            <div className="relative mt-5 pt-5 border-t border-line flex flex-wrap items-center justify-between gap-3">
              <Text variant="small" color="muted" className="flex items-center gap-1.5">
                <CalendarRange className="h-3.5 w-3.5" />
                Marketing window: {formatFullDate(enrollKey)} &rarr; {formatFullDate(cappedEndKey)}
                {isPlaced ? " (placed)" : ""}
              </Text>
              <div className="flex flex-wrap gap-1.5">
                {(candidate.Skills || "").split(",").filter(Boolean).map((s) => (
                  <span key={s} className="rounded-full bg-cloud text-ink-soft text-xs font-medium px-2.5 py-0.5">
                    {s.trim()}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {isPlaced && (
            <Card className="p-4 text-black flex items-center gap-3">
              <Award className="h-8 w-8 text-crimson-500 shrink-0" />
              <Text variant="body">
                Placed on <strong>{formatFullDate(candidate.PlacementDate)}</strong> after{" "}
                <strong>{marketingDurationDays} days</strong> of active marketing.
              </Text>
            </Card>
          )}

          {/* Stat strip */}
          <div className="grid sm:grid-cols-4 gap-4">
            <Card className={`${cardCx} p-5`}>
              <Text variant="eyebrow" color="muted">Marketing days</Text>
              <Heading variant="stat" className="mt-1">{marketingRows.length}</Heading>
            </Card>
            <Card className={`${cardCx} p-5`}>
              <Text variant="eyebrow" color="muted">Applications submitted</Text>
              <Heading variant="stat" color="accent" className="mt-1">{totalApplications.toLocaleString()}</Heading>
            </Card>
            <Card className={`${cardCx} p-5`}>
              <Text variant="eyebrow" color="muted">Total interviews</Text>
              <Heading variant="stat" className="mt-1">{interviews.length}</Heading>
              <Text variant="small" color="muted" className="mt-1">
                {completedInterviews.length} completed · {upcomingInterviews.length} upcoming
              </Text>
            </Card>
            <Card className={`${cardCx} p-5`}>
              <Text variant="eyebrow" color="muted">Unique companies</Text>
              <Heading variant="stat" className="mt-1">{uniqueCompanies}</Heading>
            </Card>
          </div>

          {/* Momentum — applications + interviews combined into one chart,
            replacing the old separate "Marketing vs. interviews" chart. */}
          <Card className={cardCx}>
            <CardHeader>
              <div>
                <Text variant="eyebrow" color="accent">Momentum</Text>
                <Heading variant="h4" className="mt-0.5">
                  Marketing activity, {marketingRows.length} day{marketingRows.length === 1 ? "" : "s"}
                </Heading>
                <Text variant="small" color="muted" className="mt-0.5">
                  Applications (area) against interviews landed (line), per {granularity === "daily" ? "day" : "week"}
                </Text>
              </div>
              <div className="flex rounded-lg border border-line overflow-hidden">
                {["daily", "weekly"].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGranularity(g)}
                    className={`px-3 py-1.5 text-xs font-semibold capitalize ${granularity === g ? "bg-crimson-500 text-white" : "bg-paper text-ink-soft hover:bg-cloud"
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
                      <stop offset="5%" stopColor="#c8102e" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#c8102e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 9 }}
                    interval={granularity === "daily" ? Math.ceil(aggregatedTrend.length / 10) : 0}
                  />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend verticalAlign="top" height={28} iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="applications"
                    name="Applications"
                    stroke="#1e1ec9"
                    fill="url(#candAppsTrend)"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="interviews"
                    name="Interviews"
                    stroke="#2fb320"
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
              <Card className={cardCx}>
                <CardHeader>
                  <div>
                    <Heading variant="h4">Daily marketing table</Heading>
                    <Text variant="small" color="muted">
                      Each column is one calendar day, from marketing start through {isPlaced ? "placement" : "today"}
                    </Text>
                  </div>
                </CardHeader>
                <CardBody className="overflow-x-auto scrollbar-thin !p-0">
                  <table className="text-sm">
                    <tbody>
                      <tr className="border-b border-line">
                        <td className="sticky left-0 bg-paper z-10 px-4 py-2.5 font-semibold text-ink-soft whitespace-nowrap border-r border-line">
                          Date
                        </td>
                        {marketingRows.map((m) => (
                          <td key={m.ActivityID} className="px-3 py-2.5 text-center whitespace-nowrap text-ink-soft">
                            {formatShortDate(m.Date)}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-line bg-cloud/40">
                        <td className="sticky left-0 bg-cloud/40 z-10 px-4 py-2.5 font-semibold text-ink-soft whitespace-nowrap border-r border-line">
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
                            {m.ApplicationsCount}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-line">
                        <td className="sticky left-0 bg-paper z-10 px-4 py-2.5 text-ink-soft whitespace-nowrap border-r border-line">
                          Company
                        </td>
                        {marketingRows.map((m) => (
                          <td key={m.ActivityID} className="px-3 py-2.5 text-center text-ink-soft">
                            {m.CompanyApplications}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-line">
                        <td className="sticky left-0 bg-paper z-10 px-4 py-2.5 text-ink-soft whitespace-nowrap border-r border-line">
                          Fast Track
                        </td>
                        {marketingRows.map((m) => (
                          <td key={m.ActivityID} className="px-3 py-2.5 text-center text-ink-soft">
                            {m.FastTrackApplications}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="sticky left-0 bg-paper z-10 px-4 py-2.5 font-semibold text-crimson-600 whitespace-nowrap border-r border-line">
                          Interviews
                        </td>
                        {marketingRows.map((m) => (
                          <td key={m.ActivityID} className="px-3 py-2.5 text-center font-semibold text-crimson-600">
                            {interviewCountByReceivedDay[dateKey(m.Date)] || 0}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </CardBody>
              </Card>

              <Card className={cardCx}>
                <CardHeader>
                  <Heading variant="h4">Completed interviews</Heading>
                  <Badge tone="default">{completedInterviews.length} rows</Badge>
                </CardHeader>
                <DataTable columns={interviewColumns} rows={completedInterviews} emptyLabel="No completed interviews yet" />
              </Card>

              <Card className={cardCx}>
                <CardHeader>
                  <div>
                    <Heading variant="h4">Upcoming interviews</Heading>
                    <Text variant="small" color="muted">
                      Scheduled and still ongoing -- never shows a future-dated invite before it's received
                    </Text>
                  </div>
                  <Badge tone="default">{upcomingInterviews.length} rows</Badge>
                </CardHeader>
                <DataTable columns={interviewColumns} rows={upcomingInterviews} emptyLabel="No upcoming interviews scheduled" />
              </Card>
            </div>

            {/* Right column — charts, single column stacked */}
            <div className="space-y-4">
              <Card className={cardCx}>
                <CardHeader>
                  <Heading variant="h4">Interviews by round</Heading>
                </CardHeader>
                <CardBody className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byRound} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#c8102e" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>

              <Card className={cardCx}>
                <CardHeader>
                  <Heading variant="h4">Applications split</Heading>
                </CardHeader>
                <CardBody className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={channelSplit} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={3}>
                        {channelSplit.map((_, i) => (
                          <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={24} iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>

              {byMode.length > 0 && (
                <Card className={cardCx}>
                  <CardHeader>
                    <Heading variant="h4">Interviews by mode</Heading>
                  </CardHeader>
                  <CardBody className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={byMode}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#ad0d27" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardBody>
                </Card>
              )}

              {byStatus.length > 0 && (
                <Card className={cardCx}>
                  <CardHeader>
                    <Heading variant="h4">Interview outcomes</Heading>
                  </CardHeader>
                  <CardBody className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={3}>
                          {byStatus.map((entry, i) => (
                            <Cell key={i} fill={STATUS_COLORS[entry.name] || PALETTE[i % PALETTE.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
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