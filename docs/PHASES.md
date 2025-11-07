# 📅 Fases de Desarrollo Detalladas

## Fase 1: Setup y Estructura Base ✅

**Objetivo:** Crear la estructura del proyecto y configurar herramientas base.

### Tareas
- [x] Crear estructura de carpetas
- [x] Configurar .gitignore
- [x] Documentación inicial
- [ ] Configurar Next.js con TypeScript
- [ ] Configurar Tailwind CSS
- [ ] Configurar backend Express
- [ ] Configurar PostgreSQL + PostGIS
- [ ] Configurar Prisma ORM
- [ ] Crear modelos de base de datos básicos

### Entregables
- Estructura de proyecto
- Configuración completa
- Base de datos con esquema inicial

---

## Fase 2: Autenticación y Roles ✅

**Objetivo:** Implementar la pantalla de inicio y sistema de códigos para conductores.

### Tareas
- [x] Pantalla de inicio con dos opciones
- [x] Diseño minimalista con tema verde pastel
- [x] Formulario de código para conductores
- [x] Endpoint de validación de código
- [x] Generar 30 códigos iniciales
- [x] Almacenar códigos en BD
- [x] Navegación entre pantallas

### Entregables
- ✅ Pantalla de inicio funcional
- ✅ Sistema de códigos operativo
- ✅ Script de generación de códigos
- ✅ Componentes UI reutilizables
- ✅ Backend API completo

### Testing
- ⏳ Validar código correcto (requiere PostgreSQL configurado)
- ⏳ Rechazar código incorrecto (requiere PostgreSQL configurado)
- ⏳ Probar navegación

**Estado:** ✅ Completada (6 Nov 2025)  
**Ver:** [FASE_2_COMPLETADA.md](./FASE_2_COMPLETADA.md)

---

## Fase 3: Panel de Conductor

**Objetivo:** Implementar el panel de control para conductores y transmisión GPS.

### Tareas
- [ ] Pantalla de conductor con dos botones
- [ ] Solicitar permisos de geolocalización
- [ ] Implementar envío de coordenadas cada 10s
- [ ] WebSocket para transmisión continua
- [ ] Estado visual "Transmitiendo posición..."
- [ ] Botón "Finalizar trayecto"
- [ ] Almacenar ubicaciones en BD
- [ ] Validar precisión GPS

### Entregables
- Panel de conductor funcional
- Transmisión GPS cada 10 segundos
- WebSocket configurado

### Testing
- Verificar envío cada 10s
- Probar inicio/fin de trayecto
- Validar almacenamiento en BD

---

## Fase 4: Panel de Usuario - Selección

**Objetivo:** Implementar selección de líneas y visualización de paradas en mapa.

### Tareas
- [ ] Pantalla de selección de líneas (L1-L4)
- [ ] Diseño con colores específicos por línea
- [ ] Integrar React-Leaflet
- [ ] Mostrar ubicación del usuario en mapa
- [ ] Cargar paradas de línea seleccionada
- [ ] Renderizar paradas en mapa
- [ ] Hacer paradas clickeables
- [ ] Endpoint para obtener paradas por línea

### Entregables
- Lista de líneas con diseño
- Mapa interactivo con Leaflet
- Paradas visibles y clickeables

### Data Needed
- **Coordenadas de paradas de cada línea** (a proporcionar)

### Testing
- Verificar geolocalización del usuario
- Probar selección de cada línea
- Validar renderizado de paradas

---

## Fase 5: Cálculo de Llegadas

**Objetivo:** Implementar el algoritmo de ETA y detección de dirección.

### Tareas
- [ ] Esperar 20s al seleccionar parada
- [ ] Recopilar 2 muestras de ubicación (0s y 20s)
- [ ] Algoritmo de detección de dirección
- [ ] Filtrar buses que se alejan
- [ ] Algoritmo de ETA siguiendo ruta
- [ ] Calcular tiempo entre paradas consecutivas
- [ ] Ordenar buses por tiempo de llegada
- [ ] Mostrar lista de buses con ETA
- [ ] Pantalla de "Cargando..." durante 20s

### Entregables
- Algoritmo de dirección funcional
- Cálculo preciso de ETA
- Lista ordenada de buses

### Testing
- Validar detección de dirección
- Comparar ETA con llegadas reales
- Probar con diferentes escenarios

---

## Fase 6: Tiempo Real y Optimización

**Objetivo:** Mejorar experiencia con actualizaciones en tiempo real y convertir en PWA.

### Tareas
- [ ] Suscripciones WebSocket por línea
- [ ] Actualizar posiciones de buses en tiempo real
- [ ] Actualizar ETAs automáticamente
- [ ] Crear manifest.json para PWA
- [ ] Configurar Service Worker
- [ ] Iconos de app (varios tamaños)
- [ ] Optimizar rendimiento (lazy loading)
- [ ] Animaciones suaves en mapa
- [ ] Debouncing en actualizaciones
- [ ] Caché de datos estáticos

### Entregables
- WebSocket bidireccional completo
- PWA instalable
- Aplicación optimizada

### Testing
- Probar actualizaciones en tiempo real
- Instalar PWA en móvil
- Verificar rendimiento

---

## Fase 7: Testing y Deployment

**Objetivo:** Asegurar calidad y desplegar en producción.

### Tareas
- [ ] Testing de flujos completos
- [ ] Testing en múltiples dispositivos móviles
- [ ] Testing de concurrencia (múltiples usuarios)
- [ ] Configurar variables de entorno de producción
- [ ] Elegir hosting (Vercel para frontend, Railway/Render para backend)
- [ ] Configurar PostgreSQL en producción
- [ ] Desplegar backend
- [ ] Desplegar frontend
- [ ] Configurar dominio (si aplica)
- [ ] Monitoreo básico
- [ ] Documentación de deployment

### Entregables
- Aplicación en producción
- Documentación completa
- Sistema de monitoreo

### Testing
- Smoke tests en producción
- Verificar SSL/HTTPS
- Probar desde múltiples dispositivos

---

## Notas Generales

### Criterios de Aceptación por Fase

Cada fase debe cumplir:
1. ✅ Funcionalidad completa según especificación
2. ✅ Diseño consistente con tema verde pastel
3. ✅ Responsive (mobile-first)
4. ✅ Sin errores en consola
5. ✅ Testing básico completado

### Stack de Testing (a implementar en Fase 7)

- **Frontend:** Jest + React Testing Library
- **Backend:** Jest + Supertest
- **E2E:** Playwright o Cypress
- **API Testing:** Postman/Insomnia collections

### Estimación de Tiempo

- **Fase 1:** 1-2 días
- **Fase 2:** 2-3 días
- **Fase 3:** 3-4 días
- **Fase 4:** 3-4 días
- **Fase 5:** 4-5 días (más compleja)
- **Fase 6:** 3-4 días
- **Fase 7:** 2-3 días

**Total estimado:** 18-25 días de desarrollo

---

**Estado Actual:** Fase 1 - En progreso  
**Próxima Fase:** Fase 2 - Autenticación y Roles
