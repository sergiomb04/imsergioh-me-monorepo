package me.imsergioh.web.analytics.model;

import java.util.LinkedHashMap;
import java.util.Map;

public class SessionEvent {

    private final String event;
    private final long timestamp;
    private final String path;
    private final Map<String, String> metadata;

    public SessionEvent(String event, long timestamp, String path, Map<String, String> metadata) {
        this.event = event;
        this.timestamp = timestamp;
        this.path = path;
        this.metadata = metadata == null ? new LinkedHashMap<>() : new LinkedHashMap<>(metadata);
    }

    public String getEvent() {
        return event;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public String getPath() {
        return path;
    }

    public Map<String, String> getMetadata() {
        return metadata;
    }
}
