package me.imsergioh.web.config;

import me.imsergioh.livecore.manager.ClientsManager;
import me.imsergioh.web.interceptor.ClientIpHandshakeInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new ClientsManager(), "/realtime/**")
                .addInterceptors(new ClientIpHandshakeInterceptor())
                .setAllowedOriginPatterns("*");
    }
}