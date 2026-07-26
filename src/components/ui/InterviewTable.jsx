// components/interviews/InterviewTable.jsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import Badge from "../ui/Badge";
import { effectiveInterviewStatus } from "../../lib/time";

function cx(...args) {
  return args.filter(Boolean).join(" ");
}

// Helper function to get date key (YYYY-MM-DD)
function getDateKey(date) {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d)) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate random background colors for rows based on round
const getRandomRowColor = (seed) => {
  // Use seed to generate consistent colors for the same round name
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    { bg: "bg-blue-50/70", hover: "hover:bg-blue-100/70" },
    { bg: "bg-emerald-50/70", hover: "hover:bg-emerald-100/70" },
    { bg: "bg-purple-50/70", hover: "hover:bg-purple-100/70" },
    { bg: "bg-amber-50/70", hover: "hover:bg-amber-100/70" },
    { bg: "bg-rose-50/70", hover: "hover:bg-rose-100/70" },
    { bg: "bg-indigo-50/70", hover: "hover:bg-indigo-100/70" },
    { bg: "bg-orange-50/70", hover: "hover:bg-orange-100/70" },
    { bg: "bg-pink-50/70", hover: "hover:bg-pink-100/70" },
    { bg: "bg-teal-50/70", hover: "hover:bg-teal-100/70" },
    { bg: "bg-cyan-50/70", hover: "hover:bg-cyan-100/70" },
    { bg: "bg-violet-50/70", hover: "hover:bg-violet-100/70" },
    { bg: "bg-fuchsia-50/70", hover: "hover:bg-fuchsia-100/70" },
  ];
  
  // Use hash to pick a color consistently
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// Default color if something goes wrong
const DEFAULT_COLOR = {
  bg: "bg-white",
  hover: "hover:bg-gray-50"
};

// Get row color based on round
const getRowColor = (round) => {
  if (!round) return DEFAULT_COLOR;
  const normalizedRound = round.trim();
  return getRandomRowColor(normalizedRound);
};

