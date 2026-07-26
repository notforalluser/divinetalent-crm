// import { useMemo, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   Upload, Sparkles, Briefcase, Building2, Globe2, Zap, ChevronRight, UserPlus,
//   CalendarClock, Trophy, Activity as ActivityIcon, Bookmark, Users, UsersRound,
// } from "lucide-react";
// import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
// import { dateKey, nowIST, addDays, diffInDays, timeAgo, startOfDay, effectiveInterviewStatus } from "../lib/time";
// import PageShell from "../components/layout/PageShell";
// import { Card, CardHeader, CardBody } from "../components/ui/Card";
// import { Heading, Text } from "../components/ui/Typography";
// import Button from "../components/ui/Button";
// import Badge from "../components/ui/Badge";
// import WatchList from "../components/ui/WatchList";
// import { useAuth } from "../context/AuthContext";
// import { useData } from "../context/DataContext";
// import { useSaved } from "../context/SavedContext";

// const STATUS_BORDER = {
//   Completed: "border-l-emerald-400",
//   Selected: "border-l-emerald-500",
//   Rejected: "border-l-crimson-500",
//   "No-Show": "border-l-amber-400",
//   Rescheduled: "border-l-blue-400",
//   "Pending Feedback": "border-l-ink/20",
// };

// const ACTIVITY_ICONS = {
//   "Added candidate": UserPlus,
//   "Updated status": ActivityIcon,
//   "Scheduled interview": CalendarClock,
//   "Uploaded resume": UserPlus,
//   "Marked as Placed": Trophy,
//   "Sent to client": Building2,
//   "Saved candidate": Bookmark,
//   "Saved job": Bookmark,
//   "Saved recruiter": Bookmark,
//   "Updated job posting": Briefcase,
//   "Added recruiter": UsersRound,
// };

// function daysAgo(dateStr, refDate) {
//   const d = new Date(dateStr);
//   if (isNaN(d)) return Infinity;
//   return Math.round((refDate - d) / 86400000);
// }

// export default function Home() {
//   const { user } = useAuth();
//   const { visible: data } = useData();
//   const { isSaved: isSavedCtx } = useSaved();
//   const navigate = useNavigate();
//   const [query, setQuery] = useState("");
//   const fileRef = useState(null)[0];

//   const jobs = data.Jobs;
//   const candidates = data.Candidates;

//   const stats = useMemo(() => {
//     const maxDate = jobs.reduce((m, j) => {
//       const d = new Date(j.PostedDate);
//       return !isNaN(d) && d > m ? d : m;
//     }, new Date(0));
//     const activeJobs = jobs.filter((j) => j.Status === "Active").length;
//     const companies = new Set(jobs.map((j) => j.Company)).size;
//     const countries = new Set(jobs.map((j) => j.Country)).size;
//     const fresh = jobs.filter((j) => daysAgo(j.PostedDate, maxDate) <= 7).length;
//     return { activeJobs, companies, countries, fresh };
//   }, [jobs]);

//   const recap = useMemo(() => {
//     const sorted = [...candidates].sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
//     if (!query.trim()) return sorted.slice(0, 6);
//     const q = query.trim().toLowerCase();
//     return sorted
//       .filter(
//         (c) =>
//           c.Name.toLowerCase().includes(q) ||
//           (c.Technology || "").toLowerCase().includes(q) ||
//           (c.CurrentLocation || "").toLowerCase().includes(q)
//       )
//       .slice(0, 8);
//   }, [candidates, query]);

//   const appsTrend = useMemo(() => {
//     const days = 14;
//     const map = {};
//     const now = nowIST();
//     for (let i = days - 1; i >= 0; i--) {
//       const d = addDays(now, -i);
//       map[dateKey(d)] = 0;
//     }
//     data.MarketingActivity.forEach((a) => {
//       const key = dateKey(a.Date);
//       if (key in map) map[key] += Number(a.ApplicationsCount) || 0;
//     });
//     return Object.entries(map).map(([date, count]) => ({
//       date: new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
//       count,
//     }));
//   }, [data.MarketingActivity]);

//   const readyToReview = candidates.filter((c) => c.Status === "Active").length;

//   const weekGlance = useMemo(() => {
//     const now = nowIST();
//     const today = startOfDay(now);
//     const newThisWeek = candidates.filter((c) => diffInDays(now, c.CreatedAt) <= 7 && new Date(c.CreatedAt) <= now).length;
//     const interviewsToday = data.Interviews.filter((i) => diffInDays(i.InterviewDate, now) === 0).length;
//     const interviewsWeek = data.Interviews.filter((i) => {
//       const d = diffInDays(i.InterviewDate, now);
//       return d >= 0 && d <= 6;
//     }).length;
//     const placedThisMonth = candidates.filter(
//       (c) => c.PlacementDate && diffInDays(now, c.PlacementDate) <= 30 && diffInDays(now, c.PlacementDate) >= 0
//     ).length;
//     return { newThisWeek, interviewsToday, interviewsWeek, placedThisMonth, today };
//   }, [candidates, data.Interviews]);

//   // Placements per week, last 8 weeks -- shows hiring momentum over time,
//   // not just a single-day/month snapshot.
//   const placementsTrend = useMemo(() => {
//     const now = nowIST();
//     const weeks = 8;
//     const buckets = Array.from({ length: weeks }, (_, i) => {
//       const weeksAgo = weeks - 1 - i;
//       const start = addDays(startOfDay(now), -(weeksAgo * 7 + 6));
//       const end = addDays(startOfDay(now), -(weeksAgo * 7));
//       return { start, end, count: 0 };
//     });
//     candidates
//       .filter((c) => c.PlacementDate)
//       .forEach((c) => {
//         const d = new Date(c.PlacementDate);
//         const bucket = buckets.find((b) => d >= b.start && d <= b.end);
//         if (bucket) bucket.count += 1;
//       });
//     return buckets.map((b) => ({
//       week: `${b.start.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`,
//       count: b.count,
//     }));
//   }, [candidates]);

//   const recentActivity = useMemo(
//     () => [...data.Activity].sort((a, b) => new Date(b.Date) - new Date(a.Date)).slice(0, 6),
//     [data.Activity]
//   );

//   const savedCounts = useMemo(
//     () => ({
//       candidates: candidates.filter((c) => isSavedCtx("candidates", c.CandidateID, c.Saved)).length,
//       jobs: jobs.filter((j) => isSavedCtx("jobs", j.JobID, j.Saved)).length,
//       recruiters: data.Recruiters.filter((r) => isSavedCtx("recruiters", r.RecruiterID, r.Saved)).length,
//     }),
//     [candidates, jobs, data.Recruiters, isSavedCtx]
//   );

