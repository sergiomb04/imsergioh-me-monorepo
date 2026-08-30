package me.imsergioh.web;

import me.imsergioh.livecore.action.SubscribeAction;
import me.imsergioh.livecore.action.UnSubscribeAction;
import me.imsergioh.livecore.config.MainConfig;
import me.imsergioh.livecore.manager.ClientsManager;
import me.imsergioh.livecore.util.JwtUtil;
import me.imsergioh.livecore.manager.ClientActionsManager;
import me.imsergioh.web.action.admin.SetSessionsPageAction;
import me.imsergioh.web.action.admin.SubAdminAction;
import me.imsergioh.web.action.analytics.LinkClickAction;
import me.imsergioh.web.action.analytics.PageViewAction;
import me.imsergioh.web.action.admin.DeleteSessionAction;
import me.imsergioh.web.session.AdminSession;
import me.imsergioh.web.session.AnalyticsSession;
import me.imsergioh.web.session.UserSession;
import me.imsergioh.web.util.ErrorLogger;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BackendApplication {

    public static void main(String[] args) {
        // Intercept any uncaught thread exceptions globally and save to individual error files
        Thread.setDefaultUncaughtExceptionHandler((thread, throwable) -> {
            ErrorLogger.log("Uncaught Exception in thread [" + thread.getName() + "]", throwable);
        });

        try {
            String envJwtSecret = System.getenv("JWT_SECRET");
            if (envJwtSecret != null && !envJwtSecret.isBlank()) {
                MainConfig.getConfig().register("JWT_SECRET", envJwtSecret);
            }
            JwtUtil.init(MainConfig.getSecret(), MainConfig.getExpirationSecs(), MainConfig.getIssuer());
            String envAdminSecret = System.getenv("ADMIN_SESSION_SECRET");
            if (envAdminSecret != null && !envAdminSecret.isBlank()) {
                MainConfig.getConfig().register("ADMIN_SESSION_SECRET", envAdminSecret);
            } else {
                String existing = MainConfig.getConfig().getString("ADMIN_SESSION_SECRET", null);
                if (existing == null || existing.isBlank() || "9EyS21sTCg16sl1NDD2RZ9b4FQt".equals(existing) || "TOKEEEEEEEEEN".equals(existing)) {
                    String generated = java.util.UUID.randomUUID().toString().replace("-", "") + java.util.UUID.randomUUID().toString().replace("-", "");
                    MainConfig.getConfig().register("ADMIN_SESSION_SECRET", generated);
                }
            }
            MainConfig.getConfig().register("dbHost", "localhost");
            MainConfig.getConfig().register("dbPort", "3306");
            MainConfig.getConfig().register("dbUser", "root");
            MainConfig.getConfig().register("dbPassword", "root");
            MainConfig.getConfig().register("dbName", "analytics");
            MainConfig.getConfig().save();

            String cfgHost = System.getenv("DB_HOST") != null ? System.getenv("DB_HOST") : MainConfig.getConfig().getString("dbHost", "localhost");
            String cfgPort = System.getenv("DB_PORT") != null ? System.getenv("DB_PORT") : MainConfig.getConfig().getString("dbPort", "3306");
            String cfgUser = System.getenv("DB_USER") != null ? System.getenv("DB_USER") : MainConfig.getConfig().getString("dbUser", "root");
            String cfgPassword = System.getenv("DB_PASSWORD") != null ? System.getenv("DB_PASSWORD") : MainConfig.getConfig().getString("dbPassword", "root");
            String cfgName = System.getenv("DB_NAME") != null ? System.getenv("DB_NAME") : MainConfig.getConfig().getString("dbName", "analytics");

            if (System.getProperty("DB_HOST") == null && System.getenv("DB_HOST") == null) {
                System.setProperty("DB_HOST", cfgHost);
            }
            if (System.getProperty("DB_PORT") == null && System.getenv("DB_PORT") == null) {
                System.setProperty("DB_PORT", cfgPort);
            }
            if (System.getProperty("DB_USER") == null && System.getenv("DB_USER") == null) {
                System.setProperty("DB_USER", cfgUser);
            }
            if (System.getProperty("DB_PASSWORD") == null && System.getenv("DB_PASSWORD") == null) {
                System.setProperty("DB_PASSWORD", cfgPassword);
            }
            if (System.getProperty("DB_NAME") == null && System.getenv("DB_NAME") == null) {
                System.setProperty("DB_NAME", cfgName);
            }
            //ClientActionsManager.init();

            //ClientsManager.addConnectionAction(UserSession::get);

            ClientsManager.addDisconnectionAction(UserSession::disconnect);
            ClientsManager.addDisconnectionAction(AnalyticsSession::disconnect);
            ClientsManager.addDisconnectionAction(AdminSession::disconnect);

            ClientActionsManager.register(new SubscribeAction(), new UnSubscribeAction());

            ClientActionsManager.register(
                    new PageViewAction(),
                    new LinkClickAction(),
                    new SubAdminAction(),
                    new DeleteSessionAction(),
                    new SetSessionsPageAction()
            );

            SpringApplication.run(BackendApplication.class, args);
        } catch (Exception e) {
            ErrorLogger.log("Application Startup Failure", e);
            e.printStackTrace(System.out);
        }
    }

}