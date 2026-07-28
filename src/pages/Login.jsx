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
    <div ref={stageRef} className="dt-login-stage relative min-h-screen w-full overflow-hidden bg-[#F7FAFF] flex items-center justify-center p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');

        .dt-login-stage {
          --spot-x: 50%;
          --spot-y: 40%;
          font-family: 'Inter', 'Plus Jakarta Sans', sans-serif;
        }
        .dt-login-stage h1, .dt-login-stage h2, .dt-login-stage h3, .dt-login-stage h4 {
          font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
          letter-spacing: -0.012em;
        }

        .dt-grid {
          background-image: radial-gradient(circle, rgba(59,130,246,0.09) 1px, transparent 1px);
          background-size: 22px 22px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 90%);
        }

        .dt-spotlight {
          background: radial-gradient(
            600px circle at var(--spot-x) var(--spot-y),
            rgba(200, 16, 46, 0.10),
            transparent 60%
          );
          transition: background 120ms ease-out;
        }

        @keyframes dt-drift-a {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -30px) scale(1.08); }
          66% { transform: translate(-20px, 20px) scale(0.96); }
        }
        @keyframes dt-drift-b {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-50px, 30px) scale(1.1); }
        }
        @keyframes dt-drift-c {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(30px, 40px) scale(0.94); }
          70% { transform: translate(-30px, -10px) scale(1.05); }
        }

        .dt-orb-a { animation: dt-drift-a 22s ease-in-out infinite; }
        .dt-orb-b { animation: dt-drift-b 26s ease-in-out infinite; }
        .dt-orb-c { animation: dt-drift-c 30s ease-in-out infinite; }

        .dt-card-enter {
          animation: dt-card-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes dt-card-in {
          from { opacity: 0; transform: translateY(14px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          .dt-orb-a, .dt-orb-b, .dt-orb-c, .dt-card-enter {
            animation: none;
          }
          .dt-spotlight {
            display: none;
          }
        }
      `}</style>

      {/* Ambient background layer: light blobs + dotted grid + cursor spotlight */}
      <div className="pointer-events-none absolute inset-0">
        <div className="dt-grid absolute inset-0" />
        <div
          className="dt-orb-a absolute -top-32 -left-24 h-[26rem] w-[26rem] rounded-full blur-3xl opacity-40"
          style={{ background: "radial-gradient(circle, #93c5fd 0%, transparent 70%)" }}
        />
        <div
          className="dt-orb-b absolute top-10 right-[-6rem] h-[24rem] w-[24rem] rounded-full blur-3xl opacity-30"
          style={{ background: "radial-gradient(circle, #f9a8d4 0%, transparent 70%)" }}
        />
        <div
          className="dt-orb-c absolute bottom-[-8rem] left-1/3 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-25"
          style={{ background: "radial-gradient(circle, #fde68a 0%, transparent 70%)" }}
        />
        <div className="dt-spotlight absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/30 to-white/60" />
      </div>

      <div className="dt-card-enter relative w-full max-w-sm rounded-2xl bg-white/85 backdrop-blur-sm ring-1 ring-blue-500/10 p-8 shadow-xl">
        <div className="mb-6 grid items-center gap-3">
          <div className="flex h-8 shrink-0 items-center justify-center rounded-lg bg-white">
            <img src={logo} alt="Divine Talent" className="h-20 object-contain" />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm font-medium text-slate">Recruiter Command Center</span>
          </div>
        </div>

        <Heading variant="h4" className="text-ink">
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

        <div className="mt-6 flex items-start gap-2 border-t border-blue-100 pt-5">
          <ShieldCheck className="h-4 w-4 text-slate mt-0.5 shrink-0" />
          <Text variant="small" color="muted">
            Access restricted to authorized emails. Contact your administrator for access.
          </Text>
        </div>
      </div>
    </div>
  );
}