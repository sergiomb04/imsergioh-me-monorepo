"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Activity,
  ArrowDownUp,
  Check,
  Code2,
  Compass,
  Copy,
  ExternalLink,
  Layers,
  MousePointerClick,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { CountryFlag } from "@/features/analytics-dashboard/components/CountryFlag";
import {
  formatDuration,
  maskIp,
  shortenSessionId,
} from "@/features/analytics-dashboard/utils";
import type { SessionEventDetail } from "@/features/analytics-dashboard/components/SessionsTable";

interface SessionInfo {
  sessionId?: string;
  country?: string;
  countryCode?: string;
  ip?: string;
  startedAt?: number | string;
  endedAt?: number | string | null;
  durationSeconds?: number;
  status?: "active" | "ended" | string;
}

interface EventsModalProps {
  events: SessionEventDetail[];
  onClose: () => void;
  formatTimestamp: (ts: number | null) => string;
  session?: SessionInfo;
}

function formatEventTime(timestamp: number | string): {
  timeStr: string;
  dateStr: string;
  rawTs: number;
} {
  const tsNum = typeof timestamp === "string" ? Number(timestamp) : timestamp;
  if (isNaN(tsNum) || !tsNum) {
    return { timeStr: "--:--:--", dateStr: "--/--/----", rawTs: 0 };
  }

  // Handle seconds vs milliseconds
  const ms = tsNum > 1e11 ? tsNum : tsNum * 1000;
  const date = new Date(ms);

  return {
    timeStr: date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    dateStr: date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    rawTs: ms,
  };
}

function getEventStyle(eventName: string) {
  const normalized = eventName?.toUpperCase() || "";

  if (normalized.includes("PAGE_VIEW") || normalized.includes("PAGE")) {
    return {
      badgeBg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-300",
      dotBg: "bg-cyan-400 shadow-cyan-500/40",
      icon: Compass,
      label: "Vista de página",
      accentColor: "text-cyan-400",
    };
  }

  if (normalized.includes("LINK_CLICK") || normalized.includes("CLICK")) {
    return {
      badgeBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
      dotBg: "bg-emerald-400 shadow-emerald-500/40",
      icon: MousePointerClick,
      label: "Click en enlace",
      accentColor: "text-emerald-400",
    };
  }

  return {
    badgeBg: "bg-indigo-500/10 border-indigo-500/30 text-indigo-300",
    dotBg: "bg-indigo-400 shadow-indigo-500/40",
    icon: Sparkles,
    label: eventName || "Evento",
    accentColor: "text-indigo-400",
  };
}

