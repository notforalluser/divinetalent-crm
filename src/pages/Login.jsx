import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { ShieldCheck, TriangleAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { renderGoogleButton } from "../lib/googleAuth";
import { Heading, Text } from "../components/ui/Typography";
import logo from "../assets/logo2.png";

export default function Login() {
  const { isAuthenticated, loginWithCredential, authError, setAuthError } = useAuth();
  const buttonRef = useRef(null);
  const stageRef = useRef(null);
  const [scriptError, setScriptError] = useState(null);

  useEffect(() => {
    if (isAuthenticated || !buttonRef.current) return;
    renderGoogleButton(buttonRef.current, loginWithCredential).catch((e) => setScriptError(e.message));
  }, [isAuthenticated, loginWithCredential]);

  // Cursor-reactive spotlight: the background tracks the pointer so the
  // page feels alive without pulling focus from the sign-in card.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let raf = null;
    const handlePointerMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        stage.style.setProperty("--spot-x", `${x}%`);
        stage.style.setProperty("--spot-y", `${y}%`);
      });
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div ref={stageRef} className="dt-login-stage relative min-h-screen w-full overflow-hidden bg-ink flex items-center justify-center p-6">
      {/* Ambient background layer: cursor spotlight + slow-drifting orbs + faint grid */}
      <div className="pointer-events-none absolute inset-0">
        <div className="dt-grid absolute inset-0 opacity-[0.07]" />
        <div className="dt-spotlight absolute inset-0" />
        <div className="dt-orb dt-orb-a absolute h-[26rem] w-[26rem] rounded-full" />
        <div className="dt-orb dt-orb-b absolute h-[20rem] w-[20rem] rounded-full" />
      </div>

      <div className="dt-card-enter relative w-full max-w-sm rounded-2xl bg-paper p-8 shadow-2xl">
        <div className="mb-6 grid items-center gap-3">
          <div className="flex h-8 shrink-0 items-center justify-center rounded-lg bg-white">
            <img src={logo} alt="Divine Talent" className="h-20 object-contain" />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm text-slate text-semibold">Recruiter Command Center</span>
          </div>
        </div>

        <Heading variant="h4">
          Welcome back
        </Heading>
        <Text variant="body" color="muted" className="mt-1.5 mb-6">
          Sign in with a Google account to view the dashboard.
        </Text>

        <div ref={buttonRef} className="flex justify-center min-h-[44px]" />

        {(authError || scriptError) && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-crimson-100 bg-crimson-50 p-3">
            <TriangleAlert className="h-4 w-4 text-crimson-600 mt-0.5 shrink-0" />
            <Text variant="small" color="accent">
              {authError || scriptError}
            </Text>
          </div>
        )}


        <div className="mt-6 flex items-start gap-2 border-t border-line pt-5">
          <ShieldCheck className="h-4 w-4 text-slate mt-0.5 shrink-0" />
          <Text variant="small" color="muted">
            Access restricted to authorized emails. Contact your administrator for access.
          </Text>
        </div>

      </div>

      <style>{`
        .dt-login-stage {
          --spot-x: 50%;
          --spot-y: 40%;
        }

        .dt-grid {
          background-image:
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px);
          background-size: 42px 42px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 90%);
        }

        .dt-spotlight {
          background: radial-gradient(
            600px circle at var(--spot-x) var(--spot-y),
            rgba(200, 28, 50, 0.16),
            transparent 60%
          );
          transition: background 120ms ease-out;
        }

        .dt-orb {
          filter: blur(70px);
          opacity: 0.35;
        }

        .dt-orb-a {
          top: -6rem;
          left: -6rem;
          background: radial-gradient(circle, #C81C32 0%, transparent 70%);
          animation: dt-drift-a 18s ease-in-out infinite;
        }

        .dt-orb-b {
          bottom: -8rem;
          right: -6rem;
          background: radial-gradient(circle, #7a0f1f 0%, transparent 70%);
          animation: dt-drift-b 22s ease-in-out infinite;
        }

        @keyframes dt-drift-a {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(3rem, 2rem) scale(1.08); }
        }

        @keyframes dt-drift-b {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-2.5rem, -2rem) scale(1.05); }
        }

        .dt-card-enter {
          animation: dt-card-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes dt-card-in {
          from { opacity: 0; transform: translateY(14px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          .dt-orb-a, .dt-orb-b, .dt-card-enter {
            animation: none;
          }
          .dt-spotlight {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}