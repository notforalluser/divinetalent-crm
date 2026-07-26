function Shimmer({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-cloud-dark ${className}`} />;
}

/**
 * Structural preloader shown only on the very first workbook load (not on
 * subsequent refreshes). Mirrors the real page's shape -- topbar, KPI row,
 * a couple of chart blocks, and a table -- so the transition to real
 * content doesn't feel like a jarring layout shift (similar to how YouTube
 * shows gray placeholder blocks in the exact shape of the thumbnail/title
 * before the real content paints in).
 */
export default function PageSkeleton() {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex items-center gap-3 h-16 px-5 border-b border-line bg-paper">
        <Shimmer className="h-4 w-24" />
        <Shimmer className="h-9 flex-1 max-w-md rounded-full" />
        <div className="ml-auto flex items-center gap-2">
          <Shimmer className="h-8 w-24 rounded-full" />
          <Shimmer className="h-8 w-8 rounded-full" />
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-5 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <Shimmer className="h-3 w-32 mb-2" />
            <Shimmer className="h-8 w-2/3 max-w-md" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-line bg-paper p-5">
                <Shimmer className="h-3 w-20 mb-3" />
                <Shimmer className="h-7 w-16" />
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-line bg-paper p-5">
                <Shimmer className="h-3 w-28 mb-4" />
                <Shimmer className="h-40 w-full" />
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-line bg-paper p-5">
            <Shimmer className="h-3 w-32 mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Shimmer key={i} className="h-9 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
