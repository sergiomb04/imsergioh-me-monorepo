#!/usr/bin/env python3
"""
Script de Migración de Analíticas a MariaDB
Fase 1: Lee analytics-snapshot.json, inicializa el esquema dinámico e inserta todas las sesiones y eventos.
"""

import argparse
import json
import os
import sys
from pathlib import Path

try:
    import pymysql
    from pymysql.cursors import DictCursor
except ImportError:
    print("❌ El paquete 'pymysql' no está instalado. Instalándolo con pip...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pymysql", "cryptography"])
    import pymysql
    from pymysql.cursors import DictCursor


def get_default_json_path():
    possible_paths = [
        Path("data") / "analytics-cache" / "analytics-snapshot.json",
        Path("analytics-snapshot.json"),
        Path("..") / "data" / "analytics-cache" / "analytics-snapshot.json",
    ]
    for p in possible_paths:
        if p.is_file():
            return str(p.resolve())
    return str(possible_paths[0])


def parse_arguments():
    parser = argparse.ArgumentParser(
        description="Migrar datos de analytics-snapshot.json a MariaDB local (Docker)."
    )
    parser.add_argument(
        "--host",
        default=os.getenv("MARIADB_HOST", "127.0.0.1"),
        help="Host de MariaDB (por defecto: 127.0.0.1)",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.getenv("MARIADB_PORT", "3306")),
        help="Puerto de MariaDB (por defecto: 3306)",
    )
    parser.add_argument(
        "--user",
        default=os.getenv("MARIADB_USER", "root"),
        help="Usuario de MariaDB (por defecto: root)",
    )
    parser.add_argument(
        "--password",
        default=os.getenv("MARIADB_PASSWORD", "root"),
        help="Contraseña de MariaDB (por defecto: root)",
    )
    parser.add_argument(
        "--database",
        default=os.getenv("MARIADB_DATABASE", "analytics"),
        help="Nombre de la base de datos (por defecto: analytics)",
    )
    parser.add_argument(
        "--file",
        default=os.getenv("SNAPSHOT_FILE", get_default_json_path()),
        help="Ruta al archivo analytics-snapshot.json",
    )
    return parser.parse_args()


def connect_server(host, port, user, password, retries=10, delay=2):
    import time
    for attempt in range(1, retries + 1):
        try:
            return pymysql.connect(
                host=host,
                port=port,
                user=user,
                password=password,
                charset="utf8mb4",
                autocommit=True,
                cursorclass=DictCursor,
                connect_timeout=5,
            )
        except Exception as e:
            if attempt < retries:
                print(f"⏳ Conexión ({attempt}/{retries}) falló: {e}. Reintentando en {delay}s...")
                time.sleep(delay)
            else:
                print(f"\n❌ Error al conectar a MariaDB en {host}:{port} con usuario '{user}':")
                print(f"   {e}\n")
                print("💡 Sugerencia si MariaDB no está corriendo en Docker:")
                print(
                    "   docker run -d --name mariadb-analytics "
                    "-p 3306:3306 -e MARIADB_ROOT_PASSWORD=root -e MARIADB_DATABASE=analytics mariadb:latest"
                )
                sys.exit(1)


