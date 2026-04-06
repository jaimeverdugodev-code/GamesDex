# Guía de Estilo y UI: GamesDex

## 1. Tokens de Diseño (Variables del Sistema)
Este proyecto utiliza un sistema de diseño basado en **OKLCH** para una gestión de color optimizada y soporte de **Modo Oscuro** mediante la clase `.dark`.

### A. Paleta de Colores
| Token | Modo Claro (Light) | Modo Oscuro (Dark) |
| :--- | :--- | :--- |
| **Background** | `#ffffff` | `oklch(0.145 0 0)` |
| **Foreground** | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` |
| **Primary** | `#030213` | `oklch(0.985 0 0)` |
| **Secondary** | `oklch(0.95 0.0058 264.53)` | `oklch(0.269 0 0)` |
| **Muted** | `#ececf0` | `oklch(0.269 0 0)` |
| **Accent** | `#e9ebef` | `oklch(0.269 0 0)` |
| **Destructive** | `#d4183d` | `oklch(0.396 0.141 25.723)` |
| **Border** | `rgba(0, 0, 0, 0.1)` | `oklch(0.269 0 0)` |

### B. Tipografía y Escala
* [cite_start]**Tamaño Base:** `16px` (1rem)[cite: 142].
* **Pesos:** Normal (`400`), Medium (`500`).
* **Encabezados:** * `h1`: 2xl, Medium (1.5 line-height).
    * `h2`: xl, Medium.
    * `h3`: lg, Medium.
    * `h4`: base, Medium.

### C. Bordes y Espaciado
* **Radius (Bordes):** `0.625rem` (10px) para tarjetas y botones.
* **Inputs:** Fondo `#f3f3f5` en claro y `oklch(0.269 0 0)` en oscuro.

---

## 2. Especificaciones de Componentes (Ionic/Angular)

### Layout y Grid
* [cite_start]**Contenedor:** Usar siempre `ion-grid` con `ion-row` y `ion-col` para asegurar la responsividad[cite: 73, 143].
* [cite_start]**Sidebar:** Fondo `oklch(0.205 0 0)` con acento lila en modo oscuro[cite: 145].

### Tarjetas de Videojuegos (`ion-card`)
* **Estilo:** Aplicar `--radius-lg` (`0.625rem`) y bordes definidos por `--border`.
* [cite_start]**Contenido:** Deben resaltar las portadas de la API RAWG usando el fondo `--card`[cite: 146].

### Botones y Controles
* **Botones:** Deben usar `font-weight: 500` y el tamaño base de `16px`.
* [cite_start]**Skeleton Loaders:** Obligatorios durante la carga de datos para mejorar el rendimiento percibido[cite: 43, 204].

---

## 3. Reglas de Implementación para la IA
Para cualquier generación de código en GamesDex, sigue estas normas:

1. **Uso de Variables:** No escribas colores en duro (hardcoded). Usa `@apply` con las variables del tema (ej: `@apply bg-background text-foreground`).
2. **Arquitectura CSS:** Los estilos deben residir en los archivos `.scss` de cada componente de Angular o en `global.scss`.
3. **Modo Oscuro:** Asegura que los componentes utilicen la variante `.dark` para invertir los colores correctamente.
4. [cite_start]**Interactividad:** Mantener un `line-height` de `1.5` en todos los elementos de texto para asegurar la legibilidad en dispositivos móviles[cite: 45, 206].