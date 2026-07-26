// import { useRef, useState } from "react";
// import {
//   Settings as SettingsIcon, RotateCcw, ShieldCheck, Database, Upload, Trash2, CheckCircle2,
//   TriangleAlert, Navigation, CalendarClock, Bookmark, Download, Laptop,
// } from "lucide-react";
// import PageShell from "../components/layout/PageShell";
// import { Card, CardHeader, CardBody } from "../components/ui/Card";
// import { Heading, Text } from "../components/ui/Typography";
// import { Select } from "../components/ui/Input";
// import Button from "../components/ui/Button";
// import { useSettings } from "../context/SettingsContext";
// import { useData } from "../context/DataContext";
// import { useSaved } from "../context/SavedContext";
// import { DATA_SOURCE_URL } from "../lib/excel";
// import { saveUploadedWorkbook, clearUploadedWorkbook } from "../lib/localWorkbookStore";
// import AtsScoreSettings from "../components/settings/AtsScoreSettings";

// function Toggle({ checked, onChange }) {
//   return (
//     <button
//       onClick={() => onChange(!checked)}
//       className={`h-6 w-11 rounded-full transition-colors relative shrink-0 ${checked ? "bg-crimson-500" : "bg-cloud-dark"}`}
//     >
//       <span
//         className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
//           checked ? "translate-x-5" : "translate-x-0.5"
//         }`}
//       />
//     </button>
//   );
// }

// function Row({ title, sub, children }) {
//   return (
//     <div className="flex items-center justify-between gap-4 py-4 border-b border-line last:border-0">
//       <div>
//         <p className="text-sm font-semibold text-ink">{title}</p>
//         {sub && (
//           <Text variant="small" color="muted" className="mt-0.5">
//             {sub}
//           </Text>
//         )}
//       </div>
//       {children}
//     </div>
//   );
// }

// export default function Settings() {
//   const { settings, updateSetting, resetSettings, replaceAllSettings } = useSettings();
//   const { data, refresh } = useData();
//   const { clearAllSaved } = useSaved();
//   const allowedEmails = (import.meta.env.VITE_ALLOWED_EMAILS || "").split(",").map((e) => e.trim()).filter(Boolean);
//   const fileInput = useRef(null);
//   const settingsFileInput = useRef(null);
//   const [uploadState, setUploadState] = useState({ status: "idle", message: "" }); // idle | working | success | error
//   const [syncState, setSyncState] = useState({ status: "idle", message: "" });
//   const [confirmingClearSaved, setConfirmingClearSaved] = useState(false);

//   function handleClearSaved() {
//     clearAllSaved();
//     setConfirmingClearSaved(false);
//   }

//   function handleExportSettings() {
//     const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "crm-settings.json";
//     a.click();
//     URL.revokeObjectURL(url);
//   }

//   function handleImportSettings(e) {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = () => {
//       try {
//         const imported = JSON.parse(String(reader.result));
//         replaceAllSettings(imported);
//         setSyncState({ status: "success", message: "Settings imported -- this device is now up to date." });
//       } catch {
//         setSyncState({ status: "error", message: "That file doesn't look like a valid settings export." });
//       }
//     };
//     reader.readAsText(file);
//     e.target.value = "";
//   }

//   async function handleFile(e) {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     if (!/\.xlsx$/i.test(file.name)) {
//       setUploadState({ status: "error", message: "Please choose an .xlsx file." });
//       return;
//     }
//     setUploadState({ status: "working", message: "" });
//     try {
//       await saveUploadedWorkbook(file);
//       await refresh();
//       setUploadState({ status: "success", message: `Replaced with "${file.name}". Every page now reads from this file.` });
//     } catch (err) {
//       setUploadState({ status: "error", message: err.message || "Could not read that file." });
//     } finally {
//       e.target.value = "";
//     }
//   }

//   async function handleResetData() {
//     setUploadState({ status: "working", message: "" });
//     try {
//       await clearUploadedWorkbook();
//       await refresh();
//       setUploadState({ status: "success", message: "Reverted to the bundled demo data." });
//     } catch (err) {
//       setUploadState({ status: "error", message: err.message });
//     }
//   }

//   const usingUpload = data.source?.type === "uploaded";

