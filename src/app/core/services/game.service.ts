// src/app/core/services/game.service.ts
// Capa de Acceso a Datos — Comunicación con la API REST de RAWG

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { shareReplay, map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Game, RawgResponse } from '../models/game.model';

/**
 * Filtros opcionales para búsquedas server-side en RAWG.
 *
 * RAWG acepta:
 * - `genres`: slugs separados por coma (ej. "action,rpg")
 * - `platforms`: IDs numéricos separados por coma (ej. "4,187,1")
 *
 * Este mapa traduce los nombres de UI a los slugs/IDs que espera la API.
 */
export interface SearchFilters {
  genres?: string[];     // Slugs de género RAWG (ej. ['action', 'rpg'])
  platforms?: number[];  // IDs de plataforma RAWG (ej. [4, 187])
}

/** Mapa: nombre de UI → ID de plataforma RAWG */
export const PLATFORM_ID_MAP: Record<string, number> = {
  'PC':          4,
  'PlayStation': 187,  // PS5 (parent_platform que agrupa PS4/PS5)
  'Xbox':        1,    // Xbox One / Series (parent_platform)
  'Nintendo':    7     // Nintendo Switch (parent_platform)
};

/** Mapa: nombre de UI → slug de género RAWG */
export const GENRE_SLUG_MAP: Record<string, string> = {
  'RPG':       'role-playing-games-rpg',
  'FPS':       'shooter',
  'Action':    'action',
  'Strategy':  'strategy',
  'Horror':    'horror',     // Nota: En RAWG no existe como genre principal;
  'Adventure': 'adventure',  // usamos el más cercano
  'Indie':     'indie'
};

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly baseUrl = 'https://api.rawg.io/api';
  private http = inject(HttpClient);

  /**
   * Caché en memoria para las secciones de la Home.
   * Se usa shareReplay(1) para no repetir peticiones HTTP.
   */
  // Caché de trending con rotación diaria: se invalida en día nuevo y rota de página.
  private trendingCached$:  Observable<RawgResponse> | null = null;
  private trendingCacheDay = '';
  private forYouCache = new Map<string, Observable<RawgResponse>>();
  private newReleasesCache = new Map<string, Observable<RawgResponse>>();
  private topRatedCache = new Map<string, Observable<RawgResponse>>();
  private indieCache = new Map<string, Observable<RawgResponse>>();
  private gameDetailsCache = new Map<number, Observable<Game>>();

  /**
   * HU02: Buscar juegos con filtros opcionales server-side.
   *
   * Acepta un texto de búsqueda y/o filtros de género y plataforma.
   * RAWG filtra en su servidor, así que no se desperdician resultados.
   *
   * Si `query` está vacío pero hay filtros, se hace una petición sin
   * el parámetro `search` (RAWG devuelve juegos que cumplan los filtros).
   *
   * No se cachea porque cada combinación de texto + filtros es única.
   */
  searchGames(
    query: string,
    page: number = 1,
    pageSize: number = 20,
    filters?: SearchFilters
  ): Observable<RawgResponse> {
    let params = new HttpParams()
      .set('key', environment.rawgApiKey)
      .set('page', page)
      .set('page_size', pageSize);

    // Ordenar por popularidad (más añadidos por usuarios de RAWG)
    params = params.set('ordering', '-added');

    // Solo añadir search si hay texto
    if (query && query.trim().length > 0) {
      params = params.set('search', query.trim());
    }

    // Géneros: slugs separados por coma
    if (filters?.genres && filters.genres.length > 0) {
      params = params.set('genres', filters.genres.join(','));
    }

    // Plataformas: usar parent_platforms (IDs agrupados) para mejor cobertura
    if (filters?.platforms && filters.platforms.length > 0) {
      params = params.set('parent_platforms', filters.platforms.join(','));
    }

    return this.http.get<RawgResponse>(`${this.baseUrl}/games`, { params });
  }

  /**
   * HU02 / RF03: Obtener la ficha completa de un juego por su ID.
   */
  getGameDetails(id: number): Observable<Game> {
    const params = new HttpParams().set('key', environment.rawgApiKey);
    return this.http.get<Game>(`${this.baseUrl}/games/${id}`, { params });
  }

  /**
   * Obtiene nombre e imagen de portada para una lista de IDs de juego.
   * Usa caché en memoria para no repetir peticiones a RAWG.
   */
  getGamesMeta(ids: number[]): Observable<Record<number, { name: string; image: string | null }>> {
    const uniqueIds = [...new Set(ids.filter(id => !!id))];
    if (uniqueIds.length === 0) return of({});

    const requests$ = uniqueIds.map(id => {
      if (!this.gameDetailsCache.has(id)) {
        const params = new HttpParams().set('key', environment.rawgApiKey);
        this.gameDetailsCache.set(id,
          this.http.get<Game>(`${this.baseUrl}/games/${id}`, { params }).pipe(shareReplay(1))
        );
      }
      return this.gameDetailsCache.get(id)!.pipe(
        map(g => ({ id, name: g.name, image: g.background_image })),
        catchError(() => of({ id, name: '', image: null as string | null }))
      );
    });

    return forkJoin(requests$).pipe(
      map(results => results.reduce((acc, r) => { acc[r.id] = { name: r.name, image: r.image }; return acc; }, {} as Record<number, { name: string; image: string | null }>))
    );
  }

  /**
   * Obtener juegos filtrados por género (slug del género RAWG).
   */
  getGamesByGenre(genreSlug: string, page: number = 1): Observable<RawgResponse> {
    const params = new HttpParams()
      .set('key', environment.rawgApiKey)
      .set('genres', genreSlug)
      .set('page', page)
      .set('page_size', 20);

    return this.http.get<RawgResponse>(`${this.baseUrl}/games`, { params });
  }

  /**
   * Tendencias: juegos más populares del último año, ordenados por añadidos.
   * La caché se invalida una vez al día. Cada día se elige una página aleatoria
   * del catálogo (1-5) para que la sección muestre juegos distintos.
   */
  getTrendingGames(pageSize: number = 10): Observable<RawgResponse> {
    const today = new Date();
    const cacheKey = `${today.toISOString().substring(0, 10)}:${pageSize}`;

    if (!this.trendingCached$ || this.trendingCacheDay !== cacheKey) {
      this.trendingCacheDay = cacheKey;
      const randomPage = Math.floor(Math.random() * 5) + 1;
      const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
      const formatDate = (d: Date) => d.toISOString().split('T')[0];

      const params = new HttpParams()
        .set('key', environment.rawgApiKey)
        .set('dates', `${formatDate(lastYear)},${formatDate(today)}`)
        .set('ordering', '-added')
        .set('page', randomPage)
        .set('page_size', pageSize);

      this.trendingCached$ = this.http.get<RawgResponse>(`${this.baseUrl}/games`, { params }).pipe(
        shareReplay(1)
      );
    }

    return this.trendingCached$;
  }

  /**
   * "Para Ti": juegos populares recientes ordenados por metacritic.
   * Aplica el mismo patrón de caché con shareReplay(1).
   */
  getForYouGames(page: number = 1, pageSize: number = 8): Observable<RawgResponse> {
    const cacheKey = `${page}:${pageSize}`;

    if (!this.forYouCache.has(cacheKey)) {
      const today = new Date();
      const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
      const formatDate = (d: Date) => d.toISOString().split('T')[0];

      const params = new HttpParams()
        .set('key', environment.rawgApiKey)
        .set('dates', `${formatDate(lastYear)},${formatDate(today)}`)
        .set('ordering', '-metacritic')
        .set('page', page)
        .set('page_size', pageSize);

      const request$ = this.http.get<RawgResponse>(`${this.baseUrl}/games`, { params }).pipe(
        shareReplay(1)
      );

      this.forYouCache.set(cacheKey, request$);
    }

    return this.forYouCache.get(cacheKey)!;
  }

  /**
   * Novedades: juegos lanzados en el último mes, ordenados por mejor valorados.
   */
  getNewReleases(page: number = 1, pageSize: number = 8): Observable<RawgResponse> {
    const cacheKey = `${page}:${pageSize}`;

    if (!this.newReleasesCache.has(cacheKey)) {
      const today = new Date();
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
      const formatDate = (d: Date) => d.toISOString().split('T')[0];

      const params = new HttpParams()
        .set('key', environment.rawgApiKey)
        .set('dates', `${formatDate(lastMonth)},${formatDate(today)}`)
        .set('ordering', '-rating')
        .set('page', page)
        .set('page_size', pageSize);

      const request$ = this.http.get<RawgResponse>(`${this.baseUrl}/games`, { params }).pipe(
        shareReplay(1)
      );

      this.newReleasesCache.set(cacheKey, request$);
    }

    return this.newReleasesCache.get(cacheKey)!;
  }

  /**
   * Top Valorados: juegos con mejor rating de todos los tiempos.
   */
  getTopRated(page: number = 1, pageSize: number = 8): Observable<RawgResponse> {
    const cacheKey = `${page}:${pageSize}`;

    if (!this.topRatedCache.has(cacheKey)) {
      const params = new HttpParams()
        .set('key', environment.rawgApiKey)
        .set('ordering', '-rating')
        .set('metacritic', '80,100')
        .set('page', page)
        .set('page_size', pageSize);

      const request$ = this.http.get<RawgResponse>(`${this.baseUrl}/games`, { params }).pipe(
        shareReplay(1)
      );

      this.topRatedCache.set(cacheKey, request$);
    }

    return this.topRatedCache.get(cacheKey)!;
  }

  /**
   * Joyas Indie: juegos indie populares bien valorados.
   */
  getIndieGems(page: number = 1, pageSize: number = 8): Observable<RawgResponse> {
    const cacheKey = `${page}:${pageSize}`;

    if (!this.indieCache.has(cacheKey)) {
      const params = new HttpParams()
        .set('key', environment.rawgApiKey)
        .set('genres', 'indie')
        .set('ordering', '-added')
        .set('metacritic', '70,100')
        .set('page', page)
        .set('page_size', pageSize);

      const request$ = this.http.get<RawgResponse>(`${this.baseUrl}/games`, { params }).pipe(
        shareReplay(1)
      );

      this.indieCache.set(cacheKey, request$);
    }

    return this.indieCache.get(cacheKey)!;
  }

  getSimilarGames(id: number): Observable<Game[]> {
    const params = new HttpParams().set('key', environment.rawgApiKey);
    return this.http.get<any>(`${this.baseUrl}/games/${id}/game-series`, { params }).pipe(
      map(response => response.results.slice(0, 10))
    );
  }

  getGamesByTitles(titles: string[]): Observable<Game[]> {
    if (!titles || titles.length === 0) return of([]);

    const searches$ = titles.map(title => {
      const params = new HttpParams()
        .set('key', environment.rawgApiKey)
        .set('search', title.trim())
        .set('page_size', 1);
      return this.http.get<RawgResponse>(`${this.baseUrl}/games`, { params }).pipe(
        map(res => res.results?.[0] ?? null),
        catchError(() => of(null))
      );
    });

    return forkJoin(searches$).pipe(
      map(results => results.filter(
        (g): g is Game => g !== null && (g.rating > 0 || (g.metacritic != null && g.metacritic > 50))
      ))
    );
  }
}
