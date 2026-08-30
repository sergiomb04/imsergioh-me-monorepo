package me.imsergioh.webchat.server;

import com.google.gson.Gson;
import me.imsergioh.webchat.instance.ClientConnection;
import me.imsergioh.webchat.instance.Message;
import me.imsergioh.webchat.instance.request.Request;
import me.imsergioh.webchat.manager.ConnectionsManager;
import me.imsergioh.webchat.manager.MessagesManager;
import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;

import java.net.InetSocketAddress;

public class WebSocketServer extends org.java_websocket.server.WebSocketServer {

    private static final Gson gson = new Gson();

    public WebSocketServer() {
        super(new InetSocketAddress(resolvePort()));
    }

    private static int resolvePort() {
        String envPort = System.getenv("PORT");
        if (envPort != null && !envPort.isBlank()) {
            try {
                return Integer.parseInt(envPort);
            } catch (NumberFormatException ignored) {
            }
        }
        return 8080;
    }

    @Override
    public void onOpen(WebSocket webSocket, ClientHandshake handshake) {
        String realIp = handshake.getFieldValue("X-Real-IP");
        if (realIp == null || realIp.isEmpty()) {
            realIp = webSocket.getRemoteSocketAddress().getAddress().getHostAddress();
        }

        System.out.println("Cliente conectado desde: " + realIp);

        ConnectionsManager.register(webSocket, realIp);
    }

    @Override
    public void onClose(WebSocket webSocket, int i, String s, boolean b) {
        ConnectionsManager.disconnect(webSocket);
    }

    @Override
    public void onMessage(WebSocket webSocket, String message) {
        try {
            Request request = gson.fromJson(message, Request.class);
            ClientConnection connection = ConnectionsManager.getConnection(webSocket);
            switch (request.getType()) {
                case LOGOUT -> {
                    ConnectionsManager.disconnect(webSocket);
                }
                case ENTER -> {
                    String username = request.getPayloadString("name");
                    if (username == null || username.isEmpty()) return;
                    connection.setUsername(username);
                    ConnectionsManager.broadcastMembers();
                }
                case MEMBERS -> {
                    ConnectionsManager.sendActiveMembers(connection);
                }
                case MESSAGES -> {
                    connection.sendMessages();
                }
                case SEND -> {
                    Message chatMessage = request.getPayloadMessage(webSocket);
                    if (chatMessage == null) return;
                    MessagesManager.register(chatMessage);
                }
            }
        } catch (Exception e) {
            e.printStackTrace(System.out);
            ConnectionsManager.disconnect(webSocket, e);
        }
    }

    @Override
    public void onError(WebSocket webSocket, Exception e) {
        e.printStackTrace(System.out);
    }

    @Override
    public void onStart() {
        System.out.println("Web chat iniciado correctamente!");
    }
}
