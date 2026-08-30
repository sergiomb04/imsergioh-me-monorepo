package me.imsergioh.web.model;

import com.fasterxml.jackson.annotation.JsonInclude;

public class TrafficItem {

    private String id;
    private String shortId;
    private String targetUrl;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String ip;

    private String ipMasked;
    private String country;
    private String city;
    private String userAgent;
    private String referer;
    private String openedAt;

    public TrafficItem() {
    }

    public TrafficItem(String id, String shortId, String targetUrl, String ip, String ipMasked,
                       String country, String city, String userAgent, String referer, String openedAt) {
        this.id = id;
        this.shortId = shortId;
        this.targetUrl = targetUrl;
        this.ip = ip;
        this.ipMasked = ipMasked;
        this.country = country;
        this.city = city;
        this.userAgent = userAgent;
        this.referer = referer;
        this.openedAt = openedAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getIpMasked() {
        return ipMasked;
    }

    public void setIpMasked(String ipMasked) {
        this.ipMasked = ipMasked;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
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

    public String getOpenedAt() {
        return openedAt;
    }

    public void setOpenedAt(String openedAt) {
        this.openedAt = openedAt;
    }
}
