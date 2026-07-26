// import { useMemo } from "react";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import {
//   ChevronLeft, MapPin, Briefcase, DollarSign, ShieldCheck, Globe2, Users, Clock, ExternalLink, Bookmark,
// } from "lucide-react";
// import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
// import PageShell from "../components/layout/PageShell";
// import { Card, CardHeader, CardBody } from "../components/ui/Card";
// import { Heading, Text } from "../components/ui/Typography";
// import Badge from "../components/ui/Badge";
// import Button from "../components/ui/Button";
// import { useData } from "../context/DataContext";
// import { useSaved } from "../context/SavedContext";
// import { timeAgo, addDays, nowIST } from "../lib/time";
// import { syntheticDailyCounts } from "../lib/synthetic";

// export default function JobDetail() {
//   const { jobId } = useParams();
//   const navigate = useNavigate();
//   const { visible: data } = useData();
//   const { isSaved, toggleSaved } = useSaved();

//   const job = data.Jobs.find((j) => j.JobID === jobId);

//   const applicantTrend = useMemo(() => {
//     if (!job) return [];
//     const days = 14;
//     const now = nowIST();
//     const counts = syntheticDailyCounts(job.JobID, days, Math.round(Number(job.Applicants) * 0.18));
//     return counts.map((count, i) => ({
//       date: addDays(now, -(days - 1 - i)).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
//       count,
//     }));
//   }, [job]);

//   const similarJobs = useMemo(() => {
//     if (!job) return [];
//     const jobSkills = new Set((job.Skills || "").split(",").map((s) => s.trim()));
//     return data.Jobs
//       .filter((j) => j.JobID !== job.JobID)
//       .map((j) => {
//         const overlap = (j.Skills || "").split(",").map((s) => s.trim()).filter((s) => jobSkills.has(s)).length;
//         const titleMatch = j.Title === job.Title ? 3 : 0;
//         return { ...j, relevance: overlap + titleMatch };
//       })
//       .filter((j) => j.relevance > 0)
//       .sort((a, b) => b.relevance - a.relevance)
//       .slice(0, 5);
//   }, [job, data.Jobs]);

//   if (!job) {
//     return (
//       <PageShell title="Job">
//         <div className="max-w-3xl mx-auto text-center py-24">
//           <Text>Job not found (it may be a future posting that isn't live yet, or has been removed).</Text>
//           <Link to="/jobs">
//             <Button variant="outline" className="mt-4">
//               Back to jobs
//             </Button>
//           </Link>
//         </div>
//       </PageShell>
//     );
//   }

//   const requirements = (job.Requirements || "").split(";").map((r) => r.trim()).filter(Boolean);
//   const skills = (job.Skills || "").split(",").map((s) => s.trim()).filter(Boolean);
//   const totalApplicants30d = applicantTrend.reduce((s, d) => s + d.count, 0);

//   return (
//     <PageShell title="Job detail">
//       <div className="max-w-6xl mx-auto space-y-5">
//         <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-slate hover:text-ink">
//           <ChevronLeft className="h-4 w-4" /> Back to jobs
//         </button>

//         <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
//           <div className="space-y-5">
//             <Card className="p-6">
//               <div className="flex items-start justify-between gap-4 flex-wrap">
//                 <div>
//                   <Badge tone={job.Status}>{job.Status}</Badge>
//                   <Heading variant="h1" className="mt-2">
//                     {job.Title}
//                   </Heading>
//                   <Text variant="bodyLg" color="muted" className="mt-1">
//                     {job.Company} · {job.City}, {job.State}, {job.Country}
//                   </Text>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Button
//                     variant={isSaved("jobs", job.JobID, job.Saved) ? "primary" : "outline"}
//                     icon={Bookmark}
//                     onClick={() => toggleSaved("jobs", job.JobID, job.Saved)}
//                   >
//                     {isSaved("jobs", job.JobID, job.Saved) ? "Saved" : "Save"}
//                   </Button>
//                   <a href={job.Website} target="_blank" rel="noreferrer">
//                     <Button variant="dark" icon={ExternalLink}>
//                       View on company site
//                     </Button>
//                   </a>
//                 </div>
//               </div>

