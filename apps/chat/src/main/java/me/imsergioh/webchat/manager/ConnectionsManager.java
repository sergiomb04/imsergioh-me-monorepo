package me.imsergioh.webchat.manager;

import me.imsergioh.webchat.instance.ClientConnection;
import me.imsergioh.webchat.instance.request.Request;
import me.imsergioh.webchat.instance.request.RequestType;
import org.java_websocket.WebSocket;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

public class ConnectionsManager {

    private static final Map<WebSocket, ClientConnection> connections = new HashMap<>();

    public static void register(WebSocket webSocket, String realIP) {
        ClientConnection connection = new ClientConnection(webSocket, realIP);
        connections.put(webSocket, connection);
        connection.postLogin();
    }

    public static void disconnect(WebSocket webSocket) {
        disconnect(webSocket, null);
        ConnectionsManager.broadcastMembers();
    }

    public static void disconnect(WebSocket webSocket, Exception e) {

        if (e != null) e.printStackTrace(System.out);

        ClientConnection connection = getConnection(webSocket);
        if (connection == null) {
            webSocket.close();
            return;
        }
        connection.logout();
        connections.remove(webSocket);
        webSocket.close();
    }

    public static ClientConnection getConnection(WebSocket webSocket) {
        return connections.get(webSocket);
    }

    public static void broadcastMembers() {
        connections.forEach((webSocket, connection) -> {
            sendActiveMembers(connection);
        });
    }

    public static void sendActiveMembers(ClientConnection connection) {
        List<String> list = new ArrayList<>();
        for (ClientConnection c : connections.values()) {
            list.add(c.getUsername());
        }
        Request request = new Request(RequestType.MEMBERS, Map.of("names", list));
        connection.sendRequest(request);
    }

    public static void forEach(Consumer<ClientConnection> consumer) {
        connections.values().forEach(consumer);
    }

}
