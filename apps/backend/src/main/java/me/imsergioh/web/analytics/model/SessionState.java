package me.imsergioh.web.analytics.model;

import lombok.Getter;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

public class SessionState {

    @Getter
    private final String sessionId;
    @Getter
    private final String ip;
    @Getter
    private final String country;
    @Getter
    private final String countryCode;
    @Getter
    private final long startedAt;

    @Getter
    private Long endedAt;
    @Getter
    private boolean active;
    @Getter
    private long totalEvents;
    @Getter
    private long pageViews;
    @Getter
    private long linkClicks;

    private final Deque<SessionEvent> events;
    private final int maxEvents;

    public SessionState(String sessionId, String ip, String country, String countryCode, long startedAt, int maxEvents) {
        this.sessionId = sessionId;
        this.ip = ip;
        this.country = country;
        this.countryCode = countryCode;
        this.startedAt = startedAt;
        this.maxEvents = maxEvents;
        this.active = true;
        this.events = new ArrayDeque<>(maxEvents);
    }

    public void addEvent(SessionEvent event) {
        totalEvents++;
        if ("PAGE_VIEW".equalsIgnoreCase(event.getEvent())) {
            pageViews++;
        } else if ("LINK_CLICK".equalsIgnoreCase(event.getEvent())) {
            linkClicks++;
        }

        events.addFirst(event);
        while (events.size() > maxEvents) {
            events.pollLast();
        }
    }

    public void end(long endedAt) {
        this.active = false;
        this.endedAt = endedAt;
    }

    public List<SessionEvent> getEvents() {
        return new ArrayList<>(events);
    }

    public SessionState copy() {
        SessionState copy = new SessionState(sessionId, ip, country, countryCode, startedAt, maxEvents);
        copy.endedAt = endedAt;
        copy.active = active;
        copy.totalEvents = totalEvents;
        copy.pageViews = pageViews;
        copy.linkClicks = linkClicks;
        List<SessionEvent> eventsCopy = getEvents();
        for (int i = eventsCopy.size() - 1; i >= 0; i--) {
            copy.events.addFirst(eventsCopy.get(i));
        }
        return copy;
    }
}
