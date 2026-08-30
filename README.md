# imsergioh.me — Monorepo

Monorepo del proyecto personal [imsergioh.me](https://imsergioh.me). Contiene el backend y el frontend como apps independientes dentro de una estructura unificada.

## 📁 Estructura

```
imsergioh-me-monorepo/
├── apps/
│   ├── backend/     # Spring Boot 3 / Java 25 / Gradle (LiveState API)
│   ├── chat/        # Java WebSocket Server / Gradle (Chat interactivo)
│   └── web/         # Next.js 16 / React 19 / TypeScript (Frontend)
└── .gitignore
```

## 🚀 Apps

### 🔷 [Backend](./apps/backend)
API REST + WebSocket en tiempo real (LiveState). Analíticas, acortador de enlaces, CDN, disponibilidad.
- **Stack**: Java 25, Spring Boot 3.5, MariaDB, Gradle
- **Docs**: [apps/backend/README.md](./apps/backend/README.md)

### 💬 [Chat](./apps/chat)
Servidor WebSocket ligero para el chat interactivo en tiempo real.
- **Stack**: Java, Java-WebSocket, Gson, Gradle

### 🟢 [Web](./apps/web)
Sitio web personal, portafolio y panel de administración.
- **Stack**: Next.js 16, React 19, Tailwind CSS v4, TypeScript
- **Docs**: [apps/web/README.md](./apps/web/README.md)

## ⚡ Quick Start

```bash
# Backend (LiveState API)
cd apps/backend
cp .env.example .env
./gradlew bootRun

# Chat (WebSocket Server)
cd apps/chat
./gradlew run

# Web (Frontend Next.js)
cd apps/web
cp .env.example .env.local
npm install
npm run dev
```

## 📄 Licencia

MIT — ver [apps/backend/LICENSE](./apps/backend/LICENSE) y [apps/web/LICENSE](./apps/web/LICENSE).
