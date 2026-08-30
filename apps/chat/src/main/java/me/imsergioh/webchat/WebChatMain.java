package me.imsergioh.webchat;

import me.imsergioh.webchat.server.WebSocketServer;

public class WebChatMain {

    public static void main(String[] args) {
        startServer();
    }

    private static void startServer() {
        System.out.println("Iniciando web chat...");
        WebSocketServer server = new WebSocketServer();
        server.start();

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("Cerrando WebSocketServer...");
            try {
                server.stop(1000);
            } catch (Exception e) {
                e.printStackTrace(System.out);
            }
        }));
    }

}
