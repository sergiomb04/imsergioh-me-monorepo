package me.imsergioh.web.analytics;

import jakarta.annotation.PostConstruct;
import me.imsergioh.web.analytics.model.AnalyticsEvent;
import me.imsergioh.web.analytics.model.CountryStats;
import me.imsergioh.web.analytics.model.SessionEvent;
import me.imsergioh.web.analytics.model.SessionState;
import me.imsergioh.web.analytics.model.TimeBucketStats;
import me.imsergioh.web.analytics.persistence.AnalyticsPersistenceService;
import me.imsergioh.web.analytics.persistence.AnalyticsRepository;
import me.imsergioh.web.service.AnalyticsRealtimeService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Deque;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.locks.ReentrantReadWriteLock;

@Component
public class AnalyticsState {

    private static AnalyticsState INSTANCE;

    private static final int MAX_RECENT_SESSIONS = 10_000;
    private static final int MAX_EVENTS_PER_SESSION = 250;
    private static final long BUCKET_SECONDS = 60L;
    private static final int MAX_BUCKETS = 60 * 24 * 7;

    @Value("${analytics.cache.inactive-timeout-ms:300000}")
    private long inactiveTimeoutMs;

    private final AnalyticsRepository repository;
    private final AnalyticsPersistenceService persistenceService;
    private final ReentrantReadWriteLock lock = new ReentrantReadWriteLock();

    // Sesiones activas en tiempo real (mantenidas de forma ligera)
    private final Map<String, SessionState> activeSessions = new ConcurrentHashMap<>();

    // Estado de la caché en memoria (se hidrata cuando hay admins y se libera tras 5m de inactividad)
    private volatile boolean isCacheLoaded = false;
    private final AtomicLong lastAdminActivityTs = new AtomicLong(0L);

    private final Deque<SessionState> recentSessions = new ArrayDeque<>();
    private long totalSessions;
    private long totalEvents;
    private long pageViews;
    private long linkClicks;

    private final Map<String, Long> eventDistribution = new LinkedHashMap<>();
    private final Map<String, Long> topPaths = new LinkedHashMap<>();
    private final Map<String, String> countryNames = new LinkedHashMap<>();
    private final Map<String, CountryStats> countryStats = new LinkedHashMap<>();
    private final TreeMap<Long, TimeBucketStats> timeSeries = new TreeMap<>();

    public AnalyticsState(AnalyticsRepository repository, AnalyticsPersistenceService persistenceService) {
        this.repository = repository;
        this.persistenceService = persistenceService;
    }

    public static AnalyticsState get() {
        return INSTANCE;
    }

    @PostConstruct
    public void setupInstance() {
        INSTANCE = this;
    }

    /**
     * Registra actividad de un administrador (conexión o consulta).
     * Si la caché en memoria estaba descargada, la hidrata desde MariaDB.
     */
    public void touchAdminActivity() {
        lastAdminActivityTs.set(System.currentTimeMillis());
        if (!isCacheLoaded) {
            hydrateFromDatabase();
        }
    }

    public boolean hasActiveAdminContext() {
        boolean adminsConnected = AnalyticsRealtimeService.getConnectedAdmins() > 0;
        long timeSinceLastActivity = System.currentTimeMillis() - lastAdminActivityTs.get();
        return adminsConnected || (timeSinceLastActivity < inactiveTimeoutMs && lastAdminActivityTs.get() > 0);
    }

    /**
     * Revisa periódicamente si ningún administrador está conectado ni ha consultado datos en 5 minutos.
     * En ese caso, purga las estructuras pesadas en memoria y libera RAM.
     */
    @Scheduled(fixedDelayString = "${analytics.cache.check-interval-ms:30000}")
    public void checkCacheEviction() {
        if (isCacheLoaded && !hasActiveAdminContext()) {
            purgeCache();
        }
    }

    public void purgeCache() {
        lock.writeLock().lock();
        try {
            if (!isCacheLoaded) return;
            recentSessions.clear();
            eventDistribution.clear();
            topPaths.clear();
            countryNames.clear();
            countryStats.clear();
            timeSeries.clear();
            totalSessions = 0;
            totalEvents = 0;
            pageViews = 0;
            linkClicks = 0;
            isCacheLoaded = false;
            System.out.println("ℹ️ [AnalyticsState] Inactividad de administradores > 5m. Caché en memoria descargada y memoria liberada.");
        } finally {
            lock.writeLock().unlock();
        }
    }

