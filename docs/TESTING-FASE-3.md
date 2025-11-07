# 🧪 Guía de Testing - Fase 3: Panel de Conductor

## Preparación

1. ✅ Backend corriendo en `http://localhost:3001`
2. ✅ Frontend corriendo en `http://localhost:3000`
3. ✅ Base de datos PostgreSQL activa
4. ✅ Líneas creadas en BD (L1, L2, L3, L4)

## Tests Manuales

### Test 1: Health Check

**Backend:**
```bash
curl http://localhost:3001/health
```

**Resultado esperado:**
```json
{
  "status": "healthy",
  "uptime": 123.45,
  "timestamp": "2025-11-07T..."
}
```

---

### Test 2: Obtener Líneas de Autobús

```bash
curl http://localhost:3001/api/lines
```

**Resultado esperado:**
```json
{
  "success": true,
  "lines": [
    {
      "id": "uuid-xxx",
      "name": "L1",
      "color": "#86efac",
      "description": "Línea 1"
    },
    ...
  ]
}
```

---

### Test 3: Login de Conductor

1. Abrir `http://localhost:3000/conductor`
2. Ingresar código válido (ejemplo: `7553812903`)
3. Presionar "Iniciar sesión"
4. **Verificar:** Redirección a `/conductor/panel`

**Alternativa por API:**
```bash
curl -X POST http://localhost:3001/api/auth/validate-code \
  -H "Content-Type: application/json" \
  -d "{\"code\": \"7553812903\"}"
```

---

### Test 4: Panel de Conductor - UI

1. Verificar que se muestra:
   - ✅ Header con "Panel de Conductor"
   - ✅ Session ID truncado
   - ✅ 4 botones de líneas (L1, L2, L3, L4)
   - ✅ Botón "Comenzar trayecto" deshabilitado

---

### Test 5: Selección de Línea

1. Click en cualquier línea (ej: L1)
2. **Verificar:**
   - ✅ Botón cambia de color
   - ✅ Borde verde
   - ✅ Escala aumenta (scale-105)
   - ✅ Botón "Comenzar trayecto" se habilita

---

### Test 6: Iniciar Transmisión GPS

1. Con línea seleccionada, click en "Comenzar trayecto"
2. **Verificar:**
   - ✅ Navegador solicita permisos de ubicación
   - ✅ Aceptar permisos
   - ✅ UI cambia a estado "Transmitiendo posición..."
   - ✅ Aparece icono Radio pulsante en header
   - ✅ Se muestran coordenadas en tiempo real
   - ✅ Botón cambia a "Finalizar trayecto" (rojo)

**Consola del navegador:**
```javascript
// Debería ver logs cada 10 segundos:
Ubicación obtenida: {latitude: 40.xxx, longitude: -3.xxx, ...}
Ubicación enviada: {latitude: 40.xxx, longitude: -3.xxx, ...}
```

---

### Test 7: Verificar Envío de Datos

**Abrir DevTools → Network → Filter XHR**

Debería ver requests cada 10 segundos a:
- **URL:** `http://localhost:3001/api/location`
- **Method:** POST
- **Payload:**
  ```json
  {
    "sessionId": "uuid-xxx",
    "lineId": "uuid-yyy",
    "latitude": 40.123456,
    "longitude": -3.123456,
    "accuracy": 10.5,
    "speed": 0,
    "heading": null
  }
  ```
- **Response:** 201 Created

---

### Test 8: Verificar Datos en Base de Datos

**Opción 1: Prisma Studio**
```bash
cd backend
npx prisma studio
```

1. Abrir tabla `bus_locations`
2. **Verificar:** Nuevas filas con:
   - sessionId correcto
   - lineId correcto
   - latitude/longitude válidos
   - timestamp reciente
   - accuracy, speed, heading

**Opción 2: SQL Directo**
```sql
SELECT 
  id, 
  "lineId", 
  latitude, 
  longitude, 
  accuracy, 
  timestamp
FROM bus_locations
ORDER BY timestamp DESC
LIMIT 10;
```

**Opción 3: API de estadísticas**
```bash
curl http://localhost:3001/api/admin/stats
```

---

### Test 9: Finalizar Trayecto

1. Click en "Finalizar trayecto"
2. **Verificar:**
   - ✅ Transmisión se detiene (no más requests)
   - ✅ Session actualizada en BD (isActive = false, endedAt)
   - ✅ localStorage limpio (authToken y sessionId borrados)
   - ✅ Redirección a `/conductor`
   - ✅ No se puede volver al panel sin login

**Verificar sesión en BD:**
```sql
SELECT id, "isActive", "endedAt" 
FROM sessions 
WHERE id = 'tu-session-id';
```

---

### Test 10: Sistema de Limpieza

