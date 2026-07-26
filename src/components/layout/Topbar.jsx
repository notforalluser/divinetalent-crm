import { useState } from "react";
import { RefreshCw, Search, LogOut, ChevronDown } from "lucide-react";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";
import { useRotatingPlaceholder, SEARCH_SUGGESTIONS } from "../../hooks/useRotatingPlaceholder";

function timeAgo(date) {
  if (!date) return "never";
  const s = Math.round((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  return `${Math.round(s / 3600)}h ago`;
}

export default function Topbar({ title, onSearch, searchPlaceholder }) {
  const { refresh, status, lastUpdated } = useData();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const refreshing = status === "refreshing" || status === "loading";
  const rotating = useRotatingPlaceholder(SEARCH_SUGGESTIONS);
  const placeholder = searchPlaceholder ? searchPlaceholder : `Quick search -- ${rotating}`;
  const showSearch = !!onSearch; // only render search where a page actually wires it up to something

  return (
    <header className="flex items-center gap-3 h-16 px-5 border-b border-line bg-paper/95 backdrop-blur sticky top-0 z-20">
      <p className="text-sm font-semibold text-ink whitespace-nowrap hidden lg:block">{title}</p>

      {showSearch && (
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate" />
          <input
            onChange={(e) => onSearch(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-full border border-line bg-cloud px-9 py-2 text-sm placeholder:text-slate focus:outline-none focus:ring-2 focus:ring-crimson-500/40 focus:bg-paper"
          />
        </div>
      )}
      <div className="ml-auto flex items-center gap-2">
        <span className="hidden md:block text-xs text-slate">Updated {timeAgo(lastUpdated)}</span>
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={refresh} loading={refreshing}>
          Refresh
        </Button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-line pl-1 pr-2 py-1 hover:bg-cloud"
          >
            {user?.picture ? (
              <img src={user.picture} alt="" className="h-7 w-7 rounded-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="h-7 w-7 rounded-full bg-ink text-white flex items-center justify-center text-xs font-semibold">
                {user?.name?.[0] || "U"}
              </div>
            )}
            <ChevronDown className="h-3.5 w-3.5 text-slate" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl border border-line bg-paper shadow-lg py-1.5 z-30">
              <div className="px-3 py-2 border-b border-line">
                <p className="text-sm font-semibold text-ink truncate">{user?.name}</p>
                <p className="text-xs text-slate truncate">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-crimson-600 hover:bg-crimson-50"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
