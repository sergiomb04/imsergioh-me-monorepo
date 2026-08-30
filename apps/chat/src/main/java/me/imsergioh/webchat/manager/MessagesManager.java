package me.imsergioh.webchat.manager;

import me.imsergioh.webchat.instance.Message;
import me.imsergioh.webchat.instance.request.Request;
import me.imsergioh.webchat.instance.request.RequestType;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class MessagesManager {

    private static final int MAX_MESSAGES = 100;

    private static final List<Message> messageList = new ArrayList<>();

    public static void register(Message message) {
        if (messageList.size() >= MAX_MESSAGES) {
            messageList.clear();
        }
        messageList.add(message);
        broadcast(message);
    }

    private static void broadcast(Message message) {
        ConnectionsManager.forEach(connection -> {
            Request request = new Request(RequestType.MESSAGES, Map.of("messages", List.of(message)));
            connection.sendRequest(request);
        });
    }

    public static List<Message> getMessageList() {
        return messageList;
    }
}