def init_schema(conn, db_name):
    print(f"🔧 Verificando base de datos '{db_name}' y creando tablas si no existen...")
    with conn.cursor() as cursor:
        cursor.execute(
            f"CREATE DATABASE IF NOT EXISTS `{db_name}` "
            "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
        )
        cursor.execute(f"USE `{db_name}`;")

        # 1. Tabla de sesiones
        cursor.execute("""
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
        """)

        # 2. Tabla dinámica de eventos (soporta cualquier nuevo evento y metadata JSON)
        cursor.execute("""
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
        """)

        # 3. Tabla de países
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `analytics_countries` (
                `country_code` VARCHAR(10) NOT NULL,
                `country_name` VARCHAR(128) NOT NULL,
                `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (`country_code`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)
    print("✅ Esquema de base de datos verificado correctamente.")


def migrate_data(conn, db_name, json_file_path):
    print(f"📖 Leyendo snapshot desde: {json_file_path}")
    if not os.path.exists(json_file_path):
        print(f"❌ Error: El archivo '{json_file_path}' no existe.")
        sys.exit(1)

    with open(json_file_path, "r", encoding="utf-8") as f:
        snapshot = json.load(f)

    country_names = snapshot.get("countryNames", {})
    recent_sessions = snapshot.get("recentSessions", [])
    active_sessions = snapshot.get("activeSessions", [])
    all_sessions = recent_sessions + active_sessions

    print(f"📊 Datos encontrados en snapshot:")
    print(f"   • Total sesiones en snapshot (declaradas): {snapshot.get('totalSessions', 0)}")
    print(f"   • Total eventos en snapshot (declarados): {snapshot.get('totalEvents', 0)}")
    print(f"   • Sesiones con detalle completo: {len(all_sessions)} ({len(recent_sessions)} recientes, {len(active_sessions)} activas)")
    print(f"   • Mapeos de países: {len(country_names)}")

    with conn.cursor() as cursor:
        cursor.execute(f"USE `{db_name}`;")

        # 1. Insertar / Actualizar países
        if country_names:
            print("🌍 Migrando nombres de países...")
            country_sql = """
                INSERT INTO `analytics_countries` (`country_code`, `country_name`)
                VALUES (%s, %s)
                ON DUPLICATE KEY UPDATE `country_name` = VALUES(`country_name`);
            """
            country_rows = [(code, name) for code, name in country_names.items() if code and name]
            if country_rows:
                cursor.executemany(country_sql, country_rows)

        # 2. Insertar sesiones
        print("💾 Migrando sesiones a 'analytics_sessions'...")
        session_sql = """
            INSERT INTO `analytics_sessions` (
                `session_id`, `ip`, `country`, `country_code`,
                `started_at`, `ended_at`, `is_active`,
                `total_events`, `page_views`, `link_clicks`
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                `ip` = VALUES(`ip`),
                `country` = VALUES(`country`),
                `country_code` = VALUES(`country_code`),
                `ended_at` = VALUES(`ended_at`),
                `is_active` = VALUES(`is_active`),
                `total_events` = VALUES(`total_events`),
                `page_views` = VALUES(`page_views`),
                `link_clicks` = VALUES(`link_clicks`);
        """

        session_rows = []
        events_to_insert = []

        for s in all_sessions:
            session_id = s.get("sessionId")
            if not session_id:
                continue

            ip = s.get("ip")
            country = s.get("country")
            country_code = s.get("countryCode")
            started_at = s.get("startedAt", 0)
            ended_at = s.get("endedAt")
            is_active = 1 if s.get("active", False) else 0
            total_events = s.get("totalEvents", 0)
            page_views = s.get("pageViews", 0)
            link_clicks = s.get("linkClicks", 0)

            session_rows.append((
                session_id,
                ip,
                country,
                country_code,
                started_at,
                ended_at,
                is_active,
                total_events,
                page_views,
                link_clicks,
            ))

            for ev in s.get("events", []):
                event_type = ev.get("event") or ev.get("eventType") or "unknown"
                ts = ev.get("timestamp", started_at)
                path = ev.get("path")
                meta = ev.get("metadata", {})
                meta_json = json.dumps(meta, ensure_ascii=False) if meta else None

                events_to_insert.append((
                    session_id,
                    event_type,
                    path,
                    country,
                    country_code,
                    ip,
                    ts,
                    meta_json,
                ))

        if session_rows:
            cursor.executemany(session_sql, session_rows)
            print(f"✅ {len(session_rows)} sesiones insertadas/actualizadas.")

        # 3. Insertar eventos
        print("⚡ Migrando eventos a 'analytics_events'...")
        # Limpiar eventos previos de estas sesiones para evitar duplicados si se reejecuta
        if session_rows:
            session_ids = [r[0] for r in session_rows]
            format_strings = ','.join(['%s'] * len(session_ids))
            cursor.execute(f"DELETE FROM `analytics_events` WHERE `session_id` IN ({format_strings})", session_ids)

        event_sql = """
            INSERT INTO `analytics_events` (
                `session_id`, `event_type`, `path`, `country`,
                `country_code`, `ip`, `timestamp`, `metadata`
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
        """

        if events_to_insert:
            batch_size = 500
            for i in range(0, len(events_to_insert), batch_size):
                batch = events_to_insert[i:i + batch_size]
                cursor.executemany(event_sql, batch)
            print(f"✅ {len(events_to_insert)} eventos insertados exitosamente.")

        # Resumen de verificación en la base de datos
        cursor.execute("SELECT COUNT(*) AS total_sessions FROM `analytics_sessions`;")
        db_sessions = cursor.fetchone()["total_sessions"]

        cursor.execute("SELECT COUNT(*) AS total_events FROM `analytics_events`;")
        db_events = cursor.fetchone()["total_events"]

        cursor.execute("SELECT event_type, COUNT(*) AS count FROM `analytics_events` GROUP BY event_type;")
        db_distribution = cursor.fetchall()

        print("\n" + "=" * 50)
        print("🎉 ¡MIGRACIÓN COMPLETADA CON ÉXITO!")
        print("=" * 50)
        print(f"📁 Sesiones en BD: {db_sessions}")
        print(f"⚡ Eventos en BD:  {db_events}")
        print("📈 Distribución de eventos en MariaDB:")
        for row in db_distribution:
            print(f"   • {row['event_type']}: {row['count']}")
        print("=" * 50 + "\n")


def main():
    args = parse_arguments()
    print("=" * 50)
    print("🚀 INICIANDO MIGRACIÓN DE ANALÍTICAS A MARIADB")
    print(f"📍 Servidor: {args.host}:{args.port}")
    print(f"👤 Usuario:  {args.user}")
    print(f"📦 Base:     {args.database}")
    print("=" * 50)

    conn = connect_server(args.host, args.port, args.user, args.password)
    try:
        init_schema(conn, args.database)
        migrate_data(conn, args.database, args.file)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
