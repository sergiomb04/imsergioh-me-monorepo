package me.imsergioh.webchat.instance;

import me.imsergioh.webchat.manager.ConnectionsManager;
import org.java_websocket.WebSocket;

import java.util.List;

public class Message {

    private static final List<String> DEFAULT_ADMIN_IPS = List.of("127.0.0.1");

    private static List<String> getAdminIps() {
        String env = System.getenv("ADMIN_IPS");
        if (env != null && !env.isBlank()) {
            return java.util.Arrays.stream(env.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        }
        return DEFAULT_ADMIN_IPS;
    }

    private final String owner, message;
    private long date;

    private boolean admin;

    public Message(String owner, String message) {
        this.owner = owner;
        this.message = message;
        admin = false;
    }

    public void registerDate() {
        date = System.currentTimeMillis();
    }

    public void checkAdmin(WebSocket conn) {
        admin = false;
        try {
            String ip = ConnectionsManager.getConnection(conn).getIp();
            if (ip != null && getAdminIps().contains(ip)) admin = true;
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public boolean isAdmin() {
        return admin;
    }

    public String getOwner() {
        return owner;
    }

    public String getMessage() {
        return message;
    }

    public long getDate() {
        return date;
    }
}
