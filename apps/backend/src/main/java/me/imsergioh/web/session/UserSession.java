package me.imsergioh.web.session;

import lombok.Getter;
import me.imsergioh.livecore.instance.connection.LiveStateClient;
import me.imsergioh.livecore.manager.ClientsManager;
import me.imsergioh.web.util.AuthUtils;
import me.imsergioh.web.util.WebSocketUtils;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class UserSession {

    private static final Map<String, UserSession> sessions = new ConcurrentHashMap<>();

    @Getter
    protected final String id;
    @Getter
    protected String ip;

    @Getter
    protected AdminSession adminSession;

    protected UserSession(String id) {
        this.id = id;
    }

    public void onDisconnection() {

    }

    public boolean tryAdmin(String token) {
        if (token == null) return false;
        if (adminSession != null) return true;

        if (AuthUtils.isValidAdminSessionToken(token)) {
            adminSession = AdminSession.get(id);
        }
        return adminSession != null;
    }

    public boolean isAdmin() {
        return adminSession != null;
    }

    public void onConnection() {
        LiveStateClient client = ClientsManager.get(id);
        if (client != null)
            ip = WebSocketUtils.getClientIp(client.getSession());
    }

    public static UserSession get(LiveStateClient client) {
        return get(client.getSession().getId());
    }

    public static UserSession get(String id) {
        if (sessions.containsKey(id)) return sessions.get(id);
        UserSession session = new UserSession(id);
        sessions.put(id, session);
        session.onConnection();
        return session;
    }

    public static void disconnect(LiveStateClient client) {
        UserSession session = sessions.get(client.getSession().getId());
        if (session == null) return;
        session.onDisconnection();

        sessions.remove(client.getSession().getId());
    }
}
