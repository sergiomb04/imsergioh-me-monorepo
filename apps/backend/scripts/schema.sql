-- MariaDB Schema for Analytics

CREATE DATABASE IF NOT EXISTS `analytics`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `analytics`;

-- 1. Table for tracking user sessions
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

-- 2. Dynamic Table for tracking all analytics events
-- Any event_type and arbitrary metadata JSON are supported dynamically without altering the schema
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

-- 3. Auxiliary table for country code to country name mapping
CREATE TABLE IF NOT EXISTS `analytics_countries` (
    `country_code` VARCHAR(10) NOT NULL,
    `country_name` VARCHAR(128) NOT NULL,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`country_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
