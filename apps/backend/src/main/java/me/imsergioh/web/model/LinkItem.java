package me.imsergioh.web.model;

import com.fasterxml.jackson.annotation.JsonInclude;

public class LinkItem {

    private String id;
    private String shortId;
    private String targetUrl;
    private String title;
    private String createdAt;
    private String updatedAt;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Long clickCount;

    public LinkItem() {
    }

    public LinkItem(String id, String shortId, String targetUrl, String title, String createdAt, String updatedAt) {
        this.id = id;
        this.shortId = shortId;
        this.targetUrl = targetUrl;
        this.title = title;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long getClickCount() {
        return clickCount;
    }

    public void setClickCount(Long clickCount) {
        this.clickCount = clickCount;
    }
}
