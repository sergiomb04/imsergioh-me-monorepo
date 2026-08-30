import type {
  AnalyticsComputedView,
  EventDistributionItem,
  EventType,
  FiltersState,
  GeoCountryItem,
  SessionAnalyticsDataset,
  SessionEvent,
  SessionItem,
  SessionStatus,
  SummaryMetrics,
  TimeRangeFilter,
  TimeseriesPoint,
  TopPathItem,
} from "@/features/analytics-dashboard/types";

const RANGE_IN_SECONDS: Record<TimeRangeFilter, number> = {
  "24h": 24 * 60 * 60,
  "7d": 7 * 24 * 60 * 60,
  "30d": 30 * 24 * 60 * 60,
};

function getBucketSize(range: TimeRangeFilter): number {
  if (range === "24h") {
    return 60 * 60;
  }

  if (range === "7d") {
    return 6 * 60 * 60;
  }

  return 24 * 60 * 60;
}

function formatBucketLabel(ts: number, range: TimeRangeFilter): string {
  const date = new Date(ts * 1000);

  if (range === "24h") {
    return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  }

  if (range === "7d") {
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short", hour: "2-digit" });
  }

  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
}

function getRangeStart(range: TimeRangeFilter, nowTs: number): number {
  return nowTs - RANGE_IN_SECONDS[range];
}

function aggregateTopPaths(events: SessionEvent[]): TopPathItem[] {
  const pathCount = new Map<string, number>();

  events.forEach((event) => {
    if (event.event !== "PAGE_VIEW" || !event.path) {
      return;
    }

    pathCount.set(event.path, (pathCount.get(event.path) || 0) + 1);
  });

  return Array.from(pathCount.entries())
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);
}

function buildEventDistribution(events: SessionEvent[]): EventDistributionItem[] {
  const pageViews = events.filter((event) => event.event === "PAGE_VIEW").length;
  const linkClicks = events.filter((event) => event.event === "LINK_CLICK").length;

  return [
    { event: "PAGE_VIEW", count: pageViews },
    { event: "LINK_CLICK", count: linkClicks },
  ];
}

function buildGeoCountries(sessions: SessionItem[], events: SessionEvent[]): GeoCountryItem[] {
  const eventCountBySession = new Map<string, number>();

  events.forEach((event) => {
    eventCountBySession.set(event.sessionId, (eventCountBySession.get(event.sessionId) || 0) + 1);
  });

  const countryMap = new Map<string, GeoCountryItem>();

  sessions.forEach((session) => {
    const key = `${session.countryCode}:${session.country}`;
    const current = countryMap.get(key);
    const eventCount = eventCountBySession.get(session.sessionId) || 0;

    if (!current) {
      countryMap.set(key, {
        country: session.country,
        countryCode: session.countryCode,
        sessions: 1,
        events: eventCount,
      });
      return;
    }

    current.sessions += 1;
    current.events += eventCount;
  });

  return Array.from(countryMap.values()).sort((a, b) => {
    if (b.sessions !== a.sessions) {
      return b.sessions - a.sessions;
    }

    return b.events - a.events;
  });
}

function buildTimeseries(
  events: SessionEvent[],
  range: TimeRangeFilter,
  fromTs: number,
  toTs: number,
): TimeseriesPoint[] {
  const bucketSize = getBucketSize(range);
  const start = fromTs - (fromTs % bucketSize);
  const points = new Map<number, TimeseriesPoint>();

  for (let ts = start; ts <= toTs; ts += bucketSize) {
    points.set(ts, {
      ts,
      label: formatBucketLabel(ts, range),
      total: 0,
      pageViews: 0,
      linkClicks: 0,
    });
  }

  events.forEach((event) => {
    const bucket = event.timestamp - (event.timestamp % bucketSize);
    const point = points.get(bucket);

    if (!point) {
      return;
    }

    point.total += 1;

    if (event.event === "PAGE_VIEW") {
      point.pageViews += 1;
    } else {
      point.linkClicks += 1;
    }
  });

  return Array.from(points.values()).slice(-24);
}

