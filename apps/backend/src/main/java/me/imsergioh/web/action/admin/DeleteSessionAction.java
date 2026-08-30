package me.imsergioh.web.action.admin;

import me.imsergioh.livecore.instance.connection.LiveStateClient;
import me.imsergioh.web.action.IAdminAction;
import me.imsergioh.web.analytics.AnalyticsState;
import me.imsergioh.web.service.AnalyticsRealtimeService;
import me.imsergioh.web.util.ActionsUtils;
import org.springframework.stereotype.Component;

import java.util.Map;

public class DeleteSessionAction extends IAdminAction {

    @Override
    public String getName() {
        return "DELETE_SESSION";
    }

    @Override
    public void onAction(LiveStateClient liveStateClient, Map<String, Object> payload) {
        boolean isAuthorized = isAuth(liveStateClient, payload);
        if (!isAuthorized) return;

        String sessionId = ActionsUtils.getString(payload, "sessionId");
        if (sessionId == null) return;

        AnalyticsState.get().deleteSession(sessionId);
        liveStateClient.send("deleted_action", Map.of("sessionId", sessionId));

        // Send full snapshot (update)
        AnalyticsRealtimeService.pushFullSnapshotToClient(liveStateClient);
    }
}
