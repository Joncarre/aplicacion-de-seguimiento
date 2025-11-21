# Guía de Despliegue en Railway

Esta guía te llevará paso a paso para desplegar tu aplicación de seguimiento de autobuses en Railway.

---

## Requisitos Previos

✅ Tienes un servicio PostgreSQL en Railway:
- **TCP**: `crossover.proxy.rlwy.net:55761`

✅ Tu código está en un repositorio Git (GitHub, GitLab, o Bitbucket)

✅ Has hecho commit de los archivos `railway.json` en ambas carpetas (backend y frontend)

---

## Variables de Entorno Necesarias

Antes de empezar, ten preparados estos valores:

### Para el Backend

```env
# Database
DATABASE_URL=postgresql://usuario:contraseña@crossover.proxy.rlwy.net:55761/nombre_bd

# Server
NODE_ENV=production
PORT=3001

# Security (genera valores aleatorios seguros)
JWT_SECRET=<genera un valor aleatorio de 64 caracteres>
SESSION_SECRET=<genera un valor aleatorio de 64 caracteres>
ADMIN_KEY=<genera un valor aleatorio de 32 caracteres>
BCRYPT_ROUNDS=10

# CORS (se actualizará después con el dominio del frontend)
ALLOWED_ORIGINS=https://tu-frontend.up.railway.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info

# Location Configuration (Aranjuez)
LOCATION_MIN_LAT=39.95
LOCATION_MAX_LAT=40.10
LOCATION_MIN_LNG=-3.70
LOCATION_MAX_LNG=-3.50

# Bus tracking settings
LOCATION_UPDATE_INTERVAL=10000
DIRECTION_DETECTION_DELAY=20000
OLD_DATA_CLEANUP_HOURS=24
```

### Para el Frontend

```env
# API URLs (se actualizarán después con el dominio del backend)
NEXT_PUBLIC_API_URL=https://tu-backend.up.railway.app
NEXT_PUBLIC_WS_URL=https://tu-backend.up.railway.app

# App Configuration
NEXT_PUBLIC_APP_NAME=Autobuses Aranjuez
NEXT_PUBLIC_APP_DESCRIPTION=Seguimiento de autobuses urbanos de Aranjuez

# Map Configuration
NEXT_PUBLIC_MAP_CENTER_LAT=40.0333
NEXT_PUBLIC_MAP_CENTER_LNG=-3.6000
NEXT_PUBLIC_MAP_DEFAULT_ZOOM=14

# Feature Flags
NEXT_PUBLIC_ENABLE_DEBUG=false
```

---

## Paso 1: Subir el Código a GitHub (si no lo has hecho)

```bash
# En la raíz del proyecto
git add .
git commit -m "Add Railway configuration files"
git push origin main
```

---

## Paso 2: Crear Servicio del Backend

### 2.1. En Railway Dashboard

