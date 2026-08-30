
package me.imsergioh.web.action.analytics;

import me.imsergioh.livecore.instance.connection.IConnectionAction;
import me.imsergioh.livecore.instance.connection.LiveStateClient;
import me.imsergioh.web.session.AnalyticsSession;
import me.imsergioh.web.util.ActionsUtils;

import java.util.Map;

public class LinkClickAction implements IConnectionAction {

    @Override
    public String getName() {
        return "LINK_CLICK";
    }

    @Override
    public void onAction(LiveStateClient liveStateClient, Map<String, Object> payload) {
        AnalyticsSession session = AnalyticsSession.get(liveStateClient);
        session.registerEvent(ActionsUtils.getStringMap(payload));
    }

}
