package me.imsergioh.web.dto.links;

public class CreateLinkRequest {

    private String shortId;
    private String targetUrl;
    private String title;

    public CreateLinkRequest() {
    }

    public CreateLinkRequest(String shortId, String targetUrl, String title) {
        this.shortId = shortId;
        this.targetUrl = targetUrl;
        this.title = title;
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
}