export default function EventsModal({
  events = [],
  onClose,
  session,
}: EventsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>({});
  const [copiedId, setCopiedId] = useState(false);
  const [copiedMetadataIndex, setCopiedMetadataIndex] = useState<number | null>(null);

  // Close on Escape key & lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  // Copy session ID
  const copySessionId = () => {
    if (!session?.sessionId) return;
    navigator.clipboard.writeText(session.sessionId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Copy event metadata JSON
  const copyMetadata = (index: number, metadata: Record<string, unknown>) => {
    navigator.clipboard.writeText(JSON.stringify(metadata, null, 2));
    setCopiedMetadataIndex(index);
    setTimeout(() => setCopiedMetadataIndex(null), 2000);
  };

  // Toggle individual metadata expansion
  const toggleMetadata = (index: number) => {
    setExpandedIndices((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Expand or collapse all
  const toggleAllMetadata = () => {
    const areAllExpanded = events.length > 0 && events.every((_, i) => expandedIndices[i]);
    const newState: Record<number, boolean> = {};
    if (!areAllExpanded) {
      events.forEach((_, i) => {
        newState[i] = true;
      });
    }
    setExpandedIndices(newState);
  };

  // Sort & Filter events
  const processedEvents = useMemo(() => {
    const items = events.map((event, originalIndex) => ({
      ...event,
      originalIndex,
      timeData: formatEventTime(event.timestamp),
    }));

    // Sort chronologically
    items.sort((a, b) => {
      const diff = a.timeData.rawTs - b.timeData.rawTs;
      return sortOrder === "asc" ? diff : -diff;
    });

    // Calculate relative time from first event (when sorted asc)
    const baseTs = items.length > 0 ? (sortOrder === "asc" ? items[0].timeData.rawTs : items[items.length - 1].timeData.rawTs) : 0;

    return items.map((item) => {
      const diffSecs = Math.max(0, Math.round(Math.abs(item.timeData.rawTs - baseTs) / 1000));
      return {
        ...item,
        relativeSecs: diffSecs,
      };
    });
  }, [events, sortOrder]);

  // Apply search and category filter
  const filteredEvents = useMemo(() => {
    return processedEvents.filter((item) => {
      // Type filter
      if (typeFilter !== "ALL") {
        if (typeFilter === "PAGE_VIEW" && !item.event?.toUpperCase().includes("PAGE")) {
          return false;
        }
        if (typeFilter === "LINK_CLICK" && !item.event?.toUpperCase().includes("CLICK")) {
          return false;
        }
        if (
          typeFilter === "OTHER" &&
          (item.event?.toUpperCase().includes("PAGE") || item.event?.toUpperCase().includes("CLICK"))
        ) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.event?.toLowerCase().includes(q);
        const matchesPath = item.path?.toLowerCase().includes(q);
        const matchesMeta = item.metadata ? JSON.stringify(item.metadata).toLowerCase().includes(q) : false;
        return matchesName || matchesPath || matchesMeta;
      }

      return true;
    });
  }, [processedEvents, typeFilter, searchQuery]);

  // Summary Metrics
  const summary = useMemo(() => {
    const pageViews = events.filter((e) => e.event?.toUpperCase().includes("PAGE")).length;
    const linkClicks = events.filter((e) => e.event?.toUpperCase().includes("CLICK")).length;
    const otherEvents = events.length - pageViews - linkClicks;
    return { pageViews, linkClicks, otherEvents, total: events.length };
  }, [events]);

  const allExpanded = events.length > 0 && events.every((_, i) => expandedIndices[i]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="events-modal-title"
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-zinc-800/90 bg-zinc-950/95 shadow-2xl shadow-black/90 backdrop-blur-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/3 h-48 w-80 rounded-full bg-cyan-500/10 blur-[90px]" />
        <div className="pointer-events-none absolute top-1/2 -right-24 h-48 w-80 rounded-full bg-indigo-500/10 blur-[90px]" />

        {/* Modal Header */}
        <header className="relative z-10 shrink-0 border-b border-zinc-800/80 bg-zinc-950/80 px-5 py-4 sm:px-6 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-sm shadow-cyan-500/10">
                <Layers className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2
                    id="events-modal-title"
                    className="font-montserrat text-lg font-bold tracking-tight text-white sm:text-xl"
                  >
                    Historial de Eventos
                  </h2>
                  {session?.status && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${session.status === "active"
                        ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                        : "border-zinc-700/60 bg-zinc-800/60 text-zinc-400"
                        }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${session.status === "active"
                          ? "bg-emerald-400 animate-pulse"
                          : "bg-zinc-500"
                          }`}
                      />
                      {session.status === "active" ? "En vivo" : "Finalizada"}
                    </span>
                  )}
                </div>

                {/* Session details pills */}
                <div className="mt-1 flex items-center gap-2.5 flex-wrap text-xs text-zinc-400">
                  {session?.sessionId && (
                    <div className="inline-flex items-center gap-1 font-mono text-zinc-300 bg-zinc-900/80 border border-zinc-800 px-2 py-0.5 rounded-md">
                      <span>id: {shortenSessionId(session.sessionId)}</span>
                      <button
                        type="button"
                        onClick={copySessionId}
                        className="text-zinc-500 hover:text-cyan-300 transition ml-0.5"
                        title="Copiar ID completo"
                      >
                        {copiedId ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  )}

                  {session?.country && (
                    <span className="inline-flex items-center gap-1.5 text-zinc-300">
                      <CountryFlag
                        countryCode={session.countryCode}
                        countryName={session.country}
                        className="h-3 w-4 rounded-xs object-cover"
                      />
                      <span>
                        {session.country}
                        {session.countryCode && session.countryCode !== "--"
                          ? ` (${session.countryCode})`
                          : ""}
                      </span>
                    </span>
                  )}

                  {session?.ip && (
                    <span className="font-mono text-zinc-500">
                      • {maskIp(session.ip)}
                    </span>
                  )}

                  {typeof session?.durationSeconds === "number" && (
                    <span className="text-zinc-400">
                      • Duración: {formatDuration(session.durationSeconds)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
              title="Cerrar modal (Esc)"
              aria-label="Cerrar modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Quick Stats Summary Bar */}
        <div className="relative z-10 shrink-0 border-b border-zinc-800/60 bg-zinc-950/40 px-5 py-3 sm:px-6">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <div className="flex items-center gap-2.5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 px-3 py-2">
              <div className="rounded-lg bg-zinc-800/80 p-1.5 text-zinc-300">
                <Activity className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">
                  Total Eventos
                </p>
                <p className="font-montserrat text-sm font-bold text-white">
                  {summary.total}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl border border-cyan-500/20 bg-cyan-950/20 px-3 py-2">
              <div className="rounded-lg bg-cyan-500/20 p-1.5 text-cyan-300">
                <Compass className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-cyan-400 tracking-wider">
                  Páginas Vistas
                </p>
                <p className="font-montserrat text-sm font-bold text-cyan-200">
                  {summary.pageViews}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-950/20 px-3 py-2">
              <div className="rounded-lg bg-emerald-500/20 p-1.5 text-emerald-300">
                <MousePointerClick className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-emerald-400 tracking-wider">
                  Clicks & Links
                </p>
                <p className="font-montserrat text-sm font-bold text-emerald-200">
                  {summary.linkClicks}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl border border-indigo-500/20 bg-indigo-950/20 px-3 py-2">
              <div className="rounded-lg bg-indigo-500/20 p-1.5 text-indigo-300">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-indigo-400 tracking-wider">
                  Otros Eventos
                </p>
                <p className="font-montserrat text-sm font-bold text-indigo-200">
                  {summary.otherEvents}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="relative z-10 shrink-0 border-b border-zinc-800/80 bg-zinc-950/80 px-5 py-3 sm:px-6 backdrop-blur-md">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por evento, ruta (/projects), texto..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 pl-9 pr-8 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none transition focus:border-cyan-400/60 focus:bg-zinc-900"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Filter Tabs & Options */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Category Filter */}
              <div className="flex rounded-xl border border-zinc-800 bg-zinc-900/80 p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setTypeFilter("ALL")}
                  className={`rounded-lg px-2.5 py-1 font-medium transition ${typeFilter === "ALL"
                    ? "bg-zinc-800 text-white shadow-xs"
                    : "text-zinc-400 hover:text-zinc-200"
                    }`}
                >
                  Todos ({events.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter("PAGE_VIEW")}
                  className={`rounded-lg px-2.5 py-1 font-medium transition ${typeFilter === "PAGE_VIEW"
                    ? "bg-cyan-500/20 text-cyan-300 shadow-xs"
                    : "text-zinc-400 hover:text-zinc-200"
                    }`}
                >
                  Páginas ({summary.pageViews})
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter("LINK_CLICK")}
                  className={`rounded-lg px-2.5 py-1 font-medium transition ${typeFilter === "LINK_CLICK"
                    ? "bg-emerald-500/20 text-emerald-300 shadow-xs"
                    : "text-zinc-400 hover:text-zinc-200"
                    }`}
                >
                  Clicks ({summary.linkClicks})
                </button>
              </div>

              {/* Sort Order Toggle */}
              <button
                type="button"
                onClick={() =>
                  setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                }
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                title="Cambiar orden temporal"
              >
                <ArrowDownUp className="h-3 w-3 text-zinc-400" />
                <span className="hidden sm:inline">
                  {sortOrder === "asc" ? "Cronológico" : "Más recientes"}
                </span>
              </button>

              {/* Toggle all metadata */}
              {events.some((e) => e.metadata && Object.keys(e.metadata).length > 0) && (
                <button
                  type="button"
                  onClick={toggleAllMetadata}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                  title="Expandir/Contraer toda la metadata"
                >
                  <Code2 className="h-3 w-3 text-zinc-400" />
                  <span className="hidden sm:inline">
                    {allExpanded ? "Ocultar JSON" : "Ver JSON"}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Events Timeline Stream */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-6">
          {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-zinc-500 mb-3">
                <Layers className="h-8 w-8 text-zinc-500" />
              </div>
              <p className="font-montserrat text-sm font-semibold text-zinc-300">
                {events.length === 0
                  ? "No hay eventos registrados en esta sesión"
                  : "No se encontraron eventos con los filtros seleccionados"}
              </p>
              <p className="mt-1 text-xs text-zinc-500 max-w-sm">
                {events.length === 0
                  ? "Los eventos de navegación y clicks se mostrarán aquí en tiempo real."
                  : "Prueba a cambiar el término de búsqueda o selecciona otra categoría."}
              </p>
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 space-y-4">
              {/* Timeline Connector Rail */}
              <div className="absolute left-[11px] sm:left-[15px] top-4 bottom-4 w-px bg-linear-to-b from-cyan-500/40 via-zinc-800 to-zinc-900" />

              {filteredEvents.map((item, displayIdx) => {
                const style = getEventStyle(item.event);
                const IconComponent = style.icon;
                const isExpanded = Boolean(expandedIndices[item.originalIndex]);
                const hasMetadata = item.metadata && Object.keys(item.metadata).length > 0;
                const metaText = typeof item.metadata?.text === "string" ? item.metadata.text : null;
                const metaHref = typeof item.metadata?.href === "string" ? item.metadata.href : null;
                const metaUrl = typeof item.metadata?.url === "string" ? item.metadata.url : null;

                return (
                  <div key={`${item.originalIndex}-${displayIdx}`} className="relative group">
                    {/* Timeline Node Icon/Dot */}
                    <div
                      className={`absolute -left-[30px] sm:-left-[34px] top-3.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-zinc-950 ${style.dotBg} shadow-md transition-transform duration-200 group-hover:scale-110`}
                      title={`${style.label} (#${item.originalIndex + 1})`}
                    >
                      <IconComponent className="h-3.5 w-3.5 text-zinc-950 stroke-[2.5]" />
                    </div>

                    {/* Event Card */}
                    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900/70 shadow-lg shadow-black/20">
                      {/* Card Top Row */}
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold tracking-wide ${style.badgeBg}`}
                          >
                            <IconComponent className="h-3 w-3 shrink-0" />
                            <span>{item.event}</span>
                          </span>

                          <span className="text-[11px] font-mono text-zinc-500">
                            #{item.originalIndex + 1}
                          </span>

                          {item.relativeSecs !== undefined && (
                            <span className="text-[11px] font-mono text-zinc-400 bg-zinc-950/60 border border-zinc-800/60 px-2 py-0.5 rounded-md">
                              +{item.relativeSecs}s
                            </span>
                          )}
                        </div>

                        {/* Timestamp */}
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                          <span className="font-mono text-zinc-300 font-medium">
                            {item.timeData.timeStr}
                          </span>
                          <span className="text-zinc-500 text-[11px]">
                            ({item.timeData.dateStr})
                          </span>
                        </div>
                      </div>

                      {/* Path / URL Section */}
                      {item.path && (
                        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-zinc-950/80 border border-zinc-800/80 px-3 py-2 text-xs">
                          <div className="flex items-center gap-2 min-w-0 font-mono text-zinc-300">
                            <Compass className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                            <span className="font-semibold text-cyan-300">Ruta:</span>
                            <span className="truncate">{item.path}</span>
                          </div>

                          <a
                            href={item.path}
                            target="_blank"
                            rel="noreferrer"
                            className="text-zinc-500 hover:text-cyan-300 transition shrink-0 p-0.5"
                            title="Abrir ruta en nueva pestaña"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}

                      {/* Structured Metadata Highlight (e.g. for Link Clicks) */}
                      {(metaText || metaHref || metaUrl) && (
                        <div className="mt-2.5 rounded-xl bg-zinc-950/50 border border-zinc-800/60 p-3 text-xs space-y-1.5">
                          {metaText && (
                            <div className="flex items-start gap-2">
                              <span className="text-zinc-500 shrink-0 font-medium">Texto:</span>
                              <span className="text-zinc-200 font-medium">&quot;{metaText}&quot;</span>
                            </div>
                          )}
                          {(metaHref || metaUrl) && (
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-zinc-500 shrink-0 font-medium">Destino:</span>
                              <a
                                href={metaHref || metaUrl || "#"}
                                target="_blank"
                                rel="noreferrer"
                                className="truncate font-mono text-emerald-400 hover:underline inline-flex items-center gap-1"
                              >
                                <span>{metaHref || metaUrl}</span>
                                <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Metadata Collapsible Drawer */}
                      {hasMetadata && (
                        <div className="mt-3 pt-2.5 border-t border-zinc-800/60">
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => toggleMetadata(item.originalIndex)}
                              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-cyan-300 transition font-medium"
                            >
                              <Code2 className="h-3 w-3 text-zinc-500" />
                              <span>
                                {isExpanded ? "Ocultar detalles JSON" : "Ver metadata completa JSON"}
                              </span>
                            </button>

                            {isExpanded && (
                              <button
                                type="button"
                                onClick={() => copyMetadata(item.originalIndex, item.metadata)}
                                className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded-md transition"
                                title="Copiar JSON"
                              >
                                {copiedMetadataIndex === item.originalIndex ? (
                                  <>
                                    <Check className="h-3 w-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copiado</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" />
                                    <span>Copiar</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                          {isExpanded && (
                            <div className="mt-2.5 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
                              <pre className="overflow-x-auto p-3.5 text-[11px] font-mono text-zinc-300 leading-relaxed">
                                {JSON.stringify(item.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>,
    document.body,
  );
}

