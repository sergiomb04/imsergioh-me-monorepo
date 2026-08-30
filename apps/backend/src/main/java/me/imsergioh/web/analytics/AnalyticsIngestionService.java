package me.imsergioh.web.analytics;

import jakarta.annotation.PostConstruct;
import me.imsergioh.web.analytics.model.AnalyticsEvent;
import me.imsergioh.web.analytics.persistence.AnalyticsPersistenceService;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class AnalyticsIngestionService {

    private static AnalyticsIngestionService INSTANCE;

    private final AnalyticsState analyticsState;
    private final AnalyticsPersistenceService persistenceService;

    public AnalyticsIngestionService(AnalyticsState analyticsState, AnalyticsPersistenceService persistenceService) {
        this.analyticsState = analyticsState;
        this.persistenceService = persistenceService;
    }

    @PostConstruct
    public void setupInstance() {
        INSTANCE = this;
    }

    public static void registerSessionStart(String sessionId, String ip, String country, String countryCode, long timestamp) {
        if (INSTANCE == null) {
            return;
        }
        INSTANCE.analyticsState.onSessionStart(sessionId, ip, country, countryCode, timestamp);

        AnalyticsEvent event = new AnalyticsEvent(
                sessionId,
                "SESSION_START",
                null,
                country,
                countryCode,
                ip,
                timestamp,
                Map.of()
        );
        INSTANCE.analyticsState.onEvent(event);
        INSTANCE.persistenceService.enqueueEvent(event);
    }

    public static void registerSessionEnd(String sessionId, long timestamp) {
        if (INSTANCE == null) {
            return;
        }
        AnalyticsEvent event = new AnalyticsEvent(
                sessionId,
                "SESSION_END",
                null,
                null,
                null,
                null,
                timestamp,
                Map.of()
        );
        INSTANCE.analyticsState.onEvent(event);
        INSTANCE.persistenceService.enqueueEvent(event);
        INSTANCE.analyticsState.onSessionEnd(sessionId, timestamp);
    }

    public static AnalyticsEvent registerEvent(String sessionId, String ip, String country, String countryCode, Map<String, String> payload, long timestamp) {
        if (INSTANCE == null) {
            return null;
        }

        String eventType = payload.getOrDefault("action", "unknown");
        String path = payload.get("path");

        Map<String, String> metadata = new LinkedHashMap<>(payload);
        metadata.remove("event");
        metadata.remove("path");

        AnalyticsEvent event = new AnalyticsEvent(
                sessionId,
                eventType,
                path,
                country,
                countryCode,
                ip,
                timestamp,
                metadata
        );

        INSTANCE.analyticsState.onEvent(event);
        INSTANCE.persistenceService.enqueueEvent(event);
        return event;
    }
}
