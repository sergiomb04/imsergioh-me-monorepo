package me.imsergioh.web.service;

import me.imsergioh.web.analytics.AnalyticsState;
import me.imsergioh.web.analytics.model.CountryStats;
import me.imsergioh.web.analytics.model.SessionEvent;
import me.imsergioh.web.analytics.model.SessionState;
import me.imsergioh.web.analytics.model.TimeBucketStats;
import me.imsergioh.web.analytics.persistence.AnalyticsRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AnalyticsQueryService {

    private final AnalyticsState analyticsState;
    private final AnalyticsRepository analyticsRepository;

    public AnalyticsQueryService(AnalyticsState analyticsState, AnalyticsRepository analyticsRepository) {
        this.analyticsState = analyticsState;
        this.analyticsRepository = analyticsRepository;
    }

    public Map<String, Object> getSummary() {
        analyticsState.touchAdminActivity();
        return analyticsState.summary();
    }

    public Map<String, Object> listSessions(Long from, Long to, String countryCode, String status, int page, int pageSize) {
        analyticsState.touchAdminActivity();
        // Usar MariaDB directamente para paginación precisa y soporte ilimitado de historial
        return analyticsRepository.querySessions(from, to, countryCode, status, page, pageSize);
    }

    public Map<String, Object> listSessionEvents(String sessionId, Long from, Long to, String eventType, int limit, String cursor) {
        analyticsState.touchAdminActivity();
        Long cursorTs = parseLong(cursor, null);
        return analyticsRepository.querySessionEvents(sessionId, from, to, eventType, limit, cursorTs);
    }

    public Map<String, Object> getTimeseries(Long from, Long to, String interval, String eventType) {
        analyticsState.touchAdminActivity();
        long bucketSeconds = intervalToSeconds(interval);

        // Si la serie temporal está en caché, calcularla en memoria; de lo contrario, consultar SQL
        Map<Long, TimeBucketStats> snapshot = analyticsState.timeSeriesSnapshot();
        if (!snapshot.isEmpty()) {
            Map<Long, long[]> buckets = new LinkedHashMap<>();

            for (Map.Entry<Long, TimeBucketStats> entry : snapshot.entrySet()) {
                long sourceBucketTs = entry.getKey();
                if (from != null && sourceBucketTs < from) {
                    continue;
                }
                if (to != null && sourceBucketTs > to) {
                    continue;
                }

                long targetBucketTs = (sourceBucketTs / bucketSeconds) * bucketSeconds;
                long[] stats = buckets.computeIfAbsent(targetBucketTs, ignored -> new long[]{0, 0, 0});

                TimeBucketStats source = entry.getValue();
                if (eventType == null || eventType.isBlank()) {
                    stats[0] += source.getPageViews();
                    stats[1] += source.getLinkClicks();
                    stats[2] += source.getTotal();
                } else if ("PAGE_VIEW".equalsIgnoreCase(eventType)) {
                    stats[0] += source.getPageViews();
                    stats[2] += source.getPageViews();
                } else if ("LINK_CLICK".equalsIgnoreCase(eventType)) {
                    stats[1] += source.getLinkClicks();
                    stats[2] += source.getLinkClicks();
                } else {
                    long count = source.getDistribution().getOrDefault(eventType, 0L);
                    stats[2] += count;
                }
            }

            List<Map<String, Object>> points = buckets.entrySet().stream()
                    .sorted(Map.Entry.comparingByKey())
                    .map(entry -> {
                        Map<String, Object> row = new LinkedHashMap<>();
                        row.put("ts", entry.getKey());
                        row.put("pageViews", entry.getValue()[0]);
                        row.put("linkClicks", entry.getValue()[1]);
                        row.put("total", entry.getValue()[2]);
                        return row;
                    })
                    .toList();

            return Map.of("points", points);
        }

        return analyticsRepository.queryTimeseries(from, to, bucketSeconds, eventType);
    }

    public Map<String, Object> getTopPaths(int limit) {
        analyticsState.touchAdminActivity();
        Map<String, Long> paths = analyticsState.topPathsSnapshot();
        if (!paths.isEmpty()) {
            List<Map<String, Object>> items = paths.entrySet().stream()
                    .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                    .limit(Math.max(1, limit))
                    .map(entry -> {
                        Map<String, Object> row = new LinkedHashMap<>();
                        row.put("path", entry.getKey());
                        row.put("views", entry.getValue());
                        return row;
                    })
                    .toList();

            return Map.of("items", items);
        }
        return analyticsRepository.queryTopPaths(limit);
    }

    public Map<String, Object> getEventDistribution() {
        analyticsState.touchAdminActivity();
        Map<String, Long> dist = analyticsState.eventDistributionSnapshot();
        if (!dist.isEmpty()) {
            List<Map<String, Object>> items = dist.entrySet().stream()
                    .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                    .map(entry -> {
                        Map<String, Object> row = new LinkedHashMap<>();
                        row.put("event", entry.getKey());
                        row.put("count", entry.getValue());
                        return row;
                    })
                    .toList();

            return Map.of("items", items);
        }
        return analyticsRepository.queryEventDistribution();
    }

    public Map<String, Object> getGeoCountries(int limit) {
        analyticsState.touchAdminActivity();
        Map<String, String> countryNames = analyticsState.countryNamesSnapshot();
        Map<String, CountryStats> statsMap = analyticsState.countryStatsSnapshot();

        if (!statsMap.isEmpty()) {
            List<Map<String, Object>> items = statsMap.entrySet().stream()
                    .sorted((a, b) -> Long.compare(b.getValue().getSessions(), a.getValue().getSessions()))
                    .limit(Math.max(1, limit))
                    .map(entry -> {
                        CountryStats stats = entry.getValue();
                        Map<String, Object> row = new LinkedHashMap<>();
                        row.put("country", countryNames.getOrDefault(entry.getKey(), entry.getKey()));
                        row.put("countryCode", entry.getKey());
                        row.put("sessions", stats.getSessions());
                        row.put("events", stats.getEvents());
                        row.put("pageViews", stats.getPageViews());
                        row.put("linkClicks", stats.getLinkClicks());
                        return row;
                    })
                    .toList();

            return Map.of("items", items);
        }
        return analyticsRepository.queryGeoCountries(limit);
    }

    public Map<String, Object> getActiveSessions() {
        analyticsState.touchAdminActivity();
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("activeSessions", analyticsState.getActiveSessionsCount());
        response.put("timestamp", System.currentTimeMillis() / 1000);
        return response;
    }

    private Map<String, Object> toSessionRow(SessionState session) {
        long effectiveEnd = session.isActive()
                ? System.currentTimeMillis() / 1000
                : session.getEndedAt() == null ? session.getStartedAt() : session.getEndedAt();

        long duration = Math.max(0L, effectiveEnd - session.getStartedAt());

        Map<String, Object> row = new LinkedHashMap<>();
        row.put("sessionId", session.getSessionId());
        row.put("ip", session.getIp());
        row.put("country", session.getCountry());
        row.put("countryCode", session.getCountryCode());
        row.put("startedAt", session.getStartedAt());
        row.put("endedAt", session.isActive() ? null : session.getEndedAt());
        row.put("durationSeconds", duration);
        row.put("status", session.isActive() ? "active" : "ended");
        row.put("events", session.getTotalEvents());
        row.put("pageViews", session.getPageViews());
        row.put("linkClicks", session.getLinkClicks());
        row.put("countryName", session.getCountry());

        row.put(
                "eventsDetail",
                session.getEvents().stream()
                        .map(event -> {
                            Map<String, Object> e = new LinkedHashMap<>();

                            e.put("event", event.getEvent());
                            e.put("timestamp", event.getTimestamp());
                            e.put("path", event.getPath());
                            e.put("metadata", event.getMetadata());

                            return e;
                        })
                        .toList()
        );

        row.put("active", session.isActive());

        return row;
    }

    private static Long parseLong(String raw, Long fallback) {
        if (raw == null || raw.isBlank()) {
            return fallback;
        }

        try {
            return Long.parseLong(raw);
        } catch (NumberFormatException ex) {
            return fallback;
        }
    }

    private static long intervalToSeconds(String interval) {
        if (interval == null) {
            return 60L;
        }

        return switch (interval.toLowerCase()) {
            case "5m" -> 300L;
            case "15m" -> 900L;
            case "30m" -> 1800L;
            case "hour", "1h" -> 3600L;
            case "day", "1d" -> 86400L;
            default -> 60L;
        };
    }
}