//   return (
//     <PageShell title="Settings">
//       <div className="max-w-3xl mx-auto space-y-5">
//         <div>
//           <Text variant="eyebrow" color="accent">
//             Preferences
//           </Text>
//           <Heading variant="h2" className="mt-1 flex items-center gap-2">
//             <SettingsIcon className="h-5 w-5 text-crimson-500" /> Settings
//           </Heading>
//           <Text variant="body" color="muted" className="mt-1">
//             These controls change behavior live across Jobs, Candidates and every other list in the app.
//           </Text>
//         </div>

//         <Card>
//           <CardHeader>
//             <Heading variant="h4" className="flex items-center gap-2">
//               <Navigation className="h-4 w-4 text-crimson-500" /> Navigation
//             </Heading>
//           </CardHeader>
//           <CardBody className="!py-0">
//             <Row title="Default landing page" sub="Where you land right after signing in">
//               <Select
//                 value={settings.defaultLandingPage}
//                 onChange={(e) => updateSetting("defaultLandingPage", e.target.value)}
//                 className="w-40"
//               >
//                 <option value="/">Home</option>
//                 <option value="/jobs">Jobs</option>
//                 <option value="/candidates">Candidates</option>
//                 <option value="/interviews">Interviews</option>
//                 <option value="/special-search">Special Search</option>
//               </Select>
//             </Row>
//           </CardBody>
//         </Card>

//         <Card>
//           <CardHeader>
//             <Heading variant="h4" className="flex items-center gap-2">
//               <Laptop className="h-4 w-4 text-crimson-500" /> Sync across devices
//             </Heading>
//           </CardHeader>
//           <CardBody className="space-y-3">
//             <Text variant="small" color="muted">
//               Settings (score ranges, profiles, filename overrides, and every preference on this page) are saved to
//               this browser only -- there's no shared server, so a second laptop won't see changes automatically.
//               Export a settings file here and import it on the other device to bring it up to date.
//             </Text>
//             <div className="flex items-center gap-2 flex-wrap">
//               <Button variant="outline" size="sm" icon={Download} onClick={handleExportSettings}>
//                 Export settings
//               </Button>
//               <input ref={settingsFileInput} type="file" accept=".json" onChange={handleImportSettings} className="hidden" />
//               <Button variant="dark" size="sm" icon={Upload} onClick={() => settingsFileInput.current?.click()}>
//                 Import settings
//               </Button>
//             </div>
//             {syncState.status === "success" && (
//               <div className="flex items-start gap-2 rounded-lg border border-emerald-100 bg-emerald-50 p-2.5">
//                 <CheckCircle2 className="h-4 w-4 text-emerald-700 mt-0.5 shrink-0" />
//                 <Text variant="small" className="!text-emerald-700">
//                   {syncState.message}
//                 </Text>
//               </div>
//             )}
//             {syncState.status === "error" && (
//               <div className="flex items-start gap-2 rounded-lg border border-crimson-100 bg-crimson-50 p-2.5">
//                 <TriangleAlert className="h-4 w-4 text-crimson-600 mt-0.5 shrink-0" />
//                 <Text variant="small" color="accent">
//                   {syncState.message}
//                 </Text>
//               </div>
//             )}
//           </CardBody>
//         </Card>

//         <Card>
//           <CardHeader>
//             <Heading variant="h4">Tables &amp; lists</Heading>
//           </CardHeader>
//           <CardBody className="!py-0">
//             <Row title="Rows per page" sub="Applies to every table across the app (Jobs, Candidates, Recruiters...)">
//               <Select value={settings.pageSize} onChange={(e) => updateSetting("pageSize", Number(e.target.value))} className="w-28">
//                 {[5, 10, 20, 50].map((n) => (
//                   <option key={n} value={n}>
//                     {n} rows
//                   </option>
//                 ))}
//               </Select>
//             </Row>
//             <Row title="Table density" sub="Compact reduces row height for scanning large lists">
//               <Select value={settings.density} onChange={(e) => updateSetting("density", e.target.value)} className="w-36">
//                 <option value="comfortable">Comfortable</option>
//                 <option value="compact">Compact</option>
//               </Select>
//             </Row>
//             <Row title="Default candidate status filter" sub="Sets the initial filter when opening the Candidates page">
//               <Select
//                 value={settings.defaultCandidateStatusFilter}
//                 onChange={(e) => updateSetting("defaultCandidateStatusFilter", e.target.value)}
//                 className="w-40"
//               >
//                 {["All", "Active", "Placed", "On Bench", "In Marketing", "Do Not Contact"].map((s) => (
//                   <option key={s} value={s}>
//                     {s}
//                   </option>
//                 ))}
//               </Select>
//             </Row>
//           </CardBody>
//         </Card>

