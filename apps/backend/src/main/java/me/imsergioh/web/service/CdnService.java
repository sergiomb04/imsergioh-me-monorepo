package me.imsergioh.web.service;

import me.imsergioh.web.dto.FileInfoDto;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

@Service
public class CdnService {

    public Path getCdnRoot() {
        String cdnRootEnv = System.getenv("CDN_ROOT");
        if (cdnRootEnv == null || cdnRootEnv.isBlank()) {
            cdnRootEnv = System.getProperty("CDN_ROOT");
        }
        if (cdnRootEnv != null && !cdnRootEnv.isBlank()) {
            return Paths.get(cdnRootEnv).toAbsolutePath().normalize();
        }
        return Paths.get("data", "cdn").toAbsolutePath().normalize();
    }

    private Path resolveSafePath(String relativePath) {
        Path root = getCdnRoot();
        if (relativePath == null || relativePath.trim().isEmpty()) {
            return root;
        }
        // Normalize and verify path doesn't escape root
        Path resolved = root.resolve(relativePath.trim()).normalize();
        if (!resolved.startsWith(root)) {
            throw new SecurityException("Path traversal attempt detected: " + relativePath);
        }
        return resolved;
    }

    public List<FileInfoDto> listFiles() throws IOException {
        List<FileInfoDto> files = new ArrayList<>();
        Path root = getCdnRoot();

        if (!Files.exists(root)) {
            Files.createDirectories(root);
        }

        try (Stream<Path> paths = Files.walk(root)) {
            paths.forEach(path -> {
                if (!path.equals(root)) {
                    String relativePath = root.relativize(path).toString().replace("\\", "/");
                    files.add(new FileInfoDto(
                            path.getFileName().toString(),
                            relativePath,
                            Files.isDirectory(path)
                    ));
                }
            });
        }

        return files;
    }

    public String uploadFile(MultipartFile file, String path) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty file");
        }

        Path destination = resolveSafePath(path);
        if (!Files.exists(destination)) {
            Files.createDirectories(destination);
        }

        // Clean filename to prevent traversal in filename
        String rawFilename = file.getOriginalFilename();
        if (rawFilename == null || rawFilename.isBlank()) {
            rawFilename = "upload_" + System.currentTimeMillis();
        }
        String cleanFilename = Paths.get(rawFilename).getFileName().toString();

        Path filePath = destination.resolve(cleanFilename).normalize();
        if (!filePath.startsWith(getCdnRoot())) {
            throw new SecurityException("Path traversal attempt detected in filename: " + rawFilename);
        }

        Files.copy(
                file.getInputStream(),
                filePath,
                StandardCopyOption.REPLACE_EXISTING
        );

        Path root = getCdnRoot();
        return root.relativize(filePath).toString().replace("\\", "/");
    }

    public void deleteFile(String relativePath) throws IOException {
        if (relativePath == null || relativePath.trim().isEmpty()) {
            throw new IllegalArgumentException("Path must not be empty");
        }

        Path file = resolveSafePath(relativePath);

        if (!Files.exists(file)) {
            throw new NoSuchFileException(relativePath);
        }

        if (file.equals(getCdnRoot())) {
            throw new SecurityException("Cannot delete CDN root directory");
        }

        Files.delete(file);
    }
}
