// src/app/UI/profile/profile.page.ts

import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonMenuButton, IonIcon,
  IonSkeletonText, IonBackButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  star, createOutline, gameControllerOutline,
  peopleOutline, timeOutline, libraryOutline,
  personAddOutline, checkmarkOutline, personRemoveOutline
} from 'ionicons/icons';
import { Subject, forkJoin, of } from 'rxjs';
import { switchMap, takeUntil, catchError, map, take } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { UserGamesService } from '../../core/services/user-games.service';
import { GameService } from '../../core/services/game.service';
import { SocialService } from '../../core/services/social.service';
import { User } from '../../core/models/database.models';
import { Game } from '../../core/models/game.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonMenuButton, IonIcon,
    IonSkeletonText, IonBackButton
  ]
})
export class ProfilePage implements ViewWillEnter, OnDestroy {
  private authService = inject(AuthService);
  private userGamesService = inject(UserGamesService);
  private gameService = inject(GameService);
  private socialService = inject(SocialService);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  // Estados del perfil
  isMyProfile = true;
  isFollowing = false;
  currentUserId: string | null = null;

  // Datos del perfil a mostrar
  userName = '';
  userEmail = '';
  userPhoto = '';
  profile: User | null = null;
  loadingProfile = true;

  // Colección de juegos
  savedGames: Game[] = [];
  loadingGames = true;

  skeletonGames = Array(6);
  bannerUrl = 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1920&h=400&fit=crop';

  constructor() {
    addIcons({
      star, createOutline, gameControllerOutline,
      peopleOutline, timeOutline, libraryOutline,
      personAddOutline, checkmarkOutline, personRemoveOutline
    });
  }

  ionViewWillEnter(): void {
    const routeId = this.route.snapshot.paramMap.get('id');
    this.loadProfile(routeId);
  }

  loadProfile(targetId: string | null) {
    this.loadingProfile = true;
    this.loadingGames = true;

    this.authService.user$.pipe(
      take(1),
      switchMap(currentUser => {
        if (!currentUser) return of(null);

        this.currentUserId = currentUser.uid;
        const uidToLoad = targetId || currentUser.uid;
        this.isMyProfile = (!targetId || targetId === currentUser.uid);

        // Cargar Perfil de Firestore
        const profile$ = this.authService.getProfileData(uidToLoad).pipe(
          catchError(() => of(undefined))
        );

        // Cargar Juegos de ese usuario
        const games$ = this.userGamesService.getUserGames(uidToLoad).pipe(
          switchMap(userGames => {
            if (userGames.length === 0) return of([]);
            const details$ = userGames.map(ug => this.gameService.getGameDetails(ug.gameId).pipe(catchError(() => of(null))));
            return forkJoin(details$).pipe(map(games => games.filter((g): g is Game => g !== null)));
          }),
          catchError(() => of([]))
        );

        // Saber si ya sigo a este usuario (Solo si NO es mi perfil)
        let following$ = of(false);
        if (!this.isMyProfile) {
          following$ = this.socialService.getFollowing(this.currentUserId).pipe(
            map(followingList => followingList.some(u => u.uid === uidToLoad)),
            take(1)
          );
        }

        return forkJoin({ profile: profile$, games: games$, isFollowing: following$ });
      }),
      takeUntil(this.destroy$)
    ).subscribe(result => {
      if (!result) return;

      if (result.profile) {
        this.profile = result.profile;
        this.userName = result.profile.displayName || 'Gamer Anónimo';
        this.userPhoto = result.profile.photoUrl || '';
        this.userEmail = result.profile.email || '';
      }
      this.loadingProfile = false;

      this.savedGames = result.games;
      this.loadingGames = false;
      this.isFollowing = result.isFollowing;
    });
  }

  async followUser() {
    if (this.isMyProfile || !this.currentUserId || !this.profile || this.isFollowing) return;
    try {
      await this.socialService.followUser(this.currentUserId, this.profile.uid);
      this.isFollowing = true;
    } catch (error) {
      console.error('Error al seguir usuario', error);
    }
  }

  async unfollowUser() {
    if (this.isMyProfile || !this.currentUserId || !this.profile || !this.isFollowing) return;
    try {
      await this.socialService.unfollowUser(this.currentUserId, this.profile.uid);
      this.isFollowing = false; 
    } catch (error) {
      console.error('Error al dejar de seguir usuario', error);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}