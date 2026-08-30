package me.imsergioh.webchat.instance;

import me.imsergioh.webchat.manager.ConnectionsManager;
import org.java_websocket.WebSocket;

import java.util.List;

public class Message {

    private static final List<String> adminsIP = List.of("185.74.158.89");


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
            if (adminsIP.contains(ip)) admin = true;
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
