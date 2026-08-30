package me.imsergioh.web.action.auth;

import me.imsergioh.livecore.instance.connection.IConnectionAction;
import me.imsergioh.livecore.instance.connection.LiveStateClient;
import me.imsergioh.web.session.UserSession;
import me.imsergioh.web.util.ActionsUtils;

import java.util.Map;

public class AuthAction implements IConnectionAction {

    @Override
    public String getName() {
        return "auth";
    }

    @Override
    public void onAction(LiveStateClient liveStateClient, Map<String, Object> payload) {
        String token = ActionsUtils.getString(payload, "token");
        if (token != null && !token.isBlank()) {
            UserSession userSession = UserSession.get(liveStateClient);
            userSession.tryAdmin(token);
        }
    }
}
