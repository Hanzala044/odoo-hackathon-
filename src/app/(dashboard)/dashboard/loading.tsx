export default function DashboardLoading() {
  return (
    <>
      <div className="mb-5 flex items-center gap-3">
        <div className="skeleton h-9 w-full max-w-sm rounded-md" />
        <div className="skeleton h-9 w-32 rounded-md" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-[10px] border border-border bg-surface p-5 shadow-rest">
            <div className="flex items-center gap-4">
              <div className="skeleton h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3.5 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
