package me.imsergioh.web.analytics.persistence;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import jakarta.annotation.PostConstruct;
import me.imsergioh.web.analytics.model.AnalyticsEvent;
import me.imsergioh.web.analytics.model.CountryStats;
import me.imsergioh.web.analytics.model.SessionEvent;
import me.imsergioh.web.analytics.model.SessionState;
import me.imsergioh.web.util.ErrorLogger;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.lang.reflect.Type;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

@Repository
public class AnalyticsRepository {

    private final JdbcTemplate jdbcTemplate;
    private final Gson gson = new Gson();
    private final Type metadataType = new TypeToken<Map<String, String>>() {}.getType();

    public AnalyticsRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void initTables() {
        try {
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS `analytics_sessions` (
                    `session_id` VARCHAR(64) NOT NULL,
                    `ip` VARCHAR(64) DEFAULT NULL,
                    `country` VARCHAR(128) DEFAULT NULL,
                    `country_code` VARCHAR(10) DEFAULT NULL,
                    `started_at` BIGINT NOT NULL,
                    `ended_at` BIGINT DEFAULT NULL,
                    `is_active` TINYINT(1) NOT NULL DEFAULT 0,
                    `total_events` BIGINT NOT NULL DEFAULT 0,
                    `page_views` BIGINT NOT NULL DEFAULT 0,
                    `link_clicks` BIGINT NOT NULL DEFAULT 0,
                    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    PRIMARY KEY (`session_id`),
                    INDEX `idx_sessions_started_at` (`started_at`),
                    INDEX `idx_sessions_ended_at` (`ended_at`),
                    INDEX `idx_sessions_country_code` (`country_code`),
                    INDEX `idx_sessions_is_active` (`is_active`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """);

            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS `analytics_events` (
                    `id` BIGINT AUTO_INCREMENT NOT NULL,
                    `session_id` VARCHAR(64) NOT NULL,
                    `event_type` VARCHAR(64) NOT NULL,
                    `path` VARCHAR(512) DEFAULT NULL,
                    `country` VARCHAR(128) DEFAULT NULL,
                    `country_code` VARCHAR(10) DEFAULT NULL,
                    `ip` VARCHAR(64) DEFAULT NULL,
                    `timestamp` BIGINT NOT NULL,
                    `metadata` LONGTEXT DEFAULT NULL,
                    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (`id`),
                    INDEX `idx_events_session_id` (`session_id`),
                    INDEX `idx_events_type` (`event_type`),
                    INDEX `idx_events_timestamp` (`timestamp`),
                    INDEX `idx_events_path` (`path`(191)),
                    INDEX `idx_events_type_timestamp` (`event_type`, `timestamp`),
                    INDEX `idx_events_country_code` (`country_code`),
                    CONSTRAINT `fk_analytics_events_session`
                        FOREIGN KEY (`session_id`) REFERENCES `analytics_sessions` (`session_id`)
                        ON DELETE CASCADE
                        ON UPDATE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """);

            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS `analytics_countries` (
                    `country_code` VARCHAR(10) NOT NULL,
                    `country_name` VARCHAR(128) NOT NULL,
                    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    PRIMARY KEY (`country_code`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """);
            System.out.println("✅ Tablas de MariaDB verificadas e inicializadas.");
            int cleaned = cleanupShortRootSessions();
            if (cleaned > 0) {
                System.out.println("🧹 [AnalyticsRepository] Limpieza inicial: " + cleaned + " sesiones cortas irrelevantes eliminadas de la base de datos.");
            }
        } catch (Exception e) {
            ErrorLogger.log("AnalyticsRepository table initialization", e);
            System.err.println("⚠️ Error al inicializar tablas en MariaDB: " + e.getMessage());
        }
    }

    public int cleanupShortRootSessions() {
        String selectSql = """
            SELECT session_id
            FROM (
                SELECT s.session_id,
                       COUNT(e.id) AS total_events,
                       SUM(CASE WHEN UPPER(e.event_type) = 'SESSION_START' THEN 1 ELSE 0 END) AS start_count,
                       SUM(CASE WHEN UPPER(e.event_type) = 'SESSION_END' THEN 1 ELSE 0 END) AS end_count,
                       SUM(CASE WHEN UPPER(e.event_type) = 'PAGE_VIEW' AND (e.path = '/' OR e.path IS NULL OR e.path = '') THEN 1 ELSE 0 END) AS page_view_root_count
                FROM `analytics_sessions` s
                JOIN `analytics_events` e ON s.session_id = e.session_id
                WHERE s.ended_at IS NOT NULL
                  AND (s.ended_at - s.started_at) < 6
                GROUP BY s.session_id
                HAVING total_events = 3
                   AND start_count = 1
                   AND end_count = 1
                   AND page_view_root_count = 1
            ) AS short_sessions;
        """;

        try {
            List<String> sessionIds = jdbcTemplate.queryForList(selectSql, String.class);
            if (sessionIds.isEmpty()) {
                return 0;
            }

            int deletedCount = 0;
            for (int i = 0; i < sessionIds.size(); i += 500) {
                List<String> chunk = sessionIds.subList(i, Math.min(i + 500, sessionIds.size()));
                String inSql = String.join(",", Collections.nCopies(chunk.size(), "?"));

                try {
                    jdbcTemplate.update("DELETE FROM `analytics_events` WHERE `session_id` IN (" + inSql + ");", chunk.toArray());
                } catch (Exception ignored) {
                }

                int rows = jdbcTemplate.update("DELETE FROM `analytics_sessions` WHERE `session_id` IN (" + inSql + ");", chunk.toArray());
                deletedCount += rows;
            }
            return deletedCount;
        } catch (Exception e) {
            ErrorLogger.log("AnalyticsRepository.cleanupShortRootSessions", e);
            System.err.println("⚠️ Error durante la limpieza de sesiones cortas: " + e.getMessage());
            return 0;
        }
    }

    public void upsertSession(String sessionId, String ip, String country, String countryCode, long startedAt) {
        String sql = """
            INSERT INTO `analytics_sessions` (`session_id`, `ip`, `country`, `country_code`, `started_at`, `is_active`)
            VALUES (?, ?, ?, ?, ?, 1)
            ON DUPLICATE KEY UPDATE
                `ip` = COALESCE(VALUES(`ip`), `ip`),
                `country` = COALESCE(VALUES(`country`), `country`),
                `country_code` = COALESCE(VALUES(`country_code`), `country_code`),
                `is_active` = 1;
        """;
        jdbcTemplate.update(sql, sessionId, ip, country, countryCode, startedAt);

        if (countryCode != null && !countryCode.isBlank() && country != null && !country.isBlank()) {
            upsertCountry(countryCode, country);
        }
    }

    public void endSession(String sessionId, long endedAt) {
        String sql = """
            UPDATE `analytics_sessions`
            SET `ended_at` = ?, `is_active` = 0
            WHERE `session_id` = ?;
        """;
        jdbcTemplate.update(sql, endedAt, sessionId);
    }

    public void deleteSession(String sessionId) {
        String sql = "DELETE FROM `analytics_sessions` WHERE `session_id` = ?;";
        jdbcTemplate.update(sql, sessionId);
    }

    public void upsertCountry(String countryCode, String countryName) {
        String sql = """
            INSERT INTO `analytics_countries` (`country_code`, `country_name`)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE `country_name` = VALUES(`country_name`);
        """;
        try {
            jdbcTemplate.update(sql, countryCode, countryName);
        } catch (DataAccessException ignored) {
        }
    }

    public void insertEvent(AnalyticsEvent event) {
        String metadataJson = null;
        if (event.getMetadata() != null && !event.getMetadata().isEmpty()) {
            metadataJson = gson.toJson(event.getMetadata());
        }

        // Asegurar que la sesión existe en la base de datos
        String ensureSessionSql = """
            INSERT INTO `analytics_sessions` (`session_id`, `ip`, `country`, `country_code`, `started_at`, `is_active`)
            VALUES (?, ?, ?, ?, ?, 1)
            ON DUPLICATE KEY UPDATE
                `ip` = COALESCE(VALUES(`ip`), `ip`),
                `country` = COALESCE(VALUES(`country`), `country`),
                `country_code` = COALESCE(VALUES(`country_code`), `country_code`);
        """;
        jdbcTemplate.update(ensureSessionSql, event.getSessionId(), event.getIp(), event.getCountry(), event.getCountryCode(), event.getTimestamp());

        String insertEventSql = """
            INSERT INTO `analytics_events` (`session_id`, `event_type`, `path`, `country`, `country_code`, `ip`, `timestamp`, `metadata`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        """;
        jdbcTemplate.update(insertEventSql,
                event.getSessionId(),
                event.getEventType(),
                event.getPath(),
                event.getCountry(),
                event.getCountryCode(),
                event.getIp(),
                event.getTimestamp(),
                metadataJson
        );

        // Actualizar contadores acumulados de la sesión
        boolean isPageView = "PAGE_VIEW".equalsIgnoreCase(event.getEventType());
        boolean isLinkClick = "LINK_CLICK".equalsIgnoreCase(event.getEventType());

        String updateSessionCounts = """
            UPDATE `analytics_sessions`
            SET `total_events` = `total_events` + 1,
                `page_views` = `page_views` + ?,
                `link_clicks` = `link_clicks` + ?
            WHERE `session_id` = ?;
        """;
        jdbcTemplate.update(updateSessionCounts, isPageView ? 1 : 0, isLinkClick ? 1 : 0, event.getSessionId());
    }

    public void insertEventsBatch(List<AnalyticsEvent> events) {
        if (events == null || events.isEmpty()) return;

        for (AnalyticsEvent event : events) {
            try {
                insertEvent(event);
            } catch (Exception e) {
                ErrorLogger.log("AnalyticsRepository.insertEventsBatch (event: " + event.getEventType() + ", session: " + event.getSessionId() + ")", e);
                System.err.println("Error insertando evento: " + e.getMessage());
            }
        }
    }

    public Map<String, Object> querySummary(long activeSessionsCount) {
        Map<String, Object> summary = new LinkedHashMap<>();
        try {
            Long totalSessions = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM `analytics_sessions`;", Long.class);
            Long totalEvents = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM `analytics_events`;", Long.class);
            Long pageViews = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM `analytics_events` WHERE UPPER(event_type) = 'PAGE_VIEW';", Long.class);
            Long linkClicks = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM `analytics_events` WHERE UPPER(event_type) = 'LINK_CLICK';", Long.class);

            summary.put("totalSessions", totalSessions != null ? totalSessions : 0L);
            summary.put("totalEvents", totalEvents != null ? totalEvents : 0L);
            summary.put("pageViews", pageViews != null ? pageViews : 0L);
            summary.put("linkClicks", linkClicks != null ? linkClicks : 0L);
            summary.put("activeSessions", activeSessionsCount);
        } catch (Exception e) {
            summary.put("totalSessions", 0L);
            summary.put("totalEvents", 0L);
            summary.put("pageViews", 0L);
            summary.put("linkClicks", 0L);
            summary.put("activeSessions", activeSessionsCount);
        }
        return summary;
    }

    public Map<String, Object> querySessions(Long from, Long to, String countryCode, String status, int page, int pageSize) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.max(pageSize, 1);
        int offset = (safePage - 1) * safeSize;

        StringBuilder whereClause = new StringBuilder(" WHERE 1=1 ");
        List<Object> params = new ArrayList<>();

        if (from != null) {
            whereClause.append(" AND started_at >= ? ");
            params.add(from);
        }
        if (to != null) {
            whereClause.append(" AND started_at <= ? ");
            params.add(to);
        }
        if (countryCode != null && !countryCode.isBlank()) {
            whereClause.append(" AND UPPER(country_code) = UPPER(?) ");
            params.add(countryCode.trim());
        }
        if (status != null && !status.isBlank()) {
            if ("active".equalsIgnoreCase(status)) {
                whereClause.append(" AND is_active = 1 ");
            } else if ("ended".equalsIgnoreCase(status)) {
                whereClause.append(" AND is_active = 0 ");
            }
        }

        String countSql = "SELECT COUNT(*) FROM `analytics_sessions` " + whereClause;
        Long total = jdbcTemplate.queryForObject(countSql, Long.class, params.toArray());
        if (total == null) total = 0L;

        String selectSql = "SELECT * FROM `analytics_sessions` " + whereClause + " ORDER BY started_at DESC LIMIT ? OFFSET ?;";
        List<Object> queryParams = new ArrayList<>(params);
        queryParams.add(safeSize);
        queryParams.add(offset);

        List<Map<String, Object>> sessionRows = jdbcTemplate.query(selectSql, (rs, rowNum) -> mapSessionRow(rs), queryParams.toArray());

        // Obtener eventos para estas sesiones
        for (Map<String, Object> sessionRow : sessionRows) {
            String sid = (String) sessionRow.get("sessionId");
            Map<String, Object> eventsDetail = querySessionEvents(sid, null, null, null, 250, null);
            sessionRow.put("eventsDetail", eventsDetail.get("items"));
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("items", sessionRows);
        response.put("page", safePage);
        response.put("pageSize", safeSize);
        response.put("total", total);
        return response;
    }

    public Map<String, Object> querySessionEvents(String sessionId, Long from, Long to, String eventType, int limit, Long cursorTs) {
        StringBuilder whereClause = new StringBuilder(" WHERE session_id = ? ");
        List<Object> params = new ArrayList<>();
        params.add(sessionId);

        if (cursorTs != null) {
            whereClause.append(" AND timestamp < ? ");
            params.add(cursorTs);
        }
        if (from != null) {
            whereClause.append(" AND timestamp >= ? ");
            params.add(from);
        }
        if (to != null) {
            whereClause.append(" AND timestamp <= ? ");
            params.add(to);
        }
        if (eventType != null && !eventType.isBlank()) {
            whereClause.append(" AND UPPER(event_type) = UPPER(?) ");
            params.add(eventType.trim());
        }

        int safeLimit = Math.max(1, limit);
        String sql = "SELECT event_type AS event, timestamp, path, metadata FROM `analytics_events` "
                + whereClause + " ORDER BY timestamp DESC LIMIT ?;";
        params.add(safeLimit);

        List<Map<String, Object>> items = jdbcTemplate.query(sql, (rs, rowNum) -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("event", rs.getString("event"));
            row.put("timestamp", rs.getLong("timestamp"));
            row.put("path", rs.getString("path"));

            String metaRaw = rs.getString("metadata");
            Map<String, String> meta = metaRaw != null ? gson.fromJson(metaRaw, metadataType) : Collections.emptyMap();
            row.put("metadata", meta != null ? meta : Collections.emptyMap());
            return row;
        }, params.toArray());

        String nextCursor = items.isEmpty()
                ? null
                : String.valueOf(items.get(items.size() - 1).get("timestamp"));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("items", items);
        response.put("nextCursor", nextCursor);
        return response;
    }

    public Map<String, Object> queryTimeseries(Long from, Long to, long bucketSeconds, String eventType) {
        StringBuilder whereClause = new StringBuilder(" WHERE 1=1 ");
        List<Object> params = new ArrayList<>();

        if (from != null) {
            whereClause.append(" AND timestamp >= ? ");
            params.add(from);
        }
        if (to != null) {
            whereClause.append(" AND timestamp <= ? ");
            params.add(to);
        }

        long safeBucket = bucketSeconds > 0 ? bucketSeconds : 60L;

        String sql;
        if (eventType == null || eventType.isBlank()) {
            sql = "SELECT (timestamp DIV " + safeBucket + ") * " + safeBucket + " AS bucket_ts, " +
                    "COUNT(*) AS total, " +
                    "SUM(CASE WHEN UPPER(event_type) = 'PAGE_VIEW' THEN 1 ELSE 0 END) AS page_views, " +
                    "SUM(CASE WHEN UPPER(event_type) = 'LINK_CLICK' THEN 1 ELSE 0 END) AS link_clicks " +
                    "FROM `analytics_events` " + whereClause +
                    "GROUP BY bucket_ts ORDER BY bucket_ts ASC;";
        } else if ("PAGE_VIEW".equalsIgnoreCase(eventType)) {
            whereClause.append(" AND UPPER(event_type) = 'PAGE_VIEW' ");
            sql = "SELECT (timestamp DIV " + safeBucket + ") * " + safeBucket + " AS bucket_ts, " +
                    "COUNT(*) AS total, COUNT(*) AS page_views, 0 AS link_clicks " +
                    "FROM `analytics_events` " + whereClause +
                    "GROUP BY bucket_ts ORDER BY bucket_ts ASC;";
        } else if ("LINK_CLICK".equalsIgnoreCase(eventType)) {
            whereClause.append(" AND UPPER(event_type) = 'LINK_CLICK' ");
            sql = "SELECT (timestamp DIV " + safeBucket + ") * " + safeBucket + " AS bucket_ts, " +
                    "COUNT(*) AS total, 0 AS page_views, COUNT(*) AS link_clicks " +
                    "FROM `analytics_events` " + whereClause +
                    "GROUP BY bucket_ts ORDER BY bucket_ts ASC;";
        } else {
            whereClause.append(" AND UPPER(event_type) = UPPER(?) ");
            params.add(eventType.trim());
            sql = "SELECT (timestamp DIV " + safeBucket + ") * " + safeBucket + " AS bucket_ts, " +
                    "COUNT(*) AS total, 0 AS page_views, 0 AS link_clicks " +
                    "FROM `analytics_events` " + whereClause +
                    "GROUP BY bucket_ts ORDER BY bucket_ts ASC;";
        }

        List<Map<String, Object>> points = jdbcTemplate.query(sql, (rs, rowNum) -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("ts", rs.getLong("bucket_ts"));
            row.put("pageViews", rs.getLong("page_views"));
            row.put("linkClicks", rs.getLong("link_clicks"));
            row.put("total", rs.getLong("total"));
            return row;
        }, params.toArray());

        return Map.of("points", points);
    }

    public Map<String, Object> queryTopPaths(int limit) {
        int safeLimit = Math.max(1, limit);
        String sql = """
            SELECT path, COUNT(*) AS views
            FROM `analytics_events`
            WHERE path IS NOT NULL AND path != ''
            GROUP BY path
            ORDER BY views DESC
            LIMIT ?;
        """;
        List<Map<String, Object>> items = jdbcTemplate.query(sql, (rs, rowNum) -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("path", rs.getString("path"));
            row.put("views", rs.getLong("views"));
            return row;
        }, safeLimit);

        return Map.of("items", items);
    }

    public Map<String, Object> queryEventDistribution() {
        String sql = """
            SELECT event_type AS event, COUNT(*) AS count
            FROM `analytics_events`
            GROUP BY event_type
            ORDER BY count DESC;
        """;
        List<Map<String, Object>> items = jdbcTemplate.query(sql, (rs, rowNum) -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("event", rs.getString("event"));
            row.put("count", rs.getLong("count"));
            return row;
        });

        return Map.of("items", items);
    }

    public Map<String, Object> queryGeoCountries(int limit) {
        int safeLimit = Math.max(1, limit);
        String sql = """
            SELECT
                s.country_code AS country_code,
                COALESCE(c.country_name, s.country, s.country_code) AS country,
                COUNT(DISTINCT s.session_id) AS sessions,
                COALESCE(SUM(s.total_events), 0) AS events,
                COALESCE(SUM(s.page_views), 0) AS page_views,
                COALESCE(SUM(s.link_clicks), 0) AS link_clicks
            FROM `analytics_sessions` s
            LEFT JOIN `analytics_countries` c ON s.country_code = c.country_code
            WHERE s.country_code IS NOT NULL AND s.country_code != ''
            GROUP BY s.country_code, country
            ORDER BY sessions DESC
            LIMIT ?;
        """;

        List<Map<String, Object>> items = jdbcTemplate.query(sql, (rs, rowNum) -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("country", rs.getString("country"));
            row.put("countryCode", rs.getString("country_code"));
            row.put("sessions", rs.getLong("sessions"));
            row.put("events", rs.getLong("events"));
            row.put("pageViews", rs.getLong("page_views"));
            row.put("linkClicks", rs.getLong("link_clicks"));
            return row;
        }, safeLimit);

        return Map.of("items", items);
    }

    public Map<String, String> queryCountryNames() {
        String sql = "SELECT country_code, country_name FROM `analytics_countries`;";
        Map<String, String> names = new LinkedHashMap<>();
        try {
            jdbcTemplate.query(sql, (rs) -> {
                names.put(rs.getString("country_code"), rs.getString("country_name"));
            });
        } catch (Exception ignored) {
        }
        return names;
    }

    public Optional<SessionState> findSession(String sessionId) {
        String sql = "SELECT * FROM `analytics_sessions` WHERE `session_id` = ?;";
        List<SessionState> list = jdbcTemplate.query(sql, (rs, rowNum) -> {
            String sid = rs.getString("session_id");
            String ip = rs.getString("ip");
            String country = rs.getString("country");
            String countryCode = rs.getString("country_code");
            long startedAt = rs.getLong("started_at");
            Long endedAt = rs.getObject("ended_at") != null ? rs.getLong("ended_at") : null;
            boolean active = rs.getInt("is_active") == 1;

            SessionState state = new SessionState(sid, ip, country, countryCode, startedAt, 250);
            if (!active && endedAt != null) {
                state.end(endedAt);
            }
            return state;
        }, sessionId);

        if (list.isEmpty()) return Optional.empty();

        SessionState session = list.get(0);
        // Cargar eventos
        String eventsSql = "SELECT event_type, timestamp, path, metadata FROM `analytics_events` WHERE session_id = ? ORDER BY timestamp DESC LIMIT 250;";
        jdbcTemplate.query(eventsSql, rs -> {
            String eventType = rs.getString("event_type");
            long ts = rs.getLong("timestamp");
            String path = rs.getString("path");
            String metaRaw = rs.getString("metadata");
            Map<String, String> meta = metaRaw != null ? gson.fromJson(metaRaw, metadataType) : Collections.emptyMap();
            session.addEvent(new SessionEvent(eventType, ts, path, meta));
        }, sessionId);

        return Optional.of(session);
    }

    private Map<String, Object> mapSessionRow(ResultSet rs) throws SQLException {
        String sid = rs.getString("session_id");
        String ip = rs.getString("ip");
        String country = rs.getString("country");
        String countryCode = rs.getString("country_code");
        long startedAt = rs.getLong("started_at");
        Long endedAt = rs.getObject("ended_at") != null ? rs.getLong("ended_at") : null;
        boolean isActive = rs.getInt("is_active") == 1;
        long totalEvents = rs.getLong("total_events");
        long pageViews = rs.getLong("page_views");
        long linkClicks = rs.getLong("link_clicks");

        long effectiveEnd = isActive ? (System.currentTimeMillis() / 1000) : (endedAt == null ? startedAt : endedAt);
        long duration = Math.max(0L, effectiveEnd - startedAt);

        Map<String, Object> row = new LinkedHashMap<>();
        row.put("sessionId", sid);
        row.put("ip", ip);
        row.put("country", country);
        row.put("countryCode", countryCode);
        row.put("startedAt", startedAt);
        row.put("endedAt", isActive ? null : endedAt);
        row.put("durationSeconds", duration);
        row.put("status", isActive ? "active" : "ended");
        row.put("events", totalEvents);
        row.put("pageViews", pageViews);
        row.put("linkClicks", linkClicks);
        row.put("countryName", country != null ? country : countryCode);
        row.put("active", isActive);
        return row;
    }
}