1. Ve a [Railway](https://railway.app/)
2. Inicia sesión y abre tu proyecto (o crea uno nuevo)
3. Haz clic en **"+ New"** → **"GitHub Repo"**
4. Selecciona tu repositorio `aplicacion-de-seguimiento`

### 2.2. Configurar el Backend

1. Railway detectará el repositorio automáticamente
2. Haz clic en el servicio que se creó
3. Ve a **Settings** y configura:
   - **Root Directory**: `backend`
   - **Build Command**: (se usa el de `railway.json` automáticamente)
   - **Start Command**: (se usa el de `railway.json` automáticamente)

### 2.3. Agregar Variables de Entorno

1. Ve a la pestaña **Variables**
2. Haz clic en **"+ New Variable"**
3. Agrega **TODAS** las variables del backend listadas arriba
   
   > ⚠️ **IMPORTANTE**: Para `DATABASE_URL`, obtén la URL completa desde tu servicio PostgreSQL:
   > - Ve al servicio PostgreSQL en Railway
   > - Ve a la pestaña **Connect**
   > - Copia el valor de **Database URL** (formato: `postgresql://usuario:contraseña@host:puerto/database`)

4. Haz clic en **"Deploy"** o espera a que se despliegue automáticamente

### 2.4. Obtener el Dominio del Backend

1. Ve a la pestaña **Settings** del servicio backend
2. En la sección **Networking**, haz clic en **"Generate Domain"**
3. Copia el dominio generado (ejemplo: `bus-tracking-backend-production.up.railway.app`)

---

## Paso 3: Crear Servicio del Frontend

### 3.1. Agregar Nuevo Servicio

1. En el mismo proyecto de Railway, haz clic en **"+ New"** → **"GitHub Repo"**
2. Selecciona el MISMO repositorio `aplicacion-de-seguimiento`
3. Railway creará otro servicio

### 3.2. Configurar el Frontend

1. Haz clic en el nuevo servicio
2. Ve a **Settings** y configura:
   - **Root Directory**: `frontend`
   - **Build Command**: (se usa el de `railway.json` automáticamente)
   - **Start Command**: (se usa el de `railway.json` automáticamente)

### 3.3. Agregar Variables de Entorno

1. Ve a la pestaña **Variables**
2. Agrega las variables del frontend listadas arriba
3. **IMPORTANTE**: Reemplaza `tu-backend.up.railway.app` con el dominio real del backend que copiaste en el Paso 2.4

4. Haz clic en **"Deploy"**

### 3.4. Obtener el Dominio del Frontend

1. Ve a la pestaña **Settings** del servicio frontend
2. En la sección **Networking**, haz clic en **"Generate Domain"**
3. Copia el dominio generado (ejemplo: `bus-tracking-frontend-production.up.railway.app`)

---

## Paso 4: Actualizar CORS en el Backend

Ahora que tienes el dominio del frontend, debes actualizar la variable `ALLOWED_ORIGINS` en el backend:

1. Ve al servicio **backend** en Railway
2. Ve a la pestaña **Variables**
3. Edita `ALLOWED_ORIGINS` y cámbialo a:
   ```
   https://tu-dominio-frontend.up.railway.app
   ```
4. El servicio se redesplega automáticamente

---

## Paso 5: Ejecutar Migraciones de Base de Datos

Las migraciones se ejecutan automáticamente al iniciar el backend gracias al script `start:migrate`, pero es bueno verificar:

1. Ve al servicio **backend** en Railway
2. Ve a la pestaña **Deployments**
3. Haz clic en el despliegue más reciente
4. Revisa los logs y verifica que veas:
   ```
   ✓ Generated Prisma Client
   ✓ Migrations applied successfully
   ```

Si hay errores, revisa la configuración de `DATABASE_URL`.

---

## Paso 6: Generar Códigos de Conductor

Necesitas generar códigos de conductor para que los conductores puedan autenticarse:

### Opción A: Manualmente desde tu máquina local

```bash
# En la carpeta backend
npm run generate-codes

# Esto creará el archivo backend/generated/driver-codes.txt
# Los códigos se guardarán en la base de datos de Railway
```

⚠️ **IMPORTANTE**: Asegúrate de que tu `.env` local tenga la `DATABASE_URL` de Railway para que los códigos se guarden en la base de datos de producción.

### Opción B: Usando Railway CLI (recomendado para producción)

1. Instala la Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Autentícate:
   ```bash
   railway login
   ```

3. Vincula tu proyecto:
   ```bash
   railway link
   ```

4. Ejecuta el comando en Railway:
   ```bash
   railway run --service backend npm run generate-codes
   ```

---

## Paso 7: Verificación

### 7.1. Verificar Backend

Abre en tu navegador:
```
https://tu-backend.up.railway.app/
```

Deberías ver un mensaje o respuesta del servidor.

### 7.2. Verificar Frontend

Abre en tu navegador:
```
https://tu-frontend.up.railway.app/
```

Deberías ver la aplicación de seguimiento de autobuses cargada correctamente.

### 7.3. Verificar Base de Datos

1. Ve al servicio PostgreSQL en Railway
2. Ve a la pestaña **Data**
3. Verifica que las tablas estén creadas:
   - `driver_codes`
   - `sessions`
   - `bus_lines`
   - `stops`
   - `bus_locations`
   - etc.

### 7.4. Verificar Logs

1. En cada servicio (backend y frontend), ve a la pestaña **Deployments**
2. Haz clic en el deployment activo
3. Revisa los logs en busca de errores

---

## Paso 8: Prueba End-to-End

1. **Autenticación de Conductor**:
   - Ve a `https://tu-frontend.up.railway.app/driver`
   - Ingresa uno de los códigos generados
   - Verifica que puedas iniciar sesión

2. **Transmisión de Ubicación**:
   - Como conductor autenticado, inicia un trayecto
   - Permite el acceso a la ubicación GPS
   - Verifica que se envíen las ubicaciones

3. **Visualización en Tiempo Real**:
   - Abre otra pestaña en `https://tu-frontend.up.railway.app/`
   - Verifica que veas el autobús en el mapa
   - Confirma que la posición se actualiza en tiempo real

---

## Problemas Comunes y Soluciones

### El backend no se conecta a la base de datos

- Verifica que `DATABASE_URL` esté correctamente configurada
- Asegúrate de incluir el puerto `:55761` en la URL
- Verifica que el formato sea: `postgresql://user:pass@host:port/database`

### CORS Error en el frontend

- Verifica que `ALLOWED_ORIGINS` en el backend tenga el dominio correcto del frontend
- Asegúrate de incluir `https://` en la URL
- Redesplegar el backend después de cambiar esta variable

### Las migraciones no se ejecutan

- Revisa los logs del deployment en Railway
- Verifica que el script `start:migrate` esté en `package.json`
- Asegúrate de que `DATABASE_URL` esté disponible

### WebSocket no funciona

- Verifica que `NEXT_PUBLIC_WS_URL` apunte al dominio correcto del backend
- Asegúrate de usar `https://` (no `http://`)
- Revisa los logs del navegador (F12) para ver errores de conexión

### El mapa no se muestra

- Abre la consola del navegador (F12)
- Busca errores relacionados con Leaflet o la API de mapas
- Verifica que las variables de configuración del mapa estén correctas

---

## Comandos Útiles de Railway CLI

```bash
# Ver logs en tiempo real del backend
railway logs --service backend

# Ver logs en tiempo real del frontend
railway logs --service frontend

# Ejecutar comandos en el contexto del backend
railway run --service backend <comando>

# Ver variables de entorno
railway variables

# Redeploy manual
railway up --service backend
railway up --service frontend
```

---

## Dominios Personalizados (Opcional)

Si tienes un dominio propio:

1. Ve al servicio (backend o frontend) en Railway
2. Ve a **Settings** → **Networking**
3. En **Custom Domain**, agrega tu dominio
4. Configura los registros DNS según las instrucciones de Railway
5. Actualiza las variables de entorno que referencian las URLs

---

## Siguientes Pasos

✅ Tu aplicación está desplegada y funcionando

**Tareas recomendadas:**

1. **Configurar Monitoreo**: Activa las alertas en Railway para estar informado de problemas
2. **Backups de Base de Datos**: Configura backups automáticos del PostgreSQL
3. **Agregar Datos de Prueba**: Usa Prisma Studio o scripts para agregar líneas, paradas, y rutas
4. **Documentar Códigos**: Guarda los códigos de conductor en un lugar seguro
5. **Testing**: Realiza pruebas exhaustivas de todas las funcionalidades

---

## Recursos Adicionales

- [Documentación de Railway](https://docs.railway.app/)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [Prisma Deploy](https://www.prisma.io/docs/guides/migrate/production-troubleshooting)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**¡Felicidades! 🎉** Tu aplicación de seguimiento de autobuses está desplegada y lista para usar.
