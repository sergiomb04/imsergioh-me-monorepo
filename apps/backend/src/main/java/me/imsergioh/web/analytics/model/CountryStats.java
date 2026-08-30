package me.imsergioh.web.analytics.model;

public class CountryStats {

    private long sessions;
    private long events;
    private long pageViews;
    private long linkClicks;

    public void incrementSession() {
        sessions++;
    }

    public void decrementSession() {
        sessions = Math.max(0, sessions - 1);
    }

    public void incrementEventType(String eventType) {
        events++;
        if ("PAGE_VIEW".equalsIgnoreCase(eventType)) {
            pageViews++;
        } else if ("LINK_CLICK".equalsIgnoreCase(eventType)) {
            linkClicks++;
        }
    }

    public void decrementEventType(String eventType) {
        events = Math.max(0, events - 1);
        if ("PAGE_VIEW".equalsIgnoreCase(eventType)) {
            pageViews = Math.max(0, pageViews - 1);
        } else if ("LINK_CLICK".equalsIgnoreCase(eventType)) {
            linkClicks = Math.max(0, linkClicks - 1);
        }
    }

    public long getSessions() {
        return sessions;
    }

    public long getEvents() {
        return events;
    }

    public long getPageViews() {
        return pageViews;
    }

    public long getLinkClicks() {
        return linkClicks;
    }
}
