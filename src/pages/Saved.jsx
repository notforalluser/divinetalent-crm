// import { useMemo, useState } from "react";
// import { Link } from "react-router-dom";
// import { Bookmark, Users, Briefcase, UsersRound } from "lucide-react";
// import PageShell from "../components/layout/PageShell";
// import { Card } from "../components/ui/Card";
// import { Heading, Text } from "../components/ui/Typography";
// import DataTable from "../components/ui/DataTable";
// import Badge from "../components/ui/Badge";
// import SaveButton from "../components/ui/SaveButton";
// import { useData } from "../context/DataContext";
// import { useSaved } from "../context/SavedContext";

// const TABS = [
//   { key: "candidates", label: "Candidates", icon: Users },
//   { key: "jobs", label: "Jobs", icon: Briefcase },
//   { key: "recruiters", label: "Recruiters", icon: UsersRound },
// ];

// export default function Saved() {
//   const { visible: data } = useData();
//   const { isSaved } = useSaved();
//   const [tab, setTab] = useState("candidates");
//   const [query, setQuery] = useState("");

//   const savedCandidates = useMemo(
//     () => data.Candidates.filter((c) => isSaved("candidates", c.CandidateID, c.Saved)),
//     [data.Candidates, isSaved]
//   );
//   const savedJobs = useMemo(
//     () => data.Jobs.filter((j) => isSaved("jobs", j.JobID, j.Saved)),
//     [data.Jobs, isSaved]
//   );
//   const savedRecruiters = useMemo(
//     () => data.Recruiters.filter((r) => isSaved("recruiters", r.RecruiterID, r.Saved)),
//     [data.Recruiters, isSaved]
//   );

//   const candidateColumns = [
//     {
//       key: "_saved",
//       label: "",
//       render: (r) => <SaveButton type="candidates" id={r.CandidateID} sheetValue={r.Saved} />,
//     },
//     {
//       key: "Name",
//       label: "Candidate",
//       sortable: true,
//       render: (r) => (
//         <Link to={`/candidates/${r.CandidateID}`} className="font-semibold text-ink hover:text-crimson-600">
//           {r.Name}
//         </Link>
//       ),
//     },
//     { key: "Technology", label: "Technology", sortable: true },
//     { key: "Recruiter", label: "Recruiter" },
//     { key: "CurrentLocation", label: "Location" },
//     { key: "Status", label: "Status", render: (r) => <Badge tone={r.Status}>{r.Status}</Badge> },
//   ];

//   const jobColumns = [
//     {
//       key: "_saved",
//       label: "",
//       render: (r) => <SaveButton type="jobs" id={r.JobID} sheetValue={r.Saved} />,
//     },
//     {
//       key: "Title",
//       label: "Role",
//       sortable: true,
//       render: (r) => (
//         <Link to={`/jobs/${r.JobID}`} className="font-semibold text-ink hover:text-crimson-600">
//           {r.Title}
//         </Link>
//       ),
//     },
//     { key: "Company", label: "Company", sortable: true },
//     { key: "City", label: "Location", render: (r) => `${r.City}, ${r.State}` },
//     { key: "JobType", label: "Type" },
//     { key: "Status", label: "Status", render: (r) => <Badge tone={r.Status}>{r.Status}</Badge> },
//   ];

//   const recruiterColumns = [
//     {
//       key: "_saved",
//       label: "",
//       render: (r) => <SaveButton type="recruiters" id={r.RecruiterID} sheetValue={r.Saved} />,
//     },
//     { key: "Name", label: "Name", sortable: true },
//     { key: "Title", label: "Title" },
//     { key: "Email", label: "Email" },
//     { key: "City", label: "City" },
//     { key: "Country", label: "Country", sortable: true },
//   ];

//   const rowsByTab = { candidates: savedCandidates, jobs: savedJobs, recruiters: savedRecruiters };
//   const columnsByTab = { candidates: candidateColumns, jobs: jobColumns, recruiters: recruiterColumns };
//   const emptyByTab = {
//     candidates: "No saved candidates yet -- bookmark one from the Candidates page.",
//     jobs: "No saved jobs yet -- bookmark one from the Jobs page.",
//     recruiters: "No saved recruiters yet -- bookmark one from the Recruiters page.",
//   };

//   return (
//     <PageShell title="Saved" onSearch={setQuery}>
//       <div className="max-w-6xl mx-auto space-y-5">
//         <div>
//           <Text variant="eyebrow" color="accent">
//             Bookmarked across the app
//           </Text>
//           <Heading variant="h2" className="mt-1 flex items-center gap-2">
//             <Bookmark className="h-5 w-5 text-crimson-500" />
//             {(savedCandidates.length + savedJobs.length + savedRecruiters.length).toLocaleString()} saved items
//           </Heading>
//         </div>

//         <div className="flex gap-2 border-b border-line">
//           {TABS.map(({ key, label, icon: Icon }) => (
//             <button
//               key={key}
//               onClick={() => setTab(key)}
//               className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
//                 tab === key ? "border-crimson-500 text-crimson-600" : "border-transparent text-slate hover:text-ink"
//               }`}
//             >
//               <Icon className="h-3.5 w-3.5" />
//               {label}
//               <Badge tone="default">{rowsByTab[key].length}</Badge>
//             </button>
//           ))}
//         </div>

