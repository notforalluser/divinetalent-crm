import { useMemo, useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Upload, Sparkles, CheckCircle2, Loader2, ScanLine,
  CircleCheck, CircleX, MapPin, Phone, Mail, Briefcase,
  FileText, Brain, Target, Zap, BarChart3,
  Trophy, Star, Shield, ChevronRight, SlidersHorizontal,
  Globe, GraduationCap, FolderKanban, BadgeCheck,
  Languages as LanguagesIcon, Calendar, Building2,
  RefreshCw, FileWarning, UploadCloud, Gauge, ListChecks,
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
import { generateAtsScore, isEligible } from "../lib/atsScore";
import { findMatchingActiveJobs, assignCompanyEligibility, deriveCandidateRoles } from "../lib/roleMatching";
import { parseResumeProfile } from "../lib/resumeParser";

// Same soft, airy palette as the rest of the dashboard: light blue as the
// primary signal, light pink/rose as the secondary accent, warm amber as
// the tertiary, and a semantic green reserved for "eligible" states.
const BLUE = "#3b82f6";
const PINK = "#ec4899";
const AMBER = "#f59e0b";
const GREEN = "#10b981";
const PALETTE = [BLUE, PINK, AMBER, GREEN, "#60a5fa", "#f9a8d4"];

const SCAN_STEPS = [
  { icon: Upload, label: "Uploading resume" },
  { icon: FileText, label: "Extracting text & formatting" },
  { icon: Brain, label: "Cross-referencing ATS keywords" },
  { icon: Target, label: "Calculating compatibility score" },
  { icon: Zap, label: "Analyzing skills & experience" },
  { icon: Trophy, label: "Generating recommendations" },
];

const FLOW_STEPS = [
  { key: "upload", label: "Upload", icon: UploadCloud },
  { key: "scan", label: "AI Scan", icon: Brain },
  { key: "score", label: "ATS Score", icon: Gauge },
  { key: "profile", label: "Profile", icon: FileText },
  { key: "matches", label: "Matches", icon: ListChecks },
];

function cx(...args) {
  return args.filter(Boolean).join(" ");
}

function scoreAccent(score) {
  if (score >= 80) return GREEN;
  if (score >= 60) return BLUE;
  if (score >= 40) return AMBER;
  return PINK;
}

function scoreVerdict(score) {
  if (score >= 80) return "Excellent Match";
  if (score >= 60) return "Good Match";
  if (score >= 40) return "Fair Match";
  return "Needs Improvement";
}

/* ---------- Shared page chrome (matches Jobs / JobDetail / CandidateDetail) ---------- */

function DashboardBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#F7FAFF]">
      <style>{`
        @keyframes floatBlobA { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(40px,-30px) scale(1.08); } 66% { transform: translate(-20px,20px) scale(0.96); } }
        @keyframes floatBlobB { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-50px,30px) scale(1.1); } }
        @keyframes floatBlobC { 0%,100% { transform: translate(0,0) scale(1); } 40% { transform: translate(30px,40px) scale(0.94); } 70% { transform: translate(-30px,-10px) scale(1.05); } }
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
      <div className="dash-blob-a absolute -top-32 -left-24 h-[26rem] w-[26rem] rounded-full blur-3xl opacity-40" style={{ background: "radial-gradient(circle, #93c5fd 0%, transparent 70%)" }} />
      <div className="dash-blob-b absolute top-10 right-[-6rem] h-[24rem] w-[24rem] rounded-full blur-3xl opacity-30" style={{ background: "radial-gradient(circle, #f9a8d4 0%, transparent 70%)" }} />
      <div className="dash-blob-c absolute bottom-[-8rem] left-1/3 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-25" style={{ background: "radial-gradient(circle, #fde68a 0%, transparent 70%)" }} />
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
      .app-shell h1, .app-shell h2, .app-shell h3, .app-shell h4, .app-shell h5, .app-shell h6 {
        font-family: var(--font-display);
        letter-spacing: -0.012em;
      }
      .app-shell .stat-figure {
        font-family: var(--font-mono);
        letter-spacing: -0.02em;
        font-variant-numeric: tabular-nums;
      }
      @keyframes jobsFadeUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .jobs-fade-up { animation: jobsFadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
      @media (prefers-reduced-motion: reduce) { .jobs-fade-up { animation: none !important; } }
    `}</style>
  );
}