//               <div className="grid sm:grid-cols-4 gap-3 mt-6">
//                 {[
//                   [DollarSign, "Salary", job.SalaryRange],
//                   [Briefcase, "Job type", job.JobType],
//                   [Globe2, "Work type", job.RemoteType],
//                   [ShieldCheck, "Visa sponsorship", job.VisaSponsorship],
//                 ].map(([Icon, label, value]) => (
//                   <div key={label} className="rounded-xl bg-cloud p-3">
//                     <Icon className="h-4 w-4 text-crimson-500 mb-1.5" />
//                     <Text variant="micro" color="muted" className="uppercase tracking-wide">
//                       {label}
//                     </Text>
//                     <p className="text-sm font-semibold text-ink mt-0.5">{value}</p>
//                   </div>
//                 ))}
//               </div>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <Heading variant="h4">Job description</Heading>
//               </CardHeader>
//               <CardBody>
//                 <Text variant="body" color="soft">
//                   {job.Description}
//                 </Text>
//               </CardBody>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <Heading variant="h4">Requirements</Heading>
//               </CardHeader>
//               <CardBody>
//                 <ul className="space-y-2">
//                   {requirements.map((r, i) => (
//                     <li key={i} className="flex gap-2 text-sm text-ink-soft">
//                       <span className="h-1.5 w-1.5 rounded-full bg-crimson-500 mt-2 shrink-0" />
//                       {r}
//                     </li>
//                   ))}
//                 </ul>
//               </CardBody>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <Heading variant="h4">Skills</Heading>
//               </CardHeader>
//               <CardBody className="flex flex-wrap gap-2">
//                 {skills.map((s) => (
//                   <span key={s} className="rounded-full bg-crimson-50 text-crimson-600 text-xs font-semibold px-3 py-1">
//                     {s}
//                   </span>
//                 ))}
//               </CardBody>
//             </Card>
//           </div>

//           <div className="space-y-5">
//             <Card className="p-5">
//               <Text variant="eyebrow" color="accent">
//                 Insights
//               </Text>
//               <div className="mt-3 space-y-3">
//                 <div className="flex items-center justify-between text-sm">
//                   <span className="inline-flex items-center gap-1.5 text-slate">
//                     <Users className="h-3.5 w-3.5" /> Total applicants
//                   </span>
//                   <span className="font-semibold text-ink">{Number(job.Applicants).toLocaleString()}</span>
//                 </div>
//                 <div className="flex items-center justify-between text-sm">
//                   <span className="inline-flex items-center gap-1.5 text-slate">
//                     <Clock className="h-3.5 w-3.5" /> Posted
//                   </span>
//                   <span className="font-semibold text-ink">{timeAgo(job.PostedDate)}</span>
//                 </div>
//                 <div className="flex items-center justify-between text-sm">
//                   <span className="inline-flex items-center gap-1.5 text-slate">
//                     <MapPin className="h-3.5 w-3.5" /> Location
//                   </span>
//                   <span className="font-semibold text-ink">
//                     {job.City}, {job.State}
//                   </span>
//                 </div>
//               </div>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <Heading variant="h4">Applicants, last 14 days</Heading>
//               </CardHeader>
//               <CardBody className="h-52">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart data={applicantTrend}>
//                     <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" />
//                     <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={2} />
//                     <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
//                     <Tooltip />
//                     <Bar dataKey="count" fill="#121214" radius={[3, 3, 0, 0]} />
//                   </BarChart>
//                 </ResponsiveContainer>
//                 <Text variant="small" color="muted" className="mt-1">
//                   {totalApplicants30d} applications tracked in this window
//                 </Text>
//               </CardBody>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <Heading variant="h4">Similar jobs</Heading>
//               </CardHeader>
//               <CardBody className="!p-0">
//                 <div className="divide-y divide-line">
//                   {similarJobs.length === 0 && (
//                     <Text variant="small" color="muted" className="px-5 py-4 block">
//                       No close matches found.
//                     </Text>
//                   )}
//                   {similarJobs.map((j) => (
//                     <Link key={j.JobID} to={`/jobs/${j.JobID}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-cloud/60">
//                       <div className="min-w-0">
//                         <p className="text-sm font-semibold text-ink truncate">{j.Title}</p>
//                         <p className="text-xs text-slate truncate">{j.Company}</p>
//                       </div>
//                       <Badge tone="default">{j.relevance} match</Badge>
//                     </Link>
//                   ))}
//                 </div>
//               </CardBody>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </PageShell>
//   );
// }





