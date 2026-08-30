package me.imsergioh.web.action.admin;

import me.imsergioh.livecore.instance.connection.LiveStateClient;
import me.imsergioh.web.action.IAdminAction;
import me.imsergioh.web.service.AnalyticsRealtimeService;
import me.imsergioh.web.session.AdminSession;
import me.imsergioh.web.session.UserSession;

import java.util.Map;

public class SetSessionsPageAction extends IAdminAction {

    @Override
    public String getName() {
        return "SET_SESSIONS_PAGE";
    }

    @Override
    public void onAction(LiveStateClient client, Map<String, Object> payload) {
        boolean isAuthorized = isAuth(client, payload);
        if (!isAuthorized) return;

        AdminSession adminSession = UserSession.get(client.getSession().getId()).getAdminSession();
        if (adminSession == null) return;

        Object indexObj = payload.get("index");
        if (indexObj instanceof Number number) {
            adminSession.setSessionsPage(number.intValue());
            AnalyticsRealtimeService.pushFullSnapshotToClient(client);
        }
    }
}
