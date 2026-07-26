import { useState, useRef, useEffect } from "react";
import {
  GraduationCap,
  BookOpen,
  Briefcase,
  FlaskConical,
  Building2,
  Users,
  FileCheck,
  FileText,
  BadgeCheck,
  Landmark,
  ArrowRightLeft,
  Sparkles,
  X,
  Info,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Lock,
  Eye,
  Wrench,
  ClipboardCheck,
  Globe,
  Repeat,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import PageShell from "../components/layout/PageShell";

/* ----------------------------------------------------------------------
   DATA MODEL
   ------------------------------------------------------------------- */

const NW = 176; // node width
const NH = 86; // node height
const HW = NW / 2;
const HH = NH / 2;

const NODES = {
  f1: {
    id: "f1",
    x: 100,
    y: 430,
    icon: GraduationCap,
    title: "F-1 Student Visa",
    tag: "Nonimmigrant · Academic study",
    accent: "#475569",
    summary: "The most common starting point. Full-time enrollment at a SEVP-certified U.S. school, academic (not vocational) programs.",
    duration: "Length of academic program",
    requirements: [
      "Admission to a SEVP-certified school",
      "Proof of financial support (I-20 / DS-160)",
      "Maintain full-time enrollment",
      "Intent to depart after studies (or change status)",
    ],
    weProvide: [],
  },
  m1: {
    id: "m1",
    x: 100,
    y: 830,
    icon: Wrench,
    title: "M-1 Vocational Visa",
    tag: "Alternate route · Vocational study",
    accent: "#b45309",
    summary: "For non-academic, vocational, or technical training programs — a stricter alternative to F-1, open to students of any nationality.",
    duration: "Length of vocational program (typically up to 1 year, extendable)",
    requirements: [
      "Admission to an SEVP-certified vocational school",
      "Proof of financial support (I-20 / DS-160)",
      "Full-time enrollment maintained",
      "No CPT — practical training only after completion",
    ],
    weProvide: [],
  },
  j1: {
    id: "j1",
    x: 620,
    y: 830,
    icon: Globe,
    title: "J-1 Exchange Visitor",
    tag: "Alternate route · Exchange program",
    accent: "#b45309",
    summary: "For students, scholars, and trainees in sponsor-approved exchange programs. Some categories carry a two-year home-residency rule that can restrict later status changes.",
    duration: "Length of program, as set by sponsor",
    requirements: [
      "Sponsorship by a designated exchange program",
      "Proof of financial support (DS-2019)",
      "May be subject to 2-yr home-residency rule (212(e))",
    ],
    weProvide: [],
  },
  cpt: {
    id: "cpt",
    x: 400,
    y: 190,
    icon: BookOpen,
    title: "CPT",
    tag: "Optional · During studies",
    accent: "#64748b",
    summary: "Curricular Practical Training — paid internship tied directly to your curriculum, authorized by your school.",
    duration: "Part-time or full-time, while enrolled",
    requirements: [
      "Job tied to your curriculum / major",
      "Employer offer letter required",
      "Authorized by DSO before starting",
      "1 year+ of full-time CPT can affect OPT eligibility",
    ],
    weProvide: ["We offer a curriculum-linked internship", "We issue an employer offer letter for your DSO"],
  },
  m1pt: {
    id: "m1pt",
    x: 360,
    y: 830,
    icon: ClipboardCheck,
    title: "M-1 Practical Training",
    tag: "Optional · After completion",
    accent: "#64748b",
    summary: "Practical Training for M-1 students — strictly capped at 1 month of work per 4 months of study completed, up to 6 months total.",
    duration: "Up to 6 months, after program completion",
    requirements: [
      "EAD card required before starting work",
      "Job must relate to vocational program",
      "Apply before program completion date",
    ],
    weProvide: ["We offer a training placement matched to your program"],
  },
  j1at: {
    id: "j1at",
    x: 960,
    y: 830,
    icon: Repeat,
    title: "J-1 Academic Training",
    tag: "Optional · Work authorization",
    accent: "#64748b",
    summary: "Academic Training — the J-1 equivalent of OPT. Work authorized in your field of study, for up to 18 months (36 for postdoctoral scholars).",
    duration: "Up to 18 months (postdocs: up to 36 months)",
    requirements: [
      "Sponsor authorization required before starting",
      "Job must relate to field of study",
      "212(e) rule, if applicable, may block later steps without a waiver",
    ],
    weProvide: ["We support sponsor-authorized training placements"],
  },
  opt: {
    id: "opt",
    x: 620,
    y: 430,
    icon: Briefcase,
    title: "OPT",
    tag: "Nonimmigrant · Work authorization",
    accent: "#475569",
    summary: "Optional Practical Training — 12 months of work authorization in your field of study, after graduation.",
    duration: "12 months",
    requirements: [
      "EAD card required before starting work",
      "Job must relate to your degree",
      "File within 90 days of graduation",
    ],
    weProvide: ["We provide a role matched to your field of study", "We support your EAD-based onboarding"],
  },
  stemopt: {
    id: "stemopt",
    x: 960,
    y: 430,
    icon: FlaskConical,
    title: "STEM OPT Extension",
    tag: "Nonimmigrant · Work authorization",
    accent: "#475569",
    summary: "A 24-month extension of OPT, available only for STEM-designated degrees, at an E-Verify employer.",
    duration: "+24 months (36 months total with OPT)",
    requirements: [
      "STEM-designated degree (CIP code)",
      "Employer must be enrolled in E-Verify",
      "Formal training plan (Form I-983)",
      "Extends your window to be selected for H-1B",
    ],
    weProvide: ["We are E-Verify registered", "We co-sign your Form I-983 training plan"],
  },
  l1: {
    id: "l1",
    x: 960,
    y: 190,
    icon: ArrowRightLeft,
    title: "L-1 Visa",
    tag: "Alternate route · Intracompany transfer",
    accent: "#b45309",
    summary: "For employees transferring from an affiliated office abroad into a managerial, executive, or specialized-knowledge role — an alternative to the F-1 → H-1B route, not built on it.",
    duration: "Up to 7 years (L-1A) / 5 years (L-1B)",
    requirements: [
      "1 year employment abroad with the same employer group",
      "Managerial, executive, or specialized-knowledge role",
      "No annual lottery or cap",
    ],
    weProvide: ["We transfer you directly through our global entity", "L-1A route can skip labor certification (EB-1C)"],
  },
  h1b: {
    id: "h1b",
    x: 1300,
    y: 430,
    icon: Building2,
    title: "H-1B Work Visa",
    tag: "Nonimmigrant · Specialty occupation",
    accent: "#475569",
    summary: "Every route on this map converges here. A specialty-occupation visa, subject to an annual cap and lottery.",
    duration: "3 years, renewable to 6 (longer if a green card is in process)",
    requirements: [
      "Visa sponsorship required",
      "Job must be full-time",
      "Role must require a bachelor's degree or higher",
      "Subject to annual cap-based lottery",
    ],
    weProvide: ["We file and sponsor your H-1B petition", "We provide a formal offer letter", "Dedicated immigration counsel throughout"],
  },
  h4: {
    id: "h4",
    x: 1300,
    y: 830,
    icon: Users,
    title: "H-4 Visa",
    tag: "Dependent · Nonimmigrant",
    accent: "#64748b",
    summary: "Status for the spouse or unmarried child under 21 of an H-1B holder. Dual-intent — pursuing a green card doesn't jeopardize this status. No work authorization on its own.",
    duration: "Tied to the H-1B holder's status",
    requirements: ["Valid marriage or parent-child relationship to the H-1B holder", "H-1B holder maintains valid status"],
    weProvide: [],
  },
  h4ead: {
    id: "h4ead",
    x: 1620,
    y: 830,
    icon: Users,
    title: "H-4 EAD",
    tag: "Dependent · Work authorization",
    accent: "#64748b",
    summary: "Work permit for the H-4 spouse once the H-1B holder's green card process reaches a qualifying stage. Doesn't require its own employer sponsorship — you can work for anyone, or start a business. Since October 2025, renewals no longer get an automatic extension, so timing matters.",
    duration: "Tied to H-1B validity; must be renewed before it expires",
    requirements: [
      "Spouse (not children) of a valid H-1B holder",
      "H-1B holder has an approved I-140, OR an AC21 extension beyond 6 years",
      "Your own H-4 status must be currently valid",
    ],
    weProvide: ["We support the H-4 EAD (I-765) filing for your spouse"],
  },
  niw: {
    id: "niw",
    x: 1660,
    y: 190,
    icon: Sparkles,
    title: "EB-1 / NIW",
    tag: "Alternate route · Self-petition",
    accent: "#b45309",
    summary: "For extraordinary-ability applicants or those working in the national interest — a self-petitioned route that skips PERM labor certification entirely.",
    duration: "Varies — often faster, since there's no labor cert step",
    requirements: [
      "Extraordinary ability, OR advanced degree + national interest",
      "Strong evidence portfolio (publications, awards, impact)",
      "No job offer required for NIW",
    ],
    weProvide: ["We support your self-petition portfolio", "No PERM step needed — filed straight to I-140"],
  },
  perm: {
    id: "perm",
    x: 1660,
    y: 430,
    icon: FileCheck,
    title: "PERM Labor Certification",
    tag: "Green Card · Step 1",
    accent: "#4338ca",
    summary: "Employer proves no qualified U.S. worker is available for the role, at the prevailing wage.",
    duration: "6–12 months",
    requirements: ["Prevailing wage determination", "Recruitment process documented", "Employer-sponsored, not portable"],
    weProvide: ["We file PERM on your behalf", "We cover legal & filing costs"],
  },
  i140: {
    id: "i140",
    x: 2000,
    y: 430,
    icon: FileText,
    title: "I-140 Immigrant Petition",
    tag: "Green Card · Step 2",
    accent: "#4338ca",
    summary: "Employer petitions for you as a permanent immigrant worker, establishing your priority date.",
    duration: "6–12+ months (varies by category & country of birth)",
    requirements: ["Approved labor certification (unless L-1A/EB-1C)", "Priority date is established at filing"],
    weProvide: ["We file your I-140 petition", "We track your priority date with you"],
  },
  gc: {
    id: "gc",
    x: 2320,
    y: 430,
    icon: BadgeCheck,
    title: "Green Card",
    tag: "Permanent Resident (I-485)",
    accent: "#047857",
    summary: "Lawful permanent residence. Priority date must be current under the visa bulletin before filing I-485.",
    duration: "Permanent (renew physical card every 10 years)",
    requirements: ["Priority date must be current", "Biometrics & background check", "Medical exam (Form I-693)"],
    weProvide: ["We support your I-485 filing", "Employer support continues through approval"],
  },
  citizen: {
    id: "citizen",
    x: 2620,
    y: 430,
    icon: Landmark,
    title: "U.S. Citizenship",
    tag: "Naturalization (N-400)",
    accent: "#047857",
    summary: "The final step. Full civic rights, including the right to vote and hold a U.S. passport.",
    duration: "5 years of continuous permanent residency (3 if married to a U.S. citizen)",
    requirements: ["5 yrs continuous residency (or 3 yrs)", "Civics & English test", "Good moral character"],
    weProvide: ["We support your N-400 application timeline"],
  },
};

const EDGES = [
  {
    id: "f1-opt",
    from: "f1",
    to: "opt",
    path: "M188,430 C360,430 360,430 532,430",
    above: [],
    below: ["EAD card required before starting work"],
    labelX: 360,
    labelYBelow: 540,
  },
  {
    id: "f1-cpt",
    from: "f1",
    to: "cpt",
    path: "M115,388 C160,310 250,250 322,220",
    above: [],
    below: ["Optional, while still enrolled"],
    labelX: 185,
    labelYBelow: 300,
    dashed: true,
  },
  {
    id: "cpt-opt",
    from: "cpt",
    to: "opt",
    path: "M415,225 C520,255 560,360 578,388",
    above: [],
    below: [],
    dashed: true,
  },
  {
    id: "m1-m1pt",
    from: "m1",
    to: "m1pt",
    path: "M188,830 C230,830 230,830 272,830",
    above: [],
    below: ["Program-matched training placement"],
    labelX: 230,
    labelYBelow: 895,
  },
  {
    id: "j1-j1at",
    from: "j1",
    to: "j1at",
    path: "M708,830 C830,830 830,830 872,830",
    above: [],
    below: ["Sponsor-authorized training placement"],
    labelX: 790,
    labelYBelow: 895,
  },
  {
    id: "m1pt-h1b",
    from: "m1pt",
    to: "h1b",
    path: "M420,792 C700,700 1000,520 1218,468",
    above: ["Employer sponsorship required — same as any change of status"],
    below: ["Same direct route as OPT graduates"],
    labelX: 620,
    labelYAbove: 615,
    labelYBelow: 670,
    dashed: true,
  },
  {
    id: "j1at-h1b",
    from: "j1at",
    to: "h1b",
    path: "M1010,792 C1100,700 1180,520 1225,470",
    above: ["212(e) waiver required, if home-residency rule applies"],
    below: ["We support the waiver + sponsorship process"],
    labelX: 1090,
    labelYAbove: 615,
    labelYBelow: 670,
    dashed: true,
  },
  {
    id: "opt-stemopt",
    from: "opt",
    to: "stemopt",
    path: "M708,430 C790,430 790,430 872,430",
    above: ["STEM-designated degree (CIP code) required"],
    below: ["We help verify STEM eligibility"],
    labelX: 790,
    labelYAbove: 320,
    labelYBelow: 540,
  },
  {
    id: "opt-h1b",
    from: "opt",
    to: "h1b",
    path: "M700,470 C860,600 1080,600 1225,470",
    above: [],
    below: ["Direct route — skips the STEM extension"],
    labelX: 960,
    labelYBelow: 615,
    variant: "bow",
  },
  {
    id: "stemopt-h1b",
    from: "stemopt",
    to: "h1b",
    path: "M1048,430 C1090,430 1090,430 1212,430",
    above: ["Visa sponsorship required", "Job must be full-time", "Cap-subject H-1B lottery"],
    below: ["We sponsor your H-1B petition", "Official offer letter provided", "E-Verify employer + Form I-983"],
    labelX: 1130,
    labelYAbove: 275,
    labelYBelow: 500,
  },
  {
    id: "l1-i140",
    from: "l1",
    to: "i140",
    path: "M1048,175 C1450,140 1750,300 1912,410",
    above: ["Managerial / executive / specialized-knowledge role"],
    below: ["No labor certification needed (EB-1C)"],
    labelX: 1480,
    labelYAbove: 95,
    labelYBelow: 140,
    dashed: true,
  },
  {
    id: "h1b-niw",
    from: "h1b",
    to: "niw",
    path: "M1340,388 C1450,300 1550,240 1610,222",
    above: [],
    below: ["Optional alternate route for qualifying H-1B holders"],
    labelX: 1460,
    labelYBelow: 305,
    dashed: true,
  },
  {
    id: "niw-i140",
    from: "niw",
    to: "i140",
    path: "M1748,215 C1830,240 1830,380 1912,420",
    above: ["Self-petition — no employer required"],
    below: ["No labor certification needed"],
    labelX: 1830,
    labelYAbove: 95,
    labelYBelow: 140,
  },
  {
    id: "h1b-perm",
    from: "h1b",
    to: "perm",
    path: "M1388,430 C1480,430 1480,430 1572,430",
    above: ["Prevailing wage determination"],
    below: ["We file PERM on your behalf"],
    labelX: 1480,
    labelYAbove: 320,
    labelYBelow: 540,
  },
  {
    id: "h1b-h4",
    from: "h1b",
    to: "h4",
    path: "M1300,473 L1300,787",
    above: [],
    below: [],
    sideLabelAbove: "For an H-1B holder's spouse or child",
    sideLabelBelow: "H-4 alone grants no work authorization",
    sideLabelX: 990,
    sideLabelY: 555,
    dashed: true,
  },
  {
    id: "h4-h4ead",
    from: "h4",
    to: "h4ead",
    path: "M1388,830 C1460,830 1460,830 1532,830",
    above: ["EAD (Form I-765) required before working"],
    below: ["We support your I-765 filing"],
    labelX: 1460,
    labelYAbove: 730,
    labelYBelow: 895,
  },
  {
    id: "h4ead-h1b",
    from: "h4ead",
    to: "h1b",
    path: "M1600,787 C1530,700 1420,540 1350,470",
    above: ["Own employer sponsorship required"],
    below: ["A common route for long-term stability"],
    labelX: 1500,
    labelYAbove: 575,
    labelYBelow: 630,
    dashed: true,
  },
  {
    id: "h4ead-perm-direct",
    from: "h4ead",
    to: "perm",
    path: "M1650,787 C1700,700 1690,540 1662,473",
    above: [],
    below: ["No H-1B required — sponsored directly on H-4"],
    labelX: 1795,
    labelYBelow: 620,
    dashed: true,
  },
  {
    id: "perm-i140",
    from: "perm",
    to: "i140",
    path: "M1748,430 C1830,430 1830,430 1912,430",
    above: ["Approved labor cert required"],
    below: ["We file your I-140 petition"],
    labelX: 1830,
    labelYAbove: 320,
    labelYBelow: 540,
  },
  {
    id: "i140-gc",
    from: "i140",
    to: "gc",
    path: "M2088,430 C2160,430 2160,430 2232,430",
    above: ["Priority date must be current"],
    below: ["We support your I-485 filing"],
    labelX: 2160,
    labelYAbove: 320,
    labelYBelow: 540,
  },
  {
    id: "gc-citizen",
    from: "gc",
    to: "citizen",
    path: "M2408,430 C2470,430 2470,430 2532,430",
    above: ["5 yrs continuous residency"],
    below: ["We support your N-400 filing"],
    labelX: 2470,
    labelYAbove: 320,
    labelYBelow: 540,
  },
];

// Ordered node chains + the edges that connect them, per clicked node.
// Every chain starts at the clicked stage itself and runs forward to
// citizenship — clicking a later stage (e.g. Green Card) never jumps
// backward to F-1; it simply has fewer stages ahead of it.
const CHAINS = {
  f1: { nodes: ["f1", "opt", "stemopt", "h1b", "perm", "i140", "gc", "citizen"], edges: ["f1-opt", "opt-stemopt", "stemopt-h1b", "h1b-perm", "perm-i140", "i140-gc", "gc-citizen"] },
  cpt: { nodes: ["cpt", "opt", "stemopt", "h1b", "perm", "i140", "gc", "citizen"], edges: ["cpt-opt", "opt-stemopt", "stemopt-h1b", "h1b-perm", "perm-i140", "i140-gc", "gc-citizen"] },
  m1: { nodes: ["m1", "m1pt", "h1b", "perm", "i140", "gc", "citizen"], edges: ["m1-m1pt", "m1pt-h1b", "h1b-perm", "perm-i140", "i140-gc", "gc-citizen"] },
  m1pt: { nodes: ["m1pt", "h1b", "perm", "i140", "gc", "citizen"], edges: ["m1pt-h1b", "h1b-perm", "perm-i140", "i140-gc", "gc-citizen"] },
  j1: { nodes: ["j1", "j1at", "h1b", "perm", "i140", "gc", "citizen"], edges: ["j1-j1at", "j1at-h1b", "h1b-perm", "perm-i140", "i140-gc", "gc-citizen"] },
  j1at: { nodes: ["j1at", "h1b", "perm", "i140", "gc", "citizen"], edges: ["j1at-h1b", "h1b-perm", "perm-i140", "i140-gc", "gc-citizen"] },
  opt: { nodes: ["opt", "stemopt", "h1b", "perm", "i140", "gc", "citizen"], edges: ["opt-stemopt", "stemopt-h1b", "h1b-perm", "perm-i140", "i140-gc", "gc-citizen"] },
  stemopt: { nodes: ["stemopt", "h1b", "perm", "i140", "gc", "citizen"], edges: ["stemopt-h1b", "h1b-perm", "perm-i140", "i140-gc", "gc-citizen"] },
  l1: { nodes: ["l1", "i140", "gc", "citizen"], edges: ["l1-i140", "i140-gc", "gc-citizen"] },
  h1b: { nodes: ["h1b", "perm", "i140", "gc", "citizen"], edges: ["h1b-perm", "perm-i140", "i140-gc", "gc-citizen"] },
  h4: {
    nodes: ["h4", "h4ead", "h1b", "perm", "i140", "gc", "citizen"],
    edges: ["h1b-h4", "h4-h4ead", "h4ead-h1b", "h1b-perm", "perm-i140", "i140-gc", "gc-citizen"],
  },
  h4ead: {
    nodes: ["h4ead", "h1b", "perm", "i140", "gc", "citizen"],
    edges: ["h4ead-h1b", "h1b-perm", "perm-i140", "i140-gc", "gc-citizen"],
  },
  niw: { nodes: ["niw", "i140", "gc", "citizen"], edges: ["niw-i140", "i140-gc", "gc-citizen"] },
  perm: { nodes: ["perm", "i140", "gc", "citizen"], edges: ["perm-i140", "i140-gc", "gc-citizen"] },
  i140: { nodes: ["i140", "gc", "citizen"], edges: ["i140-gc", "gc-citizen"] },
  // Green Card and Citizenship are terminal stages reached from many routes,
  // so clicking them only ever locks the remaining leg forward — never back
  // through F-1 or any earlier stage.
  gc: { nodes: ["gc", "citizen"], edges: ["gc-citizen"] },
  citizen: { nodes: ["citizen"], edges: [] },
};

const VB_W = 2820;
const VB_H = 1000;

/* ----------------------------------------------------------------------
   COMPONENT
   ------------------------------------------------------------------- */

export default function CareerPath() {
  // `anchorId` = the first stage clicked. It fixes the green path (anchor -> citizen)
  // and locks every stage outside that path. `viewId` = whichever stage's details
  // are currently open; clicking any stage still inside the active path just moves
  // `viewId`, it never moves the anchor. Reset clears both.
  const [anchorId, setAnchorId] = useState(null);
  const [viewId, setViewId] = useState(null);
  const scrollRef = useRef(null);
  const panelRef = useRef(null);

  const chain = anchorId ? CHAINS[anchorId] : null;
  const activeNodes = new Set(chain ? chain.nodes : []);
  const activeEdges = new Set(chain ? chain.edges : []);
  const locked = anchorId !== null;

  useEffect(() => {
    if (viewId && panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [viewId]);

  const handleSelect = (id) => {
    if (!locked) {
      setAnchorId(id);
      setViewId(id);
      return;
    }
    if (activeNodes.has(id)) {
      setViewId(id);
    }
    // clicks on locked-out stages are simply ignored
  };

  const handleReset = () => {
    setAnchorId(null);
    setViewId(null);
  };

  const stepIndex = chain ? chain.nodes.indexOf(viewId) : -1;

  const stepTo = (delta) => {
    if (!chain) return;
    const next = stepIndex + delta;
    if (next >= 0 && next < chain.nodes.length) setViewId(chain.nodes[next]);
  };

  return (
    <PageShell title="Career Path">
      <div style={styles.page}>
      <style>{CSS_KEYFRAMES}</style>

      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={styles.eyebrow}>THE ROAD FROM CAMPUS TO CITIZENSHIP</div>
            <h1 style={styles.h1}>Your visa journey, mapped out</h1>
            <p style={styles.sub}>
              {locked
                ? "Your path is locked in green — click any stage still on it to see that stage's details, or reset to explore from a different point."
                : "Tap any stage to lock in the route forward — from that point all the way to citizenship."}{" "}
              Red tags above the line are what the law requires; indigo tags below are what we take care of for you. Any
              student, from any country, can start at F-1 (academic study), M-1 (vocational study), or J-1 (exchange
              program) — shown below.
            </p>
          </div>
          {locked && (
            <button onClick={handleReset} style={styles.resetBtn}>
              <RotateCcw size={14} />
              Reset
            </button>
          )}
        </div>
      </div>

      <Legend />

      {locked && <Stepper chain={chain} viewId={viewId} onPick={setViewId} />}

      <div style={styles.scrollWrap} ref={scrollRef}>
        <div style={{ position: "relative", width: VB_W, height: VB_H }}>
          <svg
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            width={VB_W}
            height={VB_H}
            style={{ position: "absolute", inset: 0, zIndex: 1 }}
          >
            <defs>
              <marker id="arrow-dim" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#cbd5e1" />
              </marker>
              <marker id="arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#10b981" />
              </marker>
            </defs>

            {EDGES.map((e) => {
              const isActive = activeEdges.has(e.id);
              return (
                <g key={e.id}>
                  {isActive && (
                    <path
                      d={e.path}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth={10}
                      strokeLinecap="round"
                      opacity={0.35}
                      className="glow-path"
                    />
                  )}
                  <path
                    d={e.path}
                    fill="none"
                    stroke={isActive ? "#10b981" : "#cbd5e1"}
                    strokeWidth={isActive ? 3.5 : 2}
                    strokeDasharray={e.dashed ? "2 7" : isActive ? "10 8" : "0"}
                    strokeLinecap="round"
                    markerEnd={`url(#${isActive ? "arrow-active" : "arrow-dim"})`}
                    className={isActive ? "flow-path" : ""}
                    style={{ transition: "stroke .35s ease, stroke-width .35s ease" }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Above / below annotations — rendered as pill badges with their own
              background so they stay legible no matter what line or node sits
              behind them. Dulled to gray whenever their edge isn't part of the
              currently active (green) path. Every label position is hand-placed
              in its own clear lane so dense areas (like the H-1B/H-4 cluster)
              never stack two badges on top of each other. */}
          {EDGES.map((e) => (
            <EdgeLabels key={e.id + "-labels"} edge={e} active={activeEdges.has(e.id)} />
          ))}

          {/* Nodes */}
          {Object.values(NODES).map((n) => {
            const isActive = activeNodes.has(n.id);
            const isDisabled = locked && !isActive;
            return (
              <NodeCard
                key={n.id}
                node={n}
                active={isActive}
                dim={isDisabled}
                disabled={isDisabled}
                viewing={viewId === n.id}
                onClick={() => handleSelect(n.id)}
              />
            );
          })}
        </div>
      </div>

      <div ref={panelRef}>
        {viewId && (
          <DetailsPanel
            node={NODES[viewId]}
            stepNumber={stepIndex + 1}
            stepTotal={chain ? chain.nodes.length : 0}
            canPrev={stepIndex > 0}
            canNext={chain ? stepIndex < chain.nodes.length - 1 : false}
            onPrev={() => stepTo(-1)}
            onNext={() => stepTo(1)}
            onClose={() => setViewId(null)}
          />
        )}
      </div>
    </div>
    </PageShell>
  );
}

function Stepper({ chain, viewId, onPick }) {
  return (
    <div style={styles.stepperWrap}>
      {chain.nodes.map((id, i) => {
        const n = NODES[id];
        const isView = id === viewId;
        return (
          <div key={id} style={{ display: "flex", alignItems: "center" }}>
            <button onClick={() => onPick(id)} style={styles.stepDot(isView)} title={n.title}>
              {i + 1}
            </button>
            {i < chain.nodes.length - 1 && <span style={styles.stepLine} />}
          </div>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------------------
   SUBCOMPONENTS
   ------------------------------------------------------------------- */

function Legend() {
  const items = [
    { swatch: "#10b981", label: "Your selected path", pulse: true },
    { swatch: "#cbd5e1", label: "Other routes", dimText: true },
    { swatch: REQ_COLOR, label: "Requirement (above line)", tag: true, bg: REQ_BG },
    { swatch: PROVIDE_COLOR, label: "What we provide (below line)", tag: true, bg: PROVIDE_BG },
  ];
  return (
    <div style={styles.legendRow}>
      {items.map((it) => (
        <div key={it.label} style={styles.legendItem}>
          {it.tag ? (
            <span style={{ ...styles.legendSwatch, background: it.bg, border: `1px solid ${it.swatch}33` }} />
          ) : (
            <span className={it.pulse ? "legend-pulse" : ""} style={{ ...styles.legendDot, background: it.swatch }} />
          )}
          <span style={{ ...styles.legendLabel, color: it.dimText ? DIM_COLOR : styles.legendLabel.color }}>
            {it.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function LabelPill({ text, kind, active }) {
  // kind: "req" | "provide"
  const isReq = kind === "req";
  const color = active ? (isReq ? REQ_COLOR : PROVIDE_COLOR) : DIM_COLOR;
  const bg = active ? (isReq ? REQ_BG : PROVIDE_BG) : DIM_BG;
  const border = active ? (isReq ? REQ_BORDER : PROVIDE_BORDER) : "#e2e8f0";
  const Icon = isReq ? AlertTriangle : CheckCircle2;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "flex-start",
        gap: 5,
        background: bg,
        border: `1px solid ${border}`,
        color,
        fontSize: 10.5,
        fontWeight: 600,
        lineHeight: 1.35,
        borderRadius: 7,
        padding: "3.5px 8px 3.5px 6px",
        textAlign: "left",
        boxShadow: active ? "0 1px 2px rgba(15,23,42,0.05)" : "none",
        transition: "background .35s ease, color .35s ease, border-color .35s ease",
        maxWidth: "100%",
      }}
    >
      <Icon size={11} style={{ flexShrink: 0, marginTop: 1.5 }} />
      <span>{text}</span>
    </div>
  );
}

function EdgeLabels({ edge, active }) {
  const above = edge.above || [];
  const below = edge.below || [];
  const opacity = active ? 1 : 0.65;

  if (edge.sideLabelAbove || edge.sideLabelBelow) {
    const sx = edge.sideLabelX ?? edge.labelX ?? 1000;
    return (
      <div
        style={{
          position: "absolute",
          left: sx,
          top: edge.sideLabelY,
          width: 226,
          display: "flex",
          flexDirection: "column",
          gap: 5,
          opacity,
          zIndex: 2,
        }}
      >
        {edge.sideLabelAbove && <LabelPill text={edge.sideLabelAbove} kind="req" active={active} />}
        {edge.sideLabelBelow && <LabelPill text={edge.sideLabelBelow} kind="provide" active={active} />}
      </div>
    );
  }
  if (!above.length && !below.length) return null;
  const cx = edge.labelX;
  const aboveY = edge.labelYAbove ?? 340;
  const belowY = edge.labelYBelow ?? 480;
  return (
    <>
      {above.length > 0 && (
        <div
          style={{
            position: "absolute",
            left: cx - 118,
            top: aboveY,
            width: 236,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            opacity,
            zIndex: 2,
          }}
        >
          {above.map((t, i) => (
            <LabelPill key={i} text={t} kind="req" active={active} />
          ))}
        </div>
      )}
      {below.length > 0 && (
        <div
          style={{
            position: "absolute",
            left: cx - 118,
            top: belowY,
            width: 236,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            opacity,
            zIndex: 2,
          }}
        >
          {below.map((t, i) => (
            <LabelPill key={i} text={t} kind="provide" active={active} />
          ))}
        </div>
      )}
    </>
  );
}

function NodeCard({ node, active, dim, disabled, viewing, onClick }) {
  const Icon = node.icon;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-pressed={viewing}
      aria-disabled={disabled}
      style={{
        position: "absolute",
        left: node.x - HW,
        top: node.y - HH,
        width: NW,
        height: NH,
        borderRadius: 14,
        border: `1.5px solid ${viewing ? "#059669" : active ? "#10b981" : "#e2e8f0"}`,
        background: "#ffffff",
        boxShadow: viewing
          ? "0 0 0 5px rgba(5,150,105,0.20), 0 8px 20px rgba(5,150,105,0.22)"
          : active
          ? "0 0 0 4px rgba(16,185,129,0.12), 0 8px 20px rgba(16,185,129,0.18)"
          : "0 1px 3px rgba(15,23,42,0.06)",
        opacity: dim ? 0.4 : 1,
        filter: dim ? "grayscale(45%)" : "none",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 12px",
        textAlign: "left",
        transition: "all .35s ease",
        transform: active && !viewing ? "translateY(-2px)" : "translateY(0)",
        zIndex: 3,
      }}
      className={active && !viewing ? "node-pulse" : ""}
    >
      <div
        style={{
          flexShrink: 0,
          width: 38,
          height: 38,
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: active ? "#ecfdf5" : "#f1f5f9",
          color: active ? "#059669" : node.accent,
        }}
      >
        <Icon size={19} strokeWidth={2} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a", lineHeight: 1.15 }}>{node.title}</div>
        <div style={{ fontSize: 10.5, color: "#64748b", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {node.tag}
        </div>
      </div>
      {disabled && <Lock size={13} color="#94a3b8" style={{ flexShrink: 0 }} />}
      {viewing && (
        <div style={{ position: "absolute", top: -9, right: -9, background: "#059669", borderRadius: 999, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(5,150,105,0.4)" }}>
          <Eye size={11} color="#fff" />
        </div>
      )}
    </button>
  );
}

function DetailsPanel({ node, stepNumber, stepTotal, canPrev, canNext, onPrev, onNext, onClose }) {
  const Icon = node.icon;
  return (
    <div style={styles.panel} className="panel-in">
      <button onClick={onClose} style={styles.panelClose} aria-label="Close details panel">
        <X size={16} />
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "#ecfdf5",
            color: "#059669",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={22} />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.4, color: "#059669", textTransform: "uppercase" }}>
            {node.tag}
            {stepTotal > 0 && (
              <span style={{ color: "#94a3b8", fontWeight: 600, marginLeft: 8 }}>
                · Step {stepNumber} of {stepTotal}
              </span>
            )}
          </div>
          <h3 style={{ fontSize: 19, fontWeight: 800, color: "#0f172a", margin: 0 }}>{node.title}</h3>
        </div>
      </div>

      <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.55, marginTop: 14 }}>{node.summary}</p>

      <div style={{ fontSize: 12.5, color: "#0f172a", marginTop: 10, display: "flex", gap: 6, alignItems: "center" }}>
        <Info size={14} color="#64748b" />
        <span style={{ color: "#64748b" }}>Typical duration:</span>
        <span style={{ fontWeight: 600 }}>{node.duration}</span>
      </div>

      <div style={styles.panelGrid}>
        <div>
          <div style={styles.panelColTitle(REQ_COLOR)}>
            <AlertTriangle size={12} style={{ marginRight: 5, verticalAlign: -2 }} />
            Requirements
          </div>
          <ul style={styles.panelList}>
            {node.requirements.map((r, i) => (
              <li key={i} style={styles.panelListItem(REQ_COLOR)}>
                <span style={styles.bullet(REQ_COLOR)} />
                {r}
              </li>
            ))}
            {node.requirements.length === 0 && <li style={{ color: "#94a3b8", fontSize: 13 }}>—</li>}
          </ul>
        </div>
        <div>
          <div style={styles.panelColTitle(PROVIDE_COLOR)}>
            <CheckCircle2 size={12} style={{ marginRight: 5, verticalAlign: -2 }} />
            What we provide
          </div>
          <ul style={styles.panelList}>
            {node.weProvide.map((r, i) => (
              <li key={i} style={styles.panelListItem(PROVIDE_COLOR)}>
                <span style={styles.bullet(PROVIDE_COLOR)} />
                {r}
              </li>
            ))}
            {node.weProvide.length === 0 && <li style={{ color: "#94a3b8", fontSize: 13 }}>Not applicable at this stage</li>}
          </ul>
        </div>
      </div>

      {stepTotal > 0 && (
        <div style={styles.panelNav}>
          <button onClick={onPrev} disabled={!canPrev} style={styles.navBtn(canPrev)}>
            <ChevronLeft size={15} />
            Previous stage
          </button>
          <button onClick={onNext} disabled={!canNext} style={styles.navBtn(canNext)}>
            Next stage
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------------
   STYLES / CONSTANTS
   ------------------------------------------------------------------- */

const REQ_COLOR = "#b91c1c";
const REQ_BG = "#fef2f2";
const REQ_BORDER = "#fecaca";
const PROVIDE_COLOR = "#3730a3";
const PROVIDE_BG = "#eef2ff";
const PROVIDE_BORDER = "#c7d2fe";
const DIM_COLOR = "#94a3b8"; // muted slate — used for any annotation whose edge is not on the active path
const DIM_BG = "#f8fafc";

const CSS_KEYFRAMES = `
@keyframes dashFlow { to { stroke-dashoffset: -36; } }
@keyframes glowPulse { 0%,100% { opacity: .18; } 50% { opacity: .5; } }
@keyframes cardPulse { 0%,100% { box-shadow: 0 0 0 4px rgba(16,185,129,0.10), 0 8px 20px rgba(16,185,129,0.14);} 50% { box-shadow: 0 0 0 8px rgba(16,185,129,0.16), 0 8px 24px rgba(16,185,129,0.26);} }
@keyframes dotPulse { 0%,100% { transform: scale(1); opacity: 1;} 50% { transform: scale(1.3); opacity: .6;} }
@keyframes panelIn { from { opacity: 0; transform: translateY(8px);} to { opacity: 1; transform: translateY(0);} }
.flow-path { animation: dashFlow 1.1s linear infinite; }
.glow-path { animation: glowPulse 2.2s ease-in-out infinite; }
.node-pulse { animation: cardPulse 2.2s ease-in-out infinite; }
.legend-pulse { animation: dotPulse 1.6s ease-in-out infinite; }
.panel-in { animation: panelIn .3s ease; }
`;

const styles = {
  page: {
    height: "100vh",
    width: "100%",
    background: "#f8fafc",
    padding: "40px 24px 64px",
    fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif",
    overflowY: "auto",
    overflowX: "hidden",
    WebkitOverflowScrolling: "touch",
    boxSizing: "border-box",
  },
  header: { maxWidth: 780, margin: "0 auto 20px" },
  eyebrow: { fontSize: 11.5, fontWeight: 700, letterSpacing: 1.4, color: "#059669" },
  h1: { fontSize: 30, fontWeight: 800, color: "#0f172a", margin: "6px 0 8px", letterSpacing: -0.5 },
  sub: { fontSize: 14.5, color: "#475569", lineHeight: 1.6, margin: 0 },
  legendRow: {
    maxWidth: 900,
    margin: "0 auto 18px",
    display: "flex",
    flexWrap: "wrap",
    gap: 20,
    alignItems: "center",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "10px 16px",
  },
  resetBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12.5,
    fontWeight: 700,
    color: "#334155",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 9,
    padding: "8px 14px",
    cursor: "pointer",
    flexShrink: 0,
    boxShadow: "0 1px 2px rgba(15,23,42,0.05)",
  },
  stepperWrap: {
    maxWidth: 900,
    margin: "0 auto 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 0,
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "12px 16px",
  },
  stepDot: (isView) => ({
    width: 28,
    height: 28,
    borderRadius: "50%",
    border: isView ? "none" : "1.5px solid #a7f3d0",
    background: isView ? "#059669" : "#ecfdf5",
    color: isView ? "#ffffff" : "#059669",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all .25s ease",
  }),
  stepLine: {
    width: 22,
    height: 2,
    background: "#a7f3d0",
    display: "inline-block",
  },
  legendItem: { display: "flex", alignItems: "center", gap: 7 },
  legendDot: { width: 10, height: 10, borderRadius: "50%", display: "inline-block" },
  legendSwatch: { width: 16, height: 12, borderRadius: 4, display: "inline-block" },
  legendLabel: { fontSize: 12, color: "#334155", fontWeight: 500 },
  scrollWrap: {
    maxWidth: 1200,
    margin: "0 auto",
    overflowX: "auto",
    overflowY: "hidden",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    background: "#ffffff",
    boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
  },
  panel: {
    maxWidth: 1200,
    margin: "20px auto 0",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: "24px 26px",
    position: "relative",
    boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
  },
  panelClose: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 30,
    height: 30,
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    color: "#475569",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  panelGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
    marginTop: 18,
    paddingTop: 16,
    borderTop: "1px solid #f1f5f9",
  },
  panelColTitle: (color) => ({
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color,
    marginBottom: 8,
  }),
  panelList: { margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 },
  panelListItem: (color) => ({
    fontSize: 13,
    color: "#334155",
    paddingLeft: 16,
    position: "relative",
    lineHeight: 1.5,
  }),
  panelNav: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 20,
    paddingTop: 16,
    borderTop: "1px solid #f1f5f9",
  },
  navBtn: (enabled) => ({
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12.5,
    fontWeight: 700,
    color: enabled ? "#059669" : "#cbd5e1",
    background: enabled ? "#ecfdf5" : "#f8fafc",
    border: `1px solid ${enabled ? "#a7f3d0" : "#e2e8f0"}`,
    borderRadius: 8,
    padding: "8px 14px",
    cursor: enabled ? "pointer" : "not-allowed",
  }),
  bullet: (color) => ({
    position: "absolute",
    left: 0,
    top: 6,
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: color,
  }),
};
