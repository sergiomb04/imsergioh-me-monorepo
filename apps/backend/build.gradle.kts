plugins {
    id("java")
    id("application")
    id("org.springframework.boot") version "3.5.3"
    id("io.spring.dependency-management") version "1.1.7"
}

group = "me.imsergioh.web.backend"
version = "1.0-SNAPSHOT"

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(25))
    }
}

repositories {
    mavenLocal()
    mavenCentral()
}

application {
    mainClass.set("me.imsergioh.web.BackendApplication")
}

dependencies {
    implementation(files("libs/livestate-server-1.0-SNAPSHOT.jar"))
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-websocket")

    implementation("com.google.code.gson:gson:2.11.0")

    implementation("io.jsonwebtoken:jjwt-api:0.11.5")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.11.5")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.11.5")

    implementation("com.maxmind.geoip2:geoip2:4.2.1")
    implementation("org.springframework.boot:spring-boot-starter-jdbc")
    implementation("org.mariadb.jdbc:mariadb-java-client:3.3.3")

    compileOnly("org.projectlombok:lombok:1.18.38")
    annotationProcessor("org.projectlombok:lombok:1.18.38")

    testImplementation(platform("org.junit:junit-bom:5.10.0"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.test {
    useJUnitPlatform()
}

/**
 * IMPORTANTE:
 * Usamos bootJar (Spring Boot correcto), NO shadowJar
 */
tasks.bootJar {
    archiveClassifier.set("")
}

/**
 * opcional pero recomendado
 */
tasks.jar {
    enabled = false
}