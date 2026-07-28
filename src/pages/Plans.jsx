import { useMemo, useState } from "react";
import {
  UsersRound,
  Crown,
  Gem,
  Target,
  Zap,
  CheckCircle,
  Clock,
  Users,
  Award,
  Rocket,
  Shield,
  Globe,
  Briefcase,
  UserCheck,
  TrendingUp,
  Building,
  Lightbulb,
  Mail,
  Sparkle,
  CircleCheck,
} from "lucide-react";
import PageShell from "../components/layout/PageShell";
import { Card, CardBody } from "../components/ui/Card";
import { Text } from "../components/ui/Typography";

const RED = "#c8102e";
const BLUE = "#3b82f6";
const PINK = "#ec4899";
const AMBER = "#f59e0b";
const GREEN = "#10b981";

function cx(...args) {
  return args.filter(Boolean).join(" ");
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

function PlanCard({ plan, isPopular = false, index }) {
  return (
    <div
      className={`jobs-fade-up relative rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        isPopular ? "shadow-lg ring-1 ring-blue-200" : "shadow-sm"
      }`}
      style={{ 
        background: "#FFFFFF",
        borderColor: isPopular ? "#afe0ed" : "#E8E8EC",
        animationDelay: `${index * 80}ms`
      }}
    >
      {isPopular && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
          style={{ background: RED }}
        >
          Popular
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-ink">{plan.name}</h3>
            {plan.subtitle && (
              <p className="mt-0.5 text-xs text-slate">{plan.subtitle}</p>
            )}
          </div>
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ background: `${RED}1a` }}
          >
            {plan.icon}
          </div>
        </div>

        {plan.badge && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider">
            <Sparkle className="h-3 w-3" style={{ color: RED }} />
            <span style={{ color: RED }}>{plan.badge}</span>
          </div>
        )}

        <div className="mt-4">
          <div className="flex items-baseline gap-1">
            <span className="stat-figure text-3xl font-bold" style={{ color: RED }}>
              ${plan.price}
            </span>
            {plan.priceNote && (
              <span className="text-xs text-slate">{plan.priceNote}</span>
            )}
          </div>
          {plan.payment && (
            <p className="mt-1 text-xs text-slate">{plan.payment}</p>
          )}
          {plan.emi && (
            <p className="mt-0.5 text-xs font-medium text-ink">{plan.emi}</p>
          )}
        </div>

        <div className="mt-5 space-y-2">
          {plan.features.map((feature, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <CircleCheck className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" style={{ color: RED }} />
              <span className="text-xs text-ink/90">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Plans() {
  const plans = [
    {
      name: "Ultimate",
      subtitle: "Essential Plan",
      price: "1,000",
      priceNote: "15% after placement",
      payment: "15% after placement",
      badge: "Budget Friendly",
      icon: <Target className="h-5 w-5" style={{ color: RED }} />,
      features: [
        "Resume Preparation From Specialist",
        "RUC Included",
        "No Technical Training",
        "Interview Training",
        "Complete Assessment Support",
        "Complete Interview Support",
        "Resume Marketing",
        "SME (5+ year experience) (Personal)",
        "Interview Scheduling",
        "Email Support",
        "LinkedIn Chat Support",
        "1 Year Service Support",
        "5 Years Coverage"
      ]
    },
    {
      name: "Premium",
      subtitle: "Standard Plan",
      price: "2,000",
      priceNote: "12% after placement",
      payment: "12% after placement",
      badge: "Most Popular",
      icon: <Zap className="h-5 w-5" style={{ color: RED }} />,
      features: [
        "Resume Preparation From Specialist",
        "RUC Included",
        "Basic Technical Training",
        "Interview Training",
        "15 Assessment Support",
        "20 Interview Support",
        "Resume Marketing",
        "SME (3+ year experience) (Personal)",
        "Interview Scheduling",
        "Email Support",
        "LinkedIn Chat Support",
        "1 Year Service Support",
        "3 Years Coverage"
      ]
    },
    {
      name: "Standard",
      subtitle: "Premium Plan",
      price: "3,000",
      priceNote: "10% after placement",
      payment: "10% after placement",
      badge: "Best Value",
      icon: <Gem className="h-5 w-5" style={{ color: RED }} />,
      features: [
        "Resume Preparation From Specialist",
        "RUC Included",
        "Technical Training",
        "Interview Training",
        "5 Assessment Support",
        "10 Interview Support",
        "Resume Marketing",
        "SME (3+ year experience) (Shared)",
        "Interview Scheduling",
        "Email Support",
        "LinkedIn Chat Support",
        "1 Year Service Support",
        "2 Years Coverage"
      ]
    },
    {
      name: "Tailored",
      subtitle: "Custom Plan",
      price: "6,000",
      priceNote: "$3,000 upfront, $3,000 after placement",
      payment: "$3,000 upfront | $3,000 after placement",
      badge: "Ultimate Success",
      icon: <Crown className="h-5 w-5" style={{ color: RED }} />,
      features: [
        "Resume Preparation From Specialist",
        "RUC Included",
        "Technical Training",
        "Interview Training",
        "DOSR Assessment Support",
        "DOSR Interview Support",
        "Resume Marketing",
        "Depends on Upfront Amount",
        "Interview Scheduling",
        "Email Support",
        "LinkedIn Chat Support",
        "Depends on Upfront Amount",
        "2 Years Coverage"
      ]
    }
  ];

  const planSpecs = [
    { service: "Resume Preparation", ultimate: "From Specialist", premium: "From Specialist", standard: "From Specialist", tailored: "From Specialist" },
    { service: "RUC", ultimate: "Yes", premium: "Yes", standard: "Yes", tailored: "Yes" },
    { service: "Live Training", ultimate: "Yes", premium: "Yes", standard: "Yes", tailored: "DOSR" },
    { service: "Interview Training", ultimate: "Yes", premium: "Yes", standard: "Yes", tailored: "DOSR" },
    { service: "Assessment Support", ultimate: "Complete", premium: "15", standard: "5", tailored: "DOSR" },
    { service: "Interview Support", ultimate: "Complete", premium: "20", standard: "10", tailored: "DOSR" },
    { service: "Resume Marketing", ultimate: "Yes", premium: "Yes", standard: "Yes", tailored: "Yes" },
    { service: "Associate Recruiter", ultimate: "SME (5+ year) (Personal)", premium: "SME (3+ year) (Personal)", standard: "SME (3+ year) (Shared)", tailored: "Depends on Upfront Amount" },
    { service: "Interview Scheduling", ultimate: "Yes", premium: "Yes", standard: "Yes", tailored: "Yes" },
    { service: "Email Support", ultimate: "Yes", premium: "Yes", standard: "Yes", tailored: "Yes" },
    { service: "LinkedIn Chat Support", ultimate: "Yes", premium: "Yes", standard: "Yes", tailored: "Yes" },
    { service: "Service Support", ultimate: "1 Year", premium: "1 Year", standard: "1 Year", tailored: "Depends on Upfront Amount" },
    { service: "Coverage", ultimate: "5 Years", premium: "3 Years", standard: "2 Years", tailored: "2 Years" },
  ];

  const perks = [
    { icon: Building, text: "Full Time Jobs with direct fortune 500 clients (As per your Priority)" },
    { icon: TrendingUp, text: "Perfect opportunity with the highest pay rates in the market across the USA" },
    { icon: Rocket, text: "Expert marketing strategies that help the candidate to get the offer within 30 days" },
    { icon: Users, text: "Real Time Practical Trainings in live sessions by industry experts" },
    { icon: Briefcase, text: "Extraordinary resume mapping along with cover letter making through professionals" },
    { icon: UserCheck, text: "Exclusive and dedicated recruiter for every candidate" },
    { icon: Shield, text: "After-placement support (Post-Placement Project oriented training)" },
    { icon: Globe, text: "Divine Talent exclusive visa consultation support" },
  ];

  const steps = [
    { icon: UserCheck, label: "Apply" },
    { icon: Clock, label: "Review" },
    { icon: Users, label: "Interview" },
    { icon: Award, label: "Offer" },
    { icon: Rocket, label: "Start" },
  ];

  return (
    <PageShell title="Plans">
      <PageTypography />
      <DashboardBackground />

      <style>{`
        @keyframes jobsFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .jobs-fade-up {
          animation: jobsFadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .jobs-fade-up { animation: none !important; }
        }
      `}</style>

      <div className="app-shell space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm px-6 py-4 ring-1 ring-blue-500/10 shadow-sm">
          <div className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-pink-300/10 blur-3xl" />

          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-3.5">
              <span className="group flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-crimson-500 via-crimson-600 to-crimson-500 ring-1 ring-blue-400/20 transition-transform duration-300 hover:scale-105 hover:rotate-3">
                <Crown className="h-4 w-4 text-white transition-transform duration-300 group-hover:scale-110" />
              </span>
              <div>
                <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-ink">
                  Our Plans
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex cursor-default items-center gap-1.5 rounded-full border border-crimson-200 bg-crimson-50/70 px-3.5 py-2 text-xs font-semibold text-crimson-700">
                <Target className="h-3.5 w-3.5" />
                <span className="stat-figure">4</span> plans
              </div>
              <div className="flex cursor-default items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/70 px-3.5 py-2 text-xs font-semibold text-blue-700">
                <Users className="h-3.5 w-3.5" />
                <span className="stat-figure">100%</span> success rate
              </div>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="px-4 md:px-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan, index) => (
              <PlanCard
                key={plan.name}
                plan={plan}
                isPopular={plan.name === "Tailored"}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Plan Specification Table */}
        <div className="px-4 md:px-6">
          <Card className="jobs-fade-up !rounded-2xl bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10 shadow-[0_1px_2px_rgba(20,20,40,0.04)]">
            <div className="px-6 py-4 border-b border-blue-100 bg-gradient-to-r from-blue-50/70 via-pink-50/40 to-transparent rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: `${RED}1a` }}
                >
                  <Award className="h-4 w-4" style={{ color: RED }} />
                </div>
                <Text variant="small" className="font-bold tracking-tight text-ink">
                  Plan Specification
                </Text>
              </div>
            </div>

            <CardBody className="!p-0 overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr className="border-b-2" style={{ borderColor: RED }}>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate">
                      Services
                    </th>
                    <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider" style={{ color: RED }}>
                      Ultimate
                    </th>
                    <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider" style={{ color: RED }}>
                      Premium
                    </th>
                    <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider" style={{ color: RED }}>
                      Standard
                    </th>
                    <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider" style={{ color: RED }}>
                      Tailored
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {planSpecs.map((row, index) => (
                    <tr
                      key={row.service}
                      className={`border-b transition-colors ${
                        index % 2 === 0 ? "bg-white/50" : "bg-blue-50/20"
                      } hover:bg-blue-50/50`}
                      style={{ borderColor: "#E8E8EC" }}
                    >
                      <td className="px-4 py-3 text-xs font-medium text-ink">
                        {row.service}
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-slate-600">
                        {row.ultimate}
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-slate-600">
                        {row.premium}
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-slate-600">
                        {row.standard}
                      </td>
                      <td className="px-4 py-3 text-center text-xs font-semibold" style={{ color: RED }}>
                        {row.tailored}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </div>

        {/* Other Perks */}
        <div className="px-4 md:px-6">
          <Card className="jobs-fade-up !rounded-2xl bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10 shadow-[0_1px_2px_rgba(20,20,40,0.04)]">
            <div className="px-6 py-4 border-b border-blue-100 bg-gradient-to-r from-blue-50/70 via-pink-50/40 to-transparent rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: `${RED}1a` }}
                >
                  <Shield className="h-4 w-4" style={{ color: RED }} />
                </div>
                <Text variant="small" className="font-bold tracking-tight text-ink">
                  Other Perks of Association
                </Text>
              </div>
            </div>

            <CardBody className="!p-6">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {perks.map((perk, index) => {
                  const Icon = perk.icon;
                  return (
                    <div
                      key={index}
                      className="jobs-fade-up flex items-start gap-3 rounded-xl border p-3 transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5"
                      style={{ 
                        background: "#FFFFFF",
                        borderColor: "#E8E8EC",
                        animationDelay: `${index * 40}ms`
                      }}
                    >
                      <div className="mt-0.5 rounded-full p-1.5 flex-shrink-0" style={{ background: `${RED}1a` }}>
                        <Icon className="h-4 w-4" style={{ color: RED }} />
                      </div>
                      <p className="text-xs text-ink/90">{perk.text}</p>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Standard Procedure */}
        <div className="px-4 md:px-6 pb-8">
          <Card className="jobs-fade-up !rounded-2xl bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10 shadow-[0_1px_2px_rgba(20,20,40,0.04)]">
            <div className="px-6 py-4 border-b border-blue-100 bg-gradient-to-r from-blue-50/70 via-pink-50/40 to-transparent rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: `${RED}1a` }}
                >
                  <Rocket className="h-4 w-4" style={{ color: RED }} />
                </div>
                <Text variant="small" className="font-bold tracking-tight text-ink">
                  Standard Procedure
                </Text>
              </div>
            </div>

            <CardBody className="!p-6">
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
                {steps.map((step, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-transform duration-300 hover:scale-110"
                      style={{ background: RED }}
                    >
                      <step.icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate">
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}