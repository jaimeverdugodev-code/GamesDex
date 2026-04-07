# Log de Progreso: GamesDex
**Fecha:** 6 de abril de 2026

## Avances Técnicos de Hoy
* [cite_start]**Arquitectura:** Limpieza de carpetas de Ionic y configuración de rutas de autenticación[cite: 6, 72].
* [cite_start]**UI/UX:** Implementación de tokens OKLCH, border-radius de 0.625rem y Modo Oscuro[cite: 146].
* [cite_start]**Modelos:** Interfaces TypeScript creadas para User, Review, Follow y UserGame [cite: 136-140].
* [cite_start]**Lógica:** AuthService operativo con Firebase Auth (HU01) y flujo de onboarding[cite: 55, 216].
* **Optimización:** Integración de `ngx-image-cropper` y conversión a Base64 para Firestore.

---

**Fecha:** 7 de abril de 2026

## Avances Técnicos de Hoy

### HU02 — Búsqueda y Exploración de Videojuegos
* **Modelo de datos:** Creadas interfaces TypeScript para la API RAWG (`Game`, `Genre`, `Platform`, `RawgResponse`) en `core/models/game.model.ts`.
* **GameService (Capa de Acceso a Datos):** Implementado en `core/services/game.service.ts` con `HttpClient` y los siguientes métodos:
  - `searchGames(query)` — búsqueda por nombre con paginación.
  - `getGameDetails(id)` — ficha completa de un juego.
  - `getGamesByGenre(slug)` — filtrado por género.
  - `getTrendingGames()` — juegos del último año ordenados por rating.
  - `getForYouGames()` — juegos del último año ordenados por metacritic.
* **SearchPage:** Componente standalone con `ion-searchbar`, debounce RxJS (400ms), skeleton loaders y grid responsivo.

### Navegación y App Shell
* **AppComponent:** Menú lateral (`ion-menu`) con 4 accesos: Home, Buscar Juegos, Mis Juegos, Mi Perfil + botón Cerrar Sesión.
* **Rutas:** Ruta por defecto cambiada de `/login` a `/home`. Añadidas rutas lazy-loaded: `/home`, `/search`, `/my-games`.
* **Estilos del menú:** Migrados de colores hardcoded a tokens OKLCH (`--foreground`, `--background`, `--border`, `--secondary`).

### HomePage — Feed Principal
* **Hero Banner:** Imagen full-width con gradient overlay, título, subtítulo y CTAs (Explorar Juegos / Únete a la Comunidad).
* **Tendencias Actuales:** Slider horizontal con flechas prev/next, transición CSS 500ms. Datos reales de RAWG.
* **Para Ti:** Grid de recomendaciones (4 cols desktop, 3 tablet, 2 móvil) con criterio metacritic.
* **Skeleton Loaders:** Implementados en ambas secciones con aspect-ratio 2/3 (RNF02).
* **Game Cards:** Portada vertical, hover con translateY + sombra, `border-radius: var(--radius-lg)`, tokens OKLCH.
* **Responsive:** 3 breakpoints (1024px, 768px) para hero, slider y grid.

### MyGamesPage (placeholder)
* Componente standalone con estructura base para la futura HU03 de gestión de juegos.

### Configuración
* `environment.ts` / `environment.prod.ts` — Añadida `rawgApiKey` para la integración con RAWG.
* `main.ts` — Añadido `provideHttpClient()` para habilitar `HttpClient` en toda la app.
* `CLAUDE.md` — Creado con guía de arquitectura, comandos y referencia a Priority Docs.

## Tareas Pendientes (To-Do)
1. Implementar la ficha de detalle de un juego (navegación desde las cards).
2. Conectar la sección "Para Ti" con los géneros favoritos del usuario (IA / Hugging Face).
3. Crear la lógica para seguir a otros usuarios (HU04).
4. Implementar la página Mi Perfil.
5. Completar la página Mis Juegos (marcar como jugado/wishlist — HU03).