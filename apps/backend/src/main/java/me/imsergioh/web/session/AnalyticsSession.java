package me.imsergioh.web.session;

import com.maxmind.geoip2.record.Country;
import lombok.Getter;
import me.imsergioh.livecore.instance.connection.LiveStateClient;
import me.imsergioh.livecore.manager.ClientsManager;
import me.imsergioh.web.analytics.AnalyticsIngestionService;
import me.imsergioh.web.analytics.model.AnalyticsEvent;
import me.imsergioh.web.service.AnalyticsRealtimeService;
import me.imsergioh.web.util.AuthUtils;
import me.imsergioh.web.util.DataUtil;
import me.imsergioh.web.util.TimeUtils;
import me.imsergioh.web.util.WebSocketUtils;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class AnalyticsSession {

    private static final Map<String, AnalyticsSession> sessions = new ConcurrentHashMap<>();

    private static final long RATE_LIMIT_MS = 1000;

    @Getter
    private final String id;
    private String country;
    private String countryCode;

    private final Map<String, Long> lastEventTimes = new ConcurrentHashMap<>();

    private AnalyticsSession(String id) {
        this.id = id;
    }

    public void onConnection() {
        registerSession();
        AnalyticsRealtimeService.notifySessionUpdate(id, "active");
    }

    public void onDisconnection() {
        UserSession userSession = UserSession.get(id);
        if (userSession == null) return;
        AdminSession adminSession = userSession.getAdminSession();
        if (adminSession != null) {
            AnalyticsRealtimeService.onAdminDisconnected(id);
        }

        AnalyticsIngestionService.registerSessionEnd(id, TimeUtils.getSecondsTime());
        AnalyticsRealtimeService.notifySessionUpdate(id, "ended");
    }

    private void registerSession() {
        String ip = UserSession.get(id).getIp();
        Country countryData = DataUtil.getCountry(ip);
        if (countryData != null) {
            country = countryData.getName();
            countryCode = countryData.getIsoCode();
        }

        AnalyticsIngestionService.registerSessionStart(id, ip, country, countryCode, TimeUtils.getSecondsTime());
    }

    public void registerEvent(Map<String, String> payload) {
        String eventType = payload.getOrDefault("action", "unknown");

        long now = System.currentTimeMillis();

        Long lastTime = lastEventTimes.get(eventType);
        if (lastTime != null && now - lastTime < RATE_LIMIT_MS) {
            return;
        }

        lastEventTimes.put(eventType, now);

        String ip = UserSession.get(id).getIp();
        AnalyticsEvent event = AnalyticsIngestionService.registerEvent(
                id,
                ip,
                country,
                countryCode,
                payload,
                TimeUtils.getSecondsTime()
        );

        if (event == null) {
            return;
        }

        AnalyticsRealtimeService.notifyEvent(id, payload);
    }

    public static AnalyticsSession get(LiveStateClient client) {
        return get(client.getSession().getId());
    }

    public static AnalyticsSession get(String id) {
        if (sessions.containsKey(id)) return sessions.get(id);
        AnalyticsSession session = new AnalyticsSession(id);
        sessions.put(id, session);
        session.onConnection();
        return session;
    }

    public static void disconnect(LiveStateClient client) {
        AnalyticsSession session = sessions.get(client.getSession().getId());
        if (session == null) return;
        session.onDisconnection();

        sessions.remove(client.getSession().getId());
    }
}
