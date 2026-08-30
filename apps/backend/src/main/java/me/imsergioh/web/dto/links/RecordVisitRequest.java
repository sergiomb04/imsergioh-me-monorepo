package me.imsergioh.web.dto.links;

public class RecordVisitRequest {

    private String shortId;
    private String targetUrl;
    private String ip;
    private String userAgent;
    private String referer;

    public RecordVisitRequest() {
    }

    public RecordVisitRequest(String shortId, String targetUrl, String ip, String userAgent, String referer) {
        this.shortId = shortId;
        this.targetUrl = targetUrl;
        this.ip = ip;
        this.userAgent = userAgent;
        this.referer = referer;
    }

    public String getShortId() {
        return shortId;
    }

    public void setShortId(String shortId) {
        this.shortId = shortId;
    }

    public String getTargetUrl() {
        return targetUrl;
    }

    public void setTargetUrl(String targetUrl) {
        this.targetUrl = targetUrl;
    }

    public String getIp() {
        return ip;
    }

    public void setIp(String ip) {
        this.ip = ip;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public String getReferer() {
        return referer;
    }

    public void setReferer(String referer) {
        this.referer = referer;
    }
}
