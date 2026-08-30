package me.imsergioh.web.dto.links;

public class DeleteTrafficRequest {

    private String id;
    private String shortId;
    private Boolean deleteAll;

    public DeleteTrafficRequest() {
    }

    public DeleteTrafficRequest(String id, String shortId, Boolean deleteAll) {
        this.id = id;
        this.shortId = shortId;
        this.deleteAll = deleteAll;
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

    public Boolean getDeleteAll() {
        return deleteAll;
    }

    public void setDeleteAll(Boolean deleteAll) {
        this.deleteAll = deleteAll;
    }
}
