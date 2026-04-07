// src/app/core/services/game.service.ts
// Capa de Acceso a Datos — Comunicación con la API REST de RAWG

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Game, RawgResponse } from '../models/game.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly baseUrl = 'https://api.rawg.io/api';
  private http = inject(HttpClient);

  /**
   * HU02: Buscar juegos por nombre.
   * Devuelve un Observable con la lista de resultados paginados.
   */
  searchGames(query: string, page: number = 1, pageSize: number = 20): Observable<RawgResponse> {
    const params = new HttpParams()
      .set('key', environment.rawgApiKey)
      .set('search', query)
      .set('page', page)
      .set('page_size', pageSize);

    return this.http.get<RawgResponse>(`${this.baseUrl}/games`, { params });
  }

  /**
   * HU02 / RF03: Obtener la ficha completa de un juego por su ID.
   * Incluye description_raw, géneros, plataformas, etc.
   */
  getGameDetails(id: number): Observable<Game> {
    const params = new HttpParams().set('key', environment.rawgApiKey);
    return this.http.get<Game>(`${this.baseUrl}/games/${id}`, { params });
  }

  /**
   * Obtener juegos filtrados por género (slug del género RAWG).
   * Útil para la búsqueda avanzada de HU02.
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
   * Tendencias: juegos más populares del último año, ordenados por rating.
   * Usado en la HomePage para la sección "Tendencias Actuales".
   */
  /**
   * "Para Ti": juegos populares recientes ordenados por número de valoraciones.
   * Complementa las tendencias con un criterio distinto (metacritic).
   */
  getForYouGames(page: number = 1, pageSize: number = 8): Observable<RawgResponse> {
    const today = new Date();
    const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    const params = new HttpParams()
      .set('key', environment.rawgApiKey)
      .set('dates', `${formatDate(lastYear)},${formatDate(today)}`)
      .set('ordering', '-metacritic')
      .set('page', page)
      .set('page_size', pageSize);

    return this.http.get<RawgResponse>(`${this.baseUrl}/games`, { params });
  }

  getTrendingGames(page: number = 1, pageSize: number = 12): Observable<RawgResponse> {
    const today = new Date();
    const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    const params = new HttpParams()
      .set('key', environment.rawgApiKey)
      .set('dates', `${formatDate(lastYear)},${formatDate(today)}`)
      .set('ordering', '-rating')
      .set('page', page)
      .set('page_size', pageSize);

    return this.http.get<RawgResponse>(`${this.baseUrl}/games`, { params });
  }
}
