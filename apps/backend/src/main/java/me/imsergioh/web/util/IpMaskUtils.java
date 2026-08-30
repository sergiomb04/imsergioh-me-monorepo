package me.imsergioh.web.util;

import jakarta.servlet.http.HttpServletRequest;

public class IpMaskUtils {

    public static String getClientIp(HttpServletRequest request) {
        if (request == null) {
            return "127.0.0.1";
        }

        String cfIp = request.getHeader("CF-Connecting-IP");
        if (isValidIp(cfIp)) {
            return cfIp.trim();
        }

        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (isValidIp(xForwardedFor)) {
            String[] parts = xForwardedFor.split(",");
            if (parts.length > 0 && isValidIp(parts[0])) {
                return parts[0].trim();
            }
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (isValidIp(xRealIp)) {
            return xRealIp.trim();
        }

        String remoteAddr = request.getRemoteAddr();
        if (isValidIp(remoteAddr)) {
            return remoteAddr.trim();
        }

        return "127.0.0.1";
    }

    private static boolean isValidIp(String ip) {
        return ip != null && !ip.isBlank() && !"unknown".equalsIgnoreCase(ip.trim());
    }

    public static String maskIp(String ip) {
        if (ip == null || ip.isBlank()) {
            return "XX.XX.XX.XX";
        }

        String trimmed = ip.trim();

        // Handle IPv4
        if (trimmed.contains(".")) {
            String[] parts = trimmed.split("\\.");
            if (parts.length >= 2) {
                return parts[0] + "." + parts[1] + ".XX.XX";
            }
            return trimmed + ".XX.XX";
        }

        // Handle IPv6
        if (trimmed.contains(":")) {
            String[] parts = trimmed.split(":");
            if (parts.length >= 2) {
                return parts[0] + ":" + parts[1] + ":XXXX:XXXX";
            }
            return trimmed + ":XXXX:XXXX";
        }

        return trimmed;
    }
}
