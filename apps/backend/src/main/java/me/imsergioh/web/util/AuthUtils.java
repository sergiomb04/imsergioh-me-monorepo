package me.imsergioh.web.util;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

public class AuthUtils {

    private static final String COOKIE_NAME = "admin_session";
    private static final String HMAC_ALGORITHM = "HmacSHA256";

    public static boolean isValidAdminSessionToken(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }

        if (token.startsWith("Bearer ") || token.startsWith("bearer ")) {
            token = token.substring(7).trim();
        }

        String[] parts = token.split(":");
        if (parts.length != 3) {
            return false;
        }

        String scope = parts[0];
        String expiresAtRaw = parts[1];
        String providedSignature = parts[2];

        if (!"admin".equals(scope)) {
            return false;
        }

        long expiresAt;
        try {
            expiresAt = Long.parseLong(expiresAtRaw);
        } catch (NumberFormatException ex) {
            return false;
        }

        long now = System.currentTimeMillis() / 1000;
        if (expiresAt < now) {
            return false;
        }

        String payload = scope + ":" + expiresAtRaw;
        String expectedSignature = signPayload(payload);
        if (expectedSignature == null) {
            return false;
        }

        return MessageDigest.isEqual(
                providedSignature.getBytes(StandardCharsets.UTF_8),
                expectedSignature.getBytes(StandardCharsets.UTF_8)
        );
    }

    private static String signPayload(String payload) {
        String secret = System.getenv("ADMIN_SESSION_SECRET");
        if (secret == null || secret.isBlank()) {
            secret = System.getProperty("ADMIN_SESSION_SECRET");
        }

        // Fail-closed: require explicit secret in environment or configuration.
        if (secret == null || secret.isBlank()) {
            return null;
        }

        try {
            Mac hmac = Mac.getInstance(HMAC_ALGORITHM);
            hmac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM));
            byte[] digest = hmac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return toHex(digest);
        } catch (Exception ex) {
            return null;
        }
    }

    private static String toHex(byte[] bytes) {
        StringBuilder hex = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            hex.append(String.format("%02x", b));
        }
        return hex.toString();
    }

    public static String generateAdminSessionToken(long durationSeconds) {
        long expiresAt = (System.currentTimeMillis() / 1000) + durationSeconds;

        String payload = "admin:" + expiresAt;
        String signature = signPayload(payload);

        if (signature == null) {
            throw new IllegalStateException("Unable to generate token");
        }

        return payload + ":" + signature;
    }

}
