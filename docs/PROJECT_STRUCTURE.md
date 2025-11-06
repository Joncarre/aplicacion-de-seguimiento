# Estructura del Proyecto

```
aplicacion-de-seguimiento/
│
├── frontend/                          # Aplicación Next.js
│   ├── app/                           # App Router (Next.js 14)
│   │   ├── layout.tsx                 # Layout raíz
│   │   ├── page.tsx                   # Página de inicio
│   │   ├── globals.css                # Estilos globales + Tailwind
│   │   ├── conductor/                 # Rutas para conductores
│   │   │   ├── page.tsx               # Pantalla de autenticación
│   │   │   └── panel/                 # Panel de control
│   │   │       └── page.tsx           # Comenzar/Finalizar trayecto
│   │   └── usuario/                   # Rutas para usuarios
│   │       ├── page.tsx               # Selección de línea
│   │       ├── mapa/                  # Visualización de mapa
│   │       │   └── [lineaId]/
│   │       │       └── page.tsx       # Mapa con paradas
│   │       └── llegadas/              # Tiempos de llegada
│   │           └── [paradaId]/
│   │               └── page.tsx       # Lista de buses cercanos
│   │
│   ├── components/                    # Componentes React
│   │   ├── ui/                        # Componentes de UI reutilizables
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── BackButton.tsx
│   │   ├── layout/                    # Componentes de layout
│   │   │   ├── Header.tsx
│   │   │   └── Container.tsx
│   │   ├── maps/                      # Componentes de mapas
│   │   │   ├── MapView.tsx            # Contenedor del mapa
│   │   │   ├── StopMarker.tsx         # Marcador de parada
│   │   │   ├── BusMarker.tsx          # Marcador de bus
│   │   │   └── UserMarker.tsx         # Marcador de usuario
│   │   └── conductor/                 # Componentes específicos conductor
│   │       └── LocationTransmitter.tsx
│   │
│   ├── lib/                           # Utilidades y configuración
│   │   ├── socket.ts                  # Cliente WebSocket
│   │   ├── geolocation.ts             # Utilidades de geolocalización
│   │   ├── api.ts                     # Cliente API HTTP
│   │   ├── utils.ts                   # Utilidades generales
│   │   └── constants.ts               # Constantes (colores, etc)
│   │
│   ├── types/                         # Tipos TypeScript
│   │   ├── bus.ts
│   │   ├── line.ts
│   │   ├── stop.ts
│   │   └── location.ts
│   │
│   ├── hooks/                         # Custom hooks
│   │   ├── useGeolocation.ts
│   │   ├── useSocket.ts
│   │   └── useBusTracking.ts
│   │
│   ├── public/                        # Assets estáticos
│   │   ├── manifest.json              # PWA manifest
│   │   ├── sw.js                      # Service Worker
│   │   ├── icons/                     # Iconos de la app
│   │   │   ├── icon-72x72.png
│   │   │   ├── icon-96x96.png
│   │   │   ├── icon-128x128.png
│   │   │   ├── icon-144x144.png
│   │   │   ├── icon-152x152.png
│   │   │   ├── icon-192x192.png
│   │   │   ├── icon-384x384.png
│   │   │   └── icon-512x512.png
│   │   └── favicon.ico
│   │
│   ├── .env.local.example             # Ejemplo de variables de entorno
│   ├── next.config.js                 # Configuración Next.js
│   ├── tailwind.config.ts             # Configuración Tailwind
│   ├── tsconfig.json                  # Configuración TypeScript
│   └── package.json
│
├── backend/                           # API y WebSocket server
│   ├── src/
│   │   ├── server.ts                  # Punto de entrada
│   │   ├── app.ts                     # Configuración Express
│   │   │
│   │   ├── controllers/               # Controladores (lógica de negocio)
│   │   │   ├── auth.controller.ts     # Autenticación
│   │   │   ├── bus.controller.ts      # Gestión de buses
│   │   │   ├── line.controller.ts     # Gestión de líneas
│   │   │   ├── stop.controller.ts     # Gestión de paradas
│   │   │   └── location.controller.ts # Ubicaciones
│   │   │
│   │   ├── services/                  # Servicios (lógica de aplicación)
│   │   │   ├── auth.service.ts        # Validación de códigos
│   │   │   ├── location.service.ts    # Procesamiento de ubicaciones
│   │   │   ├── eta.service.ts         # Cálculo de ETA
│   │   │   ├── direction.service.ts   # Detección de dirección
│   │   │   └── code.service.ts        # Gestión de códigos
│   │   │
│   │   ├── routes/                    # Definición de rutas
│   │   │   ├── index.ts               # Router principal
│   │   │   ├── auth.routes.ts
│   │   │   ├── bus.routes.ts
│   │   │   ├── line.routes.ts
│   │   │   └── stop.routes.ts
│   │   │
│   │   ├── socket/                    # Manejadores WebSocket
│   │   │   ├── index.ts               # Configuración Socket.io
│   │   │   ├── auth.socket.ts         # Autenticación WS
│   │   │   ├── conductor.socket.ts    # Eventos de conductor
│   │   │   └── usuario.socket.ts      # Eventos de usuario
│   │   │
│   │   ├── middleware/                # Middleware Express
│   │   │   ├── auth.middleware.ts     # Verificación de token
│   │   │   ├── validation.middleware.ts # Validación de datos
│   │   │   ├── error.middleware.ts    # Manejo de errores
│   │   │   └── rateLimiter.middleware.ts
│   │   │
│   │   ├── utils/                     # Utilidades
│   │   │   ├── geo.utils.ts           # Cálculos geoespaciales
│   │   │   ├── validation.utils.ts    # Validaciones
│   │   │   ├── logger.ts              # Sistema de logs
│   │   │   └── constants.ts           # Constantes
│   │   │
│   │   └── types/                     # Tipos TypeScript
│   │       ├── express.d.ts           # Extensiones de Express
│   │       └── socket.d.ts            # Tipos de Socket.io
│   │
│   ├── prisma/                        # Prisma ORM
│   │   ├── schema.prisma              # Esquema de BD
│   │   ├── seed.ts                    # Datos iniciales
│   │   └── migrations/                # Migraciones (auto-generadas)
│   │
│   ├── scripts/                       # Scripts útiles
│   │   ├── generate-codes.ts          # Generar códigos de conductor
│   │   └── clean-old-data.ts          # Limpiar datos antiguos
│   │
│   ├── .env.example                   # Ejemplo de variables de entorno
│   ├── tsconfig.json
│   └── package.json
│
├── docs/                              # Documentación
│   ├── ARCHITECTURE.md                # Arquitectura del sistema
│   ├── PHASES.md                      # Fases de desarrollo
│   ├── DESIGN_SYSTEM.md               # Sistema de diseño
│   ├── SECURITY.md                    # Consideraciones de seguridad
│   ├── API.md                         # Documentación de API
│   └── DEPLOYMENT.md                  # Guía de despliegue
│
├── .gitignore
├── README.md
└── PROJECT_STRUCTURE.md               # Este archivo
```

