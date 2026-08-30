package me.imsergioh.web.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;

import static org.junit.jupiter.api.Assertions.*;

public class CdnServiceTest {

    private CdnService cdnService;

    @BeforeEach
    public void setup() throws IOException {
        cdnService = new CdnService();
        Path root = cdnService.getCdnRoot();
        if (Files.exists(root)) {
            Files.walk(root)
                    .sorted(Comparator.reverseOrder())
                    .forEach(p -> {
                        try {
                            if (!p.equals(root)) Files.deleteIfExists(p);
                        } catch (IOException ignored) {}
                    });
        }
    }

    @Test
    public void testUploadAndListFiles() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test-image.png",
                "image/png",
                "dummy image content".getBytes()
        );

        String path = cdnService.uploadFile(file, "images");
        assertNotNull(path);
        assertTrue(path.contains("test-image.png"));

        var files = cdnService.listFiles();
        assertFalse(files.isEmpty());
        assertTrue(files.stream().anyMatch(f -> f.getName().equals("test-image.png")));
    }

    @Test
    public void testPathTraversalInUploadBlocked() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "exploit.txt",
                "text/plain",
                "evil payload".getBytes()
        );

        assertThrows(SecurityException.class, () -> {
            cdnService.uploadFile(file, "../../outside");
        });
    }

    @Test
    public void testPathTraversalInDeleteBlocked() {
        assertThrows(SecurityException.class, () -> {
            cdnService.deleteFile("../../some_sensitive_file");
        });
    }
}
