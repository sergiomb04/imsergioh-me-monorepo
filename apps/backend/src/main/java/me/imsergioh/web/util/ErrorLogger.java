package me.imsergioh.web.util;

import java.io.File;
import java.io.FileWriter;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Utility class to capture and save exceptions into individual error files
 * inside the 'errors/' directory (located next to the running application / jar).
 */
public class ErrorLogger {

    private static final File ERRORS_DIR = new File("errors");
    private static final AtomicLong ERROR_COUNTER = new AtomicLong(0);
    private static final SimpleDateFormat FILE_DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd_HH-mm-ss-SSS");
    private static final SimpleDateFormat REPORT_DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS");

    static {
        ensureDirectoryExists();
    }

    private static synchronized void ensureDirectoryExists() {
        if (!ERRORS_DIR.exists()) {
            ERRORS_DIR.mkdirs();
        }
    }

    /**
     * Logs a throwable with default context.
     *
     * @param throwable the exception or error
     * @return the created error file, or null if an error occurred while saving
     */
    public static File log(Throwable throwable) {
        return log("General Exception", throwable, null);
    }

    /**
     * Logs a throwable with a descriptive context.
     *
     * @param context   description of where the error occurred
     * @param throwable the exception or error
     * @return the created error file, or null if an error occurred while saving
     */
    public static File log(String context, Throwable throwable) {
        return log(context, throwable, null);
    }

    /**
     * Logs a throwable with descriptive context and optional metadata.
     *
     * @param context   description of where the error occurred
     * @param throwable the exception or error
     * @param extraInfo additional key-value pairs with contextual data
     * @return the created error file, or null if an error occurred while saving
     */
    public static File log(String context, Throwable throwable, Map<String, Object> extraInfo) {
        if (throwable == null) {
            return null;
        }

        try {
            ensureDirectoryExists();

            Date now = new Date();
            long counter = ERROR_COUNTER.incrementAndGet();
            String timestampStr;
            String reportTimestampStr;

            synchronized (FILE_DATE_FORMAT) {
                timestampStr = FILE_DATE_FORMAT.format(now);
                reportTimestampStr = REPORT_DATE_FORMAT.format(now);
            }

            String fileName = String.format("error_%s_%04d.log", timestampStr, counter % 10000);
            File errorFile = new File(ERRORS_DIR, fileName);

            Thread currentThread = Thread.currentThread();

            // Format stack trace
            StringWriter sw = new StringWriter();
            PrintWriter pw = new PrintWriter(sw);
            throwable.printStackTrace(pw);
            String stackTrace = sw.toString();

            // Gather system metrics
            Runtime runtime = Runtime.getRuntime();
            long totalMemoryMb = runtime.totalMemory() / (1024 * 1024);
            long freeMemoryMb = runtime.freeMemory() / (1024 * 1024);
            long maxMemoryMb = runtime.maxMemory() / (1024 * 1024);

            StringBuilder sb = new StringBuilder();
            sb.append("================================================================================\n");
            sb.append("                                ERROR REPORT\n");
            sb.append("================================================================================\n");
            sb.append(String.format("Timestamp:     %s\n", reportTimestampStr));
            sb.append(String.format("Context:       %s\n", context != null ? context : "N/A"));
            sb.append(String.format("Thread:        %s (ID: %d, Priority: %d, Daemon: %b)\n",
                    currentThread.getName(), currentThread.getId(), currentThread.getPriority(), currentThread.isDaemon()));
            sb.append(String.format("Exception:     %s\n", throwable.getClass().getName()));
            sb.append(String.format("Message:       %s\n", throwable.getMessage() != null ? throwable.getMessage() : "(null)"));

            if (extraInfo != null && !extraInfo.isEmpty()) {
                sb.append("\n--------------------------------------------------------------------------------\n");
                sb.append("EXTRA CONTEXT DATA:\n");
                sb.append("--------------------------------------------------------------------------------\n");
                for (Map.Entry<String, Object> entry : extraInfo.entrySet()) {
                    sb.append(String.format("%-15s: %s\n", entry.getKey(), entry.getValue()));
                }
            }

            sb.append("\n--------------------------------------------------------------------------------\n");
            sb.append("STACK TRACE:\n");
            sb.append("--------------------------------------------------------------------------------\n");
            sb.append(stackTrace);

            sb.append("\n--------------------------------------------------------------------------------\n");
            sb.append("SYSTEM INFORMATION:\n");
            sb.append("--------------------------------------------------------------------------------\n");
            sb.append(String.format("Java Version:  %s (%s)\n", System.getProperty("java.version"), System.getProperty("java.vendor")));
            sb.append(String.format("OS:            %s %s (%s)\n", System.getProperty("os.name"), System.getProperty("os.version"), System.getProperty("os.arch")));
            sb.append(String.format("Working Dir:   %s\n", System.getProperty("user.dir")));
            sb.append(String.format("Memory (MB):   Free: %d MB | Total: %d MB | Max: %d MB\n", freeMemoryMb, totalMemoryMb, maxMemoryMb));
            sb.append(String.format("Processors:    %d\n", runtime.availableProcessors()));
            sb.append("================================================================================\n");

            try (FileWriter writer = new FileWriter(errorFile)) {
                writer.write(sb.toString());
            }

            System.err.printf("❌ [ERROR-LOG] Exception caught [%s: %s] -> Saved to: %s%n",
                    throwable.getClass().getSimpleName(),
                    throwable.getMessage(),
                    errorFile.getAbsolutePath());

            return errorFile;
        } catch (Exception e) {
            System.err.println("⚠️ [ErrorLogger] Failed to write error log file: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    public static File getErrorsDirectory() {
        return ERRORS_DIR;
    }
}
