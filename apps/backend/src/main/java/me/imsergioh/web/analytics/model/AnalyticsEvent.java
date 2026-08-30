package me.imsergioh.web.analytics.model;

import lombok.Getter;

import java.util.LinkedHashMap;
import java.util.Map;

@Getter
public class AnalyticsEvent {

    private String sessionId;
    private String eventType;
    private String path;
    private String country;
    private String countryCode;
    private String ip;
    private long timestamp;
    private Map<String, String> metadata;

    public AnalyticsEvent(String sessionId, String eventType, String path, String country, String countryCode, String ip, long timestamp, Map<String, String> metadata) {
        this.sessionId = sessionId;
        this.eventType = eventType;
        this.path = path;
        this.country = country;
        this.countryCode = countryCode;
        this.ip = ip;
        this.timestamp = timestamp;
        this.metadata = metadata == null ? new LinkedHashMap<>() : new LinkedHashMap<>(metadata);
    }

    public Map<String, String> getMetadata() {
        return metadata == null ? Map.of() : metadata;
    }

    public boolean is(String type) {
        return type != null && type.equalsIgnoreCase(eventType);
    }
}