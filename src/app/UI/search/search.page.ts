// src/app/UI/search/search.page.ts
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonButtons, IonMenuButton, IonSearchbar,
  IonIcon, IonSkeletonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { star, searchOutline, filterOutline, closeOutline, checkmark } from 'ionicons/icons';
import { BehaviorSubject, Subject, combineLatest, of, EMPTY } from 'rxjs';
import {
  debounceTime, switchMap, takeUntil, tap,
  distinctUntilChanged, catchError
} from 'rxjs/operators';
import {
  GameService, SearchFilters,
  PLATFORM_ID_MAP, GENRE_SLUG_MAP
} from '../../core/services/game.service';
import { Game } from '../../core/models/game.model';

/**
 * Estado interno de los filtros.
 * Se compara por valor (JSON) para evitar emisiones redundantes.
 */
interface FilterState {
  platforms: string[];
  genres: string[];
}

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonButtons, IonMenuButton, IonSearchbar,
    IonIcon, IonSkeletonText
  ]
})
export class SearchPage implements OnInit, OnDestroy {
  private gameService = inject(GameService);
  private destroy$ = new Subject<void>();

  /**
   * Dos BehaviorSubjects que alimentan un único stream con combineLatest.
   * - searchTerm$: texto del ion-searchbar
   * - activeFilters$: estado de los checkboxes (plataformas + géneros)
   *
   * combineLatest emite cada vez que cualquiera de los dos cambia.
   * Un solo debounceTime(800) agrupa cambios rápidos (texto + checkboxes)
   * en UNA ÚNICA petición HTTP → ahorra cuota de RAWG.
   */
  private searchTerm$ = new BehaviorSubject<string>('');
  private activeFilters$ = new BehaviorSubject<FilterState>({ platforms: [], genres: [] });

  // Estado de la UI
  games: Game[] = [];
  popularGames: Game[] = [];
  loading = false;
  searchTerm = '';
  hasSearchedOrFiltered = false;

  // Filtros UI
  platformFilters: string[] = [];
  genreFilters: string[] = [];
  showFilters = false;

  // Opciones de filtro
  platformOptions = ['PC', 'PlayStation', 'Xbox', 'Nintendo'];
  genreOptions = ['RPG', 'FPS', 'Action', 'Strategy', 'Horror', 'Adventure', 'Indie'];

  constructor() {
    addIcons({ star, searchOutline, filterOutline, closeOutline, checkmark });
  }

  ngOnInit(): void {
    // Cargar populares para el estado vacío (cacheados con shareReplay)
    this.gameService.getTrendingGames(12).subscribe(res => {
      this.popularGames = res.results;
    });

    // Stream unificado: texto + filtros → 1 petición HTTP
    combineLatest([
      this.searchTerm$.pipe(
        distinctUntilChanged()
      ),
      this.activeFilters$.pipe(
        // Comparar por valor para no emitir si los arrays son iguales
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      )
    ]).pipe(
      debounceTime(800),
      tap(([term, filters]) => {
        const hasText = term.trim().length >= 3;
        const hasFilters = filters.platforms.length > 0 || filters.genres.length > 0;

        // Si no hay texto ni filtros, no hacer petición
        if (!hasText && !hasFilters) {
          this.games = [];
          this.hasSearchedOrFiltered = false;
          this.loading = false;
          return;
        }

        this.loading = true;
        this.hasSearchedOrFiltered = true;
      }),
      switchMap(([term, filters]) => {
        const hasText = term.trim().length >= 3;
        const hasFilters = filters.platforms.length > 0 || filters.genres.length > 0;

        if (!hasText && !hasFilters) return EMPTY;

        // Traducir nombres de UI a parámetros RAWG
        const apiFilters: SearchFilters = {};

        if (filters.genres.length > 0) {
          apiFilters.genres = filters.genres
            .map(g => GENRE_SLUG_MAP[g])
            .filter(Boolean);
        }

        if (filters.platforms.length > 0) {
          apiFilters.platforms = filters.platforms
            .map(p => PLATFORM_ID_MAP[p])
            .filter(Boolean);
        }

        const query = hasText ? term.trim() : '';
        // Solo filtros sin texto → pedir 40 (máximo RAWG), misma 1 petición
        const pageSize = hasText ? 20 : 40;

        return this.gameService.searchGames(query, 1, pageSize, apiFilters).pipe(
          catchError(() => of({ count: 0, next: null, previous: null, results: [] }))
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe(response => {
      // Ordenación inteligente: coincidencias exactas primero, luego por rating
      const term = this.searchTerm.toLowerCase().trim();
      if (term.length >= 3) {
        this.games = response.results.sort((a, b) => {
          const aStarts = a.name.toLowerCase().startsWith(term) ? 1 : 0;
          const bStarts = b.name.toLowerCase().startsWith(term) ? 1 : 0;
          if (aStarts !== bStarts) return bStarts - aStarts;
          return (b.rating || 0) - (a.rating || 0);
        });
      } else {
        this.games = response.results;
      }
      this.loading = false;
    });
  }

  // ==========================================
  // Handlers de UI
  // ==========================================

  onSearch(event: any): void {
    const value = (event.target.value ?? '') as string;
    this.searchTerm = value;
    this.searchTerm$.next(value);
  }

  togglePlatform(platform: string): void {
    const idx = this.platformFilters.indexOf(platform);
    if (idx >= 0) {
      this.platformFilters.splice(idx, 1);
    } else {
      this.platformFilters.push(platform);
    }
    this.emitFilters();
  }

  toggleGenre(genre: string): void {
    const idx = this.genreFilters.indexOf(genre);
    if (idx >= 0) {
      this.genreFilters.splice(idx, 1);
    } else {
      this.genreFilters.push(genre);
    }
    this.emitFilters();
  }

  clearFilters(): void {
    this.platformFilters = [];
    this.genreFilters = [];
    this.emitFilters();
  }

  isPlatformActive(platform: string): boolean {
    return this.platformFilters.includes(platform);
  }

  isGenreActive(genre: string): boolean {
    return this.genreFilters.includes(genre);
  }

  get hasActiveFilters(): boolean {
    return this.platformFilters.length > 0 || this.genreFilters.length > 0;
  }

  /**
   * Determina si se debe mostrar el estado vacío (populares)
   * o los resultados de búsqueda/filtrado.
   */
  get showPopular(): boolean {
    return !this.hasSearchedOrFiltered && !this.loading;
  }

  toggleFiltersPanel(): void {
    this.showFilters = !this.showFilters;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================================
  // Internos
  // ==========================================

  /**
   * Emite el estado actual de los filtros al BehaviorSubject.
   * Se usa spread para crear nuevos arrays (evitar mutación de referencia).
   */
  private emitFilters(): void {
    this.activeFilters$.next({
      platforms: [...this.platformFilters],
      genres: [...this.genreFilters]
    });
  }
}
