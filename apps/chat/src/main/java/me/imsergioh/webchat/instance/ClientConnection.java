package me.imsergioh.webchat.instance;

import com.google.gson.Gson;
import me.imsergioh.webchat.instance.request.Request;
import me.imsergioh.webchat.instance.request.RequestType;
import me.imsergioh.webchat.manager.MessagesManager;
import org.java_websocket.WebSocket;

import java.util.Map;
import java.util.Random;

public class ClientConnection {

    private static final Gson gson = new Gson();

    private final WebSocket connection;
    private String username;

    private final String ip;

    public ClientConnection(WebSocket connection, String realIP) {
        this.connection = connection;
        this.username = getRandomUserName();
        this.ip = realIP;
    }

    public void postLogin() {
        sendMessages();
    }

    public void logout() {
        System.out.println("Disconnected " + username + " (" + ip + ")");
    }

    public void sendMessages() {
        Request request = new Request(RequestType.MESSAGES, Map.of("messages", MessagesManager.getMessageList()));
        sendRequest(request);
    }

    public void sendRequest(Request request) {
        String jsonString = gson.toJson(request);
        connection.send(jsonString);
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public WebSocket getConnection() {
        return connection;
    }

    public String getUsername() {
        return username;
    }

    public String getIp() {
        return ip;
    }

    public static String getRandomUserName() {
        return "anonymous-" + new Random().nextInt(10_000);
    }

}
