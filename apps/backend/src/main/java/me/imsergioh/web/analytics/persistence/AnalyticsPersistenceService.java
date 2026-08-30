package me.imsergioh.web.analytics.persistence;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import me.imsergioh.web.analytics.model.AnalyticsEvent;
import me.imsergioh.web.util.ErrorLogger;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class AnalyticsPersistenceService {

    private static final int MAX_QUEUE = 50_000;

    private final AnalyticsRepository analyticsRepository;
    private final BlockingQueue<AnalyticsEvent> eventQueue = new LinkedBlockingQueue<>(MAX_QUEUE);
    private final java.util.Set<String> discardedSessionIds = java.util.concurrent.ConcurrentHashMap.newKeySet();
    private final AtomicBoolean running = new AtomicBoolean(true);

    private Thread writerThread;

    public AnalyticsPersistenceService(AnalyticsRepository analyticsRepository) {
        this.analyticsRepository = analyticsRepository;
    }

    @PostConstruct
    public void start() {
        writerThread = new Thread(this::writerLoop, "analytics-mariadb-writer");
        writerThread.setDaemon(true);
        writerThread.start();
    }

    @PreDestroy
    public void stop() {
        running.set(false);
        if (writerThread != null) {
            writerThread.interrupt();
        }
        flushRemaining();
    }

    public void enqueueEvent(AnalyticsEvent event) {
        if (event == null || discardedSessionIds.contains(event.getSessionId())) {
            return;
        }
        if (!eventQueue.offer(event)) {
            eventQueue.poll();
            eventQueue.offer(event);
        }
    }

    public void discardSession(String sessionId) {
        if (sessionId == null) return;
        discardedSessionIds.add(sessionId);
        eventQueue.removeIf(e -> sessionId.equals(e.getSessionId()));
        try {
            analyticsRepository.deleteSession(sessionId);
        } catch (Exception e) {
            ErrorLogger.log("AnalyticsPersistenceService.discardSession(" + sessionId + ")", e);
        }
    }

    private void writerLoop() {
        List<AnalyticsEvent> batch = new ArrayList<>(200);

        while (running.get()) {
            try {
                AnalyticsEvent first = eventQueue.poll(500, TimeUnit.MILLISECONDS);
                if (first == null) {
                    continue;
                }

                if (!discardedSessionIds.contains(first.getSessionId())) {
                    batch.add(first);
                }

                while (batch.size() < 200) {
                    AnalyticsEvent next = eventQueue.poll();
                    if (Objects.isNull(next)) {
                        break;
                    }
                    if (!discardedSessionIds.contains(next.getSessionId())) {
                        batch.add(next);
                    }
                }

                if (!batch.isEmpty()) {
                    analyticsRepository.insertEventsBatch(batch);
                    batch.clear();
                }
            } catch (InterruptedException ignored) {
                Thread.currentThread().interrupt();
                break;
            } catch (Exception e) {
                ErrorLogger.log("AnalyticsPersistenceService.persistLoop", e);
                System.err.println("⚠️ Error en persistencia por lotes a MariaDB: " + e.getMessage());
            }
        }
    }

    private void flushRemaining() {
        List<AnalyticsEvent> remaining = new ArrayList<>();
        eventQueue.drainTo(remaining);
        List<AnalyticsEvent> filtered = remaining.stream()
                .filter(e -> !discardedSessionIds.contains(e.getSessionId()))
                .toList();
        if (!filtered.isEmpty()) {
            analyticsRepository.insertEventsBatch(filtered);
        }
    }
}