//         <Card>
//           <CardHeader>
//             <Heading variant="h4">Data refresh</Heading>
//           </CardHeader>
//           <CardBody className="!py-0">
//             <Row title="Auto-refresh from Excel" sub="Automatically re-fetch the workbook on an interval">
//               <Toggle checked={settings.autoRefresh} onChange={(v) => updateSetting("autoRefresh", v)} />
//             </Row>
//             <Row title="Refresh interval" sub="Only applies when auto-refresh is on">
//               <Select
//                 value={settings.autoRefreshSeconds}
//                 onChange={(e) => updateSetting("autoRefreshSeconds", Number(e.target.value))}
//                 className="w-32"
//                 disabled={!settings.autoRefresh}
//               >
//                 {[15, 30, 60, 300].map((n) => (
//                   <option key={n} value={n}>
//                     Every {n}s
//                   </option>
//                 ))}
//               </Select>
//             </Row>
//           </CardBody>
//         </Card>

//         <Card>
//           <CardHeader>
//             <Heading variant="h4" className="flex items-center gap-2">
//               <CalendarClock className="h-4 w-4 text-crimson-500" /> Interview page
//             </Heading>
//           </CardHeader>
//           <CardBody className="!py-0">
//             <Row title="Upcoming window" sub="How many days ahead the 'Next N days' chart on the Interview page covers">
//               <Select
//                 value={settings.upcomingInterviewWindowDays}
//                 onChange={(e) => updateSetting("upcomingInterviewWindowDays", Number(e.target.value))}
//                 className="w-32"
//               >
//                 {[7, 14, 21, 30].map((n) => (
//                   <option key={n} value={n}>
//                     {n} days
//                   </option>
//                 ))}
//               </Select>
//             </Row>
//           </CardBody>
//         </Card>

//         <div>
//           <Text variant="eyebrow" color="accent" className="mb-2 block">
//             AI Match
//           </Text>
//         </div>
//         <AtsScoreSettings />

//         <Card>
//           <CardHeader>
//             <Heading variant="h4" className="flex items-center gap-2">
//               <Bookmark className="h-4 w-4 text-crimson-500" /> Saved items
//             </Heading>
//           </CardHeader>
//           <CardBody>
//             <Text variant="small" color="muted" className="mb-3">
//               Saved/unsaved status for candidates, jobs, and recruiters is stored in your browser and layered on
//               top of the workbook's own data. Clearing it reverts every item to whatever the sheet says by default.
//             </Text>
//             {!confirmingClearSaved ? (
//               <Button variant="outline" size="sm" icon={Trash2} onClick={() => setConfirmingClearSaved(true)}>
//                 Clear all saved items
//               </Button>
//             ) : (
//               <div className="flex items-center gap-2 flex-wrap">
//                 <Text variant="small" className="!text-crimson-600 font-semibold">
//                   Clear every saved/unsaved override? This can't be undone.
//                 </Text>
//                 <Button variant="danger" size="sm" onClick={handleClearSaved}>
//                   Yes, clear it
//                 </Button>
//                 <Button variant="ghost" size="sm" onClick={() => setConfirmingClearSaved(false)}>
//                   Cancel
//                 </Button>
//               </div>
//             )}
//           </CardBody>
//         </Card>

//         <Card>
//           <CardHeader>
//             <Heading variant="h4" className="flex items-center gap-2">
//               <Database className="h-4 w-4 text-crimson-500" /> Data source
//             </Heading>
//           </CardHeader>
//           <CardBody className="space-y-4">
//             <Text variant="small" color="muted">
//               {usingUpload ? (
//                 <>
//                   Currently reading from an <span className="font-semibold text-ink">uploaded file</span>:{" "}
//                   <code className="text-ink font-medium">{data.source.name}</code>
//                   {data.source.uploadedAt && ` (uploaded ${new Date(data.source.uploadedAt).toLocaleString()})`}.
//                 </>
//               ) : (
//                 <>
//                   Currently reading the bundled demo file at{" "}
//                   <code className="text-ink font-medium">{DATA_SOURCE_URL}</code>.
//                 </>
//               )}{" "}
//               See README.md, section "Connecting your own Excel file", for other ways to connect a live source.
//             </Text>

