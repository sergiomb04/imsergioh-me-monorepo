package me.imsergioh.web.session;

import lombok.Getter;
import lombok.Setter;
import me.imsergioh.livecore.instance.connection.LiveStateClient;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class AdminSession {

    private static final Map<String, AdminSession> sessions = new ConcurrentHashMap<>();

    @Getter
    private final String id;

    @Setter @Getter
    private int sessionsPage = 1;

    protected AdminSession(String id) {
        this.id = id;
    }

    public void onConnection() {
        UserSession userSession = UserSession.get(id);
        System.out.println("New admin logged in! " + userSession.getIp());
    }

    public void onDisconnection() {

    }

    protected static AdminSession get(String id) {
        if (sessions.containsKey(id)) return sessions.get(id);
        AdminSession session = new AdminSession(id);
        sessions.put(id, session);
        session.onConnection();
        return session;
    }

    public static void disconnect(LiveStateClient client) {
        AdminSession session = sessions.get(client.getSession().getId());
        if (session == null) return;
        session.onDisconnection();

        sessions.remove(client.getSession().getId());
    }

}
