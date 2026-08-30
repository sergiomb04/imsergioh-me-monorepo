package me.imsergioh.web.dto;

public class UploadResponseDto {

    private boolean success;
    private String message;
    private String path;

    public UploadResponseDto() {
    }

    public UploadResponseDto(boolean success, String message, String path) {
        this.success = success;
        this.message = message;
        this.path = path;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public String getPath() {
        return path;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setPath(String path) {
        this.path = path;
    }
}
