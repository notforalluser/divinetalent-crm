import { useMemo, useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Upload, Sparkles, CheckCircle2, Loader2, ScanLine,
  CircleCheck, CircleX, MapPin, Phone, Mail, Briefcase, ArrowRight,
  X, FileText, Brain, Target, Zap, Clock, BarChart3, Users,
  TrendingUp, Award, Star, Shield, ChevronRight, SlidersHorizontal
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import PageShell from "../components/layout/PageShell";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Heading, Text } from "../components/ui/Typography";
import { Select } from "../components/ui/Input";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import DataTable from "../components/ui/DataTable";
import Modal from "../components/ui/Modal";
import { useData } from "../context/DataContext";
import { useSettings } from "../context/SettingsContext";
import { extractResumeText, generateResumeThumbnail, ACCEPTED_RESUME_TYPES } from "../lib/fileText";
import { generateAtsScore, resolveProfileForFile, isEligible } from "../lib/atsScore";
import { findMatchingActiveJobs, assignCompanyEligibility } from "../lib/roleMatching";

const PALETTE = ["#c8102e", "#121214", "#86858f", "#ad0d27", "#4a4a52", "#8c0a1f", "#10b981", "#3b82f6"];
const RED = "#c8102e";
const GREEN = "#10b981";
const BLUE = "#3b82f6";
const DARK = "#121214";

const SCAN_STEPS = [
  { icon: Upload, label: "Uploading resume", desc: "Reading file contents" },
  { icon: FileText, label: "Extracting text & formatting", desc: "Parsing document structure" },
  { icon: Brain, label: "Cross-referencing ATS keywords", desc: "Matching against job requirements" },
  { icon: Target, label: "Calculating compatibility score", desc: "Generating AI match score" },
  { icon: Zap, label: "Analyzing skills & experience", desc: "Evaluating candidate profile" },
  { icon: Award, label: "Generating recommendations", desc: "Creating match insights" },
];

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

function DetailChip({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-cloud text-ink-soft text-xs font-medium px-3 py-1.5">
      <Icon className="h-3.5 w-3.5 text-slate" /> {children}
    </span>
  );
}

