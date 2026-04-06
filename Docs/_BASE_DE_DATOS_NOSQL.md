# Diseño de la Base de Datos: GamesDex

## 1. Tecnología y Modelo
* [cite_start]**Motor de Base de Datos**: Se utiliza Cloud Firestore, una base de datos NoSQL orientada a documentos[cite: 125, 136].
* [cite_start]**Gestión de Datos**: La persistencia se maneja mediante la sincronización en tiempo real proporcionada por la librería AngularFire[cite: 77].
* [cite_start]**Seguridad**: El acceso a los datos está protegido por las reglas de seguridad de Firestore, garantizando que un usuario no pueda modificar datos ajenos[cite: 44, 205].

## 2. Estructura de Colecciones
La información en GamesDex se organiza en las siguientes colecciones principales:

### A. Colección `users`
[cite_start]Almacena el perfil y las preferencias de cada jugador[cite: 137].
* **Campos**:
    * [cite_start]`uid` (String): Identificador único de Firebase Auth[cite: 92, 137].
    * [cite_start]`email` (String): Correo electrónico del usuario[cite: 95, 137].
    * [cite_start]`displayName` (String): Nombre público del perfil[cite: 94, 137].
    * [cite_start]`photoUrl` (String): URL de la imagen de perfil en Base64[cite: 98, 137].
    * [cite_start]`bio` (String): Biografía corta del usuario[cite: 34, 137].
    * [cite_start]`favoriteGenres` (Array): Lista de géneros de videojuegos preferidos[cite: 99, 137].

### B. Colección `reviews`
[cite_start]Registra las valoraciones y comentarios realizados sobre los títulos[cite: 138].
* **Campos**:
    * [cite_start]`id` (Auto-ID): Identificador automático del documento[cite: 138].
    * [cite_start]`userId` (Referencia): Relación con el UID del usuario autor[cite: 107, 138].
    * [cite_start]`gameId` (Number): ID único del juego proveniente de la API RAWG[cite: 112, 138].
    * [cite_start]`rating` (Number): Puntuación numérica otorgada[cite: 115, 138].
    * [cite_start]`comment` (String): Texto de la reseña[cite: 116, 138].
    * [cite_start]`createdAt` (Timestamp): Fecha y hora de creación[cite: 118, 138].

### C. Colección `follows`
[cite_start]Gestiona el sistema de interacciones sociales y el feed[cite: 139].
* **Campos**:
    * [cite_start]`id` (Auto-ID): Identificador automático[cite: 139].
    * [cite_start]`followerId` (String): UID del usuario que comienza a seguir[cite: 102, 139].
    * [cite_start]`followingId` (String): UID del usuario al que se sigue[cite: 103, 139].
    * [cite_start]`status` (String): Estado de la relación (pending/accepted)[cite: 139].

### D. Colección `user_games`
[cite_start]Controla el historial personal de juegos de cada usuario[cite: 140].
* **Campos**:
    * [cite_start]`userId` (String): UID del propietario de la lista[cite: 140].
    * [cite_start]`gameId` (Number): Identificador del juego[cite: 140].
    * [cite_start]`status` (String): Estado del juego (played/wishlist)[cite: 36, 140].
    * [cite_start]`addedAt` (Timestamp): Fecha en la que se añadió a la colección[cite: 140].

## 3. Relaciones Lógicas (UML)
* [cite_start]**Usuarios a Seguidores**: Un usuario puede tener múltiples seguidores y seguir a múltiples usuarios (Relación 1:N en ambos sentidos) [cite: 90-104].
* [cite_start]**Usuarios a Reseñas**: Cada usuario puede escribir múltiples reseñas, pero cada reseña pertenece a un único autor (Relación 1:N) [cite: 100-107].
* [cite_start]**Juegos a Reseñas**: Un juego puede recibir múltiples valoraciones de distintos usuarios (Relación 1:N) [cite: 108-115].