export type AdminConnectionStatus =
  | "idle"
  | "connecting"
  | "open"
  | "closed"
  | "reconnecting"
  | "denied";

export interface AdminReadyPayload {
  admin: true;
  connectedAdmins: number;
  serverTs: number;
}

export interface AdminDeniedPayload {
  admin: false;
  reason: string;
  serverTs: number;
}

export interface AdminSnapshotFilters {
  from: number | null;
  to: number | null;
  countryCode: string | null;
}

export interface AdminSummarySnapshot {
  activeSessions: number;
  totalSessions: number;
  totalEvents: number;
  pageViews: number;
  linkClicks: number;
  avgSessionDuration: number;
  countriesCount: number;
}

export interface AdminSessionSnapshotItem {
  sessionId: string;
  ip: string;
  country: string;
  countryCode: string;
  startedAt: number;
  endedAt: number | null;
  durationSeconds: number;
  status: "active" | "ended";
}

export interface AdminTimeseriesPoint {
  ts: number;
  pageViews: number;
  linkClicks: number;
  total: number;
}

export interface AdminTopPathItem {
  path: string;
  views: number;
}

export interface AdminEventDistributionItem {
  event: string;
  count: number;
}

export interface AdminGeoCountryItem {
  country: string;
  countryCode: string;
  sessions: number;
  events: number;
}

export interface AdminActiveSessionsSnapshot {
  activeSessions: number;
  timestamp: number;
}

export interface AdminAnalyticsFullSnapshot {
  version: number;
  generatedAt: number;
  filters: AdminSnapshotFilters;
  summary: AdminSummarySnapshot;
  sessions: {
    items: AdminSessionSnapshotItem[];
    page: number;
    pageSize: number;
    total: number;
  };
  timeseries: {
    points: AdminTimeseriesPoint[];
  };
  topPaths: {
    items: AdminTopPathItem[];
  };
  eventDistribution: {
    items: AdminEventDistributionItem[];
  };
  geoCountries: {
    items: AdminGeoCountryItem[];
  };
  activeSessions: AdminActiveSessionsSnapshot;
}

export interface AdminSessionStatusDelta {
  type: "SESSION_STATUS";
  sessionId: string;
  status: "active" | "ended";
  timestamp: number;
}

export interface AdminEventDelta {
  type: "EVENT";
  sessionId: string;
  event: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

export type AdminAnalyticsDelta = AdminSessionStatusDelta | AdminEventDelta;

export type AdminSocketEventName =
  | "admin_ready"
  | "admin_denied"
  | "analytics_full_snapshot"
  | "delta";

export interface AdminSocketEnvelope<TPayload = unknown> {
  event?: AdminSocketEventName | string;
  type?: AdminSocketEventName | string;
  channel?: AdminSocketEventName | string;
  payload?: TPayload;
  data?: TPayload;
}
