# ⚡ backend (imsergioh.me)

[![Java](https://img.shields.io/badge/Java-25%2B-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5.3-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![MariaDB](https://img.shields.io/badge/MariaDB-11.4-003545?style=for-the-badge&logo=mariadb&logoColor=white)](https://mariadb.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

Backend service for **[imsergioh.me](https://imsergioh.me)**. Provides real-time analytics ingestion and aggregation, short links management with traffic redirection tracking, CDN file storage, availability presence status, and real-time WebSocket state distribution.

---

## 🚀 Features

- 📊 **Real-time Analytics Ingestion & Persistence**: Asynchronous batch writing of visits, sessions, link clicks, page views, and country geolocation to MariaDB.
- 🔗 **Short Links & Click Tracking**: Link management and short redirect analytics with IP masking and referrer details.
- ⚡ **WebSocket LiveState**: Bi-directional real-time subscription channels for active sessions, live events, and presence updates.
- 📁 **CDN Storage**: Multi-part upload and deletion of static assets with path validation and traversal protection.
- 🛡️ **HMAC Admin Authentication**: Session verification and protected administrative endpoints.
- 🐳 **Docker & Container Ready**: Multi-stage build and `docker-compose` orchestration for MariaDB and Spring Boot.

---

## 🏛️ Architecture Overview

```
                          ┌───────────────────────────┐
                          │  Frontend (Next.js / Web)  │
                          └─────────────┬─────────────┘
                                        │
                    REST API (HTTP)     │     WebSocket (/realtime/**)
                   ─────────────────────┴─────────────────────────
                                        │
                         ┌──────────────▼─────────────┐
                         │  Spring Boot 3 Web App     │
                         │   • AvailableController    │
                         │   • LinksController        │
                         │   • CdnController          │
                         │   • WebSocket Actions      │
                         └──────────────┬─────────────┘
                                        │
                         ┌──────────────▼─────────────┐
                         │  Analytics Ingestion &     │
                         │  Persistence Queue         │
                         └──────────────┬─────────────┘
                                        │
                               ┌────────▼────────┐
                               │  MariaDB 11.4   │
                               │  • sessions     │
                               │  • events       │
                               │  • countries    │
                               └─────────────────┘
```

---

## 🛠️ Tech Stack

- **Framework**: Spring Boot 3.5.3, Spring Web, Spring WebSocket, Spring JDBC
- **Language**: Java 25 (LTS)
- **Database**: MariaDB / MySQL
- **GeoIP**: MaxMind GeoIP2
- **Build Tool**: Gradle 9.7 (Kotlin DSL)
- **Containerization**: Docker, Docker Compose

---

## 📦 Quick Start

### 1. Prerequisites
- **JDK 25** (o superior)
- **Docker & Docker Compose** (recomendado para MariaDB)

### 2. Configure Environment
Clone the repository and copy the environment template:
```bash
cp .env.example .env
```

---

## 💻 Comandos de Compilación y Ejecución

Puedes usar el Gradle Wrapper incluido (`gradlew` en Linux/macOS o `.\gradlew` en Windows) sin necesidad de tener Gradle instalado:

### 1. Ejecución en Modo Desarrollo (Spring Boot)
Compila y arranca la aplicación directamente:

- **Windows (PowerShell / CMD):**
  ```powershell
  .\gradlew bootRun
  ```
- **Linux / macOS:**
  ```bash
  ./gradlew bootRun
  ```

### 2. Compilar y Generar el JAR de Producción
Genera el paquete ejecutable autónomo en `build/libs/` usando el plugin de Spring Boot (`bootJar`):

- **Windows:**
  ```powershell
  .\gradlew bootJar
  ```
- **Linux / macOS:**
  ```bash
  ./gradlew bootJar
  ```

> [!NOTE]
> En `backend` se utiliza **`bootJar`** (Spring Boot), no `shadowJar`. La tarea `jar` convencional está deshabilitada en `build.gradle.kts` para garantizar que solo se genere el ejecutable completo con el manifest y loaders de Spring Boot.

### 3. Ejecutar el Archivo JAR Generado
```bash
java -jar build/libs/backend-1.0-SNAPSHOT.jar
```

### 4. Limpiar y Recompilar Todo
Elimina temporales y reconstruye el proyecto ejecutando pruebas:

- **Windows:**
  ```powershell
  .\gradlew clean build
  ```
- **Linux / macOS:**
  ```bash
  ./gradlew clean build
  ```

### 5. Compilar únicamente el código Java (Verificación rápida)
- **Windows:**
  ```powershell
  .\gradlew compileJava
  ```
- **Linux / macOS:**
  ```bash
  ./gradlew compileJava
  ```

### 6. Ejecución de Tests
```bash
./gradlew test
```

### 7. Base de Datos con Docker Compose
Levanta la base de datos MariaDB lista para el backend:
```bash
# Iniciar MariaDB en segundo plano
docker compose up -d

# Ver logs de la base de datos
docker compose logs -f

# Detener contenedor
docker compose down
```

---

## 📡 API Reference

### Availability API
- `GET /available` - Retrieve current availability state (`true` / `false`).
- `POST /available/toggle` - Toggle current availability (Admin token required).
- `POST /available/set` - Explicitly set status (Admin token required).

### Links API
- `GET /api/links` - List all created links (Admin token required).
- `POST /api/links` - Create a new short link (Admin token required).
- `GET /api/links/{shortId}` - Retrieve link by short identifier.
- `PATCH /api/links/{shortId}` - Update short link target URL or title (Admin token required).
- `DELETE /api/links/{shortId}` - Delete short link (Admin token required).
- `POST /api/links/visit` - Record link visit / click event.

### Links Data & Traffic
- `GET /api/links-data` - Query traffic entries (Admin token required).
- `DELETE /api/links-data` - Delete traffic logs by ID or short link (Admin token required).

### CDN Storage API
- `GET /api/cdn` - List uploaded files (Admin token required).
- `POST /api/cdn/upload` - Upload file with optional target directory (Admin token required).
- `DELETE /api/cdn?path={relativePath}` - Delete file from CDN (Admin token required).

### WebSocket Subscriptions
- `WS /realtime/**`
  - Channels: `available`, `analytics_snapshot`, `admin_stream`
  - Actions: `SUB_ADMIN`, `PAGE_VIEW`, `LINK_CLICK`, `DELETE_SESSION`, `SET_SESSIONS_PAGE`

---

## 🧪 Testing

Execute test suite:
```bash
./gradlew test
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
