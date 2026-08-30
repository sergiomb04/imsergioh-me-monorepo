# Stage 1: Build application with Gradle
FROM eclipse-temurin:25-jdk-alpine AS builder
WORKDIR /app

COPY gradlew gradlew.bat settings.gradle.kts build.gradle.kts ./
COPY gradle ./gradle
COPY libs ./libs

# Make gradlew executable
RUN chmod +x gradlew

# Copy source code and default assets
COPY src ./src

# Build production jar
RUN ./gradlew bootJar --no-daemon -x test

# Stage 2: Minimal runtime image
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create data directories with appropriate permissions
RUN mkdir -p /app/data/cdn /app/data/analytics-cache && chown -R appuser:appgroup /app/data

# Copy jar from builder stage
COPY --from=builder --chown=appuser:appgroup /app/build/libs/*.jar app.jar

USER appuser

EXPOSE 8081

ENV PORT=8081 \
    DB_HOST=mariadb \
    DB_PORT=3306 \
    DB_NAME=analytics \
    DB_USER=root \
    DB_PASSWORD=root

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