// Scan Modal with enlarged document and continuous animation
function ScanModal({ isOpen, fileName, previewUrl, scanStep, scanProgress }) {
  const scanLineRef = useRef(null);
  const [animationPosition, setAnimationPosition] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setAnimationPosition(0);
      return;
    }

    // Continuous animation: move from 0 to 100 and repeat
    const interval = setInterval(() => {
      setAnimationPosition(prev => {
        const newPos = prev + 0.5;
        return newPos > 100 ? 0 : newPos;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [isOpen]);

  return (
    <Modal open={isOpen} onClose={() => { }} title="" size="xl" closeOnOutsideClick={false} showCloseButton={false}>
      <div className="p-0">
        <div className="relative overflow-hidden bg-white text-ink p-8 min-h-[600px]">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, #c8102e 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }} />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-start gap-8">
            {/* Enlarged Document Preview */}
            <div className="flex-shrink-0 w-full lg:w-auto">
              <div className="relative w-full lg:w-64 h-80 lg:h-96 rounded-xl overflow-hidden bg-gray-50 border-2 border-gray-200 shadow-xl">
                {previewUrl ? (
                  <img src={previewUrl} alt="Resume preview" className="absolute inset-0 h-full w-full object-cover object-top" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <FileText className="h-16 w-16 text-gray-300" />
                    <span className="text-sm text-gray-400 text-center px-4">{fileName || "Document"}</span>
                  </div>
                )}

                {/* Continuous scanning line animation from top to bottom */}
                <div className="absolute inset-0 overflow-hidden">
                  <div
                    className="absolute top-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-crimson-500 to-transparent"
                    style={{
                      top: `${animationPosition}%`,
                      transition: "top 0.02s linear",
                      boxShadow: "0 0 30px 10px rgba(200,16,46,0.3), 0 0 60px 20px rgba(200,16,46,0.15)",
                    }}
                  />
                  {/* Scan line glow reflection */}
                  <div
                    className="absolute top-1 left-0 right-0 h-20 bg-gradient-to-b from-crimson-500/10 to-transparent"
                    style={{
                      top: `${Math.max(0, animationPosition - 15)}%`,
                      transition: "top 0.02s linear",
                    }}
                  />
                </div>

                {/* Corner decorations */}
                {["top-3 left-3 border-t-2 border-l-2", "top-3 right-3 border-t-2 border-r-2",
                  "bottom-3 left-3 border-b-2 border-l-2", "bottom-3 right-3 border-b-2 border-r-2"].map((pos) => (
                    <span key={pos} className={`absolute h-8 w-8 border-crimson-500/50 ${pos}`} />
                  ))}

                {/* Pulsing corner dots */}
                {["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"].map((pos) => (
                  <span key={pos} className={`absolute h-2 w-2 bg-crimson-500 rounded-full animate-ping ${pos}`} style={{ animationDuration: '1.5s' }} />
                ))}
              </div>

              <div className="mt-3 text-center">
                <Text variant="small" className="text-gray-500">
                  {fileName}
                </Text>
              </div>
            </div>

            {/* Scanning Progress */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <Sparkles className="h-8 w-8 text-crimson-500" />
                </div>
                <Text variant="h3" className="text-ink font-bold">
                  AI Scanning Resume
                </Text>
              </div>

              <Text variant="body" className="text-gray-500 mb-6">
                Analyzing {fileName} with advanced AI matching algorithms
              </Text>

              {/* Progress Bar */}
              <div className="relative h-3 rounded-full bg-gray-200 overflow-hidden mb-6">
                <div
                  className="h-full bg-gradient-to-r from-crimson-600 via-crimson-500 to-crimson-600 rounded-full transition-all duration-500"
                  style={{ width: `${scanProgress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-2 text-xs font-bold text-gray-600">
                  {Math.round(scanProgress)}%
                </div>
              </div>

              {/* Scan Steps - with auto scroll */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
                {SCAN_STEPS.map((step, i) => {
                  const isActive = i === scanStep;
                  const isDone = i < scanStep;
                  const Icon = step.icon;

                  return (
                    <div
                      key={i}
                      className={cx(
                        "flex items-start gap-3 p-3 rounded-lg transition-all duration-300",
                        isActive ? "bg-crimson-50 border border-crimson-200 shadow-sm" : "",
                        isDone ? "opacity-100" : "opacity-50"
                      )}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {isDone ? (
                          <div className="relative">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            <div className="absolute inset-0 h-5 w-5 rounded-full bg-emerald-500/20 animate-ping" />
                          </div>
                        ) : isActive ? (
                          <div className="relative">
                            <Loader2 className="h-5 w-5 animate-spin text-crimson-500" />
                            <div className="absolute inset-0 h-5 w-5 rounded-full border-2 border-crimson-500/30 animate-pulse" />
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-gray-500" />
                          <span className={cx("text-sm font-medium", isActive ? "text-ink" : "text-gray-600")}>
                            {step.label}
                          </span>
                          {isActive && (
                            <span className="text-[10px] font-mono text-crimson-500 animate-pulse">
                              processing...
                            </span>
                          )}
                          {isDone && (
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          )}
                        </div>
                        <Text variant="small" className={cx("text-xs", isActive ? "text-gray-700" : "text-gray-500")}>
                          {step.desc}
                        </Text>
                      </div>
                      {isActive && (
                        <div className="flex-shrink-0">
                          <div className="flex gap-1">
                            <div className="h-2 w-2 rounded-full bg-crimson-500 animate-bounce" style={{ animationDelay: '0s' }} />
                            <div className="h-2 w-2 rounded-full bg-crimson-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                            <div className="h-2 w-2 rounded-full bg-crimson-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* AI Status Badge */}
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>AI Engine Active</span>
                </div>
                <span className="w-px h-3 bg-gray-200" />
                <span>v2.1.0</span>
                <span className="w-px h-3 bg-gray-200" />
                <span>{Math.round(scanProgress)}% complete</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// Score Popup Component
function ScorePopup({ score, eligible, onComplete }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl p-10 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in duration-500">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-crimson-500/20 blur-2xl animate-pulse" />

            <svg className="h-40 w-40 relative -rotate-90">
              <circle cx="80" cy="80" r="60" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle
                cx="80" cy="80" r="60" fill="none"
                stroke={eligible ? "#10b981" : "#c8102e"}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 60}
                strokeDashoffset={2 * Math.PI * 60 * (1 - (score || 0) / 100)}
                className="transition-all duration-1000"
              />
              {/* Glow on the stroke */}
              <circle
                cx="80" cy="80" r="60" fill="none"
                stroke={eligible ? "#10b981" : "#c8102e"}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 60}
                strokeDashoffset={2 * Math.PI * 60 * (1 - (score || 0) / 100)}
                className="transition-all duration-1000 opacity-20 blur-xl"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-ink">{score}</span>
              <span className="text-xs text-slate uppercase tracking-wider mt-1">ATS Score</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate">
            <Sparkles className="h-4 w-4 text-crimson-500" />
            <span>AI Analysis Complete</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AIMatch() {
  const { visible: data } = useData();
  const { settings } = useSettings();
  const fileInput = useRef(null);

  const [fileName, setFileName] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showScorePopup, setShowScorePopup] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [jobTypeFilter, setJobTypeFilter] = useState("All");

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setScanResult(null);
    setReady(false);
    setPreviewUrl(null);
    setExtracting(true);
    const [, thumbnail] = await Promise.all([
      extractResumeText(file),
      generateResumeThumbnail(file),
    ]);
    setPreviewUrl(thumbnail);
    setExtracting(false);
    setReady(true);
  }

  function runScan() {
    if (!ready || scanning) return;
    setScanResult(null);
    setScanning(true);
    setScanStep(0);
    setScanProgress(0);
    setShowScanModal(true);

    // Random duration between 5-10 seconds
    const duration = Math.floor(Math.random() * 5000) + 5000;
    const totalSteps = SCAN_STEPS.length;
    const stepDuration = duration / totalSteps;

    let currentStep = 0;
    let currentProgress = 0;

    const interval = setInterval(() => {
      currentStep++;
      currentProgress = Math.min(100, (currentStep / totalSteps) * 100);
      setScanStep(currentStep);
      setScanProgress(currentProgress);

      if (currentStep >= totalSteps) {
        clearInterval(interval);
        setScanProgress(100);

        // Calculate results
        const score = generateAtsScore(fileName, settings);
        const profile = resolveProfileForFile(fileName, settings);
        const eligible = isEligible(score, settings);

        const raw = profile && profile.jobRoles.length > 0
          ? findMatchingActiveJobs(data.Jobs, profile.jobRoles, 20)
          : [];
        const matched = assignCompanyEligibility(raw, eligible);

        setScanResult({
          fileName,
          score,
          profile,
          eligible,
          matchingJobs: matched.length
        });

        // Close scan modal after a brief pause
        setTimeout(() => {
          setShowScanModal(false);
          setScanning(false);
          setShowScorePopup(true);
        }, 500);
      }
    }, stepDuration);
  }

  const profile = useMemo(
    () => (scanResult ? scanResult.profile : null),
    [scanResult]
  );
  const eligible = scanResult ? scanResult.eligible : false;

  const matchedJobs = useMemo(() => {
    if (!profile || profile.jobRoles.length === 0) return [];
    const raw = findMatchingActiveJobs(data.Jobs, profile.jobRoles, 20);
    const assigned = assignCompanyEligibility(raw, eligible);

    return assigned
      .filter((j) => statusFilter === "All" || j.rowEligible === (statusFilter === "Eligible"))
      .filter((j) => jobTypeFilter === "All" || j.JobType === jobTypeFilter);
  }, [profile, eligible, data.Jobs, statusFilter, jobTypeFilter]);

  const jobTypes = ["All", ...new Set(data.Jobs?.map((j) => j.JobType) || [])];
  const statusOptions = ["All", "Eligible", "Not Eligible"];

  const columns = [
    {
      key: "Title",
      label: "Job Role",
      sortable: true,
      render: (r) => (
        <Link to={`/jobs/${r.JobID}`} className="font-semibold text-ink hover:text-crimson-600">
          {r.Title}
        </Link>
      ),
    },
    { key: "Company", label: "Company", sortable: true },
    { key: "City", label: "Location", render: (r) => `${r.City}, ${r.State}` },
    { key: "JobType", label: "Job Type" },
    { key: "VisaSponsorship", label: "Visa", render: (r) => <Badge tone="default">{r.VisaSponsorship}</Badge> },
    { key: "SalaryRange", label: "Salary" },
    {
      key: "Eligibility",
      label: "Eligibility",
      render: (r) => (
        <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${r.rowEligible ? "bg-emerald-50 text-emerald-700" : "bg-crimson-50 text-crimson-600"
          }`}>
          {r.rowEligible ? <CircleCheck className="h-3 w-3" /> : <CircleX className="h-3 w-3" />}
          {r.rowEligible ? "Eligible" : "Not Eligible"}
        </div>
      ),
    },
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

  const filterFields = [
    { value: statusFilter, set: setStatusFilter, options: statusOptions, prefix: "Status" },
    { value: jobTypeFilter, set: setJobTypeFilter, options: jobTypes, prefix: "Type" },
  ];

  return (
    <PageShell title="AI Match">
      <div className="max-w-7xl mx-auto space-y-5 bg-white">
        {/* Heading — white → red gradient banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-white via-white to-white px-6 py-6">
          <div className="pointer-events-none absolute bottom-0 left-1 h-24 w-20 rounded-full bg-crimson-600/30 blur-xl" />
          {/* <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-20 rounded-full bg-crimson-600/60 blur-2xl" /> */}
          <div className="relative flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="mt-1 flex items-center gap-2.5 text-2xl font-extrabold text-ink">
                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-crimson-600 shadow-sm ring-1 ring-crimson-700/30">
                  <Sparkles className="h-5 w-5 text-white" />
                </span>
                AI · Resume Scanner
              </h2>
              <Text variant="body" color="muted" className="mt-1">
                Upload a resume and get an instant ATS compatibility score with matching job opportunities
              </Text>
            </div>
            <div className="flex items-center gap-1.5 text-crimson-700 text-xs font-semibold bg-white/70 rounded-full px-3 py-1.5 ring-1 ring-crimson-200">
              <Brain className="h-3.5 w-3.5" />
              Powered by AI
            </div>
          </div>
        </div>

        {/* Upload Card */}
        <Card>
          <CardBody className="space-y-3">
            <div
              onClick={() => fileInput.current?.click()}
              className="rounded-xl border-2 border-dashed border-line hover:border-crimson-300 hover:bg-crimson-50/30 transition-colors cursor-pointer p-8 text-center"
            >
              <input ref={fileInput} type="file" accept={ACCEPTED_RESUME_TYPES} onChange={handleFile} className="hidden" />
              {fileName ? (
                <div className="flex flex-col items-center gap-2">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Resume preview" className="h-24 w-20 object-cover object-top rounded-md border border-line shadow-sm" />
                  ) : (
                    <Upload className="h-6 w-6 text-crimson-500" />
                  )}
                  <p className="text-sm font-semibold text-ink">{fileName}</p>
                  <p className="text-xs text-slate">{extracting ? "Reading file..." : "Click to choose a different file"}</p>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-crimson-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-ink">Click to upload a resume</p>
                  <p className="text-xs text-slate mt-1">PDF, DOC, DOCX, TXT or MD</p>
                </>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                variant="primary"
                icon={Sparkles}
                onClick={runScan}
                loading={scanning}
                disabled={!ready || extracting || scanning}
                className="px-6"
              >
                {scanning ? "Scanning..." : "Scan Resume"}
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Scan Modal */}
        <ScanModal
          isOpen={showScanModal}
          fileName={fileName}
          previewUrl={previewUrl}
          scanStep={scanStep}
          scanProgress={scanProgress}
        />

        {/* Score Popup */}
        {showScorePopup && scanResult && (
          <ScorePopup
            score={scanResult.score}
            eligible={scanResult.eligible}
            onComplete={() => {
              setShowScorePopup(false);
            }}
          />
        )}

        {/* Results Section */}
        {scanResult && !scanning && !showScorePopup && (
          <>
            {/* Profile Card */}
            <div className="mx-5">
              <Card className="p-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative h-32 w-32 shrink-0">
                    <svg className="h-32 w-32 -rotate-90">
                      <circle cx="64" cy="64" r="52" fill="none" stroke="#efeef2" strokeWidth="10" />
                      <circle
                        cx="64" cy="64" r="52" fill="none"
                        stroke={eligible ? "#10b981" : "#c8102e"}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 52}
                        strokeDashoffset={2 * Math.PI * 52 * (1 - (scanResult.score || 0) / 100)}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-ink">{scanResult.score}</span>
                      <span className="text-[10px] text-slate uppercase tracking-wide">ATS score</span>
                    </div>
                  </div>
                  <div className="flex-1 w-full text-center sm:text-left">

                    {profile?.name && <Heading variant="h4" className="mt-2">{profile.name}</Heading>}

                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                      {profile?.jobRoles?.map((r) => (
                        <Badge key={r} tone="default">{r}</Badge>
                      ))}
                      {profile?.experienceYears && <DetailChip icon={Briefcase}>{profile.experienceYears} yrs exp</DetailChip>}
                      {profile?.location && <DetailChip icon={MapPin}>{profile.location}</DetailChip>}
                      {profile?.mobile && <DetailChip icon={Phone}>{profile.mobile}</DetailChip>}
                      {profile?.email && <DetailChip icon={Mail}>{profile.email}</DetailChip>}
                    </div>

                    {profile?.skills?.length > 0 && (
                      <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 mt-3">
                        {profile.skills.slice(0, 10).map((s) => (
                          <span key={s} className="rounded-full bg-crimson-50 text-crimson-600 text-xs font-semibold px-2.5 py-1">
                            {s}
                          </span>
                        ))}
                        {profile.skills.length > 10 && (
                          <span className="rounded-full bg-cloud text-slate text-xs font-semibold px-2.5 py-1">
                            +{profile.skills.length - 10} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Matching Companies Table */}
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
                    {matchedJobs.length} matching jobs
                  </Badge>
                </div>
                <DataTable
                  columns={columns}
                  rows={matchedJobs}
                  searchTerm=""
                  emptyLabel="No matching jobs found for your profile"
                />
              </Card>
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}