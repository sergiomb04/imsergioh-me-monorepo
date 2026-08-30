package me.imsergioh.web.action;

import me.imsergioh.livecore.instance.connection.IConnectionAction;
import me.imsergioh.livecore.instance.connection.LiveStateClient;
import me.imsergioh.web.session.UserSession;
import me.imsergioh.web.util.ActionsUtils;

import java.util.Map;

public abstract class IAdminAction implements IConnectionAction {

    public boolean isAuth(LiveStateClient client, Map<String, Object> payload) {
        UserSession userSession = UserSession.get(client);
        if (userSession.isAdmin()) return true;
        String token = ActionsUtils.getString(payload, "token");

        return userSession.tryAdmin(token);
    }

}