    public void hydrateFromDatabase() {
        lock.writeLock().lock();
        try {
            if (isCacheLoaded) return;
            System.out.println("🔄 [AnalyticsState] Hidratando caché en memoria desde MariaDB para administración...");

            Map<String, Object> summary = repository.querySummary(activeSessions.size());
            totalSessions = ((Number) summary.getOrDefault("totalSessions", 0L)).longValue();
            totalEvents = ((Number) summary.getOrDefault("totalEvents", 0L)).longValue();
            pageViews = ((Number) summary.getOrDefault("pageViews", 0L)).longValue();
            linkClicks = ((Number) summary.getOrDefault("linkClicks", 0L)).longValue();

            countryNames.clear();
            countryNames.putAll(repository.queryCountryNames());

            eventDistribution.clear();
            for (Map<String, Object> item : (List<Map<String, Object>>) repository.queryEventDistribution().get("items")) {
                eventDistribution.put((String) item.get("event"), ((Number) item.get("count")).longValue());
            }

            topPaths.clear();
            for (Map<String, Object> item : (List<Map<String, Object>>) repository.queryTopPaths(50).get("items")) {
                topPaths.put((String) item.get("path"), ((Number) item.get("views")).longValue());
            }

            countryStats.clear();
            for (Map<String, Object> item : (List<Map<String, Object>>) repository.queryGeoCountries(100).get("items")) {
                String code = (String) item.get("countryCode");
                CountryStats cs = new CountryStats();
                long sess = ((Number) item.get("sessions")).longValue();
                for (int i = 0; i < sess; i++) cs.incrementSession();
                long events = ((Number) item.get("events")).longValue();
                long pviews = ((Number) item.get("pageViews")).longValue();
                long lclicks = ((Number) item.get("linkClicks")).longValue();
                for (int i = 0; i < pviews; i++) cs.incrementEventType("PAGE_VIEW");
                for (int i = 0; i < lclicks; i++) cs.incrementEventType("LINK_CLICK");
                countryStats.put(code, cs);
            }

            isCacheLoaded = true;
            System.out.println("✅ [AnalyticsState] Caché en memoria cargada exitosamente.");
        } catch (Exception e) {
            System.err.println("⚠️ Error al hidratar caché desde MariaDB: " + e.getMessage());
        } finally {
            lock.writeLock().unlock();
        }
    }

    public void deleteSession(String sessionId) {
        activeSessions.remove(sessionId);
        persistenceService.discardSession(sessionId);

        lock.writeLock().lock();
        try {
            recentSessions.removeIf(session -> session.getSessionId().equals(sessionId));
        } finally {
            lock.writeLock().unlock();
        }
    }

