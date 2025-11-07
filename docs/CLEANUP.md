# 🧹 Sistema de Limpieza Automática de Ubicaciones

## Descripción

Este sistema realiza una limpieza automática de todas las ubicaciones GPS almacenadas en la base de datos cada noche a las **4:00 AM (hora de España)**.

## ¿Por qué es necesario?

- Los autobuses operan hasta aproximadamente las 1:00-2:00 AM
- Las ubicaciones GPS se generan cada 10 segundos durante el servicio
- Sin limpieza, se acumularían ~17,000 ubicaciones diarias (2.5 MB/día)
- La limpieza nocturna mantiene la BD ligera y con datos relevantes

## Estrategia Implementada

**Limpieza Total Nocturna (4:00 AM)**
- ✅ Borra todas las ubicaciones de la tabla `bus_locations`
- ✅ Registra estadísticas en logs antes de borrar
- ✅ Resetea datos para el nuevo día de operación
- ✅ Mantiene la BD en tamaño mínimo (~5 MB máximo)

## Uso Manual

Para ejecutar la limpieza manualmente (testing o mantenimiento):

```bash
cd backend
npm run cleanup
```

Salida esperada:
```
═══════════════════════════════════════════════════
🧹 LIMPIEZA NOCTURNA DE UBICACIONES
═══════════════════════════════════════════════════

⏰ Hora de ejecución: 07/11/2025, 16:30:45

📊 RESUMEN:
   • Ubicaciones eliminadas: 1,234
   • Total previo: 1,234

📍 Por línea:
   • Línea L1: 310 ubicaciones
   • Línea L2: 305 ubicaciones
   • Línea L3: 308 ubicaciones
   • Línea L4: 311 ubicaciones

✅ Limpieza completada exitosamente
═══════════════════════════════════════════════════
```

## Configuración Automática

### Opción 1: Windows (Programador de Tareas)

1. Abrir **Programador de Tareas** (Task Scheduler)
2. Crear **Tarea Básica**
3. Configurar:
   - **Nombre:** Limpieza Ubicaciones Buses
   - **Desencadenador:** Diariamente a las 4:00 AM
   - **Acción:** Iniciar un programa
   - **Programa:** `C:\Program Files\nodejs\npm.cmd`
   - **Argumentos:** `run cleanup`
   - **Iniciar en:** `C:\Users\[TU_USUARIO]\Documents\GitHub\aplicacion-de-seguimiento\backend`

4. **Configuración adicional:**
   - Ejecutar solo si el equipo está conectado a CA
   - Ejecutar aunque el usuario no haya iniciado sesión
   - Zona horaria: Europe/Madrid

### Opción 2: Linux/Mac (Cron)

Editar crontab:
```bash
crontab -e
```

Agregar línea:
```cron
0 4 * * * cd /path/to/backend && npm run cleanup >> /var/log/bus-cleanup.log 2>&1
```

Verificar:
```bash
crontab -l
```

### Opción 3: Docker (si aplica)

Agregar al `docker-compose.yml`:
```yaml
services:
  cleanup:
    image: node:18
    volumes:
      - ./backend:/app
    working_dir: /app
    command: sh -c "sleep 3600 && npm run cleanup"
    restart: always
    environment:
      - TZ=Europe/Madrid
```

### Opción 4: API Manual (Desarrollo/Testing)

También puedes ejecutar la limpieza vía API:

```bash
# POST request
curl -X POST http://localhost:3001/api/admin/cleanup
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Limpieza completada exitosamente",
  "deletedCount": 1234,
  "stats": {
    "totalLocations": 1234,
    "locationsByLine": [
      { "lineId": "L1", "count": 310 },
      { "lineId": "L2", "count": 305 }
    ]
  }
}
```

## Verificación

Para verificar estadísticas sin borrar datos:

```bash
curl http://localhost:3001/api/admin/stats
```

## Logs

Los logs se encuentran en:
- Backend: `backend/logs/` (si está configurado Winston file transport)
- Consola: Ver output del proceso backend

Buscar en logs:
```
🌙 Iniciando limpieza nocturna...
📊 Estadísticas del día:
🧹 Limpieza completada: X ubicaciones eliminadas
✅ Limpieza nocturna completada
```

## Futuras Mejoras

Para fases posteriores se puede implementar:

1. **Tabla de estadísticas históricas** (`daily_stats`)
   - Guardar promedios de tiempos entre paradas
   - Rutas más transitadas
   - Velocidad promedio por línea
   - Datos para mejorar algoritmo ETA

2. **Agregación de datos**
   - Mantener 24h completas
   - Agregar datos antiguos antes de borrar
   - Permitir análisis histórico

3. **Autenticación en endpoints admin**
   - Proteger `/api/admin/*` con middleware
   - Solo administradores pueden ejecutar limpieza manual

4. **Dashboard de estadísticas**
   - Visualización de datos históricos
   - Gráficas de uso por línea
   - Métricas de rendimiento

## Archivos del Sistema

```
backend/
├── src/
│   └── services/
│       └── cleanup.service.ts      # Lógica de limpieza y estadísticas
├── scripts/
│   └── cleanup-locations.ts        # Script ejecutable
└── package.json                     # Script "cleanup"
```

## Contacto

Para dudas sobre el sistema de limpieza, revisar:
- `docs/ARCHITECTURE.md`
- `docs/DATABASE.md`
- Logs del backend en `backend/logs/`
