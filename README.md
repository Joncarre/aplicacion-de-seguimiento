# Aplicación de seguimiento de autobuses urbanos de Aranjuez
---

Esta aplicación web ha sido diseñada para facilitar la movilidad en Aranjuez, ofreciendo a los ciudadanos una herramienta moderna y sencilla para el seguimiento de los autobuses urbanos. A diferencia de otras soluciones que se basan en estimaciones tales como Google Maps o Moovit, este sistema conecta directamente con los conductores para mostrar su ubicación real en el mapa.

El sistema consta de dos partes que trabajan en conjunto:
1.  **Panel de Usuario:** La interfaz que ven los ciudadanos. Es accesible desde cualquier móvil u ordenador y muestra un mapa interactivo con las líneas y paradas.
2.  **Panel de Conductor:** Los conductores utilizan una interfaz simplificada para emitir su señal GPS, y el servidor se encarga de procesar esa información y enviarla instantáneamente a todos los usuarios conectados.

---

## Funcionalidades

### 👥 Para los ciudadanos
*   **Visualización de las líneas de autobuses:** Acceso a las 5 líneas urbanas (L1, L2, L3, L4, L5) con sus recorridos completos.
*   **Paradas detalladas:** Al pulsar en una parada, puedes ver su nombre y ubicación exacta en el mapa.
*   **Estimaciones de llegada:** Cálculo dinámico de cuánto tardará el autobús en llegar a tu parada.
*   **Diseño intuitivo:** Interfaz sencilla con colores distintivos para cada línea, facilitando su identificación.

### 🚌 Para los conductores
*   **Acceso seguro:** Sistema de autenticación mediante códigos únicos de 6 dígitos, garantizando que solo personal autorizado pueda emitir señales.
*   **Operación simplificada:** Interfaz diseñada para ser usada de forma segura y rápida, permitiendo detener el trayecto y finalizarlo y/o pausarlo en cualquier momento.
*   **Transmisión automática:** Una vez iniciado el trayecto, la aplicación envía la ubicación GPS cada 10 segundos de manera automática, sin que el conductor tenga que intervenir.

---

## Estructura del Proyecto

```
aplicacion-de-seguimiento/
├── backend/              # Servidor API REST + WebSocket
│   ├── src/             # Lógica del servidor
│   ├── prisma/          # Definición de la base de datos y datos iniciales (semillas)
│   └── scripts/         # Herramientas para mantenimiento (generación de códigos)
├── frontend/            # Aplicación web Next.js
│   ├── app/            # Páginas (Usuario, Conductor, Admin)
│   ├── components/     # Piezas reutilizables (Mapas, Tarjetas, Botones)
│   └── lib/            # Funciones de utilidad
└── docs/               # Documentación técnica detallada
```

---

## Líneas de autobús y colores

Cada línea tiene asignado un color distintivo para facilitar su identificación en el mapa y en la interfaz:

| Línea | Nombre / Zona | Color | Código Hex |
|-------|---------------|-------|------------|
| **L1** | Línea 1 | <span style="color:#ef476f">■</span> Rosa/Rojo | `#ef476f` |
| **L2** | Línea 2 | <span style="color:#ffa654">■</span> Naranja | `#ffa654` |
| **L3** | Línea 3 | <span style="color:#06d6a0">■</span> Verde Menta | `#06d6a0` |
| **L4** | Línea 4 | <span style="color:#118ab2">■</span> Azul | `#118ab2` |
| **L5** | Línea 5 | <span style="color:#9984d4">■</span> Violeta | `#9984d4` |

---

## Licencia

Proyecto privado - Autobuses Urbanos de Aranjuez

---

**Última actualización:** 4 de Diciembre de 2025
**Versión:** 1.1.0 (Fases 1-4 completadas)


## 📄 Licencia

Este proyecto está desarrollado bajo la **Licencia MIT**.

###  Desarrollador principal
**Jonathan Carrero**  
**Email:** jonathan.carrero.aranda@gmail.com

### Contribuciones
Las contribuciones son siempre bienvenidas, pero por favor:
1.  **Fork** el proyecto
2.  **Crea** una rama para tu feature
3.  **Commit** tus cambios  
4.  **Push** a la rama
5.  **Abre** un Pull Request

---
*Created by Jonathan Carrero*