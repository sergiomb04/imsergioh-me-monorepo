package me.imsergioh.web.service;

import jakarta.annotation.PostConstruct;
import me.imsergioh.livecore.instance.connection.LiveStateClient;
import me.imsergioh.livecore.manager.ClientsManager;
import me.imsergioh.web.session.AdminSession;
import me.imsergioh.web.session.UserSession;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class AnalyticsRealtimeService {

    private static AnalyticsRealtimeService INSTANCE;

    private final Set<String> adminClientIds = ConcurrentHashMap.newKeySet();
    private final AtomicInteger connectedAdmins = new AtomicInteger(0);
    private final AnalyticsQueryService analyticsQueryService;

    public AnalyticsRealtimeService(AnalyticsQueryService analyticsQueryService) {
        this.analyticsQueryService = analyticsQueryService;
    }

    @PostConstruct
    public void setupInstance() {
        INSTANCE = this;
    }

    public static void onAdminAuthorized(LiveStateClient client) {
        if (INSTANCE == null) return;

        String clientId = client.getSession().getId();

        if (INSTANCE.adminClientIds.add(clientId)) {
            INSTANCE.connectedAdmins.incrementAndGet();
        }
    }

    public static void onAdminDisconnected(String clientId) {
        if (INSTANCE == null) return;

        if (INSTANCE.adminClientIds.remove(clientId)) {
            INSTANCE.connectedAdmins.updateAndGet(c -> Math.max(0, c - 1));
        }
    }

    public static int getConnectedAdmins() {
        if (INSTANCE == null) return 0;
        return INSTANCE.connectedAdmins.get();
    }

    public static void pushFullSnapshotToClient(LiveStateClient client) {
        if (INSTANCE == null) return;

        UserSession session = UserSession.get(client);
        if (!session.isAdmin()) return;

        client.send("analytics_full_snapshot", INSTANCE.buildFullSnapshot(client));
    }

    @Scheduled(fixedDelayString = "${analytics.realtime.snapshot-ms:5000}")
    public void pushPeriodicSnapshot() {
        if (!hasConnectedAdmins()) return;

       broadcastSnapshot();
    }

    public void broadcastSnapshot() {
        ClientsManager.forEachClient(client -> {
            if (client == null) return;
            UserSession session = UserSession.get(client);
            if (session == null) return;
            if (!session.isAdmin()) return;
            client.send("analytics_full_snapshot", buildFullSnapshot(client));
        });
    }

    public boolean hasConnectedAdmins() {
        return connectedAdmins.get() > 0;
    }

    public static void notifySessionUpdate(String sessionId, String status) {
        if (INSTANCE == null || !INSTANCE.hasConnectedAdmins()) return;

        INSTANCE.broadcast("delta", Map.of(
                "type", "SESSION_STATUS",
                "sessionId", sessionId,
                "status", status,
                "timestamp", System.currentTimeMillis() / 1000
        ));
    }

    public static void notifyEvent(String sessionId, Map<String, String> payload) {
        if (INSTANCE == null || !INSTANCE.hasConnectedAdmins()) return;

        INSTANCE.broadcast("delta", Map.of(
                "type", "EVENT",
                "sessionId", sessionId,
                "event", payload.getOrDefault("action", "unknown"),
                "payload", payload,
                "timestamp", System.currentTimeMillis() / 1000
        ));
    }

    private void broadcast(String eventName, Map<String, Object> data) {
        ClientsManager.forEachClient(client -> {
            if (client == null) return;
            UserSession session = UserSession.get(client);
            if (session == null) return;
            if (!session.isAdmin()) return;
            client.send(eventName, data);
        });
    }

    private Map<String, Object> buildFullSnapshot(LiveStateClient client) {
        Map<String, Object> snapshot = new LinkedHashMap<>();

        snapshot.put("version", 1);
        snapshot.put("generatedAt", System.currentTimeMillis() / 1000);

        Map<String, Object> filters = new LinkedHashMap<>();
        filters.put("from", null);
        filters.put("to", null);
        filters.put("countryCode", null);
        snapshot.put("filters", filters);

        UserSession userSession = UserSession.get(client);
        AdminSession adminSession = userSession != null ? userSession.getAdminSession() : null;
        int page = adminSession == null ? 1 : adminSession.getSessionsPage();

        snapshot.put("summary", analyticsQueryService.getSummary());
        snapshot.put("sessions", analyticsQueryService.listSessions(null, null, null, null, page, 20));
        snapshot.put("timeseries", analyticsQueryService.getTimeseries(null, null, "hour", null));
        snapshot.put("topPaths", analyticsQueryService.getTopPaths(10));
        snapshot.put("eventDistribution", analyticsQueryService.getEventDistribution());
        snapshot.put("geoCountries", analyticsQueryService.getGeoCountries(20));
        snapshot.put("activeSessions", analyticsQueryService.getActiveSessions());

        return snapshot;
    }
}
