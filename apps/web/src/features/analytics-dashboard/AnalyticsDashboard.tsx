"use client";

import { useEffect, useMemo, useReducer, useRef } from "react";
import styles from "@/features/analytics-dashboard/AnalyticsDashboard.module.css";
import { sendAction, useRealtimeState } from "@/lib/livestate/src/realtime";
import type {
  AdminAnalyticsDelta,
  AdminAnalyticsFullSnapshot,
  AdminConnectionStatus,
  AdminDeniedPayload,
  AdminReadyPayload,
} from "@/types/admin-analytics";
import type { SessionStatus } from "@/features/analytics-dashboard/types";
import { DashboardHeader } from "@/features/analytics-dashboard/components/DashboardHeader";
import { EmptyState } from "@/features/analytics-dashboard/components/EmptyState";
import { GeoRanking } from "@/features/analytics-dashboard/components/GeoRanking";
import { KpiCard } from "@/features/analytics-dashboard/components/KpiCard";
import { ListSkeleton } from "@/features/analytics-dashboard/components/ListSkeleton";
import { LoadingPanel } from "@/features/analytics-dashboard/components/LoadingPanel";
import { SessionsTable } from "@/features/analytics-dashboard/components/SessionsTable";
import { TableSkeleton } from "@/features/analytics-dashboard/components/TableSkeleton";
import { TopPathsBarChart } from "@/features/analytics-dashboard/components/TopPathsBarChart";
import { Activity, Users, Globe, Compass, Radio } from "lucide-react";

interface DashboardState {
  fullSnapshot: AdminAnalyticsFullSnapshot | null;
  lastDelta: AdminAnalyticsDelta | null;
  connectionStatus: AdminConnectionStatus;
  adminReady: boolean;
  adminDeniedReason: string | null;
  lastSyncAt: number | null;
  connectedAdmins: number;
}

type DashboardAction =
  | { type: "connection"; status: AdminConnectionStatus }
  | { type: "admin_ready"; payload: AdminReadyPayload }
  | { type: "admin_denied"; payload: AdminDeniedPayload }
  | { type: "snapshot"; payload: AdminAnalyticsFullSnapshot }
  | { type: "delta"; payload: AdminAnalyticsDelta };

const initialState: DashboardState = {
  fullSnapshot: null,
  lastDelta: null,
  connectionStatus: "idle",
  adminReady: false,
  adminDeniedReason: null,
  lastSyncAt: null,
  connectedAdmins: 0,
};

function dashboardReducer(
  state: DashboardState,
  action: DashboardAction,
): DashboardState {
  switch (action.type) {
    case "connection":
      return {
        ...state,
        connectionStatus: action.status,
      };
    case "admin_ready":
      return {
        ...state,
        adminReady: true,
        adminDeniedReason: null,
        connectedAdmins: action.payload.connectedAdmins,
      };
    case "admin_denied":
      return {
        ...state,
        adminReady: false,
        adminDeniedReason: action.payload.reason || "invalid_or_expired_token",
        connectionStatus: "denied",
      };
    case "snapshot":
      return {
        ...state,
        fullSnapshot: action.payload,
        lastSyncAt: action.payload.generatedAt,
      };
    case "delta":
      return {
        ...state,
        lastDelta: action.payload,
      };
    default:
      return state;
  }
}

interface AnalyticsDashboardProps {
  adminToken: string;
  embedded?: boolean;
  hideHeader?: boolean;
}

