package me.imsergioh.web.util;

import org.springframework.web.socket.WebSocketSession;
import java.net.InetSocketAddress;
import java.util.List;
import java.util.Map;

public class WebSocketUtils {

    public static String getClientIp(WebSocketSession session) {

        Object xff = session.getAttributes().get("X-Forwarded-For");

        if (xff instanceof String xffValue && !xffValue.isBlank()) {
            return xffValue.split(",")[0].trim();
        }

        Object realIp = session.getAttributes().get("X-Real-IP");

        if (realIp instanceof String realIpValue && !realIpValue.isBlank()) {
            return realIpValue;
        }

        InetSocketAddress remoteAddress = session.getRemoteAddress();

        if (remoteAddress != null && remoteAddress.getAddress() != null) {
            return remoteAddress.getAddress().getHostAddress();
        }

        return "IP_DESCONOCIDA";
    }
}