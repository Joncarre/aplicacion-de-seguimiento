# 🏗️ Arquitectura del Sistema

## Visión General

Sistema cliente-servidor con comunicación en tiempo real para seguimiento de autobuses urbanos.

## Componentes Principales

### 1. Frontend (Next.js)

```
frontend/
├── app/
│   ├── layout.tsx              # Layout principal
│   ├── page.tsx                # Pantalla de inicio
│   ├── conductor/              # Rutas para conductores
│   │   ├── auth/               # Autenticación
│   │   └── panel/              # Panel de control
│   └── usuario/                # Rutas para usuarios
│       ├── lineas/             # Selección de línea
│       ├── mapa/               # Visualización de mapa
│       └── llegadas/           # Tiempos de llegada
├── components/
│   ├── ui/                     # Componentes reutilizables
│   ├── maps/                   # Componentes de mapas
│   └── layout/                 # Componentes de layout
├── lib/
│   ├── socket.ts               # Cliente WebSocket
│   ├── geolocation.ts          # Utilidades GPS
│   └── utils.ts                # Utilidades generales
└── public/
    ├── manifest.json           # PWA manifest
    └── icons/                  # Iconos de la app
```

### 2. Backend (Express)

```
backend/
├── src/
│   ├── server.ts               # Punto de entrada
│   ├── controllers/            # Lógica de negocio
│   │   ├── auth.controller.ts
│   │   ├── bus.controller.ts
│   │   └── stop.controller.ts
│   ├── services/               # Servicios
│   │   ├── location.service.ts # Manejo de ubicaciones
│   │   ├── eta.service.ts      # Cálculo de ETA
│   │   └── code.service.ts     # Gestión de códigos
│   ├── middleware/             # Middleware
│   │   ├── auth.middleware.ts
│   │   └── validation.middleware.ts
│   ├── routes/                 # Rutas API
│   │   ├── auth.routes.ts
│   │   ├── bus.routes.ts
│   │   └── stop.routes.ts
│   ├── socket/                 # Manejadores WebSocket
│   │   ├── conductor.socket.ts
│   │   └── usuario.socket.ts
│   └── utils/                  # Utilidades
│       ├── geo.utils.ts        # Cálculos geoespaciales
│       └── validation.utils.ts
└── prisma/
    ├── schema.prisma           # Esquema de base de datos
    └── seed.ts                 # Datos iniciales
```

## Flujo de Datos

### Conductor (Transmisión de Ubicación)

```
Conductor App → WebSocket → Backend → PostgreSQL/PostGIS
                    ↓
              Broadcast → Usuarios suscritos
```

1. Conductor inicia sesión con código
2. App solicita permiso de geolocalización
3. Cada 10 segundos envía coordenadas vía WebSocket
4. Backend valida y almacena en BD
5. Backend hace broadcast a usuarios interesados

### Usuario (Consulta de Llegadas)

```
Usuario App → REST API → Backend → PostgreSQL/PostGIS
                                        ↓
                            Cálculo de ETA (20s de datos)
                                        ↓
Usuario App ← WebSocket ← Backend ← Resultado
```

1. Usuario selecciona línea y parada
2. Frontend espera 20 segundos recopilando datos
3. Backend analiza trayectoria (acercándose/alejándose)
4. Calcula ETA siguiendo ruta de paradas
5. Envía lista ordenada de buses vía WebSocket

## Modelo de Datos

### Entidades Principales

```typescript
// Código de conductor
DriverCode {
  id: string
  code: string (10 dígitos, único)
  isActive: boolean
  assignedTo?: string
  createdAt: DateTime
}

// Línea de autobús
BusLine {
  id: string
  name: string (L1, L2, L3, L4)
  color: string
  stops: Stop[]
  route: Route
}

// Parada
Stop {
  id: string
  name: string
  latitude: decimal
  longitude: decimal
  lines: BusLine[]
  order: { lineId: int }[] // Orden en cada línea
}

// Posición de bus (en tiempo real)
BusLocation {
  id: string
  driverId: string
  lineId: string
  latitude: decimal
  longitude: decimal
  timestamp: DateTime
  heading: decimal
  speed: decimal
}

// Ruta (secuencia ordenada de paradas)
Route {
  id: string
  lineId: string
  stops: Stop[] (ordenadas)
}
```

