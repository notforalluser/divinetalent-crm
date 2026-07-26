import { useMemo, useState } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";

function cx(...args) {
  return args.filter(Boolean).join(" ");
}

export default function DataTable({ columns, rows, searchTerm = "", emptyLabel = "No records found" }) {
  const { settings } = useSettings();
  const [sort, setSort] = useState({ key: null, dir: "asc" });
  const [page, setPage] = useState(1);
  const pageSize = settings.pageSize;

  const filtered = useMemo(() => {
    if (!searchTerm) return rows;
    const q = searchTerm.toLowerCase();
    return rows.filter((row) => Object.values(row).some((v) => String(v ?? "").toLowerCase().includes(q)));
  }, [rows, searchTerm]);

  const sorted = useMemo(() => {
    if (!sort.key) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = a[sort.key],
        bv = b[sort.key];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") return sort.dir === "asc" ? av - bv : bv - av;
      return sort.dir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return copy;
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const startIndex = (currentPage - 1) * pageSize;

  function toggleSort(key) {
    setPage(1);
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  }

  return (
    <div className="flex flex-col rounded-xl overflow-hidden">
      {/* Small, colored, interactive scrollbar for the table body */}
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
            <tr
              className={cx(
                "bg-gradient-to-r from-crimson-600 to-crimson-500",
                settings.density === "compact" ? "text-[10.5px]" : "text-[11.5px]"
              )}
            >
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && toggleSort(col.key)}
                  className={cx(
                    "px-4 py-3 font-bold uppercase tracking-wider text-white whitespace-nowrap",
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
                <td colSpan={columns.length + 1} className="px-4 py-16 text-center bg-white">
                  <div className="flex flex-col items-center gap-2 text-slate">
                    <Inbox className="h-6 w-6" />
                    <span className="text-sm">{emptyLabel}</span>
                  </div>
                </td>
              </tr>
            ) : (
              pageRows.map((row, i) => {
                const sno = startIndex + i + 1;
                const odd = i % 2 === 0;
                return (
                  <tr
                    key={row.id || i}
                    className={cx(
                      "border-b border-line last:border-0 hover:bg-crimson-50/50 transition-colors",
                      odd ? "bg-white" : "bg-cloud/50",
                      settings.density === "compact" ? "text-xs" : "text-[13.5px]"
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cx(
                          "px-4 whitespace-nowrap font-medium text-ink/90",
                          settings.density === "compact" ? "py-2" : "py-3.5"
                        )}
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

      {sorted.length > 0 && (
        <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-xs text-slate bg-white">
          <span>
            Showing <span className="font-semibold text-ink">{startIndex + 1}</span>-
            <span className="font-semibold text-ink">{Math.min(currentPage * pageSize, sorted.length)}</span> of{" "}
            <span className="font-semibold text-ink">{sorted.length}</span>
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