## Descripción de Carpetas Principales

### Frontend (`/frontend`)

- **`app/`**: Sistema de rutas de Next.js 14 (App Router)
- **`components/`**: Componentes React reutilizables
- **`lib/`**: Lógica de cliente (API, WebSocket, utilidades)
- **`hooks/`**: Custom hooks de React
- **`types/`**: Definiciones de tipos TypeScript
- **`public/`**: Assets estáticos y configuración PWA

### Backend (`/backend`)

- **`controllers/`**: Lógica de negocio para cada ruta
- **`services/`**: Lógica de aplicación reutilizable
- **`routes/`**: Definición de endpoints REST
- **`socket/`**: Manejadores de eventos WebSocket
- **`middleware/`**: Funciones intermedias de Express
- **`prisma/`**: ORM y migraciones de base de datos
- **`utils/`**: Utilidades generales

### Documentación (`/docs`)

- Documentación técnica completa
- Guías de desarrollo
- Especificaciones de diseño

## Flujo de Archivos por Funcionalidad

### Autenticación de Conductor

1. Frontend: `app/conductor/page.tsx` → Input de código
2. Frontend: `lib/api.ts` → Llamada POST /api/auth/validate
3. Backend: `routes/auth.routes.ts` → Ruta
4. Backend: `controllers/auth.controller.ts` → Validación
5. Backend: `services/auth.service.ts` → Lógica de negocio
6. Backend: Prisma → Consulta a BD

### Transmisión de Ubicación

1. Frontend: `app/conductor/panel/page.tsx` → Botón "Comenzar"
2. Frontend: `hooks/useGeolocation.ts` → Obtener GPS
3. Frontend: `lib/socket.ts` → Emitir `conductor:location`
4. Backend: `socket/conductor.socket.ts` → Recibir evento
5. Backend: `services/location.service.ts` → Procesar y guardar
6. Backend: Prisma → Guardar en BD
7. Backend: `socket/usuario.socket.ts` → Broadcast a usuarios

### Consulta de Llegadas

1. Frontend: `app/usuario/llegadas/[paradaId]/page.tsx` → Seleccionar parada
2. Frontend: Esperar 20 segundos (UI loading)
3. Frontend: `lib/api.ts` → GET /api/stops/:id/arrivals
4. Backend: `routes/stop.routes.ts` → Ruta
5. Backend: `controllers/stop.controller.ts` → Procesar petición
6. Backend: `services/direction.service.ts` → Detectar dirección
7. Backend: `services/eta.service.ts` → Calcular tiempos
8. Backend: Respuesta con lista ordenada de buses
9. Frontend: Mostrar lista

## Convenciones de Nombres

### Archivos
- Componentes: `PascalCase.tsx` (ej: `Button.tsx`)
- Utilidades: `camelCase.ts` (ej: `utils.ts`)
- Tipos: `camelCase.ts` (ej: `bus.ts`)
- Rutas API: `kebab-case.routes.ts` (ej: `auth.routes.ts`)

### Código
- Componentes: `PascalCase`
- Funciones: `camelCase`
- Constantes: `UPPER_SNAKE_CASE`
- Tipos/Interfaces: `PascalCase`

### Branches Git
- Features: `feature/nombre-descriptivo`
- Fixes: `fix/nombre-del-bug`
- Docs: `docs/tema`

## Tecnologías por Capa

### Frontend
- **Framework:** Next.js 14 (React 18)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Mapas:** React-Leaflet
- **WebSocket:** Socket.io-client
- **HTTP:** Fetch API
- **Iconos:** Lucide React

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express
- **Lenguaje:** TypeScript
- **WebSocket:** Socket.io
- **ORM:** Prisma
- **Validación:** Zod
- **Seguridad:** Helmet, CORS, bcrypt
- **Logs:** Winston

### Base de Datos
- **DBMS:** PostgreSQL 14+
- **Extensión:** PostGIS (geoespacial)
- **Migraciones:** Prisma Migrate

### DevOps
- **Control de versiones:** Git
- **Package manager:** npm
- **Deployment:** Vercel (frontend), Railway/Render (backend)

---

**Nota:** Esta estructura está diseñada para ser escalable y fácil de mantener. Cada capa tiene responsabilidades bien definidas y está desacoplada de las demás.

**Última actualización:** Noviembre 2025