## Algoritmos Clave

### 1. Detección de Dirección

```typescript
// Esperar 20 segundos (2 muestras)
// Comparar distancia en t=0 y t=20
if (distance_t20 < distance_t0) {
  direction = "approaching"
} else {
  direction = "departing"
}
```

### 2. Cálculo de ETA

```typescript
// NO usar distancia euclidiana
// SÍ usar suma de tiempo entre paradas

function calculateETA(busLocation, targetStop, route) {
  // 1. Encontrar parada más cercana al bus
  const currentStop = findNearestStop(busLocation, route)
  
  // 2. Obtener secuencia de paradas hasta objetivo
  const stopsAhead = getStopsBetween(currentStop, targetStop, route)
  
  // 3. Sumar tiempos estimados entre paradas
  let eta = 0
  for (let i = 0; i < stopsAhead.length - 1; i++) {
    eta += estimateTimeBetweenStops(
      stopsAhead[i], 
      stopsAhead[i+1],
      averageSpeed
    )
  }
  
  return eta
}
```

### 3. Consultas Geoespaciales (PostGIS)

```sql
-- Buses cercanos a una parada (radio 2km)
SELECT * FROM bus_locations
WHERE ST_DWithin(
  location::geography,
  ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
  2000
)
AND line_id = :lineId
AND timestamp > NOW() - INTERVAL '30 seconds';
```

## Comunicación en Tiempo Real

### WebSocket Events

**Conductor:**
- `conductor:connect` - Autenticación inicial
- `conductor:start-shift` - Iniciar jornada
- `conductor:location` - Enviar ubicación (cada 10s)
- `conductor:end-shift` - Finalizar jornada

**Usuario:**
- `user:subscribe-line` - Suscribirse a línea
- `user:request-eta` - Solicitar ETAs
- `server:eta-update` - Recibir actualizaciones
- `server:bus-positions` - Posiciones de buses

## Seguridad

### Medidas Implementadas

1. **Autenticación de Conductores**
   - Códigos únicos de 10 dígitos
   - Validación en cada conexión WebSocket
   - Tokens de sesión con expiración

2. **Validación de Datos**
   - Sanitización de inputs
   - Validación de coordenadas GPS
   - Rate limiting en endpoints

3. **Variables de Entorno**
   - Credenciales de BD
   - Secrets para JWT
   - Configuración de CORS

4. **CORS y Headers**
   - Origen permitido configurado
   - Headers de seguridad (Helmet)

## Escalabilidad

### Consideraciones

1. **Horizontal Scaling**
   - Backend stateless (excepto WebSocket)
   - Redis para sesiones compartidas (futuro)
   - Load balancer con sticky sessions

2. **Base de Datos**
   - Índices en coordenadas (PostGIS)
   - Particionamiento por fecha en locations
   - Limpieza de datos antiguos (>24h)

3. **Caché**
   - Rutas y paradas (raramente cambian)
   - ETAs calculados (TTL 10s)

## Performance

### Optimizaciones

- Debouncing en actualizaciones de mapa
- Lazy loading de componentes pesados
- Service Worker para caché de assets
- Compresión gzip en respuestas
- Queries optimizadas con índices espaciales

## Monitoreo

### Métricas Clave

- Latencia de WebSocket
- Precisión de ETAs vs. llegadas reales
- Uso de memoria y CPU
- Número de conexiones activas
- Errores de geolocalización

---

**Versión:** 1.0  
**Fecha:** Noviembre 2025
