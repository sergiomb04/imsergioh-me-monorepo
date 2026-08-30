package me.imsergioh.webchat.instance.request;

import com.google.gson.Gson;
import me.imsergioh.webchat.instance.Message;
import org.java_websocket.WebSocket;

import java.util.Map;

public class Request {

    private static final Gson gson = new Gson();

    private final RequestType type;
    private final Map<String, Object> payload;

    public Request(RequestType type, Map<String, Object> payload) {
        this.type = type;
        this.payload = payload;
    }

    public String getPayloadString(String key) {
        Object value = payload.get(key);
        if (value == null) return null;
        if (value instanceof String) return (String) value;
        return payload.get(key).toString();
    }

    public Message getPayloadMessage(WebSocket webSocket) {
        Object value = payload.get("message");
        if (value == null) return null;
        try {
            Message message = gson.fromJson(value.toString(), Message.class);
            message.registerDate();
            message.checkAdmin(webSocket);
            return message;
        } catch (Exception e) {
            e.printStackTrace(System.out);
            return null;
        }
    }

    public Map<String, Object> getPayload() {
        return payload;
    }

    public RequestType getType() {
        return type;
    }
}
