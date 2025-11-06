# 🚀 Guía de Instalación y Configuración

Esta guía te ayudará a configurar el proyecto completo en tu entorno local.

## 📋 Requisitos Previos

Asegúrate de tener instalado:

- **Node.js** 18.x o superior ([Descargar](https://nodejs.org/))
- **PostgreSQL** 14.x o superior ([Descargar](https://www.postgresql.org/download/))
- **PostGIS** (extensión de PostgreSQL) ([Guía de instalación](https://postgis.net/install/))
- **npm** (viene con Node.js)
- **Git** ([Descargar](https://git-scm.com/))

## 🗄️ Configuración de la Base de Datos

### 1. Instalar PostgreSQL con PostGIS

#### Windows
```powershell
# Descargar e instalar PostgreSQL desde:
# https://www.postgresql.org/download/windows/

# Durante la instalación, asegúrate de instalar también Stack Builder
# Luego, desde Stack Builder, instala PostGIS
```

### 2. Crear la Base de Datos

```sql
-- Conectarse a PostgreSQL como superusuario
psql -U postgres

-- Crear la base de datos
CREATE DATABASE bus_tracking;

-- Conectarse a la nueva base de datos
\c bus_tracking

-- Habilitar la extensión PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Verificar que PostGIS está instalado
SELECT PostGIS_version();

-- Crear usuario para la aplicación (opcional pero recomendado)
CREATE USER bus_app WITH PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE bus_tracking TO bus_app;
GRANT ALL ON SCHEMA public TO bus_app;
```

## 🔧 Instalación del Backend

### 1. Navegar a la carpeta del backend

```powershell
cd backend
```

### 2. Instalar dependencias

```powershell
npm install
```

### 3. Configurar variables de entorno

```powershell
# Copiar el archivo de ejemplo
copy .env.example .env

# Editar .env con tus valores
notepad .env
```

Actualiza estos valores en `.env`:

```env
DATABASE_URL="postgresql://bus_app:tu_password_seguro@localhost:5432/bus_tracking?schema=public"
JWT_SECRET=genera-un-secret-aleatorio-aqui
SESSION_SECRET=genera-otro-secret-aqui
ADMIN_KEY=genera-admin-key-aqui
```

**Nota:** Para generar secrets seguros, puedes usar:
```powershell
# En PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 4. Configurar Prisma

```powershell
# Generar el cliente de Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# (Opcional) Abrir Prisma Studio para ver la BD
npm run prisma:studio
```

### 5. Generar códigos de conductor

```powershell
npm run generate-codes
```

Esto generará 30 códigos únicos y los guardará en `driver-codes.txt`. **¡Guarda este archivo de forma segura!**

### 6. Iniciar el servidor

```powershell
# Modo desarrollo (con hot reload)
npm run dev

# O en modo producción
npm run build
npm start
```

El servidor estará corriendo en `http://localhost:3001`

## 🎨 Instalación del Frontend

### 1. Abrir una nueva terminal y navegar al frontend

```powershell
cd frontend
```

### 2. Instalar dependencias

```powershell
npm install
```

### 3. Configurar variables de entorno

```powershell
# Copiar el archivo de ejemplo
copy .env.local.example .env.local

# Editar .env.local (opcional, los valores por defecto deberían funcionar)
notepad .env.local
```

Valores por defecto:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

### 4. Iniciar la aplicación

```powershell
# Modo desarrollo
npm run dev

# O construir para producción
npm run build
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## ✅ Verificar la Instalación

### Backend
1. Abre `http://localhost:3001` en tu navegador
2. Deberías ver un mensaje de la API

### Frontend
1. Abre `http://localhost:3000` en tu navegador
2. Deberías ver la pantalla de inicio con las opciones "Soy usuario" y "Soy conductor"

### Base de Datos
```powershell
cd backend
npm run prisma:studio
```

Esto abrirá una interfaz web donde puedes ver todas las tablas creadas.

## 🔍 Scripts Útiles

### Backend

```powershell
npm run dev              # Ejecutar en modo desarrollo
npm run build            # Construir para producción
npm run start            # Iniciar en modo producción
npm run prisma:migrate   # Ejecutar migraciones
npm run prisma:studio    # Abrir Prisma Studio
npm run generate-codes   # Generar nuevos códigos de conductor
npm run type-check       # Verificar tipos TypeScript
```

### Frontend

```powershell
npm run dev              # Ejecutar en modo desarrollo
npm run build            # Construir para producción
npm run start            # Iniciar en modo producción
npm run lint             # Ejecutar linter
npm run type-check       # Verificar tipos TypeScript
```

## 🐛 Solución de Problemas

### Error: "PostGIS extension not found"

**Solución:**
```sql
-- Conectarse a la base de datos
psql -U postgres -d bus_tracking

-- Intentar crear la extensión manualmente
CREATE EXTENSION IF NOT EXISTS postgis;
```

Si esto falla, reinstala PostGIS desde Stack Builder.

### Error: "Port 3000 already in use"

**Solución:**
```powershell
# Cambiar el puerto en package.json o usar:
$env:PORT=3002; npm run dev
```

### Error: "Cannot connect to database"

**Solución:**
1. Verifica que PostgreSQL esté corriendo:
   ```powershell
   # En Servicios de Windows, busca "postgresql"
   # O desde línea de comandos:
   pg_ctl status
   ```

2. Verifica la cadena de conexión en `.env`
3. Verifica que el usuario tenga permisos

### Error: Prisma migration fails

**Solución:**
```powershell
# Resetear la base de datos (¡CUIDADO! Esto borra todos los datos)
npm run prisma:migrate reset

# O crear una nueva migración
npx prisma migrate dev --name fix_migration
```

## 📱 Probar en Móvil (en la misma red)

### 1. Obtener tu IP local

```powershell
ipconfig
```

Busca la IPv4 (ejemplo: `192.168.1.100`)

### 2. Actualizar variables de entorno del frontend

En `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://192.168.1.100:3001
NEXT_PUBLIC_WS_URL=http://192.168.1.100:3001
```

### 3. Actualizar CORS en el backend

En `backend/.env`:
```env
ALLOWED_ORIGINS=http://localhost:3000,http://192.168.1.100:3000
```

### 4. Reiniciar ambos servidores

### 5. Acceder desde el móvil

En el navegador del móvil: `http://192.168.1.100:3000`

## 🔐 Seguridad en Desarrollo

- **NO** subas el archivo `.env` a Git (ya está en `.gitignore`)
- **NO** compartas los códigos de conductor públicamente
- Cambia todos los secrets antes de producción
- Usa HTTPS en producción

## 📚 Próximos Pasos

Una vez que todo esté instalado y funcionando:

1. ✅ **Fase 1 completada** - ¡Felicidades!
2. 📝 Continúa con **Fase 2**: Implementar autenticación y roles
3. 📖 Lee la documentación en `docs/` para entender la arquitectura

## 💬 ¿Necesitas Ayuda?

- Revisa la documentación en la carpeta `docs/`
- Consulta los logs en consola para ver errores específicos
- Usa Prisma Studio para inspeccionar la base de datos

---

**¡Todo listo!** Ahora tienes un entorno de desarrollo completo funcionando. 🎉