/* ---------- Flow stepper — shows where the user is in the journey ---------- */

function FlowStepper({ activeKey }) {
  const activeIndex = FLOW_STEPS.findIndex((s) => s.key === activeKey);
  return (
    <div className="jobs-fade-up flex items-center justify-between bg-white/80 backdrop-blur-sm ring-1 ring-blue-500/10 rounded-2xl px-4 sm:px-6 py-4 overflow-x-auto">
      {FLOW_STEPS.map((step, i) => {
        const isDone = i < activeIndex;
        const isActive = i === activeIndex;
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex items-center flex-1 min-w-[92px]">
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div
                className={cx(
                  "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 shrink-0",
                  isDone && "bg-emerald-500 text-white",
                  isActive && "bg-blue-500 text-white shadow-md shadow-blue-500/30 scale-110",
                  !isDone && !isActive && "bg-blue-50 text-blue-300"
                )}
              >
                {isDone ? <CheckCircle2 className="h-4.5 w-4.5" /> : <Icon className="h-4 w-4" />}
              </div>
              <span
                className={cx(
                  "text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap",
                  isActive ? "text-blue-600" : isDone ? "text-emerald-600" : "text-slate/60"
                )}
              >
                {step.label}
              </span>
            </div>
            {i < FLOW_STEPS.length - 1 && (
              <div className={cx("h-[2px] flex-1 mx-2 rounded-full transition-colors duration-500", isDone ? "bg-emerald-400" : "bg-blue-100")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Small presentational helpers ---------- */

function DetailChip({ icon: Icon, children, href }) {
  const content = (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50/80 text-ink-soft text-xs font-medium px-3 py-1.5 ring-1 ring-blue-100">
      <Icon className="h-3.5 w-3.5 text-blue-500" /> {children}
    </span>
  );
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
        {content}
      </a>
    );
  }
  return content;
}

function ProfileSection({ icon: Icon, title, count, children, delay = 0 }) {
  return (
    <Card className="jobs-fade-up bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10" style={{ animationDelay: `${delay}ms` }}>
      <CardHeader className="flex items-center gap-2 !py-3.5 !px-5">
        <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-blue-50">
          <Icon className="h-4 w-4 text-blue-600" />
        </span>
        <Text variant="small" className="font-bold text-ink">{title}</Text>
        {typeof count === "number" && (
          <Badge tone="default" className="ml-auto">{count}</Badge>
        )}
      </CardHeader>
      <CardBody className="space-y-4 !px-5 !pb-5">{children}</CardBody>
    </Card>
  );
}

function TimelineEntry({ title, subtitle, duration, description }) {
  return (
    <div className="border-l-2 border-blue-100 pl-4 relative">
      <span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-blue-500" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-ink">{title || "—"}</p>
        {duration && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate">
            <Calendar className="h-3 w-3" /> {duration}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-xs font-medium text-blue-600 mt-0.5 inline-flex items-center gap-1">
          <Building2 className="h-3 w-3" /> {subtitle}
        </p>
      )}
      {description && (
        <p className="text-xs text-slate mt-1.5 leading-relaxed whitespace-pre-line">{description}</p>
      )}
    </div>
  );
}

function TagList({ items, cycle = false }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span
          key={`${item}-${i}`}
          className="rounded-full text-xs text-slate mt-1.5 leading-relaxed whitespace-pre-line bg-slate-100 px-1"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

// NOTE: summary + skills render ONLY inside their own dedicated cards below
// (Professional Summary / Skills). The header card only shows identity +
// contact info, so nothing is duplicated on screen.
function ResumeProfileView({ profile, score, eligible, showScore = false }) {
  if (!profile) return null;
  const accent = scoreAccent(score ?? 0);

  return (
    <div className="space-y-5">
      <Card className="jobs-fade-up relative overflow-hidden bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10">
        {/* soft accent wash */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-pink-300/10 blur-3xl" />
        <CardBody className="py-5 px-5 relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              {profile.name && <Heading variant="h5" className="text-ink">{profile.name}</Heading>}
              {profile.headline && (
                <p className="text-xs font-semibold uppercase tracking-widest text-slate mt-1">
                  {profile.headline}
                </p>
              )}
              {profile.jobRoles?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {profile.jobRoles.map((role) => (
                    <Badge key={role} tone="default">{role}</Badge>
                  ))}
                </div>
              )}
            </div>

            {showScore && (
              <div className="relative h-24 w-24 shrink-0">
                <div className="absolute inset-0 rounded-full blur-xl opacity-30" style={{ background: accent }} />
                <svg className="h-24 w-24 -rotate-90 relative">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="#eef2f7" strokeWidth="8" />
                  <circle
                    cx="48" cy="48" r="40" fill="none"
                    stroke={accent}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - ((score ?? 0) || 0) / 100)}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-ink stat-figure">{score ?? 0}</span>
                  <span className="text-[10px] text-slate uppercase tracking-wider">ATS</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2.5 mt-4">
            {profile.experienceYears ? <DetailChip icon={Briefcase}>{profile.experienceYears} yrs exp</DetailChip> : null}
            {profile.mobile && <DetailChip icon={Phone}>{profile.mobile}</DetailChip>}
            {profile.email && <DetailChip icon={Mail}>{profile.email}</DetailChip>}
            {profile.location && <DetailChip icon={MapPin}>{profile.location}</DetailChip>}
            {profile.linkedin && <DetailChip icon={Globe} href={profile.linkedin}>LinkedIn</DetailChip>}
            {profile.github && <DetailChip icon={Globe} href={profile.github}>GitHub</DetailChip>}
            {profile.portfolio && <DetailChip icon={Globe} href={profile.portfolio}>Portfolio</DetailChip>}
          </div>
        </CardBody>
      </Card>

      {profile.summary && (
        <Card className="jobs-fade-up bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10" style={{ animationDelay: "80ms" }}>
          <CardHeader className="flex items-center gap-2 !py-3.5 !px-5">
            <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-blue-50">
              <FileText className="h-4 w-4 text-blue-600" />
            </span>
            <Text variant="small" className="font-bold text-ink">Professional Summary</Text>
          </CardHeader>
          <CardBody className="!px-5 !pb-5">
            <p className="text-sm leading-relaxed text-slate">{profile.summary}</p>
          </CardBody>
        </Card>
      )}

      {profile.skills?.length > 0 && (
        <Card className="bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10" style={{ animationDelay: "140ms" }}>
          <CardBody className="!px-5 !pb-5">
            <TagList items={profile.skills} cycle />
          </CardBody>
        </Card>
      )}

      {profile.experience?.length > 0 && (
        <ProfileSection icon={Briefcase} title="Experience" count={profile.experience.length} delay={200}>
          {profile.experience.map((e, i) => (
            <TimelineEntry key={`exp-${i}`} title={e.title} subtitle={e.company} duration={e.duration} description={e.description} />
          ))}
        </ProfileSection>
      )}

      {profile.education?.length > 0 && (
        <ProfileSection icon={GraduationCap} title="Education" count={profile.education.length} delay={260}>
          {profile.education.map((e, i) => (
            <TimelineEntry key={`edu-${i}`} title={e.degree} subtitle={e.institution} duration={e.duration} />
          ))}
        </ProfileSection>
      )}

      {profile.projects?.length > 0 && (
        <ProfileSection icon={FolderKanban} title="Projects" count={profile.projects.length} delay={320}>
          {profile.projects.map((p, i) => (
            <TimelineEntry key={`proj-${i}`} title={p.name} subtitle={p.tech} description={p.description} />
          ))}
        </ProfileSection>
      )}

      {profile.certifications?.length > 0 && (
        <ProfileSection icon={BadgeCheck} title="Certifications" count={profile.certifications.length} delay={380}>
          <TagList items={profile.certifications} />
        </ProfileSection>
      )}

      {profile.achievements?.length > 0 && (
        <ProfileSection icon={Trophy} title="Achievements" count={profile.achievements.length} delay={440}>
          <TagList items={profile.achievements} />
        </ProfileSection>
      )}

      {profile.languages?.length > 0 && (
        <ProfileSection icon={LanguagesIcon} title="Languages" count={profile.languages.length} delay={500}>
          <TagList items={profile.languages} />
        </ProfileSection>
      )}
    </div>
  );
}

// Scan Modal — glass styling with a layered scanning beam, ambient glow,
// and a combined ring + bar progress indicator.
function ScanModal({ isOpen, fileName, previewUrl, scanStep, scanProgress }) {
  const [animationPosition, setAnimationPosition] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setAnimationPosition(0);
      return;
    }
    const interval = setInterval(() => {
      setAnimationPosition((prev) => {
        const newPos = prev + 0.6;
        return newPos > 100 ? 0 : newPos;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [isOpen]);

  return (
    <Modal open={isOpen} onClose={() => { }} title="" size="xl" closeOnOutsideClick={false} showCloseButton={false}>
      <div className="p-0">
        <div className="relative overflow-hidden bg-gradient-to-br from-white via-white to-blue-50/40 text-ink p-8 min-h-[600px]">
          {/* Ambient background glows */}
          <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl animate-pulse" style={{ animationDuration: "4s" }} />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-pink-300/10 blur-3xl animate-pulse" style={{ animationDuration: "5s" }} />
          <div className="absolute inset-0 opacity-[0.04]">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #3b82f6 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-start gap-8">
            {/* Enlarged Document Preview */}
            <div className="flex-shrink-0 w-full lg:w-auto">
              <div className="relative w-full lg:w-64 h-80 lg:h-96 rounded-2xl overflow-hidden bg-gray-50 border border-white shadow-[0_20px_60px_-15px_rgba(59,130,246,0.35)] ring-1 ring-blue-100">
                {previewUrl ? (
                  <img src={previewUrl} alt="Resume preview" className="absolute inset-0 h-full w-full object-cover object-top" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <FileText className="h-16 w-16 text-gray-300" />
                    <span className="text-sm text-gray-400 text-center px-4">{fileName || "Document"}</span>
                  </div>
                )}

                {/* Scanning beam */}
                <div className="absolute inset-0 overflow-hidden">
                  <div
                    className="absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent via-blue-500/25 to-transparent"
                    style={{ top: `${Math.max(-24, animationPosition - 12)}%`, transition: "top 0.03s linear" }}
                  />
                  <div
                    className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                    style={{
                      top: `${animationPosition}%`,
                      transition: "top 0.03s linear",
                      boxShadow: "0 0 24px 6px rgba(59,130,246,0.55), 0 0 50px 18px rgba(59,130,246,0.2)",
                    }}
                  />
                </div>

                {/* Corner brackets */}
                {["top-3 left-3 border-t-2 border-l-2", "top-3 right-3 border-t-2 border-r-2",
                  "bottom-3 left-3 border-b-2 border-l-2", "bottom-3 right-3 border-b-2 border-r-2"].map((pos) => (
                    <span key={pos} className={`absolute h-8 w-8 rounded-sm border-blue-500/60 ${pos}`} />
                  ))}
                {["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"].map((pos) => (
                  <span key={pos} className={`absolute h-2 w-2 bg-blue-500 rounded-full animate-ping ${pos}`} style={{ animationDuration: '1.6s' }} />
                ))}

                <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 60px rgba(0,0,0,0.06)" }} />
              </div>

              <div className="mt-3 text-center flex items-center justify-center gap-1.5">
                <ScanLine className="h-3.5 w-3.5 text-blue-400" />
                <Text variant="small" className="text-gray-500 truncate max-w-[220px]">
                  {fileName}
                </Text>
              </div>
            </div>

            {/* Scanning Progress */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative flex items-center justify-center h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
                  <Sparkles className="h-5 w-5 text-white" />
                  <span className="absolute inset-0 rounded-2xl border border-white/30 animate-ping" style={{ animationDuration: "2s" }} />
                </div>
                <div>
                  <Text variant="h3" className="text-ink font-bold leading-tight">AI Scanning Resume</Text>
                  <Text variant="small" className="text-gray-500">Analyzing with advanced ATS matching algorithms</Text>
                </div>
              </div>

              {/* Progress ring + bar */}
              <div className="flex items-center gap-4 my-6">
                <div className="relative h-16 w-16 shrink-0">
                  <svg className="h-16 w-16 -rotate-90">
                    <circle cx="32" cy="32" r="26" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                    <circle
                      cx="32" cy="32" r="26" fill="none"
                      stroke={BLUE}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 26}
                      strokeDashoffset={2 * Math.PI * 26 * (1 - scanProgress / 100)}
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-ink stat-figure">
                    {Math.round(scanProgress)}%
                  </div>
                </div>

                <div className="flex-1 relative h-2.5 rounded-full bg-gray-200/70 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${scanProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer" />
                  </div>
                </div>
              </div>

              {/* Scan Steps */}
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
                {SCAN_STEPS.map((step, i) => {
                  const isActive = i === scanStep;
                  const isDone = i < scanStep;
                  const Icon = step.icon;

                  return (
                    <div
                      key={i}
                      className={cx(
                        "flex items-start gap-3 p-2 rounded-xl transition-all duration-300 border",
                        isActive ? "bg-white border-blue-200 shadow-md shadow-blue-500/10 scale-[1.01]" : "border-transparent",
                        isDone ? "opacity-100" : isActive ? "opacity-100" : "opacity-45"
                      )}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {isDone ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : isActive ? (
                          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-gray-500" />
                          <span className={cx("text-sm font-medium", isActive ? "text-ink" : "text-gray-600")}>{step.label}</span>
                          {isActive && <span className="text-[10px] font-mono text-blue-500 animate-pulse">processing…</span>}
                        </div>
                      </div>
                      {isActive && (
                        <div className="flex-shrink-0 flex gap-1 items-end pb-1">
                          <div className="h-2 w-1 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0s' }} />
                          <div className="h-3 w-1 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.15s' }} />
                          <div className="h-1.5 w-1 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>AI Engine Active</span>
                </div>
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

// Score Popup — verdict-driven copy, layered glow rings, soft particle burst.
// Color band follows the score itself, not just eligible/not-eligible.
function ScorePopup({ score, eligible, onComplete }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 2600);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  const verdict = scoreVerdict(score);
  const accent = scoreAccent(score);
  const particles = Array.from({ length: 10 });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-500">
      <div className="relative bg-white rounded-3xl p-10 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in duration-500 overflow-hidden">
        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-52 w-52 rounded-full blur-3xl opacity-20" style={{ background: accent }} />

        <div className="relative text-center">
          <div className="relative inline-block mb-6">
            {particles.map((_, i) => {
              const angle = (360 / particles.length) * i;
              return (
                <span
                  key={i}
                  className="absolute top-1/2 left-1/2 h-1.5 w-1.5 rounded-full animate-ping"
                  style={{
                    background: accent,
                    transform: `rotate(${angle}deg) translate(80px)`,
                    animationDuration: "1.4s",
                    animationDelay: `${i * 60}ms`,
                    opacity: 0.5,
                  }}
                />
              );
            })}

            <div className="absolute inset-0 rounded-full blur-2xl animate-pulse" style={{ background: `${accent}33` }} />

            <svg className="h-40 w-40 relative -rotate-90">
              <circle cx="80" cy="80" r="60" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle
                cx="80" cy="80" r="60" fill="none"
                stroke={accent}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 60}
                strokeDashoffset={2 * Math.PI * 60 * (1 - (score || 0) / 100)}
                className="transition-all duration-1000"
              />
              <circle
                cx="80" cy="80" r="60" fill="none"
                stroke={accent}
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 60}
                strokeDashoffset={2 * Math.PI * 60 * (1 - (score || 0) / 100)}
                className="transition-all duration-1000 opacity-20 blur-xl"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-ink stat-figure">{score}</span>
              <span className="text-xs text-slate uppercase tracking-wider mt-1">ATS Score</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 mb-1">
            {eligible ? <CircleCheck className="h-4 w-4" style={{ color: accent }} /> : <CircleX className="h-4 w-4" style={{ color: accent }} />}
            <Text variant="body" className="font-bold text-ink">{verdict}</Text>
          </div>

          <div className="mt-2 flex items-center justify-center gap-2 text-xs text-slate">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <span>AI Analysis Complete</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Upload dropzone: drag & drop + file-type awareness ---------- */

function UploadDropzone({ fileInput, fileName, previewUrl, extracting, ready, fileError, onFile, onOpenPicker }) {
  const [dragging, setDragging] = useState(false);

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) onFile({ target: { files: [file] } });
  }

  return (
    <div
      onClick={onOpenPicker}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cx(
        "relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer p-10 text-center overflow-hidden",
        dragging
          ? "border-blue-400 bg-blue-50/60 scale-[1.01]"
          : "border-blue-200 hover:border-blue-300 hover:bg-blue-50/30"
      )}
    >
      <input ref={fileInput} type="file" accept={ACCEPTED_RESUME_TYPES} onChange={onFile} className="hidden" />

      {/* soft ambient glow */}
      <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-blue-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-pink-300/10 blur-3xl" />

      {fileName ? (
        <div className="relative flex flex-col items-center gap-2.5">
          {previewUrl ? (
            <img src={previewUrl} alt="Resume preview" className="h-28 w-22 object-cover object-top rounded-lg border border-blue-100 shadow-md shadow-blue-500/10" />
          ) : extracting ? (
            <Loader2 className="h-7 w-7 text-blue-500 animate-spin" />
          ) : fileError ? (
            <FileWarning className="h-7 w-7 text-pink-500" />
          ) : (
            <Upload className="h-7 w-7 text-blue-500" />
          )}
          <p className="text-sm font-semibold text-ink">{fileName}</p>
          <p className="text-xs text-slate">
            {extracting ? "Reading file..." : ready ? "Ready — click \"Scan Resume\" to run AI analysis" : "Click or drop a file to choose a different resume"}
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className={cx("mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-400 shadow-lg shadow-blue-500/25 transition-transform duration-300", dragging && "scale-110")}>
            <UploadCloud className="h-7 w-7 text-white" />
          </div>
          <p className="text-sm font-semibold text-ink">{dragging ? "Drop it here" : "Click to upload, or drag & drop"}</p>
          <p className="text-xs text-slate mt-1">PDF, DOC, DOCX, TXT or MD</p>
        </div>
      )}
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

  const [resumeProfile, setResumeProfile] = useState(null);
  const [fileError, setFileError] = useState("");

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setScanResult(null);
    setReady(false);
    setPreviewUrl(null);
    setResumeProfile(null);
    setFileError("");
    setExtracting(true);
    try {
      const [text, thumbnail] = await Promise.all([
        extractResumeText(file),
        generateResumeThumbnail(file),
      ]);
      if (!text || !text.trim()) {
        setFileError("Could not extract any text from this file. It may be an image-based scan.");
        return;
      }
      // Parsed here so it's ready the moment scanning finishes — but we
      // deliberately do NOT render it until the scan animation completes.
      setResumeProfile(parseResumeProfile(text, file.name));
      setPreviewUrl(thumbnail);
      setReady(true);
    } catch (err) {
      console.error(err);
      setFileError("Something went wrong while reading this file. Please try a different file.");
    } finally {
      setExtracting(false);
    }
  }

  function resetAll() {
    setFileName("");
    setScanResult(null);
    setReady(false);
    setPreviewUrl(null);
    setResumeProfile(null);
    setFileError("");
    setScanning(false);
    setScanStep(0);
    setScanProgress(0);
    if (fileInput.current) fileInput.current.value = "";
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

    const interval = setInterval(() => {
      currentStep++;
      const currentProgress = Math.min(100, (currentStep / totalSteps) * 100);
      setScanStep(currentStep);
      setScanProgress(currentProgress);

      if (currentStep >= totalSteps) {
        clearInterval(interval);
        setScanProgress(100);

        const score = generateAtsScore(fileName, settings);
        const profile = resumeProfile;
        const eligible = isEligible(score, settings);

        const { roles: candidateRoles, domainSources, skillsText } = deriveCandidateRoles(profile);
        const raw = candidateRoles.length > 0
          ? findMatchingActiveJobs(data.Jobs, candidateRoles, undefined, domainSources, skillsText)
          : [];
        const matched = assignCompanyEligibility(raw, eligible);

        setScanResult({ fileName, score, profile, eligible, matchingJobs: matched.length });

        setTimeout(() => {
          setShowScanModal(false);
          setScanning(false);
          setShowScorePopup(true);
        }, 500);
      }
    }, stepDuration);
  }

  const profile = useMemo(() => (scanResult ? scanResult.profile : null), [scanResult]);
  const eligible = scanResult ? scanResult.eligible : false;

  const { roles: candidateRoles, domainSources: candidateDomainSources, skillsText: candidateSkillsText } = useMemo(
    () => deriveCandidateRoles(profile),
    [profile]
  );

   const matchedJobs = useMemo(() => {
    if (!profile || !candidateRoles.length) return [];
    const raw = findMatchingActiveJobs(data.Jobs, candidateRoles, undefined, candidateDomainSources, candidateSkillsText);
    const assigned = assignCompanyEligibility(raw, eligible);

    return assigned
      .filter((j) => statusFilter === "All" || j.rowEligible === (statusFilter === "Eligible"))
      .filter((j) => jobTypeFilter === "All" || j.JobType === jobTypeFilter);
  }, [profile, candidateRoles, candidateDomainSources, eligible, data.Jobs, statusFilter, jobTypeFilter]);

  const jobTypes = ["All", ...new Set(data.Jobs?.map((j) => j.JobType) || [])];
  const statusOptions = ["All", "Eligible", "Not Eligible"];

  const columns = [
    {
      key: "Title",
      label: "Job Role",
      sortable: true,
      render: (r) => (
        <Link to={`/jobs/${r.JobID}`} className="font-semibold text-ink hover:text-blue-600">
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
        <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${r.rowEligible ? "bg-emerald-50 text-emerald-700" : "bg-pink-50 text-pink-600"}`}>
          {r.rowEligible ? <CircleCheck className="h-3 w-3" /> : <CircleX className="h-3 w-3" />}
          {r.rowEligible
            ? (r.eligibilityReason === "low-salary" ? "Eligible · Entry Salary" : "Eligible")
            : "Not Eligible"}
        </div>
      ),
    },
    {
      key: "_view",
      label: "",
      render: (r) => (
        <Link to={`/jobs/${r.JobID}`} className="text-slate hover:text-blue-600">
          <ChevronRight className="h-4 w-4" />
        </Link>
      ),
    },
  ];

  const filterFields = [
    { value: statusFilter, set: setStatusFilter, options: statusOptions, prefix: "Status" },
    { value: jobTypeFilter, set: setJobTypeFilter, options: jobTypes, prefix: "Type" },
  ];

  const resultsVisible = scanResult && !scanning && !showScorePopup;
  const flowActiveKey = resultsVisible
    ? "matches"
    : scanning || showScanModal
      ? "scan"
      : showScorePopup
        ? "score"
        : "upload";

  return (
    <PageShell title="AI Match">
      <PageTypography />
      <DashboardBackground />

      <div className="app-shell space-y-6">

        {/* Hero */}
        <div className="jobs-fade-up relative overflow-hidden bg-white/80 backdrop-blur-sm px-6 py-4 ring-1 ring-blue-500/10 shadow-sm">
          <div className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-pink-300/10 blur-3xl" />

          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-3.5">
              <span className="group flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-crimson-500 via-crimson-600 to-crimson-500 ring-1 ring-blue-400/20 transition-transform duration-300 hover:scale-105 hover:rotate-3">
                <Sparkles className="h-4 w-4 text-white transition-transform duration-300 group-hover:scale-110" />
              </span>
              <div>
                <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-ink">
                  AI · Resume Scanner
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-blue-700 text-xs font-semibold bg-blue-50/70 rounded-full px-3.5 py-2 ring-1 ring-blue-200">
                <Brain className="h-3.5 w-3.5" />
                Powered by AI
              </div>
              {scanResult && !scanning && (
                <button
                  onClick={resetAll}
                  className="flex items-center gap-1.5 text-pink-600 text-xs font-semibold bg-pink-50/70 rounded-full px-3.5 py-2 ring-1 ring-pink-200 hover:bg-pink-100 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Scan another resume
                </button>
              )}
            </div>
          </div>
        </div>

        <div className=" px-4 md:px-6">

        {/* Upload Card */}
        <Card className="jobs-fade-up bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10" style={{ animationDelay: "80ms" }}>
          <CardBody className="space-y-4 !p-5">
            <UploadDropzone
              fileInput={fileInput}
              fileName={fileName}
              previewUrl={previewUrl}
              extracting={extracting}
              ready={ready}
              fileError={fileError}
              onFile={handleFile}
              onOpenPicker={() => fileInput.current?.click()}
            />

            <div className="flex items-center justify-between gap-3">
              {fileError ? (
                <p className="text-xs font-medium text-pink-600 flex items-center gap-1.5">
                  <FileWarning className="h-3.5 w-3.5" /> {fileError}
                </p>
              ) : <span />}
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
        <ScanModal isOpen={showScanModal} fileName={fileName} previewUrl={previewUrl} scanStep={scanStep} scanProgress={scanProgress} />

        {/* Score Popup */}
        {showScorePopup && scanResult && (
          <ScorePopup
            score={scanResult.score}
            eligible={scanResult.eligible}
            onComplete={() => setShowScorePopup(false)}
          />
        )}

        {/* Results Section — only appears once the scan + score popup are done */}
        {resultsVisible && (
          <>
            <ResumeProfileView profile={profile} score={scanResult?.score ?? 0} eligible={scanResult?.eligible ?? false} showScore />

            <div className="jobs-fade-up" style={{ animationDelay: "180ms" }}>
              <Card className="bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10">
                <div className="flex items-center flex-nowrap gap-2.5 px-4 py-3 border-b border-blue-100 bg-gradient-to-r from-blue-50/70 via-pink-50/40 to-transparent rounded-t-2xl overflow-x-auto scrollbar-thin">
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
                        "!py-1 !pl-2 !pr-5 !text-[10px] !rounded-full !border-blue-200 truncate",
                        "shrink-0 shadow-sm hover:shadow transition-shadow hover:border-blue-300",
                        "hover:ring-2 hover:ring-blue-400/20 focus:ring-2 focus:ring-blue-400/30"
                      )}
                      style={{ width: 96 }}
                    >
                      {f.options.map((s) => (
                        <option key={s} value={s}>{f.prefix}: {s}</option>
                      ))}
                    </Select>
                  ))}
                  <div className="flex-1" />
                  <Badge tone="default" className="shrink-0">{matchedJobs.length} matching jobs</Badge>
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
      </div>
    </PageShell>
  );
}