# 🎨 Guía de Estilo y Diseño

## Paleta de Colores

### Colores por Línea

```css
/* L1 - Verde Claro */
--line-1: #86efac; /* green-300 */
--line-1-dark: #4ade80; /* green-400 */
--line-1-light: #bbf7d0; /* green-200 */

/* L2 - Esmeralda */
--line-2: #6ee7b7; /* emerald-300 */
--line-2-dark: #34d399; /* emerald-400 */
--line-2-light: #a7f3d0; /* emerald-200 */

/* L3 - Teal */
--line-3: #5eead4; /* teal-300 */
--line-3-dark: #2dd4bf; /* teal-400 */
--line-3-light: #99f6e4; /* teal-200 */

/* L4 - Cielo */
--line-4: #7dd3fc; /* sky-300 */
--line-4-dark: #38bdf8; /* sky-400 */
--line-4-light: #bae6fd; /* sky-200 */
```

### Colores Base

```css
/* Fondos */
--bg-primary: #f0fdf4; /* green-50 */
--bg-secondary: #dcfce7; /* green-100 */
--bg-tertiary: #bbf7d0; /* green-200 */

/* Texto */
--text-primary: #14532d; /* green-900 */
--text-secondary: #166534; /* green-800 */
--text-muted: #16a34a; /* green-600 */

/* Botones y Acentos */
--accent-primary: #10b981; /* green-500 */
--accent-hover: #059669; /* green-600 */
--accent-active: #047857; /* green-700 */

/* Estados */
--success: #22c55e; /* green-500 */
--warning: #f59e0b; /* amber-500 */
--error: #ef4444; /* red-500 */
--info: #3b82f6; /* blue-500 */

/* Bordes y Sombras */
--border: #d1fae5; /* green-100 */
--shadow: rgba(5, 150, 105, 0.1);
```

## Tipografía

### Fuentes

```css
/* Fuente principal */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Títulos */
font-family: 'Poppins', 'Inter', sans-serif;
```

### Tamaños (Mobile First)

```css
/* Títulos */
h1: text-2xl (24px) md:text-4xl (36px)
h2: text-xl (20px) md:text-3xl (30px)
h3: text-lg (18px) md:text-2xl (24px)

/* Texto */
body: text-base (16px)
small: text-sm (14px)
tiny: text-xs (12px)

/* Botones */
button: text-base (16px) md:text-lg (18px)
```

### Pesos

```css
regular: 400
medium: 500
semibold: 600
bold: 700
```

## Espaciado

### Sistema de Espaciado (Tailwind)

```css
/* Padding y Margin */
xs: 2 (8px)
sm: 4 (16px)
md: 6 (24px)
lg: 8 (32px)
xl: 12 (48px)
2xl: 16 (64px)
```

## Componentes

### Botones

#### Primario
```tsx
<button className="
  bg-accent-primary hover:bg-accent-hover active:bg-accent-active
  text-white font-medium
  px-6 py-3 rounded-2xl
  shadow-lg hover:shadow-xl
  transition-all duration-200
  active:scale-95
">
  Texto del botón
</button>
```

#### Secundario
```tsx
<button className="
  bg-white/80 hover:bg-white
  text-text-primary border-2 border-accent-primary
  px-6 py-3 rounded-2xl
  shadow-md hover:shadow-lg
  transition-all duration-200
  active:scale-95
">
  Texto del botón
</button>
```

#### Por Línea
```tsx
<button className="
  bg-line-1 hover:bg-line-1-dark
  text-text-primary font-medium
  px-6 py-3 rounded-2xl
  shadow-md hover:shadow-lg
  transition-all duration-200
  active:scale-95
">
  L1
</button>
```

### Tarjetas

```tsx
<div className="
  bg-white/70 backdrop-blur-sm
  rounded-3xl
  shadow-lg hover:shadow-xl
  p-6
  border border-border
  transition-all duration-200
">
  Contenido
</div>
```

### Inputs

```tsx
<input className="
  w-full
  bg-white/80
  border-2 border-green-200 focus:border-accent-primary
  rounded-xl
  px-4 py-3
  text-text-primary
  placeholder:text-text-muted/50
  transition-all duration-200
  focus:outline-none focus:ring-2 focus:ring-accent-primary/20
" />
```

### Badges de Línea

```tsx
<span className="
  inline-block
  bg-line-1 text-text-primary
  px-3 py-1 rounded-full
  text-sm font-semibold
  shadow-sm
">
  L1
</span>
```

## Iconos

### Sistema de Iconos

Usar **Lucide React** para consistencia:

```bash
npm install lucide-react
```

