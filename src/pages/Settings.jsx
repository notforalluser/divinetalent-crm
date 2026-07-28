import { useRef, useState } from "react";
import {
  Settings as SettingsIcon, RotateCcw, ShieldCheck, Database, Upload, Trash2, CheckCircle2,
  TriangleAlert, Navigation, CalendarClock, Bookmark, Download, Laptop,
  Sparkles, Globe, Clock, LayoutDashboard
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

const RED = "#c8102e";

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
    <div className="flex items-center justify-between gap-4 py-4 border-b border-blue-100/70 last:border-0">
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

function SectionCard({ icon: Icon, title, children, delay = 0 }) {
  return (
    <Card
      className="jobs-fade-up relative overflow-hidden bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10 !rounded-2xl border-l-4 border-l-crimson-500 shadow-[0_1px_2px_rgba(20,20,40,0.04)] transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(200,16,46,0.08)]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-crimson-500/5 blur-2xl" />
      <CardHeader className="!pb-2 relative">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-crimson-50 shadow-sm">
            <Icon className="h-4 w-4 text-crimson-600" />
          </div>
          <Heading variant="h4" className="text-ink">{title}</Heading>
        </div>
      </CardHeader>
      <CardBody className="!pt-0 relative">
        {children}
      </CardBody>
    </Card>
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
        setSyncState({ status: "success", message: "Imported. This device is up to date." });
      } catch {
        setSyncState({ status: "error", message: "Invalid settings file." });
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
      setUploadState({ status: "success", message: `Replaced with "${file.name}".` });
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
      setUploadState({ status: "success", message: "Reverted to demo data." });
    } catch (err) {
      setUploadState({ status: "error", message: err.message });
    }
  }

  const usingUpload = data.source?.type === "uploaded";

  return (
    <PageShell title="Settings">
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

      <div className="app-shell mx-auto space-y-8">
        {/* Heading */}
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm px-6 py-4 ring-1 ring-blue-500/10 shadow-sm">
          <div className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-crimson-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-blue-300/10 blur-3xl" />

          <div className="relative flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3.5">
              <span className="group flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-crimson-500 via-crimson-600 to-crimson-500 ring-1 ring-crimson-400/20 transition-transform duration-300 hover:scale-105 hover:rotate-3">
                <SettingsIcon className="h-4 w-4 text-white transition-transform duration-300 group-hover:scale-110" />
              </span>
              <div>
                <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-ink">
                  Settings
                </h2>
                <Text variant="small" color="muted" className="mt-0.5">
                  CRM preferences and data sources
                </Text>
              </div>
            </div>
            <div className="flex cursor-default items-center gap-1.5 rounded-full border border-crimson-200 bg-crimson-50/70 px-3.5 py-2 text-xs font-semibold text-crimson-700">
              <Globe className="h-3.5 w-3.5" />
              {usingUpload ? "Custom data" : "Demo data"}
            </div>
          </div>
        </div>

        <div className="px-4 md:px-6 space-y-6">
          {/* Navigation Section */}
          <SectionCard icon={Navigation} title="Navigation" delay={40}>
            <Row title="Default landing page" sub="Where you land after sign-in">
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
          <SectionCard icon={Laptop} title="Sync across devices" delay={80}>
            <div className="space-y-3">
              <Text variant="small" color="muted">
                Saved to this browser only. Export and import to sync devices.
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
          <SectionCard icon={LayoutDashboard} title="Tables & lists" delay={120}>
            <Row title="Rows per page" sub="Applies to every table">
              <Select value={settings.pageSize} onChange={(e) => updateSetting("pageSize", Number(e.target.value))} className="w-28">
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n} rows
                  </option>
                ))}
              </Select>
            </Row>
            <Row title="Table density" sub="Compact reduces row height">
              <Select value={settings.density} onChange={(e) => updateSetting("density", e.target.value)} className="w-36">
                <option value="comfortable">Comfortable</option>
                <option value="compact">Compact</option>
              </Select>
            </Row>
            <Row title="Default candidate status filter" sub="Initial filter on Candidates">
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
          <SectionCard icon={Clock} title="Data refresh" delay={160}>
            <Row title="Auto-refresh from Excel" sub="Re-fetch on an interval">
              <Toggle checked={settings.autoRefresh} onChange={(v) => updateSetting("autoRefresh", v)} />
            </Row>
            <Row title="Refresh interval" sub="Only when auto-refresh is on">
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
          <SectionCard icon={CalendarClock} title="Interview page" delay={200}>
            <Row title="Upcoming window" sub="Range for the 'Next N days' chart">
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
          <SectionCard icon={Sparkles} title="AI Match" delay={240}>
            <div className="flex items-center gap-2 mb-2">
              <Badge tone="default" size="sm">Beta</Badge>
              <Text variant="small" color="muted">Match scoring and eligibility</Text>
            </div>
            <AtsScoreSettings />
          </SectionCard>

          {/* Saved Items Section */}
          <SectionCard icon={Bookmark} title="Saved items" delay={280}>
            <div className="space-y-3">
              <Text variant="small" color="muted">
                Stored in your browser. Clearing reverts to the sheet's default.
              </Text>
              {!confirmingClearSaved ? (
                <Button variant="outline" size="sm" icon={Trash2} onClick={() => setConfirmingClearSaved(true)}>
                  Clear all saved items
                </Button>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <Text variant="small" className="!text-crimson-600 font-semibold">
                    Clear all saved overrides? Can't be undone.
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
          <SectionCard icon={Database} title="Data source" delay={320}>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${usingUpload ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                <Text variant="small" color="muted">
                  {usingUpload ? (
                    <>
                      Uploaded file:{" "}
                      <code className="text-ink font-medium bg-blue-50 px-1.5 py-0.5 rounded">{data.source.name}</code>
                      {data.source.uploadedAt && ` (${new Date(data.source.uploadedAt).toLocaleDateString()})`}
                    </>
                  ) : (
                    <>
                      Bundled demo file:{" "}
                      <code className="text-ink font-medium bg-blue-50 px-1.5 py-0.5 rounded">{DATA_SOURCE_URL}</code>
                    </>
                  )}
                </Text>
              </div>

              <div className="rounded-2xl border-2 border-dashed border-blue-200 p-5 bg-blue-50/30">
                <p className="text-sm font-semibold text-ink mb-1">Upload a new crm-data.xlsx</p>
                <Text variant="small" color="muted" className="mb-3">
                  Same sheet names and columns required.
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
                  Stored in this browser's IndexedDB; persists across reloads.
                </Text>
              </div>
            </div>
          </SectionCard>

          {/* Access List Section */}
          <SectionCard icon={ShieldCheck} title="Access list" delay={360}>
            <Text variant="small" color="muted" className="mb-2">
              Accounts allowed to sign in:
            </Text>
            {allowedEmails.length ? (
              <div className="flex flex-wrap gap-2">
                {allowedEmails.map((e) => (
                  <Badge key={e} tone="default" className="font-medium border border-blue-100">
                    {e}
                  </Badge>
                ))}
              </div>
            ) : (
              <Text variant="small" color="accent" className="flex items-center gap-2">
                <TriangleAlert className="h-4 w-4" />
                No emails configured — add VITE_ALLOWED_EMAILS.
              </Text>
            )}
          </SectionCard>

          {/* Reset Button */}
          <div className="jobs-fade-up flex justify-end pt-2" style={{ animationDelay: "400ms" }}>
            <Button variant="outline" icon={RotateCcw} onClick={resetSettings}>
              Reset all settings
            </Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}