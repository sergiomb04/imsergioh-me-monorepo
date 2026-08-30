package me.imsergioh.web;

import me.imsergioh.livecore.action.SubscribeAction;
import me.imsergioh.livecore.action.UnSubscribeAction;
import me.imsergioh.livecore.manager.ClientsManager;
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
        loadConfigJson();

        try {
            String adminSecret = getEnvOrProp("ADMIN_SESSION_SECRET", null);
            if (adminSecret == null || adminSecret.isBlank() || "9EyS21sTCg16sl1NDD2RZ9b4FQt".equals(adminSecret) || "TOKEEEEEEEEEN".equals(adminSecret)) {
                String generated = java.util.UUID.randomUUID().toString().replace("-", "") + java.util.UUID.randomUUID().toString().replace("-", "");
                System.setProperty("ADMIN_SESSION_SECRET", generated);
            }

            String cfgHost = getEnvOrProp("DB_HOST", "localhost");
            String cfgPort = getEnvOrProp("DB_PORT", "3306");
            String cfgUser = getEnvOrProp("DB_USER", "root");
            String cfgPassword = getEnvOrProp("DB_PASSWORD", "root");
            String cfgName = getEnvOrProp("DB_NAME", "analytics");

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

    private static void loadConfigJson() {
        java.io.File[] searchPaths = new java.io.File[]{
                new java.io.File("config.json"),
                new java.io.File("../config.json"),
                new java.io.File("../../config.json")
        };
        for (java.io.File configFile : searchPaths) {
            if (configFile.exists() && configFile.isFile()) {
                try (java.io.FileReader reader = new java.io.FileReader(configFile)) {
                    com.google.gson.JsonObject obj = com.google.gson.JsonParser.parseReader(reader).getAsJsonObject();
                    if (obj.has("ADMIN_SESSION_SECRET") && !obj.get("ADMIN_SESSION_SECRET").isJsonNull()) {
                        setPropIfAbsent("ADMIN_SESSION_SECRET", obj.get("ADMIN_SESSION_SECRET").getAsString());
                    }
                    if (obj.has("dbHost") && !obj.get("dbHost").isJsonNull()) {
                        setPropIfAbsent("DB_HOST", obj.get("dbHost").getAsString());
                    }
                    if (obj.has("dbPort") && !obj.get("dbPort").isJsonNull()) {
                        setPropIfAbsent("DB_PORT", obj.get("dbPort").getAsString());
                    }
                    if (obj.has("dbUser") && !obj.get("dbUser").isJsonNull()) {
                        setPropIfAbsent("DB_USER", obj.get("dbUser").getAsString());
                    }
                    if (obj.has("dbPassword") && !obj.get("dbPassword").isJsonNull()) {
                        setPropIfAbsent("DB_PASSWORD", obj.get("dbPassword").getAsString());
                    }
                    if (obj.has("dbName") && !obj.get("dbName").isJsonNull()) {
                        setPropIfAbsent("DB_NAME", obj.get("dbName").getAsString());
                    }
                    System.out.println("✅ [BackendApplication] Fallback config.json cargado desde: " + configFile.getAbsolutePath());
                    break;
                } catch (Exception e) {
                    System.err.println("⚠️ Error leyendo config.json: " + e.getMessage());
                }
            }
        }
    }

    private static void setPropIfAbsent(String key, String value) {
        if (value != null && !value.isBlank() && System.getProperty(key) == null && System.getenv(key) == null) {
            System.setProperty(key, value);
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