Iconos principales:
- 🚌 `Bus` - Autobús
- 📍 `MapPin` - Parada
- 🗺️ `Map` - Mapa
- ⏱️ `Clock` - Tiempo
- ▶️ `Play` - Comenzar trayecto
- ⏹️ `Square` - Finalizar trayecto
- ↩️ `ArrowLeft` - Volver
- 📡 `Radio` - Transmitiendo
- 👤 `User` - Usuario
- 🚗 `Car` - Conductor (usar Bus)

## Layout

### Estructura de Página

```tsx
<div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
  {/* Header */}
  <header className="bg-white/70 backdrop-blur-md shadow-sm">
    {/* Contenido del header */}
  </header>
  
  {/* Main Content */}
  <main className="container mx-auto px-4 py-6 md:py-8">
    {/* Contenido principal */}
  </main>
  
  {/* Footer (opcional) */}
  <footer className="bg-white/50 backdrop-blur-sm">
    {/* Contenido del footer */}
  </footer>
</div>
```

### Contenedores

```tsx
/* Container principal */
className="container mx-auto px-4 max-w-md md:max-w-2xl lg:max-w-4xl"

/* Card container */
className="max-w-md mx-auto"
```

## Animaciones

### Transiciones

```css
/* Standard */
transition-all duration-200 ease-in-out

/* Smooth */
transition-all duration-300 ease-out

/* Bounce (botones) */
active:scale-95 transition-transform duration-150
```

### Efectos Hover (usar con moderación)

```tsx
/* Elevación */
hover:shadow-lg hover:-translate-y-0.5

/* Brillo */
hover:brightness-105

/* Escala */
hover:scale-102

/* Opacidad */
hover:opacity-90
```

### Loading States

```tsx
<div className="animate-pulse">
  {/* Skeleton */}
</div>

<div className="animate-spin">
  {/* Spinner */}
</div>
```

## Mapas (Leaflet)

### Estilo del Mapa

```tsx
// Personalización de marcadores
const stopIcon = L.divIcon({
  className: 'custom-stop-marker',
  html: `
    <div class="
      bg-white/90 backdrop-blur-sm
      border-2 border-line-1
      rounded-full
      w-8 h-8
      flex items-center justify-center
      shadow-lg
    ">
      📍
    </div>
  `
});

const busIcon = L.divIcon({
  className: 'custom-bus-marker',
  html: `
    <div class="
      bg-line-1
      border-2 border-white
      rounded-full
      w-10 h-10
      flex items-center justify-center
      shadow-xl
      animate-pulse
    ">
      🚌
    </div>
  `
});
```

### Tiles del Mapa

```typescript
// Usar tema claro y minimalista
const tileLayer = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
```

## Responsive Design

### Breakpoints (Tailwind)

```css
sm: 640px   /* Móviles grandes */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
```

### Mobile First

Siempre diseñar primero para móvil, luego agregar estilos para pantallas más grandes:

```tsx
className="
  text-base       /* móvil */
  md:text-lg      /* tablet+ */
  lg:text-xl      /* desktop+ */
"
```

## Estados de UI

### Loading

```tsx
<div className="text-center py-8">
  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-accent-primary border-t-transparent"></div>
  <p className="mt-4 text-text-muted">Cargando...</p>
</div>
```

### Empty State

```tsx
<div className="text-center py-12">
  <div className="text-6xl mb-4">🚌</div>
  <p className="text-text-secondary">No hay buses disponibles</p>
</div>
```

### Error

```tsx
<div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
  <p className="text-red-700">⚠️ Error: {mensaje}</p>
</div>
```

## Accesibilidad

### Principios

1. **Contraste mínimo:** 4.5:1 para texto normal
2. **Touch targets:** Mínimo 44x44px
3. **Labels:** Siempre en inputs
4. **Alt text:** En todas las imágenes
5. **ARIA labels:** En botones con solo iconos

### Ejemplo

```tsx
<button
  className="..."
  aria-label="Volver a la pantalla anterior"
  role="button"
>
  <ArrowLeft />
</button>
```

## Best Practices

1. ✅ Usar transparencias (`bg-white/70`)
2. ✅ Aplicar `backdrop-blur` para efecto glassmorphism
3. ✅ Bordes redondeados generosos (`rounded-2xl`, `rounded-3xl`)
4. ✅ Sombras suaves (`shadow-lg`)
5. ✅ Transiciones en interacciones
6. ⚠️ Usar hover con moderación (solo en elementos clave)
7. ❌ Evitar animaciones excesivas
8. ❌ No usar colores saturados
9. ❌ No abusar de efectos

---

**Versión:** 1.0  
**Última actualización:** Noviembre 2025
