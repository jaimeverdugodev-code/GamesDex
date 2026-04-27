// src/app/UI/home/home.page.ts

import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import { Subject, of, forkJoin } from 'rxjs';
import { takeUntil, switchMap, catchError } from 'rxjs/operators';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonMenuButton, IonIcon,
  IonSkeletonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBackOutline, chevronForwardOutline, star } from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
import { GameService } from '../../core/services/game.service';
import { AuthService } from '../../core/services/auth.service';
import { AiService } from '../../core/services/ai.service';
import { UserGamesService } from '../../core/services/user-games.service';
import { Game } from '../../core/models/game.model';
import { HomeGameCardComponent } from '../../shared/components/home-game-card/home-game-card.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [
    CommonModule,
    RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonMenuButton, IonIcon,
    IonSkeletonText,
    HomeGameCardComponent
  ]
})
export class HomePage implements OnInit, OnDestroy, ViewWillEnter {
  private gameService = inject(GameService);
  private authService = inject(AuthService);
  private aiService = inject(AiService);
  private userGamesService = inject(UserGamesService);
  private destroy$ = new Subject<void>();

  // Secciones
  trendingGames: Game[] = [];
  topRated: Game[] = [];
  newReleases: Game[] = [];
  forYouGames: Game[] = [];
  indieGems: Game[] = [];

  // Loading flags
  loadingTrending = true;
  loadingTopRated = true;
  loadingNewReleases = true;
  loadingForYou = true;
  loadingIndie = true;

  // Datos del usuario
  userName = '';
  userPhoto = '';

  // Índices de slider independientes por sección
  sliderIndex: Record<string, number> = {
    trending: 0,
    topRated: 0,
    newReleases: 0,
    forYou: 0,
    indie: 0
  };

  // Skeletons
  skeletonSlider = Array(5);

  constructor() {
    addIcons({ chevronBackOutline, chevronForwardOutline, star });
  }

  ionViewWillEnter(): void {
    this.refreshUserData();
    this.gameService.getTrendingGames(10).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => { this.trendingGames = res.results; this.loadingTrending = false; },
      error: () => { this.loadingTrending = false; }
    });
  }

  ngOnInit(): void {

    this.gameService.getTopRated(1, 12).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => { this.topRated = res.results; this.loadingTopRated = false; },
      error: () => { this.loadingTopRated = false; }
    });

    this.gameService.getNewReleases(1, 12).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => { this.newReleases = res.results; this.loadingNewReleases = false; },
      error: () => { this.loadingNewReleases = false; }
    });

    this.gameService.getForYouGames(1, 12).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => { this.forYouGames = res.results; this.loadingForYou = false; },
      error: () => { this.loadingForYou = false; }
    });

    this.gameService.getIndieGems(1, 12).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => { this.indieGems = res.results; this.loadingIndie = false; },
      error: () => { this.loadingIndie = false; }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private visibleCount(section: string): number {
    return section === 'trending' ? 5 : 8;
  }

  prev(section: string): void {
    if (this.sliderIndex[section] > 0) {
      this.sliderIndex[section]--;
    }
  }

  next(section: string, totalItems: number): void {
    const maxIndex = Math.max(totalItems - this.visibleCount(section), 0);
    if (this.sliderIndex[section] < maxIndex) {
      this.sliderIndex[section]++;
    }
  }

  getOffset(section: string): string {
    const n = this.sliderIndex[section];
    if (n === 0) return 'translateX(0)';
    const count = this.visibleCount(section);
    const pct = 100 / count;
    const gapRem = 1.5;
    const gapPerItem = (gapRem * (count - 1)) / count;
    return `translateX(calc(-${n * pct}% - ${n * gapPerItem}rem))`;
  }

  canPrev(section: string): boolean {
    return this.sliderIndex[section] > 0;
  }

  canNext(section: string, totalItems: number): boolean {
    return this.sliderIndex[section] < Math.max(totalItems - this.visibleCount(section), 0);
  }

  private refreshUserData(): void {
    this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe(async user => {
      if (!user) return;
      this.userName = user.displayName || '';
      this.userPhoto = user.photoURL || '';

      const profile = await firstValueFrom(this.authService.getProfileData(user.uid));
      if (!profile) return;
      this.userName = profile.displayName || this.userName;
      this.userPhoto = profile.photoUrl || this.userPhoto;

      const userGames = await firstValueFrom(
        this.userGamesService.getUserGames(user.uid).pipe(catchError(() => of([])))
      );

      if (userGames.length > 0) {
        const recent = [...userGames]
          .sort((a, b) => b.addedAt.toMillis() - a.addedAt.toMillis())
          .slice(0, 3);

        forkJoin(recent.map(ug =>
          this.gameService.getGameDetails(ug.gameId).pipe(catchError(() => of(null)))
        )).pipe(
          switchMap(details => {
            const names = details.filter(g => g !== null).map(g => g!.name);
            if (names.length === 0) return of([]);
            return this.aiService.getRecommendationsByGames(names).pipe(
              switchMap(titles => this.gameService.getGamesByTitles(titles)),
              catchError(() => of([]))
            );
          }),
          catchError(() => of([])),
          takeUntil(this.destroy$)
        ).subscribe({
          next: (games) => { if (games.length > 0) this.forYouGames = games; }
        });

      } else if (profile.favoriteGenres?.length > 0) {
        this.aiService.getPersonalizedRecommendations(profile.favoriteGenres).pipe(
          switchMap(titles => this.gameService.getGamesByTitles(titles)),
          catchError(() => of([])),
          takeUntil(this.destroy$)
        ).subscribe({
          next: (games) => { if (games.length > 0) this.forYouGames = games; }
        });
      }
    });
  }
}
