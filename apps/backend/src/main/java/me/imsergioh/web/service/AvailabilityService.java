package me.imsergioh.web.service;

import java.util.concurrent.atomic.AtomicBoolean;

import me.imsergioh.livecore.handler.ChannelsHandler;
import me.imsergioh.livecore.manager.ClientsManager;
import org.springframework.stereotype.Service;

import me.imsergioh.web.controller.AvailableController;

@Service
public class AvailabilityService {

    private final AtomicBoolean available = new AtomicBoolean(false);

    public boolean toggleAvailable() {
        return setAvailable(!isAvailable());
    }

    public boolean setAvailable(boolean newState) {
        boolean previous = available.getAndSet(newState);
        if (previous != newState) {
            String channel = AvailableController.getInstance().getWebSocketChannelName();
            ClientsManager.forEachSubscribed(channel, client -> {
                client.send(channel, newState);
            });
        }
        return newState;
    }

    public boolean isAvailable() {
        return available.get();
    }

}