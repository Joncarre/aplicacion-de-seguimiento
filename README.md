# Aplicación de Seguimiento de Autobuses Urbanos de Aranjuez

Sistema de seguimiento en tiempo real de autobuses urbanos en Aranjuez, Madrid.

---

## Descripción

Aplicación web que permite el seguimiento GPS en tiempo real de los autobuses urbanos de Aranjuez. Los conductores transmiten su ubicación cada 10 segundos, permitiendo a los usuarios conocer la posición exacta de cada bus y estimar tiempos de llegada precisos.

### Problema que Resuelve

Las aplicaciones como Google Maps solo hacen estimaciones basadas en horarios, sin datos en tiempo real. Esta aplicación proporciona la ubicación exacta de cada autobús, eliminando la incertidumbre sobre cuándo llegará el siguiente bus.

---

## Stack Tecnológico

### Frontend
- Next.js 14 (App Router)
- TypeScript 5.6
- Tailwind CSS 3.4
- React-Leaflet (mapas interactivos)
- Socket.io-client (tiempo real)

### Backend
- Node.js 18+ + Express
- TypeScript
- Socket.io (WebSockets)
- PostgreSQL 14+
- Prisma ORM

---

## Funcionalidades

### Para Usuarios
- Visualización de líneas de bus (L1, L2, L3, L4)
- Mapa interactivo con todas las paradas
- Ubicación en tiempo real de cada autobús
- Tiempo estimado de llegada preciso
- Detección inteligente de dirección del bus
- Interfaz responsive mobile-first

### Para Conductores
- Autenticación mediante código único de 10 dígitos
- Transmisión automática de GPS cada 10 segundos
- Control simple: botones para iniciar/finalizar trayecto
- Panel optimizado para uso durante conducción

---

## Características Técnicas

- **Autenticación:** Códigos únicos hasheados con bcrypt
- **Tiempo real:** WebSockets mediante Socket.io
- **Geolocalización:** API de Geolocation del navegador
- **Base de datos:** PostgreSQL con capacidad para PostGIS
- **Seguridad:** CORS, Helmet, rate limiting, validaciones cliente/servidor
- **PWA:** Instalable en dispositivos móviles

---

## Estructura del Proyecto

```
aplicacion-de-seguimiento/
├── backend/              # API REST + WebSocket
│   ├── src/             # Código fuente
│   ├── prisma/          # Esquema de base de datos
│   └── scripts/         # Utilidades (generación de códigos)
├── frontend/            # Aplicación Next.js
│   ├── app/            # Páginas y rutas
│   ├── components/     # Componentes React
│   └── lib/            # Utilidades y configuración
└── docs/               # Documentación técnica
```

---

## Líneas de Autobús

| Línea | Color | Hex |
|-------|-------|-----|
| L1 | Verde Claro | #86efac |
| L2 | Esmeralda | #6ee7b7 |
| L3 | Teal | #5eead4 |
| L4 | Cielo | #7dd3fc |

---

## Estado del Desarrollo

| Fase | Estado | Descripción |
|------|--------|-------------|
| Fase 1 | ✓ Completada | Estructura y configuración base |
| Fase 2 | ✓ Completada | Autenticación y roles |
| Fase 3 | En desarrollo | Panel de conductor |
| Fase 4 | Pendiente | Panel de usuario |
| Fase 5 | Pendiente | Cálculo de llegadas |
| Fase 6 | Pendiente | Optimización y tiempo real |
| Fase 7 | Pendiente | Testing y despliegue |

**Progreso:** 29% (2/7 fases completadas)

---

## Configuración de Desarrollo

### Requisitos
- Node.js 18+
- PostgreSQL 14+
- npm

### Variables de Entorno

**Backend (.env):**
```env
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/bus_tracking"
JWT_SECRET=your-secret
SESSION_SECRET=your-secret
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

### Instalación

```bash
# Backend
cd backend
npm install
npx prisma migrate dev
npm run generate-codes
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

---

## Documentación Técnica

- `docs/ARCHITECTURE.md` - Arquitectura del sistema
- `docs/PHASES.md` - Fases de desarrollo
- `docs/DESIGN_SYSTEM.md` - Sistema de diseño
- `docs/SECURITY.md` - Consideraciones de seguridad
- `docs/PROJECT_STRUCTURE.md` - Estructura de archivos

---

## Licencia

Proyecto privado - Autobuses Urbanos de Aranjuez

---

**Última actualización:** 7 de Noviembre de 2025  
**Versión:** 1.0.0 (Fase 2 completada)