//   // Sorted strictly by Received Date, most recent first (25th, then 24th,
//   // then 23rd...) -- this is `data.Interviews`, the exact same
//   // ReceivedDate-filtered array the Interview Schedule page and every
//   // candidate's profile read from, so this list can never drift out of
//   // sync with either of those views.
//   const RECENT_INTERVIEW_CAP = 8;
//   const recentInterviews = useMemo(
//     () =>
//       [...data.Interviews]
//         .sort((a, b) => new Date(b.InterviewReceivedDate) - new Date(a.InterviewReceivedDate))
//         .slice(0, RECENT_INTERVIEW_CAP),
//     [data.Interviews]
//   );

//   const recentTechHelp = useMemo(
//     () => [...data.TechnicalHelp].sort((a, b) => new Date(b.Date) - new Date(a.Date)).slice(0, 5),
//     [data.TechnicalHelp]
//   );

//   const compactNumber = (n) =>
//     new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n || 0);

//   return (
//     <PageShell title="Home" onSearch={setQuery}>
//       <div className="max-w-6xl mx-auto space-y-4 px-4 sm:px-0">
//         <div className="bg-white p-4 sm:p-5 lg:p-8 relative overflow-hidden">
//           {/* Top-right gradient spot */}
//           <div className="pointer-events-none absolute -top-24 -right-24 h-40 w-100 rounded-full bg-gradient-to-br from-crimson-500/30 via-crimson-400/10 to-transparent blur-3xl animate-pulse" />

//           <div>
//             <Heading variant="display" className="max-w-2xl relative z-10 text-2xl sm:text-3xl lg:text-4xl">
//               Match candidates to <span className="text-crimson-500">real opportunities</span> in seconds.
//             </Heading>
//             <Text variant="bodyLg" color="muted" className="mt-3 max-w-xl relative z-10 text-sm sm:text-base">
//               Search a live pool of direct-employer roles pulled straight from your workbook, or upload a resume and let
//               AI Match surface the strongest fits across every active listing.
//             </Text>
//           </div>

//           <div className="grid lg:grid-cols-[1.3fr_2fr] gap-4 items-stretch relative z-10 mt-4">
//             <Card className="relative overflow-hidden text-white p-4 sm:p-6 flex flex-col justify-between bg-gradient-to-r from-crimson-700 to-crimson-500">
//               <svg
//                 className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 opacity-20"
//                 viewBox="0 0 200 200"
//                 fill="none"
//               >
//                 <circle cx="100" cy="100" r="90" stroke="white" strokeWidth="1" strokeDasharray="2 6" />
//                 <circle cx="100" cy="100" r="65" stroke="white" strokeWidth="1" strokeDasharray="2 6" />
//               </svg>
//               <div className="pointer-events-none absolute -left-10 -bottom-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

//               <div className="relative">
//                 <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white mb-4 backdrop-blur-sm">
//                   <Sparkles className="h-3 w-3" /> AI MATCH · BETA
//                 </span>
//                 <Heading variant="h3" color="onDark" className="text-lg sm:text-xl">
//                   Upload a resume. Get a ranked job list in seconds.
//                 </Heading>
//                 <Text variant="small" color="onDarkMuted" className="mt-2 max-w-sm text-sm">
//                   Drop a candidate's resume, and we'll surface the strongest-matching jobs — ranked by skills, role,
//                   and location.
//                 </Text>
//               </div>
//               <div className="relative flex flex-wrap items-center gap-3 mt-5">
//                 <Button
//                   variant="primary"
//                   icon={Upload}
//                   onClick={() => navigate("/ai-match")}
//                   className="bg-red-800 text-crimson-600 hover:bg-crimson-50 shadow-sm text-sm"
//                 >
//                   Upload resume
//                 </Button>
//                 <Link
//                   to="/candidates"
//                   className="text-xs font-semibold text-white/85 hover:text-white inline-flex items-center gap-1 transition-colors"
//                 >
//                   View all candidates <ChevronRight className="h-3.5 w-3.5" />
//                 </Link>
//               </div>
//             </Card>

//             <div className="flex flex-col">
//               {/* First row - 4 stat cards with vertical dividers */}
//               <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 relative border-b border-gray-200">
//                 {/* Stat 1 */}
//                 <div className="relative px-2 sm:px-3 py-3 sm:py-4 border-r border-gray-200 flex items-center justify-center">
//                   <div className="text-center">
//                     <Text variant="eyebrow" color="muted" className="text-[8px] sm:text-[10px] tracking-wide leading-tight uppercase">
//                       Active jobs
//                     </Text>
//                     <Heading variant="stat" color="accent" className="relative mt-1 text-lg sm:text-xl lg:text-2xl" style={{ fontSize: "clamp(1rem, 2vw, 1.5rem)", lineHeight: "1.75rem" }}>
//                       {compactNumber(stats.activeJobs)}
//                     </Heading>
//                     <Text variant="small" color="muted" className="relative mt-0.5 text-[9px] sm:text-[11px]">
//                       across markets
//                     </Text>
//                   </div>
//                 </div>

//                 {/* Stat 2 */}
//                 <div className="relative px-2 sm:px-3 py-3 sm:py-4 border-r border-gray-200 flex items-center justify-center">
//                   <div className="text-center">
//                     <Text variant="eyebrow" color="muted" className="text-[8px] sm:text-[10px] tracking-wide leading-tight uppercase">
//                       Companies
//                     </Text>
//                     <Heading variant="stat" color="accent" className="relative mt-1 text-lg sm:text-xl lg:text-2xl" style={{ fontSize: "clamp(1rem, 2vw, 1.5rem)", lineHeight: "1.75rem" }}>
//                       {compactNumber(stats.companies)}
//                     </Heading>
//                     <Text variant="small" color="muted" className="relative mt-0.5 text-[9px] sm:text-[11px]">
//                       hiring now
//                     </Text>
//                   </div>
//                 </div>

//                 {/* Stat 3 */}
//                 <div className="relative px-2 sm:px-3 py-3 sm:py-4 border-r border-gray-200 flex items-center justify-center">
//                   <div className="text-center">
//                     <Text variant="eyebrow" color="muted" className="text-[8px] sm:text-[10px] tracking-wide leading-tight uppercase">
//                       Countries
//                     </Text>
//                     <Heading variant="stat" color="accent" className="relative mt-1 text-lg sm:text-xl lg:text-2xl" style={{ fontSize: "clamp(1rem, 2vw, 1.5rem)", lineHeight: "1.75rem" }}>
//                       {stats.countries}
//                     </Heading>
//                     <Text variant="small" color="muted" className="relative mt-0.5 text-[9px] sm:text-[11px]">
//                       global reach
//                     </Text>
//                   </div>
//                 </div>

//                 {/* Stat 4 */}
//                 <div className="relative px-2 sm:px-3 py-3 sm:py-4 flex items-center justify-center">
//                   <div className="text-center">
//                     <Text variant="eyebrow" color="muted" className="text-[8px] sm:text-[10px] tracking-wide leading-tight uppercase">
//                       Fresh · 7 days
//                     </Text>
//                     <Heading variant="stat" color="accent" className="relative mt-1 text-lg sm:text-xl lg:text-2xl" style={{ fontSize: "clamp(1rem, 2vw, 1.5rem)", lineHeight: "1.75rem" }}>
//                       {compactNumber(stats.fresh)}
//                     </Heading>
//                     <Text variant="small" color="muted" className="relative mt-0.5 text-[9px] sm:text-[11px]">
//                       just posted
//                     </Text>
//                   </div>
//                 </div>
//               </div>

