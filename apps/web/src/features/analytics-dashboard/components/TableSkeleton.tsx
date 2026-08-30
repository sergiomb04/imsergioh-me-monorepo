import styles from "@/features/analytics-dashboard/AnalyticsDashboard.module.css";

interface TableSkeletonProps {
  rows?: number;
}

export function TableSkeleton({ rows = 6 }: TableSkeletonProps) {
  return (
    <div aria-hidden="true">
      <div className="flex items-center justify-end gap-3 mb-3">
        <div className="h-7 w-20 rounded border border-neutral-800 bg-zinc-900/60 animate-pulse" />
        <div className="h-7 w-16 rounded bg-zinc-900/40 animate-pulse" />
        <div className="h-7 w-20 rounded border border-neutral-800 bg-zinc-900/60 animate-pulse" />
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Sesion</th>
              <th>Pais</th>
              <th>IP</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Duracion</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i}>
                <td>
                  <div className="h-4 w-20 rounded bg-zinc-800/60 animate-pulse" />
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-5 rounded bg-zinc-800/70 animate-pulse shrink-0" />
                    <div className="h-4 w-24 rounded bg-zinc-800/60 animate-pulse" />
                  </div>
                </td>
                <td>
                  <div className="h-4 w-24 rounded bg-zinc-800/50 animate-pulse" />
                </td>
                <td>
                  <div className="h-4 w-28 rounded bg-zinc-800/50 animate-pulse" />
                </td>
                <td>
                  <div className="h-4 w-28 rounded bg-zinc-800/50 animate-pulse" />
                </td>
                <td>
                  <div className="h-4 w-12 rounded bg-zinc-800/50 animate-pulse" />
                </td>
                <td>
                  <div className="h-5 w-16 rounded-full bg-zinc-800/60 animate-pulse" />
                </td>
                <td>
                  <div className="h-6 w-24 rounded bg-zinc-800/50 animate-pulse" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