//             <div className="rounded-xl border border-dashed border-line p-4">
//               <p className="text-sm font-semibold text-ink mb-1">Upload a new crm-data.xlsx</p>
//               <Text variant="small" color="muted" className="mb-3">
//                 Same sheet names and columns as the current file. This replaces the data every page reads from --
//                 right in your browser, no server needed.
//               </Text>
//               <div className="flex items-center gap-2 flex-wrap">
//                 <input ref={fileInput} type="file" accept=".xlsx" onChange={handleFile} className="hidden" />
//                 <Button variant="dark" size="sm" icon={Upload} onClick={() => fileInput.current?.click()} loading={uploadState.status === "working"}>
//                   Upload &amp; replace
//                 </Button>
//                 {usingUpload && (
//                   <Button variant="outline" size="sm" icon={Trash2} onClick={handleResetData}>
//                     Reset to bundled demo data
//                   </Button>
//                 )}
//               </div>
//               {uploadState.status === "success" && (
//                 <div className="mt-3 flex items-start gap-2 rounded-lg border border-emerald-100 bg-emerald-50 p-2.5">
//                   <CheckCircle2 className="h-4 w-4 text-emerald-700 mt-0.5 shrink-0" />
//                   <Text variant="small" className="!text-emerald-700">
//                     {uploadState.message}
//                   </Text>
//                 </div>
//               )}
//               {uploadState.status === "error" && (
//                 <div className="mt-3 flex items-start gap-2 rounded-lg border border-crimson-100 bg-crimson-50 p-2.5">
//                   <TriangleAlert className="h-4 w-4 text-crimson-600 mt-0.5 shrink-0" />
//                   <Text variant="small" color="accent">
//                     {uploadState.message}
//                   </Text>
//                 </div>
//               )}
//               <Text variant="micro" color="muted" className="mt-3 block">
//                 Note: this is a static frontend with no backend, so uploading stores the file in your browser
//                 (IndexedDB) rather than overwriting the file on disk. It persists across reloads on this device and
//                 is used instead of the bundled file until you reset it.
//               </Text>
//             </div>
//           </CardBody>
//         </Card>

//         <Card>
//           <CardHeader>
//             <Heading variant="h4" className="flex items-center gap-2">
//               <ShieldCheck className="h-4 w-4 text-crimson-500" /> Access list
//             </Heading>
//           </CardHeader>
//           <CardBody>
//             <Text variant="small" color="muted" className="mb-2">
//               Only these Google accounts (from <code className="text-ink">VITE_ALLOWED_EMAILS</code>) can sign in:
//             </Text>
//             {allowedEmails.length ? (
//               <ul className="text-sm space-y-1">
//                 {allowedEmails.map((e) => (
//                   <li key={e} className="font-medium text-ink">
//                     {e}
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <Text variant="small" color="accent">
//                 No emails configured yet -- add VITE_ALLOWED_EMAILS to your .env file.
//               </Text>
//             )}
//           </CardBody>
//         </Card>

//         <Button variant="outline" icon={RotateCcw} onClick={resetSettings}>
//           Reset to defaults
//         </Button>
//       </div>
//     </PageShell>
//   );
// }





import { useRef, useState } from "react";
import {
  Settings as SettingsIcon, RotateCcw, ShieldCheck, Database, Upload, Trash2, CheckCircle2,
  TriangleAlert, Navigation, CalendarClock, Bookmark, Download, Laptop,
  Sparkles, UserCheck, Briefcase, Users, Globe, Clock, Filter, LayoutDashboard
} from "lucide-react";
import PageShell from "../components/layout/PageShell";
import { Card, CardHeader, CardBody } from "../components/ui/Card";
import { Heading, Text } from "../components/ui/Typography";
import { Select } from "../components/ui/Input";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { useSettings } from "../context/SettingsContext";
import { useData } from "../context/DataContext";
import { useSaved } from "../context/SavedContext";
import { DATA_SOURCE_URL } from "../lib/excel";
import { saveUploadedWorkbook, clearUploadedWorkbook } from "../lib/localWorkbookStore";
import AtsScoreSettings from "../components/settings/AtsScoreSettings";

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`h-6 w-11 rounded-full transition-colors relative shrink-0 ${checked ? "bg-crimson-500" : "bg-cloud-dark"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"
          }`}
      />
    </button>
  );
}

