// src/app/UI/profile/profile.page.ts

import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonMenuButton, IonIcon,
  IonSkeletonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  star, createOutline, gameControllerOutline,
  peopleOutline, timeOutline, libraryOutline
} from 'ionicons/icons';
import { Subject, forkJoin, of } from 'rxjs';
import { switchMap, takeUntil, catchError, map, take } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { UserGamesService } from '../../core/services/user-games.service';
import { GameService } from '../../core/services/game.service';
import { User } from '../../core/models/database.models';
import { Game } from '../../core/models/game.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  imports: [
    CommonModule,
    RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonMenuButton, IonIcon,
    IonSkeletonText
  ]
})
export class ProfilePage implements ViewWillEnter, OnDestroy {
  private authService = inject(AuthService);
  private userGamesService = inject(UserGamesService);
  private gameService = inject(GameService);
  private destroy$ = new Subject<void>();

  // Datos del usuario
  userName = '';
  userEmail = '';
  userPhoto = '';

  // Datos del perfil (Firestore users/)
  profile: User | null = null;
  loadingProfile = true;

  // Colección de juegos favoritos
  savedGames: Game[] = [];
  loadingGames = true;

  // Skeletons
  skeletonGames = Array(6);

  bannerUrl = 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1920&h=400&fit=crop';

  constructor() {
    addIcons({
      star, createOutline, gameControllerOutline,
      peopleOutline, timeOutline, libraryOutline
    });
  }

  /**
   * ionViewWillEnter se ejecuta CADA VEZ que la página se muestra,
   * incluyendo cuando vuelves de edit-profile. ngOnInit solo se ejecuta una vez.
   */
  ionViewWillEnter(): void {
    this.loadingProfile = true;
    this.loadingGames = true;

    this.authService.user$.pipe(
      take(1), // Solo 1 emisión por entrada a la vista
      switchMap(user => {
        if (!user) {
          this.loadingProfile = false;
          this.loadingGames = false;
          return of(null);
        }

        // Datos básicos de Firebase Auth
        this.userName = user.displayName || 'Gamer Anónimo';
        this.userEmail = user.email || '';

        // Cargar perfil de Firestore y juegos en paralelo
        const profile$ = this.authService.getProfileData(user.uid).pipe(
          catchError(() => of(undefined))
        );

        const games$ = this.userGamesService.getUserGames(user.uid).pipe(
          switchMap(userGames => {
            if (userGames.length === 0) return of([]);
            const details$ = userGames.map(ug =>
              this.gameService.getGameDetails(ug.gameId).pipe(
                catchError(() => of(null))
              )
            );
            return forkJoin(details$).pipe(
              map(games => games.filter((g): g is Game => g !== null))
            );
          }),
          catchError(() => of([]))
        );

        return forkJoin({ profile: profile$, games: games$ });
      }),
      takeUntil(this.destroy$)
    ).subscribe(result => {
      if (!result) return;

      if (result.profile) {
        this.profile = result.profile;
        // Leer foto y nombre de Firestore (donde se guardan los cambios de edit-profile)
        this.userName = result.profile.displayName || this.userName;
        this.userPhoto = result.profile.photoUrl || '';
      }
      this.loadingProfile = false;

      this.savedGames = result.games;
      this.loadingGames = false;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
