package me.imsergioh.web.analytics.model;

import java.util.LinkedHashMap;
import java.util.Map;

public class TimeBucketStats {

    private long total;
    private long pageViews;
    private long linkClicks;
    private final Map<String, Long> distribution = new LinkedHashMap<>();

    public void increment(String eventType) {
        total++;
        distribution.merge(eventType, 1L, Long::sum);
        if ("PAGE_VIEW".equalsIgnoreCase(eventType)) {
            pageViews++;
        } else if ("LINK_CLICK".equalsIgnoreCase(eventType)) {
            linkClicks++;
        }
    }

    public void decrement(String eventType) {
        total = Math.max(0, total - 1);
        if (distribution.containsKey(eventType)) {
            long updated = distribution.get(eventType) - 1;
            if (updated <= 0) {
                distribution.remove(eventType);
            } else {
                distribution.put(eventType, updated);
            }
        }
        if ("PAGE_VIEW".equalsIgnoreCase(eventType)) {
            pageViews = Math.max(0, pageViews - 1);
        } else if ("LINK_CLICK".equalsIgnoreCase(eventType)) {
            linkClicks = Math.max(0, linkClicks - 1);
        }
    }

    public long getTotal() {
        return total;
    }

    public long getPageViews() {
        return pageViews;
    }

    public long getLinkClicks() {
        return linkClicks;
    }

    public Map<String, Long> getDistribution() {
        return distribution;
    }
}
