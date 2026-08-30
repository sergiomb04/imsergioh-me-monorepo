export type EventType = "PAGE_VIEW" | "LINK_CLICK";

export type TimeRangeFilter = "24h" | "7d" | "30d";

export type EventTypeFilter = EventType | "ALL";

export type SessionStatus = "active" | "ended";

export interface SessionItem {
  sessionId: string;
  ip: string;
  country: string;
  countryCode: string;
  startedAt: number;
  endedAt: number | null;
  durationSeconds: number;
}

export interface SessionEvent {
  sessionId: string;
  event: EventType;
  timestamp: number;
  path?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface TopPathItem {
  path: string;
  views: number;
}

export interface SummaryMetrics {
  totalSessions: number;
  totalEvents: number;
  pageViews: number;
  linkClicks: number;
  avgSessionDuration: number;
  countriesCount: number;
}

export interface SessionAnalyticsDataset {
  activeSessions: number;
  sessions: SessionItem[];
  events: SessionEvent[];
  topPathsMonthly: TopPathItem[];
  summary: SummaryMetrics;
}

export interface TimeseriesPoint {
  ts: number;
  label: string;
  total: number;
  pageViews: number;
  linkClicks: number;
}

export interface EventDistributionItem {
  event: EventType;
  count: number;
}

export interface GeoCountryItem {
  country: string;
  countryCode: string;
  sessions: number;
  events: number;
}

export interface FiltersState {
  range: TimeRangeFilter;
  countryCode: string;
  eventType: EventTypeFilter;
}

export interface AnalyticsComputedView {
  activeSessions: number;
  summary: SummaryMetrics;
  timeseries: TimeseriesPoint[];
  topPaths: TopPathItem[];
  eventDistribution: EventDistributionItem[];
  sessions: (SessionItem & { status: SessionStatus })[];
  geoCountries: GeoCountryItem[];
}
