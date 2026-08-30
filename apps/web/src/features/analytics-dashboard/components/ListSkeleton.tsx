interface ListSkeletonProps {
  rows?: number;
}

export function ListSkeleton({ rows = 7 }: ListSkeletonProps) {
  return (
    <div className="space-y-2.5" aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="relative overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-3 h-[46px] flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Rank badge placeholder */}
            <div className="h-5 w-5 rounded-md bg-zinc-800/80 animate-pulse shrink-0" />
            {/* Label placeholder */}
            <div className="h-4 w-36 sm:w-48 rounded bg-zinc-800/70 animate-pulse" />
          </div>
          {/* Badge placeholder */}
          <div className="h-5 w-16 rounded-lg bg-zinc-800/60 animate-pulse shrink-0" />
        </div>
      ))}
    </div>
  );
}
