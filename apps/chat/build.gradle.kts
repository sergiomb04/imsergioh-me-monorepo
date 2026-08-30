plugins {
    id("java")
    id("com.gradleup.shadow") version "8.3.6"
    id("application")
}

group = "me.imsergioh"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(platform("org.junit:junit-bom:5.10.0"))
    testImplementation("org.junit.jupiter:junit-jupiter")

    implementation("com.google.code.gson:gson:2.13.2")
    implementation("org.java-websocket:Java-WebSocket:1.6.0")
}

application {
    mainClass.set("me.imsergioh.webchat.WebChatMain")
}

tasks.test {
    useJUnitPlatform()
}