//               {/* Horizontal divider with "This week at a glance" */}
//               <div className="relative py-2 sm:py-3">
//                 <div className="absolute inset-0 flex items-center">
//                   <div className="w-full h-[1px] bg-gray-200" />
//                 </div>
//                 <div className="relative flex justify-center">
//                   <span className="px-3 sm:px-4 py-0.5 bg-white text-[8px] sm:text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
//                     This week at a glance
//                   </span>
//                 </div>
//               </div>

//               {/* Second row - 4 stat cards with vertical dividers */}
//               <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 relative">
//                 {/* Stat 5 */}
//                 <div className="relative px-2 sm:px-3 py-3 sm:py-4 border-r border-gray-200 flex items-center justify-center">
//                   <div className="text-center">
//                     <Text variant="eyebrow" color="muted" className="text-[8px] sm:text-[10px] tracking-wide leading-tight uppercase">
//                       New candidates
//                     </Text>
//                     <Heading variant="stat" color="primary" className="relative mt-1 text-lg sm:text-xl lg:text-2xl" style={{ fontSize: "clamp(1rem, 2vw, 1.5rem)", lineHeight: "1.75rem" }}>
//                       {weekGlance.newThisWeek}
//                     </Heading>
//                     <Text variant="small" color="muted" className="relative mt-0.5 text-[9px] sm:text-[11px]">
//                       joined this week
//                     </Text>
//                   </div>
//                 </div>

//                 {/* Stat 6 */}
//                 <div className="relative px-2 sm:px-3 py-3 sm:py-4 border-r border-gray-200 flex items-center justify-center">
//                   <div className="text-center">
//                     <Text variant="eyebrow" color="muted" className="text-[8px] sm:text-[10px] tracking-wide leading-tight uppercase">
//                       Interviews today
//                     </Text>
//                     <Heading variant="stat" color="accent" className="relative mt-1 text-lg sm:text-xl lg:text-2xl" style={{ fontSize: "clamp(1rem, 2vw, 1.5rem)", lineHeight: "1.75rem" }}>
//                       {weekGlance.interviewsToday}
//                     </Heading>
//                     <Text variant="small" color="muted" className="relative mt-0.5 text-[9px] sm:text-[11px]">
//                       {weekGlance.today.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
//                     </Text>
//                   </div>
//                 </div>

//                 {/* Stat 7 */}
//                 <div className="relative px-2 sm:px-3 py-3 sm:py-4 border-r border-gray-200 flex items-center justify-center">
//                   <div className="text-center">
//                     <Text variant="eyebrow" color="muted" className="text-[8px] sm:text-[10px] tracking-wide leading-tight uppercase">
//                       Interviews · week
//                     </Text>
//                     <Heading variant="stat" color="primary" className="relative mt-1 text-lg sm:text-xl lg:text-2xl" style={{ fontSize: "clamp(1rem, 2vw, 1.5rem)", lineHeight: "1.75rem" }}>
//                       {weekGlance.interviewsWeek}
//                     </Heading>
//                     <Text variant="small" color="muted" className="relative mt-0.5 text-[9px] sm:text-[11px]">
//                       today +6 days
//                     </Text>
//                   </div>
//                 </div>

//                 {/* Stat 8 */}
//                 <div className="relative px-2 sm:px-3 py-3 sm:py-4 flex items-center justify-center">
//                   <div className="text-center">
//                     <Text variant="eyebrow" color="muted" className="text-[8px] sm:text-[10px] tracking-wide leading-tight uppercase">
//                       Placements
//                     </Text>
//                     <Heading variant="stat" color="primary" className="relative mt-1 text-lg sm:text-xl lg:text-2xl" style={{ fontSize: "clamp(1rem, 2vw, 1.5rem)", lineHeight: "1.75rem" }}>
//                       {weekGlance.placedThisMonth}
//                     </Heading>
//                     <Text variant="small" color="muted" className="relative mt-0.5 text-[9px] sm:text-[11px]">
//                       last 30 days
//                     </Text>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* hello   */}
//         <div className="p-2">
//           <div className="grid md:grid-cols-2 gap-4 mb-4">
//             <Card>
//               <div className="flex items-center justify-between px-4 sm:px-5 pt-4 sm:pt-5">
//                 <div>
//                   <Heading variant="h4" className="mt-1 text-base sm:text-lg">
//                     Applications, last 14 days
//                   </Heading>
//                 </div>
//               </div>
//               <CardBody className="h-40 px-2 sm:px-4">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <AreaChart data={appsTrend} margin={{ left: -20 }}>
//                     <defs>
//                       <linearGradient id="homeAppsTrend" x1="0" y1="0" x2="0" y2="1">
//                         <stop offset="5%" stopColor="#098a25" stopOpacity={0.35} />
//                         <stop offset="95%" stopColor="#098a25" stopOpacity={0} />
//                       </linearGradient>
//                     </defs>
//                     <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" />
//                     <XAxis dataKey="date" tick={{ fontSize: 10 }} />
//                     <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
//                     <Tooltip />
//                     <Area type="monotone" dataKey="count" stroke="#098a25" fill="url(#homeAppsTrend)" strokeWidth={2} />
//                   </AreaChart>
//                 </ResponsiveContainer>
//               </CardBody>
//             </Card>

//             <Card>
//               <div className="flex items-center justify-between px-4 sm:px-5 pt-4 sm:pt-5">
//                 <div>
//                   <Heading variant="h4" className="mt-1 text-base sm:text-lg">
//                     Placements, last 8 weeks
//                   </Heading>
//                 </div>
//               </div>
//               <CardBody className="h-40 px-2 sm:px-4">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart data={placementsTrend} margin={{ left: -20 }}>
//                     <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" />
//                     <XAxis dataKey="week" tick={{ fontSize: 10 }} />
//                     <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
//                     <Tooltip />
//                     <Bar dataKey="count" fill="#098a25" radius={[4, 4, 0, 0]} />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </CardBody>
//             </Card>
//           </div>

