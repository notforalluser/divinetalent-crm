import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home, Briefcase, Sparkles, Users, Bookmark, Activity, BarChart3,
  UsersRound, Settings, Radio, CalendarClock, SearchCheck, Milestone,
  ChevronLeft, Crown, // Add Crown icon for Plans
} from "lucide-react";
import { Text } from "../ui/Typography";
import logo from "../../assets/logo.png";
import logo2 from "../../assets/logo2.png";

// TODO: drop your real logo file in /public and point this at it,
// e.g. "/logo.svg" or "/logo.png". Shown only when the sidebar is expanded.
const LOGO_URL = "/logo.svg";
// Compact brand mark used when the sidebar is collapsed to icon-only width.
const BRAND_INITIALS = "DT";

const NAV_GROUPS = [
  {
    label: "Workflow",
    items: [
      { to: "/", label: "Home", icon: Home, end: true },
      { to: "/jobs", label: "Jobs", icon: Briefcase },
      { to: "/ai-match", label: "AI Match", icon: Sparkles },
      { to: "/special-search", label: "Special Search", icon: SearchCheck },
      { to: "/candidates", label: "Candidates", icon: Users },
      { to: "/interviews", label: "Interview", icon: CalendarClock },
      { to: "/plans", label: "Plan", icon: Crown }, // Changed from CalendarClock to Crown
      { to: "/path", label: "Visa Path", icon: Milestone },
    ],
  },
  {
    label: "Insights",
    items: [
      { to: "/recruiters", label: "Recruiters", icon: UsersRound },
      { to: "/activity", label: "Activity", icon: Activity },
      { to: "/reports", label: "Reports", icon: BarChart3 },
      { to: "/saved", label: "Saved", icon: Bookmark },
    ],
  },
  {
    label: "Account",
    items: [{ to: "/settings", label: "Settings", icon: Settings }],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("sidebar-collapsed") === "1";
  });

  useEffect(() => {
    window.localStorage.setItem("sidebar-collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  return (
    <aside
      className={`hidden md:flex md:flex-col relative border-r border-line bg-paper shrink-0 transition-[width] duration-300 ease-in-out ${
        collapsed ? "md:w-[76px]" : "md:w-52"
      }`}
    >
      {/* Collapse / expand toggle -- sits centered on the sidebar's right edge */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-[26px] z-10 flex h-6 w-6 items-center justify-center rounded-full
          border border-line bg-paper text-slate shadow-sm
          hover:bg-gradient-to-br hover:from-crimson-600 hover:to-crimson-500 hover:text-white hover:border-transparent
          transition-colors"
      >
        <ChevronLeft className={`h-3.5 w-3.5 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
      </button>

      {/* Brand header */}
      <div
        className={`flex items-center h-16 border-b border-line shrink-0 ${
          collapsed ? "justify-center px-2" : "gap-2.5 px-5"
        }`}
      >
        {collapsed ? (
          <img
            src={logo}
            alt="Company logo"
            className="h-9 w-auto object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <img
            src={logo2}
            alt="Company logo"
            className="h-14 w-auto object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        )}
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-5 px-3">
            {!collapsed && (
              <Text variant="eyebrow" color="muted" className="px-2 mb-1.5">
                {group.label}
              </Text>
            )}
            <div className="flex flex-col gap-1">
              {group.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  title={collapsed ? label : undefined}
                  className={({ isActive }) =>
                    `group flex items-center rounded-lg text-sm font-medium transition-all duration-200 ${
                      collapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-2.5 py-2"
                    } ${
                      isActive
                        ? "bg-gradient-to-r from-crimson-600 to-crimson-500 text-white shadow-sm shadow-crimson-500/30"
                        : "text-ink-soft hover:bg-cloud hover:text-ink"
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span
                    className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${
                      collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                    }`}
                  >
                    {label}
                  </span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

    </aside>
  );
}