**Test Manual:**
```bash
cd backend
npm run cleanup
```

**Salida esperada:**
```
═══════════════════════════════════════════════════
🧹 LIMPIEZA NOCTURNA DE UBICACIONES
═══════════════════════════════════════════════════

⏰ Hora de ejecución: 07/11/2025, XX:XX:XX

📊 RESUMEN:
   • Ubicaciones eliminadas: X
   • Total previo: X

✅ Limpieza completada exitosamente
```

**Verificar BD vacía:**
```sql
SELECT COUNT(*) FROM bus_locations;
-- Resultado: 0
```

**Test por API:**
```bash
curl -X POST http://localhost:3001/api/admin/cleanup
```

---

## Escenarios de Error

### Error 1: Permisos GPS Denegados

1. Rechazar permisos de ubicación
2. **Verificar:**
   - ✅ Mensaje de error: "Permiso de ubicación denegado..."
   - ✅ Tarjeta roja con AlertCircle
   - ✅ No inicia transmisión

### Error 2: GPS No Disponible

1. Deshabilitar servicios de ubicación del sistema
2. Intentar comenzar trayecto
3. **Verificar:**
   - ✅ Error: "Ubicación no disponible..."

### Error 3: Sesión Expirada

1. Esperar 8 horas (o modificar expiresAt en BD)
2. Intentar enviar ubicación
3. **Verificar:**
   - ✅ Backend rechaza: 401 Unauthorized
   - ✅ Mensaje en frontend

### Error 4: Sin Línea Seleccionada

1. Click en "Comenzar trayecto" sin seleccionar línea
2. **Verificar:**
   - ✅ Alert: "Por favor, selecciona una línea..."

---

## Scripts Útiles para Testing

### Script 1: Simular Ubicaciones (Navegador)

```javascript
// Pegar en consola del navegador (DevTools)
// Simula ubicaciones cada 5 segundos para testing rápido

let count = 0;
const interval = setInterval(() => {
  count++;
  console.log(`📍 Ubicación simulada #${count}`);
  
  // Simular coordenadas de Aranjuez con variación
  const lat = 40.0322 + (Math.random() - 0.5) * 0.01;
  const lng = -3.6018 + (Math.random() - 0.5) * 0.01;
  
  console.log(`Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`);
  
  if (count >= 5) {
    clearInterval(interval);
    console.log('✅ Simulación completada');
  }
}, 5000);
```

### Script 2: Verificar Sesión Activa

```javascript
// Consola del navegador
const token = localStorage.getItem('authToken');
const sessionId = localStorage.getItem('sessionId');

console.log('Token:', token);
console.log('Session ID:', sessionId);

// Verificar si está autenticado
if (token && sessionId) {
  console.log('✅ Sesión activa');
} else {
  console.log('❌ No hay sesión');
}
```

### Script 3: Limpiar Sesión Manual

```javascript
// Consola del navegador
localStorage.removeItem('authToken');
localStorage.removeItem('sessionId');
console.log('✅ Sesión limpiada');
window.location.href = '/conductor';
```

---

## Checklist Final

Antes de dar la Fase 3 como completada, verificar:

- [ ] Login de conductor funciona
- [ ] Se cargan las 4 líneas desde la API
- [ ] Selección de línea visual funciona
- [ ] Permisos GPS se solicitan correctamente
- [ ] Ubicaciones se envían cada 10 segundos
- [ ] Datos se guardan en `bus_locations` table
- [ ] Indicador visual "Transmitiendo..." aparece
- [ ] Coordenadas en tiempo real se muestran
- [ ] Botón "Finalizar trayecto" cierra sesión
- [ ] Redirección post-logout funciona
- [ ] Sistema de limpieza borra ubicaciones
- [ ] Estadísticas se calculan correctamente
- [ ] Manejo de errores GPS funciona
- [ ] No hay errores en consola (backend/frontend)
- [ ] Logs del backend son claros

---

## Códigos de Prueba Disponibles

Los códigos generados más recientemente están en:
```
backend/generated/driver-codes-2025-11-07T10-54-48-861Z.txt
```

**Primeros 3 códigos:**
- `7553812903`
- `2322562397`
- `7065890383`

---

## Recursos

- **Backend:** http://localhost:3001
- **Frontend:** http://localhost:3000
- **Prisma Studio:** http://localhost:5555 (ejecutar `npx prisma studio`)
- **Logs Backend:** Consola del servidor backend
- **Logs Frontend:** DevTools → Console

---

## Próximos Pasos

Una vez completados todos los tests:
- ✅ Fase 3 completada
- ➡️ Commit de cambios
- ➡️ Actualizar README con progreso (43% → 43%)
- ➡️ Comenzar Fase 4: Interfaz de Usuario
