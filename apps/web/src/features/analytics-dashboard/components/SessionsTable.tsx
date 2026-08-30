import type { SessionStatus } from "@/features/analytics-dashboard/types";
import {
  formatDuration,
  formatTimestamp,
  maskIp,
  shortenSessionId,
} from "@/features/analytics-dashboard/utils";
import { CountryFlag } from "@/features/analytics-dashboard/components/CountryFlag";
import styles from "@/features/analytics-dashboard/AnalyticsDashboard.module.css";
import { sendAction, useRealtimeState } from "@/lib/livestate/src/realtime";
import { Trash, Layers, ChevronLeft, ChevronRight } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const EventsModal = dynamic(
  () => import("@/features/analytics-dashboard/components/EventsModal"),
  { ssr: false }
);

interface SessionRow {
  sessionId: string;
  country: string;
  countryCode: string;
  ip: string;
  startedAt: number;
  endedAt: number | null;
  durationSeconds: number;
  status: SessionStatus;
  eventsDetail?: SessionEventDetail[];
}

export interface SessionEventDetail {
  event: string;
  timestamp: number;
  path: string;
  metadata: Record<string, unknown>;
}

interface SessionsTableProps {
  rows: SessionRow[];
  page?: number;
  pageSize?: number;
  total?: number;
}

const ADMIN_SESSIONS_PAGE_KEY = "admin_sessions_page";
let memoryAdminSessionsPage = 1;

function getStoredPage(initialPage?: number): number {
  if (typeof initialPage === "number" && initialPage >= 1) {
    return initialPage;
  }
  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem(ADMIN_SESSIONS_PAGE_KEY);
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= 1) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
  }
  return memoryAdminSessionsPage || 1;
}

function persistPage(page: number) {
  memoryAdminSessionsPage = page;
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(ADMIN_SESSIONS_PAGE_KEY, String(page));
    } catch {
      // ignore
    }
  }
}

export function SessionsTable({
  rows,
  page,
  pageSize,
  total,
}: SessionsTableProps) {
  const [sessionDeletePayload] = useRealtimeState("deleted_action", null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(() =>
    getStoredPage(page),
  );

  const sessions = useMemo(() => rows, [rows]);

  const selectedSession = sessions.find(
    (s) => s.sessionId === selectedSessionId,
  );

  const events = selectedSession?.eventsDetail || [];

  const [prevPropPage, setPrevPropPage] = useState<number | undefined>(page);
  if (page !== undefined && page !== prevPropPage) {
    setPrevPropPage(page);
    if (typeof page === "number" && page >= 1) {
      setCurrentPage(page);
      persistPage(page);
    }
  }

  useEffect(() => {
    if (!sessionDeletePayload) {
      return;
    }
    toast.success("Sesión eliminada correctamente", {
      description: "El registro de la sesión ha sido eliminado del sistema.",
    });
  }, [sessionDeletePayload]);

  const goToPage = (newPage: number) => {
    if (newPage < 1) {
      return;
    }

    setCurrentPage(newPage);
    persistPage(newPage);
    sendAction("SET_SESSIONS_PAGE", {
      index: newPage,
    });
  };

  const totalPages =
    typeof total === "number" &&
    typeof pageSize === "number" &&
    pageSize > 0 &&
    total > 0
      ? Math.max(1, Math.ceil(total / pageSize))
      : undefined;

  return (
    <>
      <div className="flex items-center justify-end gap-3 mb-4">
        <button
          type="button"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 text-xs font-medium text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800 hover:text-white transition"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Anterior</span>
        </button>

        <span className="text-xs text-zinc-400 font-medium">
          Página <span className="text-white font-semibold">{currentPage}</span>
          {totalPages ? ` de ${totalPages}` : ""}
        </span>

        <button
          type="button"
          onClick={() => goToPage(currentPage + 1)}
          disabled={totalPages !== undefined ? currentPage >= totalPages : false}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 text-xs font-medium text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800 hover:text-white transition"
        >
          <span>Siguiente</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
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
            {sessions.map((row) => {
              const {
                sessionId = "",
                country = "Desconocido",
                countryCode = "--",
                ip = "",
                startedAt = "",
                endedAt = "",
                durationSeconds = 0,
                status = "ended",
                eventsDetail = [],
              } = row || {};

              return (
                <tr key={sessionId}>
                  <td className="font-mono text-zinc-300 font-medium">
                    {shortenSessionId(sessionId)}
                  </td>

                  <td>
                    <span className="inline-flex items-center gap-2">
                      <CountryFlag
                        countryCode={countryCode}
                        countryName={country}
                        className="h-3.5 w-5 rounded-xs object-cover"
                      />
                      <span className="text-zinc-200">
                        {country} {countryCode && countryCode !== "--" ? `(${countryCode})` : ""}
                      </span>
                    </span>
                  </td>

                  <td className="font-mono text-zinc-400">{maskIp(ip)}</td>

                  <td className="text-zinc-300">{startedAt !== "" ? formatTimestamp(startedAt as unknown as number) : "-"}</td>

                  <td className="text-zinc-300">{endedAt !== "" ? formatTimestamp(endedAt as unknown as number) : "-"}</td>

                  <td className="text-zinc-300 font-medium">{formatDuration(durationSeconds)}</td>

                  <td>
                    <span
                      className={`${styles.badge} ${
                        status === "active"
                          ? styles.badgeActive
                          : styles.badgeEnded
                      }`}
                    >
                      {status === "active" ? "Activa" : "Finalizada"}
                    </span>
                  </td>

                  <td>
                    <div
                      className={`${styles.actions} flex gap-2 items-center`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSessionId(sessionId);
                          setOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 hover:text-cyan-200 transition-all shadow-xs active:scale-95"
                        title="Ver historial de eventos"
                      >
                        <Layers className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Ver eventos</span>
                        <span className="rounded-md bg-cyan-950/80 px-1.5 py-0.2 text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
                          {eventsDetail?.length ?? 0}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          sendAction("DELETE_SESSION", {
                            sessionId,
                          })
                        }
                        className="inline-flex items-center justify-center rounded-lg border border-transparent p-1.5 text-zinc-500 hover:border-rose-500/30 hover:bg-rose-500/15 hover:text-rose-400 transition-all active:scale-95"
                        title="Eliminar sesión"
                      >
                        <Trash className="h-4 w-4 text-rose-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {open && (
        <EventsModal
          session={selectedSession}
          events={events}
          formatTimestamp={formatTimestamp}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