//         <Card>
//           <DataTable
//             columns={columnsByTab[tab]}
//             rows={rowsByTab[tab]}
//             searchTerm={query}
//             emptyLabel={emptyByTab[tab]}
//           />
//         </Card>
//       </div>
//     </PageShell>
//   );
// }





import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Users, Briefcase, UsersRound, Sparkles, ChevronRight } from "lucide-react";
import PageShell from "../components/layout/PageShell";
import { Card, CardHeader, CardBody } from "../components/ui/Card";
import { Heading, Text } from "../components/ui/Typography";
import DataTable from "../components/ui/DataTable";
import Badge from "../components/ui/Badge";
import SaveButton from "../components/ui/SaveButton";
import StatCard from "../components/ui/StatCard";
import { useData } from "../context/DataContext";
import { useSaved } from "../context/SavedContext";

const TABS = [
  { key: "candidates", label: "Candidates", icon: Users, color: "crimson" },
  { key: "jobs", label: "Jobs", icon: Briefcase, color: "blue" },
  { key: "recruiters", label: "Recruiters", icon: UsersRound, color: "emerald" },
];

export default function Saved() {
  const { visible: data } = useData();
  const { isSaved } = useSaved();
  const [tab, setTab] = useState("candidates");
  const [query, setQuery] = useState("");

  const savedCandidates = useMemo(
    () => data.Candidates.filter((c) => isSaved("candidates", c.CandidateID, c.Saved)),
    [data.Candidates, isSaved]
  );
  const savedJobs = useMemo(
    () => data.Jobs.filter((j) => isSaved("jobs", j.JobID, j.Saved)),
    [data.Jobs, isSaved]
  );
  const savedRecruiters = useMemo(
    () => data.Recruiters.filter((r) => isSaved("recruiters", r.RecruiterID, r.Saved)),
    [data.Recruiters, isSaved]
  );

  const totalSaved = savedCandidates.length + savedJobs.length + savedRecruiters.length;

  const candidateColumns = [
    {
      key: "_saved",
      label: "",
      render: (r) => <SaveButton type="candidates" id={r.CandidateID} sheetValue={r.Saved} />,
    },
    {
      key: "Name",
      label: "Candidate",
      sortable: true,
      render: (r) => (
        <Link to={`/candidates/${r.CandidateID}`} className="font-semibold text-ink hover:text-crimson-600">
          {r.Name}
        </Link>
      ),
    },
    { key: "Technology", label: "Technology", sortable: true },
    { key: "Recruiter", label: "Recruiter" },
    { key: "CurrentLocation", label: "Location" },
    { key: "Status", label: "Status", render: (r) => <Badge tone={r.Status}>{r.Status}</Badge> },
    {
      key: "_view",
      label: "",
      render: (r) => (
        <Link to={`/candidates/${r.CandidateID}`} className="text-slate hover:text-crimson-600">
          <ChevronRight className="h-4 w-4" />
        </Link>
      ),
    },
  ];

  const jobColumns = [
    {
      key: "_saved",
      label: "",
      render: (r) => <SaveButton type="jobs" id={r.JobID} sheetValue={r.Saved} />,
    },
    {
      key: "Title",
      label: "Role",
      sortable: true,
      render: (r) => (
        <Link to={`/jobs/${r.JobID}`} className="font-semibold text-ink hover:text-crimson-600">
          {r.Title}
        </Link>
      ),
    },
    { key: "Company", label: "Company", sortable: true },
    { key: "City", label: "Location", render: (r) => `${r.City}, ${r.State}` },
    { key: "JobType", label: "Type" },
    { key: "Status", label: "Status", render: (r) => <Badge tone={r.Status}>{r.Status}</Badge> },
    {
      key: "_view",
      label: "",
      render: (r) => (
        <Link to={`/jobs/${r.JobID}`} className="text-slate hover:text-crimson-600">
          <ChevronRight className="h-4 w-4" />
        </Link>
      ),
    },
  ];

  const recruiterColumns = [
    {
      key: "_saved",
      label: "",
      render: (r) => <SaveButton type="recruiters" id={r.RecruiterID} sheetValue={r.Saved} />,
    },
    { key: "Name", label: "Name", sortable: true },
    { key: "Title", label: "Title" },
    { key: "Email", label: "Email" },
    { key: "City", label: "City" },
    { key: "Country", label: "Country", sortable: true },
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

  const rowsByTab = { candidates: savedCandidates, jobs: savedJobs, recruiters: savedRecruiters };
  const columnsByTab = { candidates: candidateColumns, jobs: jobColumns, recruiters: recruiterColumns };
  const emptyByTab = {
    candidates: "No saved candidates yet -- bookmark one from the Candidates page.",
    jobs: "No saved jobs yet -- bookmark one from the Jobs page.",
    recruiters: "No saved recruiters yet -- bookmark one from the Recruiters page.",
  };

  const getTabColor = (key) => {
    const tab = TABS.find(t => t.key === key);
    return tab?.color || "crimson";
  };

  return (
    <PageShell title="Saved" onSearch={setQuery} searchPlaceholder={`Search ${tab}...`}>
      <div className="max-w-7xl mx-auto space-y-5 bg-white">
        {/* Heading */}
        <div className="relative overflow-hidden bg-gradient-to-r from-white via-white to-white px-6 py-6">
          <div className="pointer-events-none absolute bottom-0 left-1 h-24 w-20 rounded-full bg-crimson-600/30 blur-xl" />
          <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-20 rounded-full bg-crimson-600/60 blur-2xl" />
          <div className="relative flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="mt-1 flex items-center gap-2.5 text-2xl font-extrabold text-ink">
                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-crimson-600 shadow-sm ring-1 ring-crimson-700/30">
                  <Bookmark className="h-5 w-5 text-white" />
                </span>
                Saved Items
              </h2>
              <Text variant="body" color="muted" className="mt-1">
                All your bookmarked candidates, jobs, and recruiters in one place
              </Text>
            </div>
            <div className="flex items-center gap-1.5 text-crimson-700 text-xs font-semibold bg-white/70 rounded-full px-3 py-1.5 ring-1 ring-crimson-200">
              <Sparkles className="h-3.5 w-3.5" />
              {totalSaved} saved total
            </div>
          </div>
        </div>

        <div className="mx-5">
          {/* Stats Cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className={`bg-white rounded-xl border p-4 shadow-sm border-l-4 border-l-crimson-500`}>
              <div className="flex items-center justify-between">
                <div>
                  <Text variant="small" className="font-semibold text-slate">Candidates</Text>
                  <Text variant="stat" className="mt-1">{savedCandidates.length}</Text>
                </div>
                <div className="p-2 rounded-lg bg-crimson-50">
                  <Users className="h-5 w-5 text-crimson-600" />
                </div>
              </div>
            </div>
            <div className={`bg-white rounded-xl border p-4 shadow-sm border-l-4 border-l-blue-500`}>
              <div className="flex items-center justify-between">
                <div>
                  <Text variant="small" className="font-semibold text-slate">Jobs</Text>
                  <Text variant="stat" className="mt-1">{savedJobs.length}</Text>
                </div>
                <div className="p-2 rounded-lg bg-blue-50">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>
            <div className={`bg-white rounded-xl border p-4 shadow-sm border-l-4 border-l-emerald-500`}>
              <div className="flex items-center justify-between">
                <div>
                  <Text variant="small" className="font-semibold text-slate">Recruiters</Text>
                  <Text variant="stat" className="mt-1">{savedRecruiters.length}</Text>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50">
                  <UsersRound className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-line">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${tab === key
                    ? `border-crimson-500 text-crimson-600`
                    : "border-transparent text-slate hover:text-ink"
                  }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                <span className={`ml-1 text-xs rounded-full px-2 py-0.5 ${tab === key ? "bg-crimson-100 text-crimson-700" : "bg-cloud text-slate"
                  }`}>
                  {rowsByTab[key].length}
                </span>
              </button>
            ))}
          </div>

          {/* Table */}
          <Card>
            <div className="px-4 py-2 border-b border-line bg-gradient-to-r from-cloud/50 to-cloud/30 rounded-t-xl">
              <div className="flex items-center justify-between">
                <Text variant="small" className="font-semibold text-ink">
                  {TABS.find(t => t.key === tab)?.label}
                </Text>
                <Badge tone="default">
                  {rowsByTab[tab].length} items
                </Badge>
              </div>
            </div>
            <DataTable
              columns={columnsByTab[tab]}
              rows={rowsByTab[tab]}
              searchTerm={query}
              emptyLabel={emptyByTab[tab]}
            />
          </Card>

          {/* Empty State Tip */}
          {totalSaved === 0 && (
            <Card className="bg-gradient-to-r from-cloud/50 to-cloud/30 border-dashed border-2 border-line">
              <CardBody className="text-center py-8">
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 rounded-full bg-crimson-50">
                    <Bookmark className="h-8 w-8 text-crimson-500" />
                  </div>
                  <Heading variant="h4" className="text-ink">Start saving items</Heading>
                  <Text variant="body" color="muted" className="max-w-md">
                    Click the bookmark icon on any candidate, job, or recruiter card to save it here for quick access.
                  </Text>
                  <div className="flex gap-2 mt-2">
                    <Link to="/candidates">
                      <Badge tone="default" className="hover:bg-crimson-50 cursor-pointer">Browse Candidates</Badge>
                    </Link>
                    <Link to="/jobs">
                      <Badge tone="default" className="hover:bg-crimson-50 cursor-pointer">Browse Jobs</Badge>
                    </Link>
                    <Link to="/recruiters">
                      <Badge tone="default" className="hover:bg-crimson-50 cursor-pointer">Browse Recruiters</Badge>
                    </Link>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </PageShell>
  );
}