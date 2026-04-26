// src/app/UI/profile/profile.page.ts

import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonMenuButton, IonIcon,
  IonSkeletonText, IonBackButton,
  IonSegment, IonSegmentButton, IonLabel,
  ModalController, AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  star, createOutline, gameControllerOutline,
  peopleOutline, timeOutline, libraryOutline,
  personAddOutline, checkmarkOutline, personRemoveOutline,
  chatbubbleOutline
} from 'ionicons/icons';
import { ReviewModalComponent } from '../game-detail/review-modal.component';
import { ReviewCardComponent } from '../../shared/components/review-card/review-card.component';
import { Subject, forkJoin, of } from 'rxjs';
import { switchMap, takeUntil, catchError, map, take } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { UserGamesService } from '../../core/services/user-games.service';
import { GameService } from '../../core/services/game.service';
import { SocialService } from '../../core/services/social.service';
import { ReviewService } from '../../core/services/review.service';
import { User, Review } from '../../core/models/database.models';
import { Game } from '../../core/models/game.model';

interface GameWithStatus {
  game: Game;
  status: 'played' | 'playing' | 'wishlist' | null;
}

interface ReviewWithGame {
  review: Review;
  gameName: string;
  gameImage: string | null;
}

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
    IonSkeletonText, IonBackButton,
    IonSegment, IonSegmentButton, IonLabel,
    ReviewCardComponent
  ]
})
export class ProfilePage implements ViewWillEnter, OnDestroy {
  private authService = inject(AuthService);
  private userGamesService = inject(UserGamesService);
  private gameService = inject(GameService);
  private socialService = inject(SocialService);
  private reviewService = inject(ReviewService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);
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

  // Pestañas y filtros
  activeTab: 'collection' | 'activity' = 'collection';
  collectionFilter: 'all' | 'played' | 'playing' | 'wishlist' = 'all';

  // Colección de juegos
  savedGames: GameWithStatus[] = [];
  loadingGames = true;

  // Reseñas del usuario (enriquecidas con datos del juego)
  userReviews: ReviewWithGame[] = [];
  loadingReviews = true;

  // Contadores sociales
  followersCount = 0;
  followingCount = 0;

  skeletonGames = Array(6);
  bannerUrl = 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1920&h=400&fit=crop';

  constructor() {
    addIcons({
      star, createOutline, gameControllerOutline,
      peopleOutline, timeOutline, libraryOutline,
      personAddOutline, checkmarkOutline, personRemoveOutline,
      chatbubbleOutline
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

        // Cargar Juegos de ese usuario preservando el status
        const games$ = this.userGamesService.getUserGames(uidToLoad).pipe(
          switchMap(userGames => {
            if (userGames.length === 0) return of([]);
            const details$ = userGames.map(ug =>
              this.gameService.getGameDetails(ug.gameId).pipe(
                map(game => ({ game, status: ug.status } as GameWithStatus)),
                catchError(() => of(null))
              )
            );
            return forkJoin(details$).pipe(
              map(results => results.filter((r): r is GameWithStatus => r !== null))
            );
          }),
          catchError(() => of([]))
        );

        // Reseñas enriquecidas con nombre e imagen del juego
        const reviews$ = this.reviewService.getUserReviews(uidToLoad).pipe(
          take(1),
          switchMap(reviews => {
            if (reviews.length === 0) return of([]);
            const enriched$ = reviews.map(review =>
              this.gameService.getGameDetails(review.gameId).pipe(
                map(game => ({ review, gameName: game.name, gameImage: game.background_image || null } as ReviewWithGame)),
                catchError(() => of({ review, gameName: `Juego #${review.gameId}`, gameImage: null } as ReviewWithGame))
              )
            );
            return forkJoin(enriched$);
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

        // Contadores sociales del perfil visitado
        const followersCount$ = this.socialService.getFollowers(uidToLoad).pipe(
          take(1), map(list => list.length), catchError(() => of(0))
        );
        const followingCount$ = this.socialService.getFollowing(uidToLoad).pipe(
          take(1), map(list => list.length), catchError(() => of(0))
        );

        return forkJoin({ profile: profile$, games: games$, reviews: reviews$, isFollowing: following$, followersCount: followersCount$, followingCount: followingCount$ });
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
      this.userReviews = result.reviews;
      this.loadingReviews = false;
      this.isFollowing = result.isFollowing;
      this.followersCount = result.followersCount;
      this.followingCount = result.followingCount;
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

  get filteredGames(): GameWithStatus[] {
    if (this.collectionFilter === 'all') return this.savedGames;
    return this.savedGames.filter(gws => gws.status === this.collectionFilter);
  }

  countByStatus(status: 'played' | 'playing' | 'wishlist'): number {
    return this.savedGames.filter(g => g.status === status).length;
  }

  statusLabel(status: 'played' | 'playing' | 'wishlist' | null): string {
    const labels: Record<string, string> = { played: 'Jugado', playing: 'Jugando', wishlist: 'Deseado' };
    return status ? labels[status] : '';
  }

  setTab(tab: string): void {
    this.activeTab = tab as 'collection' | 'activity';
  }

  setFilter(filter: 'all' | 'played' | 'playing' | 'wishlist'): void {
    this.collectionFilter = filter;
  }

  viewFollowers(): void {
    const uid = this.profile?.uid || this.currentUserId;
    this.router.navigate(['/profile', uid, 'followers']);
  }

  viewFollowing(): void {
    const uid = this.profile?.uid || this.currentUserId;
    this.router.navigate(['/profile', uid, 'following']);
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

  async editReview(rg: ReviewWithGame): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ReviewModalComponent,
      componentProps: { reviewToEdit: rg.review },
      breakpoints: [0, 0.75, 1],
      initialBreakpoint: 0.75
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data?.success) {
      const idx = this.userReviews.indexOf(rg);
      if (idx !== -1) {
        this.userReviews[idx] = {
          ...rg,
          review: { ...rg.review, rating: data.rating, text: data.text }
        };
      }
    }
  }

  async deleteReview(reviewId: string, index: number): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Borrar reseña',
      message: '¿Seguro que quieres eliminar esta reseña? Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Borrar',
          role: 'destructive',
          handler: async () => {
            this.userReviews.splice(index, 1);
            await this.reviewService.deleteReview(reviewId);
          }
        }
      ]
    });
    await alert.present();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}