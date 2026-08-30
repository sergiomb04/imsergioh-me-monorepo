# Contributing to imsergioh-me-backend

Thank you for your interest in contributing! We welcome contributions to improve the backend analytics, link shortening, and real-time services.

## Development Setup

### Prerequisites
- **Java 17+** (JDK 17 or JDK 21 recommended)
- **Gradle 8.14+** (or using `./gradlew`)
- **MariaDB 10.6+ / 11+** (or via Docker Compose)

### Getting Started
1. **Clona el monorepo**:
   ```bash
   git clone https://github.com/imsergioh/imsergioh-me-monorepo.git
   cd imsergioh-me-monorepo/apps/backend
   ```
2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` or set up your `config.json` based on `config.example.json`.
   ```bash
   cp .env.example .env
   ```
3. **Run MariaDB with Docker** (Optional):
   ```bash
   docker compose up mariadb -d
   ```
4. **Compile and Run Tests**:
   ```bash
   ./gradlew test
   ```
5. **Start the Application**:
   ```bash
   ./gradlew bootRun
   ```

## Code Guidelines
- Follow standard Java code style and conventions.
- Keep security in mind: do not commit API keys, passwords, or production database credentials.
- Ensure all automated unit tests pass before submitting a pull request.

## Submitting Pull Requests
1. Fork the repo and create your branch from `dev` or `main`.
2. Ensure `./gradlew test` passes.
3. Submit a Pull Request with a clear description of your changes.
