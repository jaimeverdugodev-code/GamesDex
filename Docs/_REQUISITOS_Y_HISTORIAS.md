# Requisitos y Historias de Usuario: GamesDex

## 1. Requisitos Funcionales (RF)
[cite_start]Basado en la planificación técnica del proyecto[cite: 31, 192]:

* [cite_start]**RF01 - Gestión de Usuarios:** Registro, inicio de sesión, recuperación de contraseña y edición de perfil[cite: 34, 195].
* [cite_start]**RF02 - Búsqueda y Exploración:** Buscar videojuegos por nombre, género y plataforma[cite: 35, 196].
* [cite_start]**RF03 - Gestión de Juegos:** Ver detalles (portada, descripción, rating) y marcar como "Jugado"[cite: 36, 197].
* [cite_start]**RF04 - Valoraciones:** Sistema de estrellas y reseñas de texto que actualizan la nota media[cite: 37, 198].
* [cite_start]**RF05 - Interacción Social:** Seguir otros perfiles y generar un feed de actividad cronológico[cite: 38, 199].
* [cite_start]**RF06 - Recomendaciones:** Lista "Para Ti" basada en el historial mediante IA[cite: 39, 200].

## 2. Requisitos No Funcionales (RNF)
* [cite_start]**RNF01 - Multiplataforma:** Base de código única en Angular/Ionic para Android y PWA[cite: 41, 42, 202, 203].
* [cite_start]**RNF02 - Rendimiento:** Uso de Skeleton Loaders e indicadores de carga para llamadas a Firestore y RAWG[cite: 43, 204].
* [cite_start]**RNF03 - Seguridad:** Autenticación vía Firebase Auth y reglas de seguridad en Firestore[cite: 44, 205].
* [cite_start]**RNF04 - Usabilidad:** Interfaz responsive con soporte nativo para Modo Oscuro[cite: 45, 206].

## 3. Historias de Usuario (HU)
| ID | Como... | Quiero... | Para... |
| :--- | :--- | :--- | :--- |
| **HU01** | Usuario Invitado | Iniciar sesión con Google o Email | [cite_start]Acceder a mi perfil y datos[cite: 55, 216]. |
| **HU02** | Usuario Registrado | Buscar un juego por nombre o género | [cite_start]Encontrar información específica[cite: 55, 216]. |
| **HU03** | Usuario Registrado | Dar puntuación y escribir reseña | [cite_start]Compartir mi opinión sobre un juego[cite: 56, 217]. |
| **HU04** | Usuario Registrado | Seguir a otros usuarios | [cite_start]Ver su actividad en mi feed[cite: 56, 217]. |
| **HU05** | Usuario Registrado | Ver lista de "Juegos que podrían interesarme" | [cite_start]Descubrir títulos nuevos vía IA[cite: 56, 217]. |
| **HU06** | Usuario Registrado | Modificar los datos de mi perfil | [cite_start]Mantener mi información actualizada[cite: 56, 217]. |

## 4. Diseño de Interfaz (UI/UX)
* [cite_start]**Look & Feel:** Basado en el prototipo de alta fidelidad de Figma[cite: 147, 148].
* [cite_start]**Navegación:** Menú hamburguesa lateral para maximizar el área de contenido[cite: 145].
* [cite_start]**Paleta:** Modo oscuro para resaltar las portadas de los juegos proporcionadas por la API RAWG[cite: 146].