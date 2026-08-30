package me.imsergioh.web.action.admin;

import me.imsergioh.livecore.instance.connection.LiveStateClient;
import me.imsergioh.web.action.IAdminAction;
import me.imsergioh.web.service.AnalyticsRealtimeService;

import java.util.Map;

public class SubAdminAction extends IAdminAction {

    @Override
    public String getName() {
        return "SUB_ADMIN";
    }

    @Override
    public void onAction(LiveStateClient liveStateClient, Map<String, Object> payload) {
        boolean isAuthorized = isAuth(liveStateClient, payload);

        if (!isAuthorized) {
            // Send feedback denied
            liveStateClient.send("admin_denied", Map.of(
                    "admin", false,
                    "reason", "invalid_or_expired_token",
                    "serverTs", System.currentTimeMillis() / 1000
            ));
            return;
        }

        // Register admin connected and subscribed (count, etc.)
        AnalyticsRealtimeService.onAdminAuthorized(liveStateClient);

        // Send feedback ready
        liveStateClient.send("admin_ready", Map.of(
                "admin", true,
                "connectedAdmins", AnalyticsRealtimeService.getConnectedAdmins(),
                "serverTs", System.currentTimeMillis() / 1000
        ));

        // Send full snapshot (once)
        AnalyticsRealtimeService.pushFullSnapshotToClient(liveStateClient);
    }
}
