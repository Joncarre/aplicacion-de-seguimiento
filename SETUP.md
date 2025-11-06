# Instrucciones de Instalación - LÉEME PRIMERO

## ⚡ Inicio Rápido

Para configurar el proyecto completo, sigue estos pasos:

### 1️⃣ Requisitos Previos

Instala:
- **Node.js 18+**: https://nodejs.org/
- **PostgreSQL 14+**: https://www.postgresql.org/download/
- **PostGIS**: Durante la instalación de PostgreSQL, usa Stack Builder para instalar PostGIS

### 2️⃣ Configurar Base de Datos

```powershell
# Conectarse a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE bus_tracking;
\c bus_tracking
CREATE EXTENSION IF NOT EXISTS postgis;
```

### 3️⃣ Instalar Backend

```powershell
cd backend
npm install
copy .env.example .env
# Edita .env con tu configuración de PostgreSQL
npm run prisma:migrate
npm run generate-codes
npm run dev
```

### 4️⃣ Instalar Frontend

```powershell
# En otra terminal
cd frontend
npm install
copy .env.local.example .env.local
npm run dev
```

### 5️⃣ Abrir la Aplicación

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 📖 Documentación Completa

Para instrucciones detalladas, ve a: `docs/INSTALLATION.md`

## 🎯 Estado del Proyecto

**Fase actual:** Fase 1 - Setup y Estructura Base ✅

**Siguiente:** Fase 2 - Autenticación y Roles

## 📂 Estructura

```
frontend/    → Aplicación Next.js (puerto 3000)
backend/     → API + WebSocket (puerto 3001)
docs/        → Documentación completa
```

## ❓ ¿Problemas?

Consulta `docs/INSTALLATION.md` para solución de problemas comunes.
