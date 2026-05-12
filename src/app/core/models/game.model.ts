// src/app/core/models/game.model.ts
// Interfaces que mapean la respuesta de la API RAWG (https://rawg.io/apidocs)

export interface Game {
  id: number;                    // ID único del juego en RAWG
  name: string;                  // Título del juego
  slug: string;                  // Slug URL-friendly
  background_image: string | null; // URL de la portada
  rating: number;                // Nota media (0-5)
  ratings_count: number;         // Número total de valoraciones
  released: string | null;       // Fecha de lanzamiento (YYYY-MM-DD)
  metacritic: number | null;     // Puntuación Metacritic
  genres: Genre[];               // Lista de géneros
  platforms: PlatformWrapper[];  // Plataformas disponibles
  description_raw?: string;      // Descripción en texto plano (solo en detalle)
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
}

export interface PlatformWrapper {
  platform: Platform;
}

export interface Platform {
  id: number;
  name: string;
  slug: string;
}

export interface Screenshot {
  id: number;
  image: string;
  width: number;
  height: number;
}

export interface GameMovie {
  id: number;
  name: string;
  preview: string;
  data: { max: string; '480': string };
}

/** Estructura de la respuesta paginada de RAWG */
export interface RawgResponse {
  count: number;                 // Total de resultados
  next: string | null;           // URL de la siguiente página
  previous: string | null;       // URL de la página anterior
  results: Game[];               // Lista de juegos
}
