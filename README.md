# Aplicación de seguimiento de autobuses urbanos de Aranjuez
---

[Visitar este enlace para acceder](https://determined-enjoyment-production.up.railway.app/)

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

## Capturas de pantalla

<img src="recursos_readme/im0.png" width="25%" alt="Panel de conductor">

Los conductores, al comenzar su jornada, pueden seleccionar en la línea que van a conducir para comenzar a emitir su señal GPS. Al hacer un descanso o finalizar su jornada, pueden detener la emisión de señales pulsando el botón "Finalizar trayecto".

<img src="recursos_readme/im1.png" width="25%" alt="Mapa interactivo">

Por otro lado, cuando los usuarios acceden, verán un mapa interactivo con las líneas y paradas. Al pulsar en una parada, se mostrará su nombre y el tiempo que faltará para que los próximos autobuses de dicha línea lleguen.

<img src="recursos_readme/im3.png" width="25%" alt="Tiempo de llegada">

Nótese que si el autobús se retrasa, el tiempo de llegada se actualizará de forma automática. Por lo tanto, la persona sabe de manera precisa el tiempo que le queda para que el autobús llegue. Esta información puede ser consultada para cualquier parada de cualquier línea de autobús en tiempo real.

<img src="recursos_readme/im5.png" width="25%" alt="Página de contacto">

Se dispone de un correo electrónico (actualmente no operativo hasta que la aplicación sea lanzada por completo) para contactar y solicitar la información de la aplicación, propuestas de mejora o reportar problemas en el funcionamiento.

<img src="recursos_readme/im6.png" width="25%" alt="Contacto adicional">

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
| **L1** | Línea 1 | ![#ef476f](https://placehold.co/15x15/ef476f/ef476f.png) Rojo | `#ef476f` |
| **L2** | Línea 2 | ![#ffa654](https://placehold.co/15x15/ffa654/ffa654.png) Naranja | `#ffa654` |
| **L3** | Línea 3 | ![#06d6a0](https://placehold.co/15x15/06d6a0/06d6a0.png) Verde | `#06d6a0` |
| **L4** | Línea 4 | ![#118ab2](https://placehold.co/15x15/118ab2/118ab2.png) Azul | `#118ab2` |
| **L5** | Línea 5 | ![#9984d4](https://placehold.co/15x15/9984d4/9984d4.png) Violeta | `#9984d4` |

---

**Última actualización:** 4 de Diciembre de 2025
**Versión:** 1.1.0


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