function Row({ title, sub, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-line last:border-0">
      <div>
        <p className="text-sm font-semibold text-ink">{title}</p>
        {sub && (
          <Text variant="small" color="muted" className="mt-0.5">
            {sub}
          </Text>
        )}
      </div>
      {children}
    </div>
  );
}

function SectionCard({ icon: Icon, title, children, bgColor = "bg-white" }) {
  return (
    <Card className={`${bgColor} border-l-4 border-l-crimson-500`}>
      <CardHeader className="!pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-crimson-50">
            <Icon className="h-4 w-4 text-crimson-600" />
          </div>
          <Heading variant="h4" className="text-ink">{title}</Heading>
        </div>
      </CardHeader>
      <CardBody className="!pt-0">
        {children}
      </CardBody>
    </Card>
  );
}

export default function Settings() {
  const { settings, updateSetting, resetSettings, replaceAllSettings } = useSettings();
  const { data, refresh } = useData();
  const { clearAllSaved } = useSaved();
  const allowedEmails = (import.meta.env.VITE_ALLOWED_EMAILS || "").split(",").map((e) => e.trim()).filter(Boolean);
  const fileInput = useRef(null);
  const settingsFileInput = useRef(null);
  const [uploadState, setUploadState] = useState({ status: "idle", message: "" });
  const [syncState, setSyncState] = useState({ status: "idle", message: "" });
  const [confirmingClearSaved, setConfirmingClearSaved] = useState(false);

  function handleClearSaved() {
    clearAllSaved();
    setConfirmingClearSaved(false);
  }

  function handleExportSettings() {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "crm-settings.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportSettings(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(String(reader.result));
        replaceAllSettings(imported);
        setSyncState({ status: "success", message: "Settings imported -- this device is now up to date." });
      } catch {
        setSyncState({ status: "error", message: "That file doesn't look like a valid settings export." });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/\.xlsx$/i.test(file.name)) {
      setUploadState({ status: "error", message: "Please choose an .xlsx file." });
      return;
    }
    setUploadState({ status: "working", message: "" });
    try {
      await saveUploadedWorkbook(file);
      await refresh();
      setUploadState({ status: "success", message: `Replaced with "${file.name}". Every page now reads from this file.` });
    } catch (err) {
      setUploadState({ status: "error", message: err.message || "Could not read that file." });
    } finally {
      e.target.value = "";
    }
  }

  async function handleResetData() {
    setUploadState({ status: "working", message: "" });
    try {
      await clearUploadedWorkbook();
      await refresh();
      setUploadState({ status: "success", message: "Reverted to the bundled demo data." });
    } catch (err) {
      setUploadState({ status: "error", message: err.message });
    }
  }

  const usingUpload = data.source?.type === "uploaded";

  return (
    <PageShell title="Settings">
      <div className=" mx-auto space-y-5 bg-white">
        {/* Heading */}
        <div className="relative overflow-hidden bg-gradient-to-r from-white via-white to-white px-6 py-6">
          <div className="pointer-events-none absolute bottom-0 left-1 h-24 w-20 rounded-full bg-crimson-600/30 blur-xl" />
          <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-20 rounded-full bg-crimson-600/60 blur-2xl" />
          <div className="relative flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="mt-1 flex items-center gap-2.5 text-2xl font-extrabold text-ink">
                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-crimson-600 shadow-sm ring-1 ring-crimson-700/30">
                  <SettingsIcon className="h-5 w-5 text-white" />
                </span>
                Settings
              </h2>
              <Text variant="body" color="muted" className="mt-1">
                Configure your CRM preferences and data sources
              </Text>
            </div>
            <div className="flex items-center gap-1.5 text-crimson-700 text-xs font-semibold bg-white/70 rounded-full px-3 py-1.5 ring-1 ring-crimson-200">
              <Globe className="h-3.5 w-3.5" />
              {usingUpload ? "Custom data" : "Demo data"}
            </div>
          </div>
        </div>
        <div className="mx-5">
          {/* Navigation Section */}
          <SectionCard icon={Navigation} title="Navigation" bgColor="bg-white">
            <Row title="Default landing page" sub="Where you land right after signing in">
              <Select
                value={settings.defaultLandingPage}
                onChange={(e) => updateSetting("defaultLandingPage", e.target.value)}
                className="w-40"
              >
                <option value="/">Home</option>
                <option value="/jobs">Jobs</option>
                <option value="/candidates">Candidates</option>
                <option value="/interviews">Interviews</option>
                <option value="/special-search">Special Search</option>
              </Select>
            </Row>
          </SectionCard>

          {/* Sync Section */}
          <SectionCard icon={Laptop} title="Sync across devices" bgColor="bg-white">
            <div className="space-y-3">
              <Text variant="small" color="muted">
                Settings are saved to this browser only. Export a settings file and import it on another device.
              </Text>
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="sm" icon={Download} onClick={handleExportSettings}>
                  Export settings
                </Button>
                <input ref={settingsFileInput} type="file" accept=".json" onChange={handleImportSettings} className="hidden" />
                <Button variant="dark" size="sm" icon={Upload} onClick={() => settingsFileInput.current?.click()}>
                  Import settings
                </Button>
              </div>
              {syncState.status === "success" && (
                <div className="flex items-start gap-2 rounded-lg border border-emerald-100 bg-emerald-50 p-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700 mt-0.5 shrink-0" />
                  <Text variant="small" className="!text-emerald-700">
                    {syncState.message}
                  </Text>
                </div>
              )}
              {syncState.status === "error" && (
                <div className="flex items-start gap-2 rounded-lg border border-crimson-100 bg-crimson-50 p-2.5">
                  <TriangleAlert className="h-4 w-4 text-crimson-600 mt-0.5 shrink-0" />
                  <Text variant="small" color="accent">
                    {syncState.message}
                  </Text>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Tables Section */}
          <SectionCard icon={LayoutDashboard} title="Tables & lists" bgColor="bg-white">
            <Row title="Rows per page" sub="Applies to every table across the app">
              <Select value={settings.pageSize} onChange={(e) => updateSetting("pageSize", Number(e.target.value))} className="w-28">
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n} rows
                  </option>
                ))}
              </Select>
            </Row>
            <Row title="Table density" sub="Compact reduces row height for scanning large lists">
              <Select value={settings.density} onChange={(e) => updateSetting("density", e.target.value)} className="w-36">
                <option value="comfortable">Comfortable</option>
                <option value="compact">Compact</option>
              </Select>
            </Row>
            <Row title="Default candidate status filter" sub="Sets the initial filter when opening Candidates">
              <Select
                value={settings.defaultCandidateStatusFilter}
                onChange={(e) => updateSetting("defaultCandidateStatusFilter", e.target.value)}
                className="w-40"
              >
                {["All", "Active", "Placed", "On Bench", "In Marketing", "Do Not Contact"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Row>
          </SectionCard>

          {/* Data Refresh Section */}
          <SectionCard icon={Clock} title="Data refresh" bgColor="bg-white">
            <Row title="Auto-refresh from Excel" sub="Automatically re-fetch the workbook on an interval">
              <Toggle checked={settings.autoRefresh} onChange={(v) => updateSetting("autoRefresh", v)} />
            </Row>
            <Row title="Refresh interval" sub="Only applies when auto-refresh is on">
              <Select
                value={settings.autoRefreshSeconds}
                onChange={(e) => updateSetting("autoRefreshSeconds", Number(e.target.value))}
                className="w-32"
                disabled={!settings.autoRefresh}
              >
                {[15, 30, 60, 300].map((n) => (
                  <option key={n} value={n}>
                    Every {n}s
                  </option>
                ))}
              </Select>
            </Row>
          </SectionCard>

          {/* Interview Section */}
          <SectionCard icon={CalendarClock} title="Interview page" bgColor="bg-white">
            <Row title="Upcoming window" sub="How many days ahead the 'Next N days' chart covers">
              <Select
                value={settings.upcomingInterviewWindowDays}
                onChange={(e) => updateSetting("upcomingInterviewWindowDays", Number(e.target.value))}
                className="w-32"
              >
                {[7, 14, 21, 30].map((n) => (
                  <option key={n} value={n}>
                    {n} days
                  </option>
                ))}
              </Select>
            </Row>
          </SectionCard>

          {/* AI Match Section */}
          <SectionCard icon={Sparkles} title="AI Match" bgColor="bg-white">
            <div className="flex items-center gap-2 mb-2">
              <Badge tone="default" size="sm">Beta</Badge>
              <Text variant="small" color="muted">Configure AI match scoring and eligibility</Text>
            </div>
            <AtsScoreSettings />
          </SectionCard>

          {/* Saved Items Section */}
          <SectionCard icon={Bookmark} title="Saved items" bgColor="bg-white">
            <div className="space-y-3">
              <Text variant="small" color="muted">
                Saved/unsaved status is stored in your browser. Clearing it reverts every item to the sheet's default.
              </Text>
              {!confirmingClearSaved ? (
                <Button variant="outline" size="sm" icon={Trash2} onClick={() => setConfirmingClearSaved(true)}>
                  Clear all saved items
                </Button>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <Text variant="small" className="!text-crimson-600 font-semibold">
                    Clear every saved/unsaved override? This can't be undone.
                  </Text>
                  <Button variant="danger" size="sm" onClick={handleClearSaved}>
                    Yes, clear it
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setConfirmingClearSaved(false)}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Data Source Section */}
          <SectionCard icon={Database} title="Data source" bgColor="bg-white">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${usingUpload ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                <Text variant="small" color="muted">
                  {usingUpload ? (
                    <>
                      Reading from an <span className="font-semibold text-ink">uploaded file</span>:{" "}
                      <code className="text-ink font-medium bg-cloud px-1.5 py-0.5 rounded">{data.source.name}</code>
                      {data.source.uploadedAt && ` (uploaded ${new Date(data.source.uploadedAt).toLocaleString()})`}
                    </>
                  ) : (
                    <>
                      Reading the bundled demo file at{" "}
                      <code className="text-ink font-medium bg-cloud px-1.5 py-0.5 rounded">{DATA_SOURCE_URL}</code>
                    </>
                  )}
                </Text>
              </div>

              <div className="rounded-xl border-2 border-dashed border-line p-5 bg-cloud/30">
                <p className="text-sm font-semibold text-ink mb-1">Upload a new crm-data.xlsx</p>
                <Text variant="small" color="muted" className="mb-3">
                  Same sheet names and columns as the current file. Replaces data in your browser, no server needed.
                </Text>
                <div className="flex items-center gap-2 flex-wrap">
                  <input ref={fileInput} type="file" accept=".xlsx" onChange={handleFile} className="hidden" />
                  <Button variant="dark" size="sm" icon={Upload} onClick={() => fileInput.current?.click()} loading={uploadState.status === "working"}>
                    Upload &amp; replace
                  </Button>
                  {usingUpload && (
                    <Button variant="outline" size="sm" icon={Trash2} onClick={handleResetData}>
                      Reset to demo
                    </Button>
                  )}
                </div>
                {uploadState.status === "success" && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg border border-emerald-100 bg-emerald-50 p-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-700 mt-0.5 shrink-0" />
                    <Text variant="small" className="!text-emerald-700">
                      {uploadState.message}
                    </Text>
                  </div>
                )}
                {uploadState.status === "error" && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg border border-crimson-100 bg-crimson-50 p-2.5">
                    <TriangleAlert className="h-4 w-4 text-crimson-600 mt-0.5 shrink-0" />
                    <Text variant="small" color="accent">
                      {uploadState.message}
                    </Text>
                  </div>
                )}
                <Text variant="micro" color="muted" className="mt-3 block">
                  Note: Uploading stores the file in your browser's IndexedDB. It persists across reloads on this device.
                </Text>
              </div>
            </div>
          </SectionCard>

          {/* Access List Section */}
          <SectionCard icon={ShieldCheck} title="Access list" bgColor="bg-white">
            <Text variant="small" color="muted" className="mb-2">
              Only these Google accounts can sign in:
            </Text>
            {allowedEmails.length ? (
              <div className="flex flex-wrap gap-2">
                {allowedEmails.map((e) => (
                  <Badge key={e} tone="default" className="font-medium">
                    {e}
                  </Badge>
                ))}
              </div>
            ) : (
              <Text variant="small" color="accent" className="flex items-center gap-2">
                <TriangleAlert className="h-4 w-4" />
                No emails configured — add VITE_ALLOWED_EMAILS to your .env file.
              </Text>
            )}
          </SectionCard>

          {/* Reset Button */}
          <div className="flex justify-end pt-2">
            <Button variant="outline" icon={RotateCcw} onClick={resetSettings}>
              Reset all settings to defaults
            </Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}