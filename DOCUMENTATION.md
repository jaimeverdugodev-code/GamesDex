# GamesDex — Project Map

Generated from `src/app/core/services/`.

---

## 1. RAWG API Endpoints

Base URL: `https://api.rawg.io/api`

| Método | Endpoint | Función | Parámetros clave |
|--------|----------|---------|-----------------|
| GET | `/games` | Búsqueda de juegos | `search`, `ordering`, `genres`, `parent_platforms`, `page`, `page_size` |
| GET | `/games` | Tendencias (último año) | `dates=<lastYear>,<today>`, `ordering=-added`, `page=<aleatorio 1-5>` |
| GET | `/games` | Para Ti | `dates=<lastYear>,<today>`, `ordering=-metacritic` |
| GET | `/games` | Novedades (último mes) | `dates=<lastMonth>,<today>`, `ordering=-rating` |
| GET | `/games` | Top Valorados | `ordering=-rating`, `metacritic=80,100` |
| GET | `/games` | Joyas Indie | `genres=indie`, `ordering=-added`, `metacritic=70,100` |
| GET | `/games` | Por Género | `genres=<slug>` |
| GET | `/games/{id}` | Detalle de un juego | `key` |
| GET | `/games/{id}/game-series` | Juegos de la misma saga | `key` |

---

## 2. Colecciones de Firebase (Firestore)

### `users`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `uid` | `string` | Identificador único de Firebase Auth |
| `email` | `string` | Correo electrónico |
| `displayName` | `string` | Nombre de pantalla |
| `photoUrl` | `string?` | URL o Base64 del avatar |
| `bio` | `string?` | Descripción del perfil |
| `favoriteGenres` | `string[]` | Lista de géneros favoritos |

### `reviews`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string?` | ID auto-generado por Firestore |
| `gameId` | `number` | ID del juego en RAWG |
| `userId` | `string` | UID del autor |
| `authorName` | `string` | Nombre del autor (desnormalizado) |
| `authorPhoto` | `string?` | Foto del autor (actualizada en tiempo real por `getGameReviews`) |
| `rating` | `number` | Puntuación de 1 a 5 estrellas |
| `text` | `string` | Texto de la reseña |
| `createdAt` | `Timestamp` | Fecha de publicación (ServerTimestamp) |

### `follows`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string?` | ID auto-generado por Firestore |
| `followerId` | `string` | UID del usuario que sigue |
| `followingId` | `string` | UID del usuario seguido |
| `status` | `'pending' \| 'accepted'` | Estado de la relación |

### `user_games`

ID de documento: `{userId}_{gameId}`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string?` | ID del documento |
| `userId` | `string` | UID del usuario |
| `gameId` | `number` | ID del juego en RAWG |
| `status` | `'played' \| 'playing' \| 'wishlist' \| null` | Estado en la biblioteca |
| `addedAt` | `Timestamp` | Fecha de adición |

---

## 3. Servicios — Funciones Principales

### `GameService` (`src/app/core/services/game.service.ts`)

| Función | Retorno | Descripción |
|---------|---------|-------------|
| `searchGames(query, page, pageSize, filters?)` | `Observable<RawgResponse>` | Búsqueda con filtros de género y plataforma |
| `getGameDetails(id)` | `Observable<Game>` | Ficha completa de un juego por ID |
| `getGamesByGenre(genreSlug, page?)` | `Observable<RawgResponse>` | Juegos filtrados por slug de género |
| `getTrendingGames(pageSize?)` | `Observable<RawgResponse>` | Más populares del último año; página aleatoria 1–5 por día; caché diaria con `shareReplay(1)` |
| `getForYouGames(page?, pageSize?)` | `Observable<RawgResponse>` | Mejores por Metacritic del último año; cacheado |
| `getNewReleases(page?, pageSize?)` | `Observable<RawgResponse>` | Lanzamientos del último mes; cacheado |
| `getTopRated(page?, pageSize?)` | `Observable<RawgResponse>` | Mejor rating de todos los tiempos; cacheado |
| `getIndieGems(page?, pageSize?)` | `Observable<RawgResponse>` | Indie con Metacritic ≥ 70; cacheado |
| `getSimilarGames(id)` | `Observable<Game[]>` | Juegos de la misma saga (hasta 10) |

---

### `AuthService` (`src/app/core/services/auth.service.ts`)

| Función | Retorno | Descripción |
|---------|---------|-------------|
| `loginWithGoogle()` | `Promise<void>` | Login con popup de Google; sincroniza usuario en Firestore |
| `registerWithEmail(email, password, displayName)` | `Promise<void>` | Registro con email; crea documento en `users` |
| `loginWithEmail(email, password)` | `Promise<void>` | Inicio de sesión con email |
| `logout()` | `Promise<void>` | Cierra la sesión activa |
| `getProfileData(uid)` | `Observable<User \| undefined>` | Lectura única del perfil desde Firestore |
| `updateUserProfile(uid, profileData)` | `Promise<void>` | Actualización parcial del perfil (`merge: true`) |
| `isProfileComplete(uid)` | `Promise<boolean>` | Comprueba si el usuario tiene ≥ 3 géneros favoritos |
| `user$` | `Observable<FirebaseAuthUser \| null>` | Observable del estado de autenticación |

---

### `UserGamesService` (`src/app/core/services/user-games.service.ts`)

| Función | Retorno | Descripción |
|---------|---------|-------------|
| `loadUserGames(userId)` | `void` | Carga la biblioteca del usuario en caché local (`BehaviorSubject<Map>`) |
| `isGameSaved(gameId)` | `Observable<boolean>` | Indica si el juego está en la colección |
| `getGameStatus(gameId)` | `Observable<GameStatus \| null>` | Estado exacto del juego en la biblioteca |
| `addGame(userId, gameId, status?)` | `Promise<void>` | Añade o actualiza el juego con su estado; actualiza caché |
| `removeGame(userId, gameId)` | `Promise<void>` | Elimina el juego de la colección; actualiza caché |
| `getUserGames(userId)` | `Observable<UserGame[]>` | Documentos completos de la biblioteca de un usuario |

---

### `ReviewService` (`src/app/core/services/review.service.ts`)

| Función | Retorno | Descripción |
|---------|---------|-------------|
| `getGameReviews(gameId)` | `Observable<Review[]>` | Reseñas de un juego; enriquece `authorPhoto` en tiempo real desde `users` |
| `getUserReviews(userId)` | `Observable<Review[]>` | Reseñas de un usuario (lectura única desde servidor, evita caché parcial) |
| `addReview(reviewData)` | `Promise<void>` | Publica una nueva reseña con `serverTimestamp` |
| `updateReview(reviewId, data)` | `Promise<void>` | Actualiza campos de una reseña existente |
| `deleteReview(reviewId)` | `Promise<void>` | Elimina una reseña por su ID |

---

### `SocialService` (`src/app/core/services/social.service.ts`)

| Función | Retorno | Descripción |
|---------|---------|-------------|
| `getAllUsers(maxLimit?)` | `Observable<User[]>` | Lista de usuarios (máx. 50 por defecto) |
| `getFollowers(userId)` | `Observable<User[]>` | Usuarios que siguen a `userId` (reactivo) |
| `getFollowing(currentUserId)` | `Observable<User[]>` | Usuarios a los que sigue `currentUserId` (reactivo) |
| `followUser(followerId, followingId)` | `Promise<void>` | Crea un documento en `follows` con `status: 'accepted'` |
| `unfollowUser(followerId, followingId)` | `Promise<void>` | Busca y elimina el documento de `follows` correspondiente |
