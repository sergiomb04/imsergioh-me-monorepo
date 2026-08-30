# 💬 chat (imsergioh.me)

[![Java](https://img.shields.io/badge/Java-21%2B-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Gradle](https://img.shields.io/badge/Gradle-9.7-02303A?style=for-the-badge&logo=gradle&logoColor=white)](https://gradle.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

Servidor WebSocket ligero y autónomo para el chat interactivo en tiempo real de **[imsergioh.me](https://imsergioh.me)**.

---

## 🚀 Características

- ⚡ **WebSocket en tiempo real**: Comunicación bidireccional de baja latencia basada en `Java-WebSocket`.
- 🛡️ **Detección de Administrador**: Asignación de rol admin a través de filtrado por lista de IPs configuradas (`ADMIN_IPS`).
- 📦 **JSON Serialization**: Manejo eficiente de payloads de mensajes con `Gson`.
- 🔨 **Shadow Fat JAR**: Empaquetado completo de todas las dependencias en un único JAR ejecutable y ligero.

---

## 🛠️ Stack Tecnológico

- **Lenguaje**: Java
- **Librerías**: `org.java-websocket:Java-WebSocket`, `com.google.code.gson:gson`
- **Build Tool**: Gradle 9.7 (Kotlin DSL) con plugin `com.gradleup.shadow`

---

## 📦 Quick Start

### 1. Configuración de Variables de Entorno
Copia el archivo de plantilla `.env.example`:
```bash
cp .env.example .env
```

Variables disponibles:
- `PORT`: Puerto donde escuchará el servidor WebSocket (por defecto: `8080`).
- `ADMIN_IPS`: Lista de IPs separadas por comas que tendrán privilegios de administrador.

---

## 💻 Comandos de Compilación y Ejecución

> [!NOTE]
> **Diferencia con `backend`:**
> `backend` utiliza Spring Boot (`./gradlew bootJar`), mientras que `chat` es una aplicación Java estándar que utiliza el plugin **Shadow** (`./gradlew shadowJar`) para empaquetar las dependencias en el `.jar` ejecutable.

### 1. Ejecución en Modo Desarrollo
Arranca el servidor WebSocket directamente:

- **Windows (PowerShell / CMD):**
  ```powershell
  .\gradlew run
  ```
- **Linux / macOS:**
  ```bash
  ./gradlew run
  ```

### 2. Compilar y Generar el JAR Ejecutable (Fat JAR)
Genera el paquete ejecutable autónomo con todas sus dependencias en `build/libs/chat-1.0-SNAPSHOT-all.jar`:

- **Windows:**
  ```powershell
  .\gradlew shadowJar
  ```
- **Linux / macOS:**
  ```bash
  ./gradlew shadowJar
  ```

### 3. Ejecutar el Archivo JAR Generado
```bash
java -jar build/libs/chat-1.0-SNAPSHOT-all.jar
```

### 4. Limpiar y Recompilar
```bash
./gradlew clean shadowJar
```

### 5. Compilar únicamente el código Java
```bash
./gradlew compileJava
```

---

## 📄 Licencia

Este proyecto está bajo la licencia [MIT](LICENSE).
