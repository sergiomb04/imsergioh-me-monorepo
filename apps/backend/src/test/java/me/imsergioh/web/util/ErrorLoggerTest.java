package me.imsergioh.web.util;

import org.junit.jupiter.api.Test;

import java.io.File;
import java.nio.file.Files;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class ErrorLoggerTest {

    @Test
    void testErrorLoggerCreatesFileWithDetails() throws Exception {
        String testMessage = "Test exception for ErrorLogger validation " + System.currentTimeMillis();
        RuntimeException testException = new RuntimeException(testMessage);

        File errorFile = ErrorLogger.log("UnitTestContext", testException, Map.of("CustomKey", "CustomValue123"));

        assertNotNull(errorFile, "Error file should have been created");
        assertTrue(errorFile.exists(), "Error file should exist on disk");
        assertTrue(errorFile.getParentFile().getName().equals("errors"), "Parent folder should be 'errors'");

        String content = Files.readString(errorFile.toPath());
        assertTrue(content.contains("ERROR REPORT"), "Report must contain header");
        assertTrue(content.contains("UnitTestContext"), "Report must contain context");
        assertTrue(content.contains("RuntimeException"), "Report must contain exception type");
        assertTrue(content.contains(testMessage), "Report must contain exception message");
        assertTrue(content.contains("CustomKey"), "Report must contain extra info key");
        assertTrue(content.contains("CustomValue123"), "Report must contain extra info value");
        assertTrue(content.contains("STACK TRACE:"), "Report must contain stack trace section");
        assertTrue(content.contains("SYSTEM INFORMATION:"), "Report must contain system information");

        // Clean up test file
        errorFile.delete();
    }
}