export function AnalyticsDashboard({
  adminToken,
  embedded = false,
  hideHeader = false,
}: AnalyticsDashboardProps) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const handshakeSentForOpenRef = useRef(false);

  const [adminReadyPayload] = useRealtimeState("admin_ready", null, adminToken);
  const [adminDeniedPayload] = useRealtimeState(
    "admin_denied",
    null,
    adminToken,
  );
  const [snapshotPayload, , snapshotConnectionState] = useRealtimeState(
    "analytics_full_snapshot",
    null,
    adminToken,
  );
  const [deltaPayload] = useRealtimeState("delta", null, adminToken);

  useEffect(() => {
    if (!adminToken) {
      dispatch({
        type: "admin_denied",
        payload: {
          admin: false,
          reason: "missing_admin_token",
          serverTs: Math.floor(Date.now() / 1000),
        },
      });
      return;
    }
  }, [adminToken]);

  useEffect(() => {
    dispatch({
      type: "connection",
      status:
        snapshotConnectionState === "open"
          ? "open"
          : snapshotConnectionState === "connecting"
            ? "connecting"
            : "closed",
    });
  }, [snapshotConnectionState]);

  useEffect(() => {
    if (snapshotConnectionState !== "open") {
      handshakeSentForOpenRef.current = false;
      return;
    }

    if (!handshakeSentForOpenRef.current && adminToken) {
      sendAction("SUB_ADMIN", { token: adminToken });
      handshakeSentForOpenRef.current = true;
    }
  }, [snapshotConnectionState, adminToken]);

  useEffect(() => {
    if (!adminReadyPayload) {
      return;
    }

    dispatch({
      type: "admin_ready",
      payload: adminReadyPayload as AdminReadyPayload,
    });
  }, [adminReadyPayload]);

  useEffect(() => {
    if (!adminDeniedPayload) {
      return;
    }

    dispatch({
      type: "admin_denied",
      payload: adminDeniedPayload as AdminDeniedPayload,
    });
  }, [adminDeniedPayload]);

  useEffect(() => {
    if (!snapshotPayload) {
      return;
    }

    dispatch({
      type: "snapshot",
      payload: snapshotPayload as AdminAnalyticsFullSnapshot,
    });
  }, [snapshotPayload]);

  useEffect(() => {
    if (!deltaPayload) {
      return;
    }

    dispatch({
      type: "delta",
      payload: deltaPayload as AdminAnalyticsDelta,
    });
  }, [deltaPayload]);

  const view = useMemo(() => {
    if (!state.fullSnapshot) {
      return null;
    }

    const snapshot = state.fullSnapshot;

    const sessions = [...snapshot.sessions.items].sort(
      (a, b) => b.startedAt - a.startedAt,
    );

    return {
      activeSessions:
        snapshot.activeSessions?.activeSessions ??
        snapshot.summary.activeSessions,

      summary: snapshot.summary,

      topPaths: snapshot.topPaths.items,

      sessions: sessions.map((session) => ({
        ...session,
        status: session.status as SessionStatus,
      })),

      sessionsPage: snapshot.sessions.page,
      sessionsPageSize: snapshot.sessions.pageSize,
      sessionsTotal: snapshot.sessions.total,

      geoCountries: snapshot.geoCountries.items,
    };
  }, [state.fullSnapshot]);

  const hasSnapshot = Boolean(view);

  const hasSessions = Boolean(
    view && view.sessions && view.sessions.length > 0,
  );

  const hasGeo = Boolean(
    view && view.geoCountries && view.geoCountries.length > 0,
  );

  const hasTopPaths = Boolean(
    view && view.topPaths && view.topPaths.length > 0,
  );

  if (state.adminDeniedReason) {
    return (
      <main className={embedded ? styles.pageEmbedded : styles.page}>
        <section className={styles.container}>
          {!hideHeader ? (
            <DashboardHeader
              title="Dashboard de Analítica"
              showLogout={!embedded}
            />
          ) : null}

          <article className="rounded-2xl border border-rose-500/30 bg-rose-950/40 p-6 text-rose-200">
            <h2 className="font-montserrat text-lg font-bold text-white">Acceso denegado</h2>
            <p className="mt-1 text-sm text-rose-300">
              El backend rechazó la suscripción de administrador. Motivo:{" "}
              {state.adminDeniedReason}
            </p>
          </article>
        </section>
      </main>
    );
  }

  return (
    <main className={embedded ? styles.pageEmbedded : styles.page}>
      <section className="space-y-6 max-w-7xl mx-auto">
        {!hideHeader ? (
          <DashboardHeader
            title="Dashboard de Analítica"
            showLogout={!embedded}
          />
        ) : null}

        {/* 2 Core KPIs: Sesiones Activas & Sesiones Totales */}
        <section className="grid gap-4 sm:grid-cols-2">
          <KpiCard
            title="Sesiones Activas"
            value={hasSnapshot ? String(view?.activeSessions || 0) : "-"}
            isLive={hasSnapshot}
            icon={<Activity className="h-5 w-5 text-emerald-400" />}
          />

          <KpiCard
            title="Sesiones Totales"
            value={hasSnapshot ? String(view?.summary.totalSessions || 0) : "-"}
            icon={<Users className="h-5 w-5 text-cyan-400" />}
          />
        </section>

        {/* Top Páginas & Geografía Grid (Side-by-side) */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Páginas */}
          <article className="rounded-3xl border border-zinc-800/90 bg-zinc-950/70 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <Compass className="h-4 w-4 text-cyan-400" />
                <h2 className="font-montserrat text-base font-bold text-white">
                  Top Páginas Más Vistas
                </h2>
              </div>
              <p className="text-xs text-zinc-400 mb-5">
                Ranking de rutas y URLs con mayor volumen de visitas
              </p>

              {!hasSnapshot ? (
                <ListSkeleton rows={7} />
              ) : hasTopPaths ? (
                <TopPathsBarChart items={view!.topPaths} />
              ) : (
                <EmptyState message="No hay datos de páginas vistas todavía." />
              )}
            </div>
          </article>

          {/* Geografía */}
          <article className="rounded-3xl border border-zinc-800/90 bg-zinc-950/70 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <Globe className="h-4 w-4 text-emerald-400" />
                <h2 className="font-montserrat text-base font-bold text-white">
                  Distribución Geográfica
                </h2>
              </div>
              <p className="text-xs text-zinc-400 mb-5">
                Países y orígenes de tráfico de los visitantes
              </p>

              {!hasSnapshot ? (
                <ListSkeleton rows={7} />
              ) : hasGeo ? (
                <GeoRanking items={view!.geoCountries} />
              ) : (
                <EmptyState message="No hay datos de países todavía." />
              )}
            </div>
          </article>
        </div>

        {/* Sesiones Table Panel */}
        <section className="rounded-3xl border border-zinc-800/90 bg-zinc-950/70 p-6 sm:p-7 backdrop-blur-xl shadow-xl">
          <div className="mb-5">
            <h2 className="font-montserrat text-lg font-bold text-white">
              Registro de Sesiones
            </h2>
            <p className="text-xs text-zinc-400">
              Estado, duración, geolocalización e historial de eventos por sesión
            </p>
          </div>

          {!hasSnapshot ? (
            <TableSkeleton rows={6} />
          ) : hasSessions ? (
            <SessionsTable
              rows={view!.sessions}
              page={view!.sessionsPage}
              pageSize={view!.sessionsPageSize}
              total={view!.sessionsTotal}
            />
          ) : (
            <EmptyState message="No hay sesiones registradas disponibles." />
          )}
        </section>
      </section>
    </main>
  );
}