export default function InterviewTable({ interviews, searchTerm = "", emptyLabel = "No interviews found" }) {
  const { settings } = useSettings();
  const [sort, setSort] = useState({ key: null, dir: "asc" });
  const [page, setPage] = useState(1);
  const pageSize = settings.pageSize;

  // Group interviews by date (using InterviewReceivedDate or InterviewDate)
  const groupedInterviews = useMemo(() => {
    const groups = {};
    
    interviews.forEach(interview => {
      // Use InterviewReceivedDate as primary, fallback to InterviewDate
      const dateStr = interview.InterviewReceivedDate || interview.InterviewDate;
      if (!dateStr) {
        // If no date, put in "Unknown Date" group
        const key = "Unknown Date";
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(interview);
        return;
      }
      
      const date = new Date(dateStr);
      if (isNaN(date)) {
        const key = "Invalid Date";
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(interview);
        return;
      }
      
      // Format date for grouping (YYYY-MM-DD)
      const key = getDateKey(date);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(interview);
    });

    // Sort groups by date (newest first)
    const sortedGroups = {};
    Object.keys(groups)
      .sort((a, b) => {
        // Handle special cases
        if (a === "Unknown Date" || a === "Invalid Date") return 1;
        if (b === "Unknown Date" || b === "Invalid Date") return -1;
        return new Date(b) - new Date(a);
      })
      .forEach(key => {
        sortedGroups[key] = groups[key];
      });

    return sortedGroups;
  }, [interviews]);

  // Filter groups based on search
  const filteredGroups = useMemo(() => {
    if (!searchTerm) return groupedInterviews;
    
    const q = searchTerm.toLowerCase();
    const filtered = {};
    
    Object.entries(groupedInterviews).forEach(([date, items]) => {
      const matched = items.filter(row => 
        Object.values(row).some(v => String(v ?? "").toLowerCase().includes(q))
      );
      if (matched.length > 0) {
        filtered[date] = matched;
      }
    });
    
    return filtered;
  }, [groupedInterviews, searchTerm]);

  // Get all rows for pagination
  const allRows = useMemo(() => {
    const rows = [];
    Object.entries(filteredGroups).forEach(([date, items]) => {
      items.forEach(item => {
        rows.push({ ...item, _dateGroup: date });
      });
    });
    return rows;
  }, [filteredGroups]);

  // Sort rows
  const sortedRows = useMemo(() => {
    if (!sort.key) return allRows;
    const copy = [...allRows];
    copy.sort((a, b) => {
      const av = a[sort.key],
        bv = b[sort.key];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") return sort.dir === "asc" ? av - bv : bv - av;
      return sort.dir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return copy;
  }, [allRows, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const startIndex = (currentPage - 1) * pageSize;

  // Get unique dates in current page
  const datesInPage = [...new Set(pageRows.map(row => row._dateGroup))];

  function toggleSort(key) {
    setPage(1);
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  }

  // Custom render for candidate name
  const renderCandidate = (row) => (
    <Link to={`/candidates/${row.CandidateID}`} className="font-semibold text-ink hover:text-crimson-600 transition-colors">
      {row.CandidateName}
    </Link>
  );

  // Custom render for status
  const renderStatus = (row) => {
    const status = effectiveInterviewStatus(row);
    const tone = status === "Completed" ? "emerald" : 
                 status === "Selected" ? "emerald" : 
                 status === "Rejected" ? "crimson" : 
                 status === "No-Show" ? "amber" : 
                 status === "Rescheduled" ? "blue" : "default";
    return <Badge tone={tone}>{status}</Badge>;
  };

  // Format date for display
  const formatDateHeader = (dateKey) => {
    if (dateKey === "Unknown Date") return "📅 Unknown Date";
    if (dateKey === "Invalid Date") return "⚠️ Invalid Date";
    
    const date = new Date(dateKey);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayKey = getDateKey(today);
    const yesterdayKey = getDateKey(yesterday);
    
    if (dateKey === todayKey) return "📅 Today";
    if (dateKey === yesterdayKey) return "📅 Yesterday";
    
    return `📅 ${date.toLocaleDateString(undefined, { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    })}`;
  };

  const columns = [
    { key: "CandidateName", label: "Candidate", sortable: true, render: renderCandidate },
    { key: "InterviewReceivedDate", label: "Received", sortable: true },
    { key: "InterviewDate", label: "Interview Date", sortable: true },
    { key: "InterviewTime", label: "Time" },
    { key: "JobRole", label: "Job Role", sortable: true },
    { key: "InterviewRound", label: "Round", sortable: true },
    { key: "ModeOfRound", label: "Mode" },
    { key: "ClientName", label: "Client", sortable: true },
    { key: "Status", label: "Status", render: renderStatus },
  ];

  return (
    <div className="flex flex-col rounded-md overflow-hidden">
      <style>{`
        .dt-scroll::-webkit-scrollbar { height: 6px; }
        .dt-scroll::-webkit-scrollbar-track { background: transparent; }
        .dt-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, #c8102e, #af102b);
          border-radius: 9999px;
        }
        .dt-scroll::-webkit-scrollbar-thumb:hover { background: #8c0a1f; }
        .dt-scroll { scrollbar-width: thin; scrollbar-color: #d6d6d6 transparent; }
      `}</style>

      <div className="dt-scroll overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-0 font-sans">
          <thead>
            <tr className="bg-gradient-to-r from-crimson-600/90 to-crimson-500/90 text-[10.5px]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && toggleSort(col.key)}
                  className={cx(
                    "px-4 py-2 font-bold uppercase tracking-wider text-white whitespace-nowrap",
                    col.sortable && "cursor-pointer select-none hover:text-crimson-100"
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable &&
                      sort.key === col.key &&
                      (sort.dir === "asc" ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      ))}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center bg-white">
                  <div className="flex flex-col items-center gap-2 text-slate">
                    <Inbox className="h-6 w-6" />
                    <span className="text-sm">{emptyLabel}</span>
                  </div>
                </td>
              </tr>
            ) : (
              pageRows.map((row, i) => {
                const sno = startIndex + i + 1;
                const round = row.InterviewRound || "Not Specified";
                const colors = getRowColor(round);
                
                return (
                  <tr
                    key={row.id || row.InterviewID || i}
                    className={cx(
                      "border-b border-line last:border-0 transition-colors",
                      colors.bg,
                      colors.hover,
                      "text-[12px]"
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-4 whitespace-nowrap font-medium text-ink/90 py-1.5"
                      >
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {sortedRows.length > 0 && (
        <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-xs text-slate bg-white">
          <span>
            Showing <span className="font-semibold text-ink">{startIndex + 1}</span>-
            <span className="font-semibold text-ink">{Math.min(currentPage * pageSize, sortedRows.length)}</span> of{" "}
            <span className="font-semibold text-ink">{sortedRows.length}</span>
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-md p-1.5 hover:bg-crimson-50 hover:text-crimson-600 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 font-semibold text-ink">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-md p-1.5 hover:bg-crimson-50 hover:text-crimson-600 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      
    </div>
  );
}