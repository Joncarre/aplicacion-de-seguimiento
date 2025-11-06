# 🚌 Aplicación de Seguimiento de Autobuses Urbanos de Aranjuez

> Aplicación web progresiva (PWA) para seguimiento en tiempo real de autobuses urbanos en Aranjuez, Madrid.

[![Estado](https://img.shields.io/badge/estado-Fase%201-green)]()
[![Next.js](https://img.shields.io/badge/Next.js-14-black)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)]()

---

## 📋 Descripción

Sistema de seguimiento que permite a los usuarios conocer la posición en tiempo real de los autobuses y estimar tiempos de llegada precisos. Los conductores transmiten su ubicación GPS cada 10 segundos, permitiendo un seguimiento exacto y minimizando la incertidumbre en los tiempos de espera.

### 🎯 Problema que Resuelve

Aplicaciones como Google Maps solo hacen estimaciones sobre cuándo pasará el siguiente autobús, pero no tienen datos en tiempo real. Si un bus se retrasa por un atasco, la predicción será incorrecta. Esta aplicación soluciona esto mostrando la ubicación exacta de cada autobús en tiempo real.

---

## ✨ Características Principales

### 👤 Para Usuarios

- 🗺️ **Visualización de líneas** - Selección entre L1, L2, L3 y L4
- 📍 **Mapa interactivo** - Ver todas las paradas de la línea seleccionada
- 🚌 **Tiempo real** - Ubicación exacta de cada autobús
- ⏱️ **ETA preciso** - Tiempo estimado de llegada real (no estimaciones)
- 🎯 **Detección inteligente** - Identifica buses que se acercan vs. se alejan
- 📱 **Mobile-first** - Diseñado para móviles desde el principio

### 🚗 Para Conductores

- 🔐 **Autenticación segura** - Sistema de códigos únicos
- 📡 **Transmisión GPS** - Envío automático cada 10 segundos
- ▶️ **Control simple** - Botones para iniciar/finalizar trayecto
- 🔋 **Eficiente** - Optimizado para no gastar batería innecesariamente

---

## 🛠️ Stack Tecnológico

### Frontend
- ![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js) **Next.js 14** (App Router)
- ![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript) **TypeScript**
- ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss) **Tailwind CSS**
- ![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet) **React-Leaflet** (mapas)
- ![Socket.io](https://img.shields.io/badge/Socket.io-4.7-010101?logo=socket.io) **Socket.io-client**

### Backend
- ![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js) **Node.js** + **Express**
- ![Socket.io](https://img.shields.io/badge/Socket.io-4.7-010101?logo=socket.io) **Socket.io** (WebSockets)
- ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?logo=postgresql) **PostgreSQL** + **PostGIS**
- ![Prisma](https://img.shields.io/badge/Prisma-5.21-2D3748?logo=prisma) **Prisma ORM**

---

## 🚀 Inicio Rápido

### 📦 Requisitos Previos

- Node.js 18+
- PostgreSQL 14+ con PostGIS
- npm

### ⚡ Instalación Rápida

```powershell
# 1. Clonar el repositorio
git clone https://github.com/Joncarre/aplicacion-de-seguimiento.git
cd aplicacion-de-seguimiento

# 2. Configurar base de datos
psql -U postgres
CREATE DATABASE bus_tracking;
\c bus_tracking
CREATE EXTENSION IF NOT EXISTS postgis;
\q

# 3. Backend
cd backend
npm install
copy .env.example .env
# Edita .env con tu configuración
npm run prisma:migrate
npm run generate-codes
npm run dev

# 4. Frontend (en otra terminal)
cd frontend
npm install
copy .env.local.example .env.local
npm run dev
```

### 🌐 Acceder a la Aplicación

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001

📖 **Instrucciones detalladas:** Ver [`SETUP.md`](./SETUP.md) o [`docs/INSTALLATION.md`](./docs/INSTALLATION.md)

---

## 📁 Estructura del Proyecto

```
aplicacion-de-seguimiento/
│
├── 📱 frontend/              # Aplicación Next.js (puerto 3000)
│   ├── app/                  # Rutas y páginas
│   ├── components/           # Componentes React
│   ├── lib/                  # Utilidades y configuración
│   └── public/               # Assets estáticos + PWA
│
├── 🔧 backend/               # API + WebSocket (puerto 3001)
│   ├── src/                  # Código fuente
│   │   ├── controllers/      # Lógica de negocio
│   │   ├── services/         # Servicios
│   │   ├── routes/           # Endpoints REST
│   │   └── socket/           # WebSocket handlers
│   └── prisma/               # ORM y base de datos
│
└── 📚 docs/                  # Documentación completa
    ├── ARCHITECTURE.md       # Arquitectura del sistema
    ├── PHASES.md             # Fases de desarrollo
    ├── DESIGN_SYSTEM.md      # Sistema de diseño
    ├── SECURITY.md           # Seguridad
    └── INSTALLATION.md       # Guía de instalación
```

---

## 🎨 Sistema de Diseño

### Paleta de Colores por Línea

| Línea | Color | Hex |
|-------|-------|-----|
| **L1** | <span style="color: #86efac">●</span> Verde Claro | `#86efac` |
| **L2** | <span style="color: #6ee7b7">●</span> Esmeralda | `#6ee7b7` |
| **L3** | <span style="color: #5eead4">●</span> Teal | `#5eead4` |
| **L4** | <span style="color: #7dd3fc">●</span> Cielo | `#7dd3fc` |

### Principios de Diseño

- ✨ **Minimalista** - Interfaz limpia y clara
- 🎨 **Tonos verdes pastel** - Paleta suave y agradable
- 🌈 **Transparencias** - Efecto glassmorphism
- � **Bordes redondeados** - Esquinas suaves
- 📱 **Mobile-first** - Diseñado para móviles
- ☀️ **Light theme** - Tonos claros

---

## 📋 Fases de Desarrollo

| Fase | Estado | Descripción |
|------|--------|-------------|
| **Fase 1** | ✅ Completada | Setup y estructura base |
| **Fase 2** | 🔄 En progreso | Autenticación y roles |
| **Fase 3** | ⏳ Pendiente | Panel de conductor |
| **Fase 4** | ⏳ Pendiente | Panel de usuario - Selección |
| **Fase 5** | ⏳ Pendiente | Cálculo de llegadas |
| **Fase 6** | ⏳ Pendiente | Tiempo real y optimización |
| **Fase 7** | ⏳ Pendiente | Testing y deployment |

**Progreso total:** 14% (1/7 fases)

---

## 🔐 Seguridad

- 🔑 Códigos únicos de 10 dígitos para conductores
- 🔒 Variables de entorno para datos sensibles
- ✅ Validación de datos en cliente y servidor
- 🌐 CORS configurado apropiadamente
- 🛡️ Rate limiting contra ataques
- 🔐 Hashing de códigos con bcrypt
- 📝 Sistema de logs y auditoría

📖 **Más información:** [`docs/SECURITY.md`](./docs/SECURITY.md)

---

## 📱 PWA (Progressive Web App)

La aplicación funciona como una **PWA** lo que permite:

- 🏠 **Instalación** - Icono en pantalla de inicio
- ⚡ **Rápida** - Carga instantánea
- 📴 **Offline-ready** - Funcionalidad básica sin conexión (futuro)
- 📲 **Nativa** - Experiencia similar a app nativa

---

## 🧪 Scripts Disponibles

### Backend

```powershell
npm run dev              # Modo desarrollo con hot reload
npm run build            # Construir para producción
npm run start            # Iniciar en producción
npm run prisma:migrate   # Ejecutar migraciones
npm run prisma:studio    # Interfaz visual de BD
npm run generate-codes   # Generar códigos de conductor
```

### Frontend

```powershell
npm run dev              # Modo desarrollo
npm run build            # Construir para producción
npm run start            # Iniciar en producción
npm run lint             # Ejecutar linter
```

---

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [`SETUP.md`](./SETUP.md) | Guía de inicio rápido |
| [`docs/INSTALLATION.md`](./docs/INSTALLATION.md) | Instalación detallada |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | Arquitectura del sistema |
| [`docs/PHASES.md`](./docs/PHASES.md) | Plan de desarrollo por fases |
| [`docs/DESIGN_SYSTEM.md`](./docs/DESIGN_SYSTEM.md) | Sistema de diseño completo |
| [`docs/SECURITY.md`](./docs/SECURITY.md) | Consideraciones de seguridad |
| [`docs/PROJECT_STRUCTURE.md`](./docs/PROJECT_STRUCTURE.md) | Estructura de archivos |

---

## 🤝 Contribución

Este proyecto está en desarrollo activo. Para contribuir:

1. Lee la documentación en `docs/`
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Haz tus cambios siguiendo el sistema de diseño
4. Commit: `git commit -m "Añadir nueva funcionalidad"`
5. Push: `git push origin feature/nueva-funcionalidad`
6. Crea un Pull Request

---

## � Reportar Problemas

Si encuentras un bug o tienes una sugerencia:

1. Verifica que no exista ya un issue similar
2. Crea un nuevo issue con:
   - Descripción clara del problema
   - Pasos para reproducirlo
   - Comportamiento esperado vs. actual
   - Screenshots si aplica

---

## 📄 Licencia

Proyecto privado para uso municipal de Aranjuez, Madrid.

---

## 👨‍💻 Autor

**Joncarre**

- GitHub: [@Joncarre](https://github.com/Joncarre)
- Proyecto: [aplicacion-de-seguimiento](https://github.com/Joncarre/aplicacion-de-seguimiento)

---

## 🙏 Agradecimientos

- Comunidad de Aranjuez
- Conductores de autobuses urbanos
- OpenStreetMap y Leaflet por los mapas

---

<div align="center">

**Estado:** 🟢 En desarrollo activo  
**Fase actual:** Fase 1 - Completada ✅  
**Próxima fase:** Fase 2 - Autenticación y Roles  
**Última actualización:** Noviembre 2025

[⬆ Volver arriba](#-aplicación-de-seguimiento-de-autobuses-urbanos-de-aranjuez)

</div>