    public static boolean isDiscardableSession(SessionState state, long endedAt) {
        if (state == null) return false;
        long duration = Math.max(0L, endedAt - state.getStartedAt());
        if (duration >= 6) {
            return false;
        }

        List<SessionEvent> events = state.getEvents();
        if (events.size() != 3 || state.getTotalEvents() != 3) {
            return false;
        }

        boolean hasSessionStart = false;
        boolean hasSessionEnd = false;
        boolean hasRootPageView = false;

        for (SessionEvent event : events) {
            String type = event.getEvent();
            if ("SESSION_START".equalsIgnoreCase(type)) {
                hasSessionStart = true;
            } else if ("SESSION_END".equalsIgnoreCase(type)) {
                hasSessionEnd = true;
            } else if ("PAGE_VIEW".equalsIgnoreCase(type)) {
                String path = event.getPath();
                if (path == null || path.isBlank() || path.equals("/")) {
                    hasRootPageView = true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }

        return hasSessionStart && hasSessionEnd && hasRootPageView;
    }

    private void revertSessionStats(SessionState state) {
        totalSessions = Math.max(0, totalSessions - 1);
        totalEvents = Math.max(0, totalEvents - state.getTotalEvents());
        pageViews = Math.max(0, pageViews - state.getPageViews());
        linkClicks = Math.max(0, linkClicks - state.getLinkClicks());

        for (SessionEvent event : state.getEvents()) {
            String eventType = event.getEvent();
            if (eventDistribution.containsKey(eventType)) {
                long count = eventDistribution.get(eventType) - 1;
                if (count <= 0) {
                    eventDistribution.remove(eventType);
                } else {
                    eventDistribution.put(eventType, count);
                }
            }

            if ("PAGE_VIEW".equalsIgnoreCase(eventType)) {
                String path = event.getPath();
                if (path != null && !path.isBlank() && topPaths.containsKey(path)) {
                    long count = topPaths.get(path) - 1;
                    if (count <= 0) {
                        topPaths.remove(path);
                    } else {
                        topPaths.put(path, count);
                    }
                }
            }

            String cc = state.getCountryCode();
            if (cc != null && !cc.isBlank() && countryStats.containsKey(cc)) {
                CountryStats cs = countryStats.get(cc);
                cs.decrementEventType(eventType);
            }

            long bucket = (event.getTimestamp() / BUCKET_SECONDS) * BUCKET_SECONDS;
            TimeBucketStats tb = timeSeries.get(bucket);
            if (tb != null) {
                tb.decrement(eventType);
                if (tb.getTotal() <= 0) {
                    timeSeries.remove(bucket);
                }
            }
        }

        String cc = state.getCountryCode();
        if (cc != null && !cc.isBlank() && countryStats.containsKey(cc)) {
            CountryStats cs = countryStats.get(cc);
            cs.decrementSession();
            if (cs.getSessions() <= 0 && cs.getEvents() <= 0) {
                countryStats.remove(cc);
            }
        }
    }

    public void onSessionStart(String sessionId, String ip, String country, String countryCode, long timestamp) {
        SessionState state = new SessionState(sessionId, ip, country, countryCode, timestamp, MAX_EVENTS_PER_SESSION);
        activeSessions.put(sessionId, state);

        repository.upsertSession(sessionId, ip, country, countryCode, timestamp);

        if (isCacheLoaded) {
            lock.writeLock().lock();
            try {
                totalSessions++;
                if (countryCode != null && !countryCode.isBlank()) {
                    countryStats.computeIfAbsent(countryCode, key -> new CountryStats()).incrementSession();
                    if (country != null && !country.isBlank()) {
                        countryNames.putIfAbsent(countryCode, country);
                    }
                }
            } finally {
                lock.writeLock().unlock();
            }
        }
    }

    public void onSessionEnd(String sessionId, long timestamp) {
        SessionState state = activeSessions.remove(sessionId);
        if (state != null) {
            state.end(timestamp);

            if (isDiscardableSession(state, timestamp)) {
                if (isCacheLoaded) {
                    lock.writeLock().lock();
                    try {
                        revertSessionStats(state);
                    } finally {
                        lock.writeLock().unlock();
                    }
                }
                persistenceService.discardSession(sessionId);
                return;
            }

            if (isCacheLoaded) {
                lock.writeLock().lock();
                try {
                    recentSessions.addFirst(state.copy());
                    while (recentSessions.size() > MAX_RECENT_SESSIONS) {
                        recentSessions.pollLast();
                    }
                } finally {
                    lock.writeLock().unlock();
                }
            }
        }

        repository.endSession(sessionId, timestamp);
    }

    public void onEvent(AnalyticsEvent event) {
        SessionState session = activeSessions.get(event.getSessionId());
        if (session != null) {
            session.addEvent(new SessionEvent(event.getEventType(), event.getTimestamp(), event.getPath(), event.getMetadata()));
        }

        if (isCacheLoaded) {
            lock.writeLock().lock();
            try {
                totalEvents++;
                eventDistribution.merge(event.getEventType(), 1L, Long::sum);

                if (event.is("PAGE_VIEW")) {
                    pageViews++;
                    if (event.getPath() != null && !event.getPath().isBlank()) {
                        topPaths.merge(event.getPath(), 1L, Long::sum);
                    }
                } else if (event.is("LINK_CLICK")) {
                    linkClicks++;
                }

                String cc = event.getCountryCode();
                if (cc != null && !cc.isBlank()) {
                    countryStats.computeIfAbsent(cc, key -> new CountryStats()).incrementEventType(event.getEventType());
                }

                long bucket = (event.getTimestamp() / BUCKET_SECONDS) * BUCKET_SECONDS;
                timeSeries.computeIfAbsent(bucket, key -> new TimeBucketStats()).increment(event.getEventType());
                trimOldBuckets();
            } finally {
                lock.writeLock().unlock();
            }
        }
    }

    public Map<String, Object> summary() {
        touchAdminActivity();
        if (isCacheLoaded) {
            lock.readLock().lock();
            try {
                long totalDuration = 0L;
                long now = System.currentTimeMillis() / 1000;

                for (SessionState session : activeSessions.values()) {
                    totalDuration += Math.max(0L, now - session.getStartedAt());
                }
                for (SessionState session : recentSessions) {
                    Long endedAt = session.getEndedAt();
                    if (endedAt != null) {
                        totalDuration += Math.max(0L, endedAt - session.getStartedAt());
                    }
                }

                long knownSessions = activeSessions.size() + recentSessions.size();
                Map<String, Object> response = new LinkedHashMap<>();
                response.put("activeSessions", activeSessions.size());
                response.put("totalSessions", totalSessions);
                response.put("totalEvents", totalEvents);
                response.put("pageViews", pageViews);
                response.put("linkClicks", linkClicks);
                response.put("avgSessionDuration", knownSessions == 0 ? 0 : totalDuration / knownSessions);
                response.put("countriesCount", countryStats.size());
                return response;
            } finally {
                lock.readLock().unlock();
            }
        }
        return repository.querySummary(activeSessions.size());
    }

    public List<SessionState> sessionsSnapshot() {
        touchAdminActivity();
        lock.readLock().lock();
        try {
            List<SessionState> sessions = new ArrayList<>(activeSessions.size() + recentSessions.size());
            for (SessionState session : activeSessions.values()) {
                sessions.add(session.copy());
            }
            for (SessionState session : recentSessions) {
                sessions.add(session.copy());
            }
            sessions.sort(Comparator.comparingLong(SessionState::getStartedAt).reversed());
            return sessions;
        } finally {
            lock.readLock().unlock();
        }
    }

    public Optional<SessionState> findSession(String sessionId) {
        touchAdminActivity();
        SessionState active = activeSessions.get(sessionId);
        if (active != null) {
            return Optional.of(active.copy());
        }

        lock.readLock().lock();
        try {
            for (SessionState session : recentSessions) {
                if (sessionId.equals(session.getSessionId())) {
                    return Optional.of(session.copy());
                }
            }
        } finally {
            lock.readLock().unlock();
        }

        return repository.findSession(sessionId);
    }

    public Map<String, Long> eventDistributionSnapshot() {
        touchAdminActivity();
        if (isCacheLoaded) {
            lock.readLock().lock();
            try {
                return new LinkedHashMap<>(eventDistribution);
            } finally {
                lock.readLock().unlock();
            }
        }
        Map<String, Long> dist = new LinkedHashMap<>();
        for (Map<String, Object> item : (List<Map<String, Object>>) repository.queryEventDistribution().get("items")) {
            dist.put((String) item.get("event"), ((Number) item.get("count")).longValue());
        }
        return dist;
    }

    public Map<String, Long> topPathsSnapshot() {
        touchAdminActivity();
        if (isCacheLoaded) {
            lock.readLock().lock();
            try {
                return new LinkedHashMap<>(topPaths);
            } finally {
                lock.readLock().unlock();
            }
        }
        Map<String, Long> paths = new LinkedHashMap<>();
        for (Map<String, Object> item : (List<Map<String, Object>>) repository.queryTopPaths(10).get("items")) {
            paths.put((String) item.get("path"), ((Number) item.get("views")).longValue());
        }
        return paths;
    }

    public Map<String, CountryStats> countryStatsSnapshot() {
        touchAdminActivity();
        lock.readLock().lock();
        try {
            return new LinkedHashMap<>(countryStats);
        } finally {
            lock.readLock().unlock();
        }
    }

    public Map<String, String> countryNamesSnapshot() {
        touchAdminActivity();
        if (isCacheLoaded) {
            lock.readLock().lock();
            try {
                return new LinkedHashMap<>(countryNames);
            } finally {
                lock.readLock().unlock();
            }
        }
        return repository.queryCountryNames();
    }

    public Map<Long, TimeBucketStats> timeSeriesSnapshot() {
        touchAdminActivity();
        lock.readLock().lock();
        try {
            return new LinkedHashMap<>(timeSeries);
        } finally {
            lock.readLock().unlock();
        }
    }

    public long getActiveSessionsCount() {
        return activeSessions.size();
    }

    private void trimOldBuckets() {
        while (timeSeries.size() > MAX_BUCKETS) {
            timeSeries.pollFirstEntry();
        }
    }
}