//           {/* Interview Sheet and Technical Help with WatchList */}
//           <div className="">
//             <div className="space-y-5 min-w-0">
//               <Card>
//                 <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
//                   <div>
//                     <Heading variant="h4" className="mt-0.5 text-base sm:text-lg">
//                       Interview sheet (recent)
//                     </Heading>
//                   </div>
//                 </CardHeader>
//                 <CardBody className="!p-0 overflow-x-auto scrollbar-thin">
//                   <div className="min-w-[900px] lg:min-w-full overflow-x-auto">
//                     <table className="text-sm min-w-full">
//                       <thead>
//                         <tr className="border-b border-line text-left">
//                           {["Candidate", "Received", "Interview Date", "Time", "Job Role", "Round", "Mode", "Client", "Status"].map((h) => (
//                             <th key={h} className="px-2 sm:px-3 py-2 font-semibold text-ink-soft text-[10px] sm:text-xs uppercase tracking-wide whitespace-nowrap">
//                               {h}
//                             </th>
//                           ))}
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {recentInterviews.map((iv) => {
//                           const status = effectiveInterviewStatus(iv);
//                           return (
//                             <tr
//                               key={iv.InterviewID}
//                               className={`border-b border-line last:border-0 border-l-4 ${STATUS_BORDER[status] || "border-l-line"} hover:bg-cloud/40`}
//                             >
//                               <td className="px-2 sm:px-3 py-2 sm:py-2.5 whitespace-nowrap">
//                                 <Link to={`/candidates/${iv.CandidateID}`} className="font-semibold text-ink hover:text-crimson-600 text-xs sm:text-sm">
//                                   {iv.CandidateName}
//                                 </Link>
//                               </td>
//                               <td className="px-2 sm:px-3 py-2 sm:py-2.5 whitespace-nowrap text-xs sm:text-sm">{iv.InterviewReceivedDate}</td>
//                               <td className="px-2 sm:px-3 py-2 sm:py-2.5 whitespace-nowrap text-xs sm:text-sm">{iv.InterviewDate}</td>
//                               <td className="px-2 sm:px-3 py-2 sm:py-2.5 whitespace-nowrap text-slate text-xs sm:text-sm">{iv.InterviewTime}</td>
//                               <td className="px-2 sm:px-3 py-2 sm:py-2.5 whitespace-nowrap text-xs sm:text-sm">{iv.JobRole}</td>
//                               <td className="px-2 sm:px-3 py-2 sm:py-2.5 whitespace-nowrap text-xs sm:text-sm">{iv.InterviewRound}</td>
//                               <td className="px-2 sm:px-3 py-2 sm:py-2.5 whitespace-nowrap text-xs sm:text-sm">{iv.ModeOfRound}</td>
//                               <td className="px-2 sm:px-3 py-2 sm:py-2.5 whitespace-nowrap text-xs sm:text-sm">{iv.ClientName}</td>
//                               <td className="px-2 sm:px-3 py-2 sm:py-2.5 whitespace-nowrap">
//                                 <Badge tone={status} className="text-xs">{status}</Badge>
//                               </td>
//                             </tr>
//                           );
//                         })}
//                       </tbody>
//                     </table>
//                   </div>
//                 </CardBody>
//               </Card>

//               <Card>
//                 <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
//                   <Heading variant="h4" className="text-base sm:text-lg">Technical help (recent)</Heading>
//                   <Badge tone="default" className="text-xs">{data.TechnicalHelp.length.toLocaleString()} total</Badge>
//                 </CardHeader>
//                 <CardBody className="!p-0 overflow-x-auto scrollbar-thin">
//                   <div className="min-w-[700px] lg:min-w-full overflow-x-auto">
//                     <table className="text-sm min-w-full">
//                       <thead>
//                         <tr className="border-b border-line text-left">
//                           {["Date", "Client", "Job Role", "Round", "Technical Person", "Status"].map((h) => (
//                             <th key={h} className="px-2 sm:px-3 py-2 font-semibold text-ink-soft text-[10px] sm:text-xs uppercase tracking-wide whitespace-nowrap">
//                               {h}
//                             </th>
//                           ))}
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {recentTechHelp.map((t) => (
//                           <tr key={t.HelpID} className="border-b border-line last:border-0 hover:bg-cloud/40">
//                             <td className="px-2 sm:px-3 py-2 sm:py-2.5 whitespace-nowrap text-xs sm:text-sm">{t.Date}</td>
//                             <td className="px-2 sm:px-3 py-2 sm:py-2.5 whitespace-nowrap text-xs sm:text-sm">{t.ClientName}</td>
//                             <td className="px-2 sm:px-3 py-2 sm:py-2.5 whitespace-nowrap text-xs sm:text-sm">{t.JobRole}</td>
//                             <td className="px-2 sm:px-3 py-2 sm:py-2.5 whitespace-nowrap text-xs sm:text-sm">{t.InterviewRound}</td>
//                             <td className="px-2 sm:px-3 py-2 sm:py-2.5 whitespace-nowrap text-xs sm:text-sm">{t.TechnicalPerson}</td>
//                             <td className="px-2 sm:px-3 py-2 sm:py-2.5 whitespace-nowrap">
//                               <Badge tone={t.StatusOfHelp} className="text-xs">{t.StatusOfHelp}</Badge>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </CardBody>
//               </Card>

//               {/* Recent Activity */}
//               <Card>
//                 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-5 pt-4 sm:pt-5 gap-2 sm:gap-0">
//                   <div>
//                     <Heading variant="h4" className="mt-1 text-base sm:text-lg">
//                       Recent activity
//                     </Heading>
//                   </div>
//                   <Link to="/activity" className="w-full sm:w-auto">
//                     <Button variant="ghost" size="sm" iconRight={ChevronRight} className="w-full sm:w-auto justify-center">
//                       View all
//                     </Button>
//                   </Link>
//                 </div>
//                 <CardBody className="!p-0 mt-2">
//                   <div className="divide-y divide-line">
//                     {recentActivity.map((a) => {
//                       const Icon = ACTIVITY_ICONS[a.Action] || ActivityIcon;
//                       return (
//                         <div key={a.ActivityID} className="flex items-start gap-3 px-4 sm:px-5 py-2.5 sm:py-3">
//                           <span className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-cloud flex items-center justify-center shrink-0 text-ink-soft">
//                             <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//                           </span>
//                           <div className="min-w-0 flex-1">
//                             <p className="text-xs sm:text-sm text-ink truncate">{a.Details}</p>
//                             <p className="text-[10px] sm:text-xs text-slate mt-0.5">
//                               {a.User} · {timeAgo(a.Date)}
//                             </p>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </CardBody>
//               </Card>
//             </div>
//           </div>

//           {/* Today's Recap and WatchList side by side */}
//           <div className="grid lg:grid-cols-[1fr_320px] gap-5 mb-4">
//             <Card className="min-w-0">
//               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-5 pt-4 sm:pt-5 gap-3 sm:gap-0">
//                 <div>
//                   <Text variant="eyebrow" color="accent" className="text-xs">
//                     {query.trim() ? "Search results" : "Today's recap"}
//                   </Text>
//                   <Heading variant="h3" className="mt-1 text-base sm:text-lg lg:text-xl">
//                     {query.trim()
//                       ? `${recap.length} match${recap.length === 1 ? "" : "es"} for "${query}"`
//                       : `${candidates.length.toLocaleString()} candidates in pipeline · ${readyToReview} ready to review`}
//                   </Heading>
//                   <Text variant="small" color="muted" className="mt-1 text-xs sm:text-sm">
//                     {query.trim() ? "Matching by name, technology or location." : "Click a candidate to review and save the strongest fits."}
//                   </Text>
//                 </div>
//                 <Link to="/candidates" className="w-full sm:w-auto">
//                   <Button variant="ghost" size="sm" iconRight={ChevronRight} className="w-full sm:w-auto justify-center">
//                     View all candidates
//                   </Button>
//                 </Link>
//               </div>
//               <CardBody className="pt-4">
//                 {recap.length === 0 ? (
//                   <Text variant="small" color="muted" className="py-8 text-center block">
//                     No candidates match "{query}".
//                   </Text>
//                 ) : (
//                   <div className="divide-y divide-line">
//                     {recap.map((c) => (
//                       <Link
//                         to={`/candidates/${c.CandidateID}`}
//                         key={c.CandidateID}
//                         className="flex items-center gap-3 sm:gap-4 py-3 sm:py-3.5 hover:bg-cloud/60 -mx-2 px-2 rounded-lg transition-colors"
//                       >
//                         <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-crimson-50 text-crimson-600 flex items-center justify-center text-xs font-bold shrink-0">
//                           {c.Name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <p className="text-sm font-semibold text-ink truncate">{c.Name}</p>
//                           <p className="text-xs text-slate truncate">
//                             {c.Technology} · {c.CurrentLocation}
//                           </p>
//                         </div>
//                         <Badge tone={c.Status} className="text-xs shrink-0">{c.Status}</Badge>
//                         <ChevronRight className="h-4 w-4 text-slate shrink-0" />
//                       </Link>
//                     ))}
//                   </div>
//                 )}
//               </CardBody>
//             </Card>

//             <div className="lg:block">
//               <WatchList />
//             </div>
//           </div>

          
//         </div>
//       </div>
//     </PageShell>
//   );
// }






import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Upload, Sparkles, Briefcase, Building2, Globe2, Zap, ChevronRight, UserPlus,
  CalendarClock, Trophy, Activity as ActivityIcon, Bookmark, Users, UsersRound,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight as ChevronRightIcon, Inbox
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { dateKey, nowIST, addDays, diffInDays, timeAgo, startOfDay, effectiveInterviewStatus } from "../lib/time";
import PageShell from "../components/layout/PageShell";
import { Card, CardHeader, CardBody } from "../components/ui/Card";
import { Heading, Text } from "../components/ui/Typography";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import WatchList from "../components/ui/WatchList";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { useSaved } from "../context/SavedContext";
import { useSettings } from "../context/SettingsContext";

function cx(...args) {
  return args.filter(Boolean).join(" ");
}

// DataTable component integrated directly into Home page
function DataTable({ columns, rows, emptyLabel = "No records found" }) {
  const { settings } = useSettings();
  const [sort, setSort] = useState({ key: null, dir: "asc" });
  const [page, setPage] = useState(1);
  const pageSize = settings.pageSize;

  const sorted = useMemo(() => {
    if (!sort.key) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = a[sort.key],
        bv = b[sort.key];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") return sort.dir === "asc" ? av - bv : bv - av;
      return sort.dir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return copy;
  }, [rows, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const startIndex = (currentPage - 1) * pageSize;

  function toggleSort(key) {
    setPage(1);
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  }

  return (
    <div className="flex flex-col rounded-xl overflow-hidden">
      <style>{`
        .dt-scroll::-webkit-scrollbar { height: 6px; }
        .dt-scroll::-webkit-scrollbar-track { background: transparent; }
        .dt-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, #c8102e, #af102b);
          border-radius: 9999px;
        }
        .dt-scroll::-webkit-scrollbar-thumb:hover { background: #8c0a1f; }
        .dt-scroll { scrollbar-width: thin; scrollbar-color: #d6d6d6 transparent; }
      `}</style>

      <div className="dt-scroll overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-0 font-sans">
          <thead>
            <tr className="bg-gradient-to-r from-crimson-600 to-crimson-500 text-[10.5px]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && toggleSort(col.key)}
                  className={cx(
                    "px-4 py-3 font-bold uppercase tracking-wider text-white whitespace-nowrap",
                    col.sortable && "cursor-pointer select-none hover:text-crimson-100"
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable &&
                      sort.key === col.key &&
                      (sort.dir === "asc" ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      ))}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center bg-white">
                  <div className="flex flex-col items-center gap-2 text-slate">
                    <Inbox className="h-6 w-6" />
                    <span className="text-sm">{emptyLabel}</span>
                  </div>
                </td>
              </tr>
            ) : (
              pageRows.map((row, i) => {
                const sno = startIndex + i + 1;
                const odd = i % 2 === 0;
                return (
                  <tr
                    key={row.id || row.InterviewID || row.HelpID || i}
                    className={cx(
                      "border-b border-line last:border-0 hover:bg-crimson-50/50 transition-colors",
                      odd ? "bg-white" : "bg-cloud/50",
                      "text-[13.5px]"
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cx(
                          "px-4 whitespace-nowrap font-medium text-ink/90",
                          "py-3.5"
                        )}
                      >
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {sorted.length > 0 && (
        <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-xs text-slate bg-white">
          <span>
            Showing <span className="font-semibold text-ink">{startIndex + 1}</span>-
            <span className="font-semibold text-ink">{Math.min(currentPage * pageSize, sorted.length)}</span> of{" "}
            <span className="font-semibold text-ink">{sorted.length}</span>
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-md p-1.5 hover:bg-crimson-50 hover:text-crimson-600 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 font-semibold text-ink">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-md p-1.5 hover:bg-crimson-50 hover:text-crimson-600 disabled:opacity-30 transition-colors"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const STATUS_BORDER = {
  Completed: "border-l-emerald-400",
  Selected: "border-l-emerald-500",
  Rejected: "border-l-crimson-500",
  "No-Show": "border-l-amber-400",
  Rescheduled: "border-l-blue-400",
  "Pending Feedback": "border-l-ink/20",
};

const ACTIVITY_ICONS = {
  "Added candidate": UserPlus,
  "Updated status": ActivityIcon,
  "Scheduled interview": CalendarClock,
  "Uploaded resume": UserPlus,
  "Marked as Placed": Trophy,
  "Sent to client": Building2,
  "Saved candidate": Bookmark,
  "Saved job": Bookmark,
  "Saved recruiter": Bookmark,
  "Updated job posting": Briefcase,
  "Added recruiter": UsersRound,
};

function daysAgo(dateStr, refDate) {
  const d = new Date(dateStr);
  if (isNaN(d)) return Infinity;
  return Math.round((refDate - d) / 86400000);
}

export default function Home() {
  const { user } = useAuth();
  const { visible: data } = useData();
  const { isSaved: isSavedCtx } = useSaved();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const fileRef = useState(null)[0];

  const jobs = data.Jobs;
  const candidates = data.Candidates;

  const stats = useMemo(() => {
    const maxDate = jobs.reduce((m, j) => {
      const d = new Date(j.PostedDate);
      return !isNaN(d) && d > m ? d : m;
    }, new Date(0));
    const activeJobs = jobs.filter((j) => j.Status === "Active").length;
    const companies = new Set(jobs.map((j) => j.Company)).size;
    const countries = new Set(jobs.map((j) => j.Country)).size;
    const fresh = jobs.filter((j) => daysAgo(j.PostedDate, maxDate) <= 7).length;
    return { activeJobs, companies, countries, fresh };
  }, [jobs]);

  const recap = useMemo(() => {
    const sorted = [...candidates].sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
    if (!query.trim()) return sorted.slice(0, 6);
    const q = query.trim().toLowerCase();
    return sorted
      .filter(
        (c) =>
          c.Name.toLowerCase().includes(q) ||
          (c.Technology || "").toLowerCase().includes(q) ||
          (c.CurrentLocation || "").toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [candidates, query]);

  const appsTrend = useMemo(() => {
    const days = 14;
    const map = {};
    const now = nowIST();
    for (let i = days - 1; i >= 0; i--) {
      const d = addDays(now, -i);
      map[dateKey(d)] = 0;
    }
    data.MarketingActivity.forEach((a) => {
      const key = dateKey(a.Date);
      if (key in map) map[key] += Number(a.ApplicationsCount) || 0;
    });
    return Object.entries(map).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      count,
    }));
  }, [data.MarketingActivity]);

  const readyToReview = candidates.filter((c) => c.Status === "Active").length;

  const weekGlance = useMemo(() => {
    const now = nowIST();
    const today = startOfDay(now);
    const newThisWeek = candidates.filter((c) => diffInDays(now, c.CreatedAt) <= 7 && new Date(c.CreatedAt) <= now).length;
    const interviewsToday = data.Interviews.filter((i) => diffInDays(i.InterviewDate, now) === 0).length;
    const interviewsWeek = data.Interviews.filter((i) => {
      const d = diffInDays(i.InterviewDate, now);
      return d >= 0 && d <= 6;
    }).length;
    const placedThisMonth = candidates.filter(
      (c) => c.PlacementDate && diffInDays(now, c.PlacementDate) <= 30 && diffInDays(now, c.PlacementDate) >= 0
    ).length;
    return { newThisWeek, interviewsToday, interviewsWeek, placedThisMonth, today };
  }, [candidates, data.Interviews]);

  const placementsTrend = useMemo(() => {
    const now = nowIST();
    const weeks = 8;
    const buckets = Array.from({ length: weeks }, (_, i) => {
      const weeksAgo = weeks - 1 - i;
      const start = addDays(startOfDay(now), -(weeksAgo * 7 + 6));
      const end = addDays(startOfDay(now), -(weeksAgo * 7));
      return { start, end, count: 0 };
    });
    candidates
      .filter((c) => c.PlacementDate)
      .forEach((c) => {
        const d = new Date(c.PlacementDate);
        const bucket = buckets.find((b) => d >= b.start && d <= b.end);
        if (bucket) bucket.count += 1;
      });
    return buckets.map((b) => ({
      week: `${b.start.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`,
      count: b.count,
    }));
  }, [candidates]);

  const recentActivity = useMemo(
    () => [...data.Activity].sort((a, b) => new Date(b.Date) - new Date(a.Date)).slice(0, 6),
    [data.Activity]
  );

  const savedCounts = useMemo(
    () => ({
      candidates: candidates.filter((c) => isSavedCtx("candidates", c.CandidateID, c.Saved)).length,
      jobs: jobs.filter((j) => isSavedCtx("jobs", j.JobID, j.Saved)).length,
      recruiters: data.Recruiters.filter((r) => isSavedCtx("recruiters", r.RecruiterID, r.Saved)).length,
    }),
    [candidates, jobs, data.Recruiters, isSavedCtx]
  );

  const recentInterviews = useMemo(
    () =>
      [...data.Interviews]
        .sort((a, b) => new Date(b.InterviewReceivedDate) - new Date(a.InterviewReceivedDate))
        .slice(0, 20),
    [data.Interviews]
  );

  const recentTechHelp = useMemo(
    () => [...data.TechnicalHelp].sort((a, b) => new Date(b.Date) - new Date(a.Date)).slice(0, 20),
    [data.TechnicalHelp]
  );

  const compactNumber = (n) =>
    new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n || 0);

  // Interview columns for DataTable
  const interviewColumns = [
    { key: "CandidateName", label: "Candidate", sortable: true, render: (r) => (
      <Link to={`/candidates/${r.CandidateID}`} className="font-semibold text-ink hover:text-crimson-600">
        {r.CandidateName}
      </Link>
    )},
    { key: "InterviewReceivedDate", label: "Received", sortable: true },
    { key: "InterviewDate", label: "Interview Date", sortable: true },
    { key: "InterviewTime", label: "Time" },
    { key: "JobRole", label: "Job Role", sortable: true },
    { key: "InterviewRound", label: "Round", sortable: true },
    { key: "ModeOfRound", label: "Mode" },
    { key: "ClientName", label: "Client", sortable: true },
    { key: "Status", label: "Status", render: (r) => {
      const status = effectiveInterviewStatus(r);
      return <Badge tone={status}>{status}</Badge>;
    }},
  ];

  // Technical Help columns for DataTable
  const techHelpColumns = [
    { key: "Date", label: "Date", sortable: true },
    { key: "ClientName", label: "Client", sortable: true },
    { key: "JobRole", label: "Job Role", sortable: true },
    { key: "InterviewRound", label: "Round", sortable: true },
    { key: "TechnicalPerson", label: "Technical Person", sortable: true },
    { key: "StatusOfHelp", label: "Status", render: (r) => <Badge tone={r.StatusOfHelp}>{r.StatusOfHelp}</Badge> },
  ];

  return (
    <PageShell title="Home" onSearch={setQuery}>
      <div className="mx-auto space-y-4 px-4 sm:px-0">
        <div className="bg-white p-4 sm:p-5 lg:p-8 relative overflow-hidden">
          {/* Top-right gradient spot */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-40 w-100 rounded-full bg-gradient-to-br from-crimson-500/30 via-crimson-400/10 to-transparent blur-3xl animate-pulse" />

          <div>
            <Heading variant="display" className="max-w-2xl relative z-10 text-2xl sm:text-3xl lg:text-4xl">
              Match candidates to <span className="text-crimson-500">real opportunities</span> in seconds.
            </Heading>
            <Text variant="bodyLg" color="muted" className="mt-3 max-w-xl relative z-10 text-sm sm:text-base">
              Search a live pool of direct-employer roles pulled straight from your workbook, or upload a resume and let
              AI Match surface the strongest fits across every active listing.
            </Text>
          </div>

          <div className="grid lg:grid-cols-[1.3fr_2fr] gap-4 items-stretch relative z-10 mt-4">
            <Card className="relative overflow-hidden text-white p-4 sm:p-6 flex flex-col justify-between bg-gradient-to-r from-crimson-700 to-crimson-500">
              <svg
                className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 opacity-20"
                viewBox="0 0 200 200"
                fill="none"
              >
                <circle cx="100" cy="100" r="90" stroke="white" strokeWidth="1" strokeDasharray="2 6" />
                <circle cx="100" cy="100" r="65" stroke="white" strokeWidth="1" strokeDasharray="2 6" />
              </svg>
              <div className="pointer-events-none absolute -left-10 -bottom-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

              <div className="relative">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white mb-4 backdrop-blur-sm">
                  <Sparkles className="h-3 w-3" /> AI MATCH · BETA
                </span>
                <Heading variant="h3" color="onDark" className="text-lg sm:text-xl">
                  Upload a resume. Get a ranked job list in seconds.
                </Heading>
                <Text variant="small" color="onDarkMuted" className="mt-2 max-w-sm text-sm">
                  Drop a candidate's resume, and we'll surface the strongest-matching jobs — ranked by skills, role,
                  and location.
                </Text>
              </div>
              <div className="relative flex flex-wrap items-center gap-3 mt-5">
                <Button
                  variant="primary"
                  icon={Upload}
                  onClick={() => navigate("/ai-match")}
                  className="bg-red-800 text-crimson-600 hover:bg-crimson-50 shadow-sm text-sm"
                >
                  Upload resume
                </Button>
                <Link
                  to="/candidates"
                  className="text-xs font-semibold text-white/85 hover:text-white inline-flex items-center gap-1 transition-colors"
                >
                  View all candidates <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </Card>

            <div className="flex flex-col">
              {/* First row - 4 stat cards with vertical dividers */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 relative border-b border-gray-200">
                {/* Stat 1 */}
                <div className="relative px-2 sm:px-3 py-3 sm:py-4 border-r border-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <Text variant="eyebrow" color="muted" className="text-[8px] sm:text-[10px] tracking-wide leading-tight uppercase">
                      Active jobs
                    </Text>
                    <Heading variant="stat" color="accent" className="relative mt-1 text-lg sm:text-xl lg:text-2xl" style={{ fontSize: "clamp(1rem, 2vw, 1.5rem)", lineHeight: "1.75rem" }}>
                      {compactNumber(stats.activeJobs)}
                    </Heading>
                    <Text variant="small" color="muted" className="relative mt-0.5 text-[9px] sm:text-[11px]">
                      across markets
                    </Text>
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="relative px-2 sm:px-3 py-3 sm:py-4 border-r border-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <Text variant="eyebrow" color="muted" className="text-[8px] sm:text-[10px] tracking-wide leading-tight uppercase">
                      Companies
                    </Text>
                    <Heading variant="stat" color="accent" className="relative mt-1 text-lg sm:text-xl lg:text-2xl" style={{ fontSize: "clamp(1rem, 2vw, 1.5rem)", lineHeight: "1.75rem" }}>
                      {compactNumber(stats.companies)}
                    </Heading>
                    <Text variant="small" color="muted" className="relative mt-0.5 text-[9px] sm:text-[11px]">
                      hiring now
                    </Text>
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="relative px-2 sm:px-3 py-3 sm:py-4 border-r border-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <Text variant="eyebrow" color="muted" className="text-[8px] sm:text-[10px] tracking-wide leading-tight uppercase">
                      Countries
                    </Text>
                    <Heading variant="stat" color="accent" className="relative mt-1 text-lg sm:text-xl lg:text-2xl" style={{ fontSize: "clamp(1rem, 2vw, 1.5rem)", lineHeight: "1.75rem" }}>
                      {stats.countries}
                    </Heading>
                    <Text variant="small" color="muted" className="relative mt-0.5 text-[9px] sm:text-[11px]">
                      global reach
                    </Text>
                  </div>
                </div>

                {/* Stat 4 */}
                <div className="relative px-2 sm:px-3 py-3 sm:py-4 flex items-center justify-center">
                  <div className="text-center">
                    <Text variant="eyebrow" color="muted" className="text-[8px] sm:text-[10px] tracking-wide leading-tight uppercase">
                      Fresh · 7 days
                    </Text>
                    <Heading variant="stat" color="accent" className="relative mt-1 text-lg sm:text-xl lg:text-2xl" style={{ fontSize: "clamp(1rem, 2vw, 1.5rem)", lineHeight: "1.75rem" }}>
                      {compactNumber(stats.fresh)}
                    </Heading>
                    <Text variant="small" color="muted" className="relative mt-0.5 text-[9px] sm:text-[11px]">
                      just posted
                    </Text>
                  </div>
                </div>
              </div>

              {/* Horizontal divider with "This week at a glance" */}
              <div className="relative py-2 sm:py-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-[1px] bg-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 sm:px-4 py-0.5 bg-white text-[8px] sm:text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                    This week at a glance
                  </span>
                </div>
              </div>

              {/* Second row - 4 stat cards with vertical dividers */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 relative">
                {/* Stat 5 */}
                <div className="relative px-2 sm:px-3 py-3 sm:py-4 border-r border-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <Text variant="eyebrow" color="muted" className="text-[8px] sm:text-[10px] tracking-wide leading-tight uppercase">
                      New candidates
                    </Text>
                    <Heading variant="stat" color="primary" className="relative mt-1 text-lg sm:text-xl lg:text-2xl" style={{ fontSize: "clamp(1rem, 2vw, 1.5rem)", lineHeight: "1.75rem" }}>
                      {weekGlance.newThisWeek}
                    </Heading>
                    <Text variant="small" color="muted" className="relative mt-0.5 text-[9px] sm:text-[11px]">
                      joined this week
                    </Text>
                  </div>
                </div>

                {/* Stat 6 */}
                <div className="relative px-2 sm:px-3 py-3 sm:py-4 border-r border-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <Text variant="eyebrow" color="muted" className="text-[8px] sm:text-[10px] tracking-wide leading-tight uppercase">
                      Interviews today
                    </Text>
                    <Heading variant="stat" color="accent" className="relative mt-1 text-lg sm:text-xl lg:text-2xl" style={{ fontSize: "clamp(1rem, 2vw, 1.5rem)", lineHeight: "1.75rem" }}>
                      {weekGlance.interviewsToday}
                    </Heading>
                    <Text variant="small" color="muted" className="relative mt-0.5 text-[9px] sm:text-[11px]">
                      {weekGlance.today.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </Text>
                  </div>
                </div>

                {/* Stat 7 */}
                <div className="relative px-2 sm:px-3 py-3 sm:py-4 border-r border-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <Text variant="eyebrow" color="muted" className="text-[8px] sm:text-[10px] tracking-wide leading-tight uppercase">
                      Interviews · week
                    </Text>
                    <Heading variant="stat" color="primary" className="relative mt-1 text-lg sm:text-xl lg:text-2xl" style={{ fontSize: "clamp(1rem, 2vw, 1.5rem)", lineHeight: "1.75rem" }}>
                      {weekGlance.interviewsWeek}
                    </Heading>
                    <Text variant="small" color="muted" className="relative mt-0.5 text-[9px] sm:text-[11px]">
                      today +6 days
                    </Text>
                  </div>
                </div>

                {/* Stat 8 */}
                <div className="relative px-2 sm:px-3 py-3 sm:py-4 flex items-center justify-center">
                  <div className="text-center">
                    <Text variant="eyebrow" color="muted" className="text-[8px] sm:text-[10px] tracking-wide leading-tight uppercase">
                      Placements
                    </Text>
                    <Heading variant="stat" color="primary" className="relative mt-1 text-lg sm:text-xl lg:text-2xl" style={{ fontSize: "clamp(1rem, 2vw, 1.5rem)", lineHeight: "1.75rem" }}>
                      {weekGlance.placedThisMonth}
                    </Heading>
                    <Text variant="small" color="muted" className="relative mt-0.5 text-[9px] sm:text-[11px]">
                      last 30 days
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="p-2">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <Card>
              <div className="flex items-center justify-between px-4 sm:px-5 pt-4 sm:pt-5">
                <div>
                  <Heading variant="h4" className="mt-1 text-base sm:text-lg">
                    Applications, last 14 days
                  </Heading>
                </div>
              </div>
              <CardBody className="h-40 px-2 sm:px-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={appsTrend} margin={{ left: -20 }}>
                    <defs>
                      <linearGradient id="homeAppsTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#098a25" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#098a25" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#098a25" fill="url(#homeAppsTrend)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            <Card>
              <div className="flex items-center justify-between px-4 sm:px-5 pt-4 sm:pt-5">
                <div>
                  <Heading variant="h4" className="mt-1 text-base sm:text-lg">
                    Placements, last 8 weeks
                  </Heading>
                </div>
              </div>
              <CardBody className="h-40 px-2 sm:px-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={placementsTrend} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" />
                    <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#098a25" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </div>

          {/* Interview Sheet with DataTable */}
          <Card className="mb-4">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <div>
                <Heading variant="h4" className="mt-0.5 text-base sm:text-lg">
                  Interview Sheet
                </Heading>
                <Text variant="small" color="muted" className="mt-0.5">
                  Recent interviews ({recentInterviews.length} total)
                </Text>
              </div>
              <Link to="/interviews">
                <Button variant="ghost" size="sm" iconRight={ChevronRight} className="w-full sm:w-auto justify-center">
                  View all
                </Button>
              </Link>
            </CardHeader>
            <CardBody className="!p-0">
              <DataTable 
                columns={interviewColumns} 
                rows={recentInterviews} 
                emptyLabel="No interviews scheduled"
              />
            </CardBody>
          </Card>

          {/* Technical Help with DataTable */}
          <Card className="mb-4">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <div>
                <Heading variant="h4" className="mt-0.5 text-base sm:text-lg">
                  Technical Help
                </Heading>
                <Text variant="small" color="muted" className="mt-0.5">
                  Recent technical support requests ({recentTechHelp.length} total)
                </Text>
              </div>
              <Badge tone="default" className="text-xs">{data.TechnicalHelp.length.toLocaleString()} total</Badge>
            </CardHeader>
            <CardBody className="!p-0">
              <DataTable 
                columns={techHelpColumns} 
                rows={recentTechHelp} 
                emptyLabel="No technical help requests"
              />
            </CardBody>
          </Card>

          {/* Recent Activity */}
          <Card className="mb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-5 pt-4 sm:pt-5 gap-2 sm:gap-0">
              <div>
                <Heading variant="h4" className="mt-1 text-base sm:text-lg">
                  Recent Activity
                </Heading>
              </div>
              <Link to="/activity" className="w-full sm:w-auto">
                <Button variant="ghost" size="sm" iconRight={ChevronRight} className="w-full sm:w-auto justify-center">
                  View all
                </Button>
              </Link>
            </div>
            <CardBody className="!p-0 mt-2">
              <div className="divide-y divide-line">
                {recentActivity.map((a) => {
                  const Icon = ACTIVITY_ICONS[a.Action] || ActivityIcon;
                  return (
                    <div key={a.ActivityID} className="flex items-start gap-3 px-4 sm:px-5 py-2.5 sm:py-3">
                      <span className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-cloud flex items-center justify-center shrink-0 text-ink-soft">
                        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-ink truncate">{a.Details}</p>
                        <p className="text-[10px] sm:text-xs text-slate mt-0.5">
                          {a.User} · {timeAgo(a.Date)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          {/* Today's Recap and WatchList side by side */}
          <div className="grid lg:grid-cols-[1fr_320px] gap-5 mb-4">
            <Card className="min-w-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-5 pt-4 sm:pt-5 gap-3 sm:gap-0">
                <div>
                  <Text variant="eyebrow" color="accent" className="text-xs">
                    {query.trim() ? "Search results" : "Today's recap"}
                  </Text>
                  <Heading variant="h3" className="mt-1 text-base sm:text-lg lg:text-xl">
                    {query.trim()
                      ? `${recap.length} match${recap.length === 1 ? "" : "es"} for "${query}"`
                      : `${candidates.length.toLocaleString()} candidates in pipeline · ${readyToReview} ready to review`}
                  </Heading>
                  <Text variant="small" color="muted" className="mt-1 text-xs sm:text-sm">
                    {query.trim() ? "Matching by name, technology or location." : "Click a candidate to review and save the strongest fits."}
                  </Text>
                </div>
                <Link to="/candidates" className="w-full sm:w-auto">
                  <Button variant="ghost" size="sm" iconRight={ChevronRight} className="w-full sm:w-auto justify-center">
                    View all candidates
                  </Button>
                </Link>
              </div>
              <CardBody className="pt-4">
                {recap.length === 0 ? (
                  <Text variant="small" color="muted" className="py-8 text-center block">
                    No candidates match "{query}".
                  </Text>
                ) : (
                  <div className="divide-y divide-line">
                    {recap.map((c) => (
                      <Link
                        to={`/candidates/${c.CandidateID}`}
                        key={c.CandidateID}
                        className="flex items-center gap-3 sm:gap-4 py-3 sm:py-3.5 hover:bg-cloud/60 -mx-2 px-2 rounded-lg transition-colors"
                      >
                        <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-crimson-50 text-crimson-600 flex items-center justify-center text-xs font-bold shrink-0">
                          {c.Name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-ink truncate">{c.Name}</p>
                          <p className="text-xs text-slate truncate">
                            {c.Technology} · {c.CurrentLocation}
                          </p>
                        </div>
                        <Badge tone={c.Status} className="text-xs shrink-0">{c.Status}</Badge>
                        <ChevronRight className="h-4 w-4 text-slate shrink-0" />
                      </Link>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            <div className="lg:block">
              <WatchList />
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}