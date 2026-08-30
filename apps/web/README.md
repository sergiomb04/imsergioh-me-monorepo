# SergioHub — web (imsergioh.me) 🚀

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

Sitio web personal interactivo, portafolio y plataforma de gestión desarrollada con **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4** y **LiveState (WebSockets en tiempo real)**.

---

## ✨ Características Principales

### 🌐 Sitio Público y Experiencia Interactiva
- **Landing & Portafolio:** Presentación de trayectoria, proyectos y habilidades con animaciones fluidas y soporte 3D con **Three.js / React Three Fiber**.
- **Proyectos Interactivos:**
  - 💬 **Interactive Chat:** Sala de chat conectada vía WebSockets (`/projects/interactive-chat`).
  - 🔢 **Global Counter:** Contador sincronizado en tiempo real (`/projects/counter`).
  - 🔗 **Acortador de Enlaces:** Redirección dinámica `/link/[id]` con soporte de vista previa / Open Graph para Discord, Twitter/X, Telegram, WhatsApp, Slack, etc.

### 🛡️ Panel de Administración (`/admin`)
- **Autenticación Segura:** Google OAuth mediante **Auth.js / NextAuth** protegido con lista blanca de correos autorizados (`ALLOWED_EMAILS`).
- **Analíticas en Tiempo Real (`/admin/analytics`):** Monitorización en vivo de sesiones activas, eventos, geolocalización por país y volumen de tráfico mediante WebSockets bidireccionales.
- **Gestión de Enlaces Cortos (`/admin/links`):** Creación, edición, eliminación y auditoría de tráfico con filtrado avanzado.
- **Explorador y Gestor de CDN (`/admin/cdn`):** Subida de imágenes y recursos con visualización previa y copia de enlaces directos.
- **Interruptor de Disponibilidad:** Sincronización global en vivo del estado laboral y disponibilidad para proyectos.

---

## 🛠️ Stack Tecnológico

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **UI & Estilos:** [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Lucide Icons](https://lucide.dev/), [React Icons](https://react-icons.github.io/react-icons/)
- **3D & Animaciones:** [Three.js](https://threejs.org/), [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber), [@react-three/drei](https://github.com/pmndrs/drei)
- **Tiempo Real:** LiveState WebSocket Client & Socket.io architecture
- **Autenticación:** [NextAuth.js (Auth.js v4)](https://next-auth.js.org/) con Google Provider
- **Tipado & Calidad:** TypeScript, ESLint 9

---

## 🚀 Inicio Rápido

### 1. Clonar el monorepo
```bash
git clone https://github.com/imsergioh/imsergioh-me-monorepo.git
cd imsergioh-me-monorepo/apps/web
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Copia la plantilla `.env.example` a `.env.local`:
```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales y URLs:
```env
# Google OAuth (Google Cloud Console)
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret

# Clave de sesión aleatoria
NEXT_AUTH_SECRET=genera-una-clave-secreta-aleatoria

# Lista blanca de administradores
ALLOWED_EMAILS=tu-email@gmail.com

# Backend LiveState y Servicios
NEXT_PUBLIC_LIVESTATE_URL=https://livestate.imsergioh.me
BACKEND_LINKS_API_URL=https://livestate.imsergioh.me/api/links
BACKEND_CDN_API_URL=https://livestate.imsergioh.me/api/cdn
```

### 4. Ejecutar en desarrollo
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📜 Scripts Disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo con Turbopack |
| `npm run build` | Compila y genera el bundle de producción |
| `npm run start` | Inicia el servidor optimizado para producción |
| `npm run lint` | Ejecuta el análisis estático de código con ESLint |

---

## 📁 Estructura del Proyecto

```text
├── public/                # Recursos estáticos e imágenes
├── src/
│   ├── app/               # Rutas y páginas de Next.js App Router
│   │   ├── (main-site)/   # Páginas públicas (inicio, sobre mí)
│   │   ├── admin/         # Panel de administración protegido
│   │   ├── api/           # Endpoints de API REST
│   │   ├── link/[id]/     # Handler del acortador de enlaces
│   │   └── projects/      # Proyectos interactivos
│   ├── component/         # Componentes UI reutilizables
│   ├── context/           # Contextos globales (Realtime, Analytics, Availability)
│   ├── features/          # Módulos de funcionalidad (CDN, Links, Analytics)
│   ├── lib/               # Clientes y utilidades de backend/servicios
│   ├── types/             # Definiciones TypeScript
│   └── utils/             # Funciones de soporte y utilidades
├── .env.example           # Plantilla documentada de variables de entorno
├── eslint.config.mjs      # Configuración de ESLint 9 Flat Config
├── next.config.ts         # Configuración de Next.js
└── package.json           # Dependencias y scripts
```

---

## 🤝 Contribuciones

Las contribuciones, sugerencias y mejoras son bienvenidas. Para más información, consulta [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 🔒 Seguridad

Si descubres alguna vulnerabilidad de seguridad, por favor revisa [SECURITY.md](SECURITY.md) para informarla de manera responsable.

---

## 📄 Licencia

Este proyecto está bajo la Licencia [MIT](LICENSE).
