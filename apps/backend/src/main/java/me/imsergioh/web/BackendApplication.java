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

        loadDotEnv();

        try {
            String envJwtSecret = getEnvOrProp("JWT_SECRET", null);
            if (envJwtSecret != null && !envJwtSecret.isBlank()) {
                MainConfig.getConfig().register("JWT_SECRET", envJwtSecret);
            }
            JwtUtil.init(MainConfig.getSecret(), MainConfig.getExpirationSecs(), MainConfig.getIssuer());
            String envAdminSecret = getEnvOrProp("ADMIN_SESSION_SECRET", null);
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
            MainConfig.getConfig().register("AUTH_REQUIRED", false);
            MainConfig.getConfig().save();

            String cfgHost = getEnvOrProp("DB_HOST", MainConfig.getConfig().getString("dbHost", "localhost"));
            String cfgPort = getEnvOrProp("DB_PORT", MainConfig.getConfig().getString("dbPort", "3306"));
            String cfgUser = getEnvOrProp("DB_USER", MainConfig.getConfig().getString("dbUser", "root"));
            String cfgPassword = getEnvOrProp("DB_PASSWORD", MainConfig.getConfig().getString("dbPassword", "root"));
            String cfgName = getEnvOrProp("DB_NAME", MainConfig.getConfig().getString("dbName", "analytics"));

            System.setProperty("DB_HOST", cfgHost);
            System.setProperty("DB_PORT", cfgPort);
            System.setProperty("DB_USER", cfgUser);
            System.setProperty("DB_PASSWORD", cfgPassword);
            System.setProperty("DB_NAME", cfgName);
            ClientActionsManager.init();

            ClientsManager.addConnectionAction(UserSession::get);

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

    private static void loadDotEnv() {
        java.io.File[] searchPaths = new java.io.File[]{
                new java.io.File(".env"),
                new java.io.File("../.env"),
                new java.io.File("../../.env")
        };
        for (java.io.File envFile : searchPaths) {
            if (envFile.exists() && envFile.isFile()) {
                try (java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.FileReader(envFile))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) continue;
                        int eq = line.indexOf('=');
                        if (eq > 0) {
                            String key = line.substring(0, eq).trim();
                            String value = line.substring(eq + 1).trim();
                            if (value.startsWith("\"") && value.endsWith("\"") && value.length() >= 2) {
                                value = value.substring(1, value.length() - 1);
                            }
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, value);
                            }
                        }
                    }
                    System.out.println("✅ [BackendApplication] Variables de entorno cargadas desde: " + envFile.getAbsolutePath());
                    break;
                } catch (Exception e) {
                    System.err.println("⚠️ Error leyendo " + envFile.getAbsolutePath() + ": " + e.getMessage());
                }
            }
        }
    }

    public static String getEnvOrProp(String key, String fallback) {
        String val = System.getenv(key);
        if (val == null || val.isBlank()) {
            val = System.getProperty(key);
        }
        return (val != null && !val.isBlank()) ? val : fallback;
    }

}