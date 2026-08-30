package me.imsergioh.web.dto;

public class FileInfoDto {

    private String name;
    private String path;
    private boolean directory;

    public FileInfoDto() {
    }

    public FileInfoDto(String name, String path, boolean directory) {
        this.name = name;
        this.path = path;
        this.directory = directory;
    }

    public String getName() {
        return name;
    }

    public String getPath() {
        return path;
    }

    public boolean isDirectory() {
        return directory;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public void setDirectory(boolean directory) {
        this.directory = directory;
    }
}