import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft, MapPin, Briefcase, DollarSign, ShieldCheck, Globe2, Users, Clock, ExternalLink, Bookmark,
  Building2, Calendar, ChevronRight, TrendingUp, Award, Zap, Sparkles
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import PageShell from "../components/layout/PageShell";
import { Card, CardHeader, CardBody } from "../components/ui/Card";
import { Heading, Text } from "../components/ui/Typography";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import StatCard from "../components/ui/StatCard";
import { useData } from "../context/DataContext";
import { useSaved } from "../context/SavedContext";
import { timeAgo, addDays, nowIST } from "../lib/time";
import { syntheticDailyCounts } from "../lib/synthetic";

const PALETTE = ["#c8102e", "#121214", "#86858f", "#ad0d27", "#8c0a1f", "#10b981", "#3b82f6"];
const RED = "#c8102e";
const GREEN = "#10b981";
const BLUE = "#3b82f6";
const ORANGE = "#f59e0b";
const PURPLE = "#8b5cf6";

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

export default function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { visible: data } = useData();
  const { isSaved, toggleSaved } = useSaved();

  const job = data.Jobs.find((j) => j.JobID === jobId);

  const applicantTrend = useMemo(() => {
    if (!job) return [];
    const days = 14;
    const now = nowIST();
    const counts = syntheticDailyCounts(job.JobID, days, Math.round(Number(job.Applicants) * 0.18));
    return counts.map((count, i) => ({
      date: addDays(now, -(days - 1 - i)).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      count,
    }));
  }, [job]);

  const similarJobs = useMemo(() => {
    if (!job) return [];
    const jobSkills = new Set((job.Skills || "").split(",").map((s) => s.trim()));
    return data.Jobs
      .filter((j) => j.JobID !== job.JobID)
      .map((j) => {
        const overlap = (j.Skills || "").split(",").map((s) => s.trim()).filter((s) => jobSkills.has(s)).length;
        const titleMatch = j.Title === job.Title ? 3 : 0;
        return { ...j, relevance: overlap + titleMatch };
      })
      .filter((j) => j.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5);
  }, [job, data.Jobs]);

  // Get matching candidates count
  const matchingCandidates = useMemo(() => {
    if (!job) return [];
    const jobSkills = new Set((job.Skills || "").split(",").map((s) => s.trim().toLowerCase()));
    return data.Candidates
      .filter((c) => {
        const candidateSkills = (c.Skills || "").split(",").map((s) => s.trim().toLowerCase());
        const match = candidateSkills.filter(s => jobSkills.has(s)).length;
        return match >= 2;
      })
      .slice(0, 5);
  }, [job, data.Candidates]);

  if (!job) {
    return (
      <PageShell title="Job">
        <div className="max-w-3xl mx-auto text-center py-24">
          <Text>Job not found.</Text>
          <Link to="/jobs">
            <Button variant="outline" className="mt-4">Back to jobs</Button>
          </Link>
        </div>
      </PageShell>
    );
  }

  const requirements = (job.Requirements || "").split(";").map((r) => r.trim()).filter(Boolean);
  const skills = (job.Skills || "").split(",").map((s) => s.trim()).filter(Boolean);
  const totalApplicants30d = applicantTrend.reduce((s, d) => s + d.count, 0);

  // Visa sponsorship distribution
  const visaData = [
    { name: "Offers Sponsorship", value: job.VisaSponsorship === "Yes" ? 1 : 0 },
    { name: "No Sponsorship", value: job.VisaSponsorship === "No" ? 1 : 0 },
  ].filter(d => d.value > 0);

  const workTypeData = [
    { name: "Remote", value: job.RemoteType === "Remote" ? 1 : 0 },
    { name: "Hybrid", value: job.RemoteType === "Hybrid" ? 1 : 0 },
    { name: "On-site", value: job.RemoteType === "On-site" ? 1 : 0 },
  ].filter(d => d.value > 0);

  return (
    <PageShell title="Job Detail">
      <div className="max-w-7xl mx-auto space-y-5 bg-white">
        {/* Heading */}
        <div className="relative overflow-hidden bg-gradient-to-r from-white via-white to-white px-6 py-6">
          <div className="pointer-events-none absolute bottom-0 left-1 h-24 w-20 rounded-full bg-crimson-600/30 blur-xl" />
          <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-20 rounded-full bg-crimson-600/60 blur-2xl" />
          <div className="relative flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-cloud rounded-lg transition-colors">
                <ChevronLeft className="h-5 w-5 text-slate" />
              </button>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-extrabold text-ink">{job.Title}</h2>
                  <Badge tone={job.Status}>{job.Status}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate mt-0.5 flex-wrap">
                  <span>{job.Company}</span>
                  <span className="w-px h-3 bg-line" />
                  <span>{job.City}, {job.State}</span>
                  <span className="w-px h-3 bg-line" />
                  <span>{job.Country}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-crimson-700 text-xs font-semibold bg-white/70 rounded-full px-3 py-1.5 ring-1 ring-crimson-200">
              <Sparkles className="h-3.5 w-3.5" />
              {totalApplicants30d} applicants in 14 days
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mx-5">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <Text variant="small" className="font-semibold text-slate">Total Applicants</Text>
                  <Text variant="stat" className="mt-1 text-blue-600">{Number(job.Applicants).toLocaleString()}</Text>
                </div>
                <div className="p-2 rounded-lg bg-blue-100">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-crimson-50 to-white rounded-xl border border-crimson-100 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <Text variant="small" className="font-semibold text-slate">Posted</Text>
                  <Text variant="stat" className="mt-1 text-crimson-600">{timeAgo(job.PostedDate)}</Text>
                </div>
                <div className="p-2 rounded-lg bg-crimson-100">
                  <Calendar className="h-5 w-5 text-crimson-600" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <Text variant="small" className="font-semibold text-slate">Job Type</Text>
                  <Text variant="stat" className="mt-1 text-green-600 text-lg">{job.JobType}</Text>
                </div>
                <div className="p-2 rounded-lg bg-green-100">
                  <Briefcase className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <Text variant="small" className="font-semibold text-slate">Visa Sponsorship</Text>
                  <Text variant="stat" className="mt-1 text-purple-600 text-lg">{job.VisaSponsorship}</Text>
                </div>
                <div className="p-2 rounded-lg bg-purple-100">
                  <ShieldCheck className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
            <div className="space-y-5">
              {/* Job Description */}
              <Card>
                <CardHeader>
                  <Heading variant="h4">Job Description</Heading>
                </CardHeader>
                <CardBody>
                  <Text variant="body" color="soft" className="leading-relaxed">
                    {job.Description}
                  </Text>
                </CardBody>
              </Card>

              {/* Requirements */}
              <Card>
                <CardHeader>
                  <Heading variant="h4">Requirements</Heading>
                </CardHeader>
                <CardBody>
                  <ul className="space-y-2">
                    {requirements.map((r, i) => (
                      <li key={i} className="flex gap-2 text-sm text-ink-soft">
                        <span className="h-1.5 w-1.5 rounded-full bg-crimson-500 mt-2 shrink-0" />
                        {r}
                      </li>
                    ))}
                    {requirements.length === 0 && (
                      <Text variant="small" color="muted">No specific requirements listed.</Text>
                    )}
                  </ul>
                </CardBody>
              </Card>

              {/* Skills */}
              <Card>
                <CardHeader>
                  <Heading variant="h4">Skills</Heading>
                </CardHeader>
                <CardBody className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span key={s} className="rounded-full bg-crimson-50 text-crimson-600 text-xs font-semibold px-3 py-1.5 border border-crimson-100">
                      {s}
                    </span>
                  ))}
                  {skills.length === 0 && (
                    <Text variant="small" color="muted">No skills listed.</Text>
                  )}
                </CardBody>
              </Card>

              {/* Matching Candidates */}
              {matchingCandidates.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-crimson-500" />
                      <Heading variant="h4">Matching Candidates</Heading>
                    </div>
                    <Badge tone="default">{matchingCandidates.length} candidates</Badge>
                  </CardHeader>
                  <CardBody className="!p-0">
                    <div className="divide-y divide-line">
                      {matchingCandidates.map((c) => (
                        <Link key={c.CandidateID} to={`/candidates/${c.CandidateID}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-cloud/60 transition-colors">
                          <div>
                            <p className="text-sm font-semibold text-ink">{c.Name}</p>
                            <p className="text-xs text-slate">{c.Technology} · {c.CurrentLocation}</p>
                          </div>
                          <Badge tone="default">{c.Status}</Badge>
                          <ChevronRight className="h-4 w-4 text-slate" />
                        </Link>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Action Buttons */}
              <Card className="p-5 text-center">
                <Button
                  variant={isSaved("jobs", job.JobID, job.Saved) ? "primary" : "subtle"}
                  icon={Bookmark}
                  className="w-full justify-center"
                  onClick={() => toggleSaved("jobs", job.JobID, job.Saved)}
                >
                  {isSaved("jobs", job.JobID, job.Saved) ? "Saved" : "Save Job"}
                </Button>
                <a href={job.Website} target="_blank" rel="noreferrer" className="block mt-2">
                  <Button variant="dark" icon={ExternalLink} className="w-full justify-center">
                    Apply on company site
                  </Button>
                </a>
              </Card>

              {/* Quick Info */}
              <Card>
                <CardHeader>
                  <Heading variant="h4">Quick Info</Heading>
                </CardHeader>
                <CardBody className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-1.5 text-slate">
                      <DollarSign className="h-3.5 w-3.5" /> Salary
                    </span>
                    <span className="font-semibold text-ink">{job.SalaryRange}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-1.5 text-slate">
                      <Globe2 className="h-3.5 w-3.5" /> Work Type
                    </span>
                    <span className="font-semibold text-ink">{job.RemoteType}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-1.5 text-slate">
                      <Building2 className="h-3.5 w-3.5" /> Company
                    </span>
                    <span className="font-semibold text-ink">{job.Company}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-1.5 text-slate">
                      <MapPin className="h-3.5 w-3.5" /> Location
                    </span>
                    <span className="font-semibold text-ink">{job.City}, {job.State}</span>
                  </div>
                </CardBody>
              </Card>

              {/* Applicant Trend Chart */}
              <Card>
                <CardHeader>
                  <Heading variant="h4">Applicant Trend</Heading>
                  <Text variant="small" color="muted">Last 14 days</Text>
                </CardHeader>
                <CardBody className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={applicantTrend} margin={{ left: -20 }}>
                      <defs>
                        <linearGradient id="applicantTrend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={RED} stopOpacity={0.35} />
                          <stop offset="95%" stopColor={RED} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e7e6ea" />
                      <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={2} angle={-15} textAnchor="end" height={35} />
                      <YAxis tick={{ fontSize: 9 }} allowDecimals={false} width={25} />
                      <Tooltip />
                      <Area type="monotone" dataKey="count" stroke={RED} fill="url(#applicantTrend)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                  <Text variant="small" color="muted" className="mt-1 text-center">
                    {totalApplicants30d} applications in 14 days
                  </Text>
                </CardBody>
              </Card>

              {/* Similar Jobs */}
              <Card>
                <CardHeader>
                  <Heading variant="h4">Similar Jobs</Heading>
                </CardHeader>
                <CardBody className="!p-0">
                  <div className="divide-y divide-line">
                    {similarJobs.length === 0 && (
                      <Text variant="small" color="muted" className="px-5 py-4 block text-center">
                        No close matches found.
                      </Text>
                    )}
                    {similarJobs.map((j) => (
                      <Link key={j.JobID} to={`/jobs/${j.JobID}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-cloud/60 transition-colors">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ink truncate">{j.Title}</p>
                          <p className="text-xs text-slate truncate">{j.Company}</p>
                        </div>
                        <Badge tone="default" className="shrink-0">{j.relevance} match</Badge>
                      </Link>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Charts - Visa & Work Type */}
              <div className="grid grid-cols-2 gap-3">
                {visaData.length > 0 && (
                  <Card>
                    <CardHeader className="!pb-1">
                      <Text variant="small" className="font-bold text-ink text-xs">Visa</Text>
                    </CardHeader>
                    <CardBody className="h-28">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={visaData} dataKey="value" nameKey="name" innerRadius={20} outerRadius={35} paddingAngle={3}>
                            {visaData.map((_, i) => (
                              <Cell key={i} fill={i === 0 ? GREEN : RED} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardBody>
                  </Card>
                )}

                {workTypeData.length > 0 && (
                  <Card>
                    <CardHeader className="!pb-1">
                      <Text variant="small" className="font-bold text-ink text-xs">Work Type</Text>
                    </CardHeader>
                    <CardBody className="h-28">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={workTypeData} dataKey="value" nameKey="name" innerRadius={20} outerRadius={35} paddingAngle={3}>
                            {workTypeData.map((_, i) => (
                              <Cell key={i} fill={[BLUE, ORANGE, PURPLE][i % 3]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardBody>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}