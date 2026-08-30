package me.imsergioh.web.exception;

import jakarta.servlet.http.HttpServletRequest;
import me.imsergioh.web.util.ErrorLogger;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.io.File;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Global exception handler for Spring Web endpoints.
 * Captures unhandled exceptions or errors in controllers, logs them to an individual file in 'errors/',
 * and returns a standard JSON error response.
 * Excludes expected client errors such as 404 NoResourceFoundException from error logging.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNoResourceFoundException(NoResourceFoundException ex, HttpServletRequest request) {
        Map<String, Object> responseBody = new LinkedHashMap<>();
        responseBody.put("timestamp", System.currentTimeMillis());
        responseBody.put("status", HttpStatus.NOT_FOUND.value());
        responseBody.put("error", "Not Found");
        responseBody.put("message", ex.getMessage());
        responseBody.put("path", request.getRequestURI());

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(responseBody);
    }

    @ExceptionHandler(Throwable.class)
    public ResponseEntity<Map<String, Object>> handleUnhandledException(Throwable ex, HttpServletRequest request) {
        Map<String, Object> extraInfo = new LinkedHashMap<>();
        extraInfo.put("HTTP Method", request.getMethod());
        extraInfo.put("Request URI", request.getRequestURI());
        if (request.getQueryString() != null) {
            extraInfo.put("Query String", request.getQueryString());
        }
        extraInfo.put("Remote Addr", request.getRemoteAddr());
        extraInfo.put("User-Agent", request.getHeader("User-Agent"));

        String context = "HTTP " + request.getMethod() + " " + request.getRequestURI();
        File errorFile = ErrorLogger.log(context, ex, extraInfo);

        Map<String, Object> responseBody = new LinkedHashMap<>();
        responseBody.put("timestamp", System.currentTimeMillis());
        responseBody.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        responseBody.put("error", ex.getClass().getSimpleName());
        responseBody.put("message", ex.getMessage() != null ? ex.getMessage() : "An unexpected error occurred");
        responseBody.put("path", request.getRequestURI());

        if (errorFile != null) {
            responseBody.put("errorFile", errorFile.getName());
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseBody);
    }
}