function buildSummary(
  sessions: SessionItem[],
  events: SessionEvent[],
  activeSessions: number,
): SummaryMetrics {
  const totalSessions = sessions.length;
  const totalEvents = events.length;
  const pageViews = events.filter((event) => event.event === "PAGE_VIEW").length;
  const linkClicks = events.filter((event) => event.event === "LINK_CLICK").length;
  const avgSessionDuration =
    totalSessions === 0
      ? 0
      : Math.round(
          sessions.reduce((total, session) => total + Math.max(0, session.durationSeconds), 0) /
            totalSessions,
        );

  return {
    totalSessions,
    totalEvents,
    pageViews,
    linkClicks,
    avgSessionDuration,
    countriesCount: new Set(sessions.map((session) => session.countryCode)).size,
  };
}

export function getAvailableCountries(data: SessionAnalyticsDataset): Array<{ code: string; name: string }> {
  return Array.from(
    data.sessions.reduce((map, session) => {
      map.set(session.countryCode, session.country);
      return map;
    }, new Map<string, string>()),
  )
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function buildAnalyticsView(
  data: SessionAnalyticsDataset,
  filters: FiltersState,
  nowTs = Math.floor(Date.now() / 1000),
): AnalyticsComputedView {
  const fromTs = getRangeStart(filters.range, nowTs);

  const sessionsByRange = data.sessions.filter((session) => session.startedAt >= fromTs);
  const sessionsByCountry =
    filters.countryCode === "ALL"
      ? sessionsByRange
      : sessionsByRange.filter((session) => session.countryCode === filters.countryCode);

  const sessionIds = new Set(sessionsByCountry.map((session) => session.sessionId));
  const eventsBySession = data.events.filter(
    (event) => sessionIds.has(event.sessionId) && event.timestamp >= fromTs,
  );

  const filteredEvents =
    filters.eventType === "ALL"
      ? eventsBySession
      : eventsBySession.filter((event) => event.event === filters.eventType);

  const activeSessions = sessionsByCountry.filter((session) => session.endedAt === null).length;

  const sessionsWithStatus: Array<SessionItem & { status: SessionStatus }> = sessionsByCountry
    .map((session) => ({
      ...session,
      status: (session.endedAt === null ? "active" : "ended") as SessionStatus,
    }))
    .sort((a, b) => b.startedAt - a.startedAt);

  return {
    activeSessions,
    summary: buildSummary(sessionsByCountry, filteredEvents, activeSessions),
    timeseries: buildTimeseries(filteredEvents, filters.range, fromTs, nowTs),
    topPaths: aggregateTopPaths(filteredEvents),
    eventDistribution: buildEventDistribution(filteredEvents),
    sessions: sessionsWithStatus,
    geoCountries: buildGeoCountries(sessionsByCountry, filteredEvents),
  };
}

export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, totalSeconds);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${remainingSeconds}s`;
}

export function formatTimestamp(epochSeconds: number | null): string {
  if (!epochSeconds) {
    return "-";
  }

  return new Date(epochSeconds * 1000).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function maskIp(ip: string): string {
  const chunks = ip.split(".");

  if (chunks.length !== 4) {
    return "***.***.***.***";
  }

  return `${chunks[0]}.${chunks[1]}.XX.XX`;
}

export function shortenSessionId(sessionId: string): string {
  return sessionId.slice(0, 8);
}

export function getEventLabel(eventType: EventType): string {
  if (eventType === "PAGE_VIEW") {
    return "Page View";
  }

  return "Link Click";
}

export function getCountryFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode === "--" || countryCode.length !== 2) {
    return "🌐";
  }
  const code = countryCode.toUpperCase();
  const offset = 127397;
  const first = code.codePointAt(0);
  const second = code.codePointAt(1);
  if (!first || !second || first < 65 || first > 90 || second < 65 || second > 90) {
    return "🌐";
  }
  return String.fromCodePoint(first + offset, second + offset);
}
