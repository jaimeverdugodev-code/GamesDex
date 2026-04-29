// src/app/UI/game-detail/game-detail.page.ts

import { Component, inject, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  IonHeader, IonToolbar, IonContent, IonButtons,
  IonBackButton, IonIcon, IonSkeletonText,
  ModalController, ActionSheetController, AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  star, calendarOutline, addOutline, createOutline, chatbubbleOutline, chatbubblesOutline,
  checkmarkCircle, time, bookmark, checkmarkCircleOutline, timeOutline, bookmarkOutline, trashOutline,
  chevronBackOutline, chevronForwardOutline
} from 'ionicons/icons';
import { Subject, Observable, of } from 'rxjs';
import { takeUntil, switchMap, filter, catchError, map } from 'rxjs/operators';

import { GameService } from '../../core/services/game.service';
import { AiService } from '../../core/services/ai.service';
import { AuthService } from '../../core/services/auth.service';
import { UserGamesService } from '../../core/services/user-games.service';
import { ReviewService } from '../../core/services/review.service';

import { Game } from '../../core/models/game.model';
import { Review } from '../../core/models/database.models';
import { ReviewModalComponent } from './review-modal.component';
import { GameCardComponent } from '../../shared/components/game-card/game-card.component';
import { ReviewCardComponent } from '../../shared/components/review-card/review-card.component';

@Component({
  selector: 'app-game-detail',
  templateUrl: './game-detail.page.html',
  styleUrls: ['./game-detail.page.scss'],
  imports: [
    CommonModule, RouterModule, IonHeader, IonToolbar, 
    IonContent, IonButtons, IonBackButton, IonIcon, IonSkeletonText,
    GameCardComponent,
    ReviewCardComponent
  ]
})
export class GameDetailPage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private gameService = inject(GameService);
  private authService = inject(AuthService);
  private userGamesService = inject(UserGamesService);
  private reviewService = inject(ReviewService);
  private aiService = inject(AiService);
  private modalCtrl = inject(ModalController);
  private actionSheetCtrl = inject(ActionSheetController);
  private alertCtrl = inject(AlertController);
  private destroy$ = new Subject<void>();

  game: Game | null = null;
  isLoading = true;
  isDescriptionExpanded = false;

  savedStatus: 'played' | 'playing' | 'wishlist' | null = null;
  currentUserId: string | null = null;
  currentUserFull: any = null;
  private gameId = 0;

  reviews$: Observable<Review[]> = of([]);
  similarGames: Game[] = []; 

  @ViewChild('scrollContainer', { read: ElementRef }) scrollContainer!: ElementRef;

  constructor() {
    addIcons({
      star, calendarOutline, addOutline, createOutline, chatbubbleOutline, chatbubblesOutline,
      checkmarkCircle, time, bookmark, checkmarkCircleOutline, timeOutline, bookmarkOutline, trashOutline,
      chevronBackOutline, chevronForwardOutline
    });
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.gameId = Number(params.get('id'));
      if (!this.gameId) return;

      this.isLoading = true;
      this.game = null; 
      this.similarGames = []; // Limpiamos la lista anterior al cambiar de juego

      // 1. Obtener detalles y, una vez resueltos, cargar similares en paralelo
      this.gameService.getGameDetails(this.gameId).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (game) => {
          this.game = game;
          this.isLoading = false;

          // 2a. RAWG saga: muestra resultados inmediatamente
          this.gameService.getSimilarGames(this.gameId).pipe(
            catchError(() => of([])),
            takeUntil(this.destroy$)
          ).subscribe(sagaGames => {
            this.similarGames = sagaGames
              .filter(g => g.id !== this.gameId)
              .slice(0, 12);
          });

          // 2b. IA: enriquece la lista cuando resuelve (no bloquea la UI)
          this.aiService.getRecommendationsByGame(game.name).pipe(
            switchMap(titles => this.gameService.getGamesByTitles(titles)),
            catchError(() => of([])),
            takeUntil(this.destroy$)
          ).subscribe(aiGames => {
            if (aiGames.length === 0) return;
            const seen = new Set<number>(this.similarGames.map(g => g.id));
            seen.add(this.gameId);
            const extras = aiGames.filter(g => !seen.has(g.id));
            this.similarGames = [...this.similarGames, ...extras].slice(0, 12);
          });
        },
        error: () => { this.isLoading = false; }
      });

      // 3. Obtener reseñas del juego actual
      this.reviews$ = this.reviewService.getGameReviews(this.gameId);

      // 4. Comprobar el estado en la biblioteca
      this.userGamesService.getGameStatus(this.gameId).pipe(
        takeUntil(this.destroy$)
      ).subscribe(status => {
        this.savedStatus = status as 'played' | 'playing' | 'wishlist' | null;
      });
    });

    this.authService.user$.pipe(
      takeUntil(this.destroy$),
      filter(user => !!user),
      switchMap(user => this.authService.getProfileData(user!.uid))
    ).subscribe(profile => {
      if (profile) {
        this.currentUserFull = profile;
        this.currentUserId = profile.uid;
        this.userGamesService.loadUserGames(profile.uid);
      }
    });
  }

  toggleDescription(): void {
    this.isDescriptionExpanded = !this.isDescriptionExpanded;
  }

  scrollHorizontally(event: WheelEvent) {
    if (event.deltaY !== 0 && this.scrollContainer) {
      event.preventDefault(); 
      this.scrollContainer.nativeElement.scrollLeft += event.deltaY;
    }
  }

  scrollByAmount(amount: number) {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollBy({
        left: amount,
        behavior: 'smooth'
      });
    }
  }

  getStatusText(): string {
    if (this.savedStatus === 'played') return 'Jugado';
    if (this.savedStatus === 'playing') return 'Jugando';
    if (this.savedStatus === 'wishlist') return 'Deseado';
    return 'Añadir a Lista';
  }

  getStatusIcon(): string {
    if (this.savedStatus === 'played') return 'checkmark-circle';
    if (this.savedStatus === 'playing') return 'time';
    if (this.savedStatus === 'wishlist') return 'bookmark';
    return 'add-outline';
  }

  async openStatusSheet() {
    if (!this.currentUserId) return;

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Añadir a mi biblioteca',
      cssClass: 'custom-action-sheet',
      buttons: [
        { text: 'Jugado', icon: 'checkmark-circle-outline', handler: () => this.updateStatus('played') },
        { text: 'Jugando', icon: 'time-outline', handler: () => this.updateStatus('playing') },
        { text: 'Lista de Deseos', icon: 'bookmark-outline', handler: () => this.updateStatus('wishlist') },
        ...(this.savedStatus ? [{ text: 'Eliminar de mi lista', role: 'destructive', icon: 'trash-outline', handler: () => this.removeGame() }] : []),
        { text: 'Cancelar', role: 'cancel' }
      ]
    });

    await actionSheet.present();
  }

  async updateStatus(status: 'played' | 'playing' | 'wishlist') {
    if (!this.currentUserId) return;
    this.savedStatus = status;
    await this.userGamesService.addGame(this.currentUserId, this.gameId, status);
  }

  async removeGame() {
    if (!this.currentUserId) return;
    this.savedStatus = null;
    await this.userGamesService.removeGame(this.currentUserId, this.gameId);
  }

  async writeReview() {
    if (!this.currentUserFull) return;
    const modal = await this.modalCtrl.create({
      component: ReviewModalComponent,
      componentProps: {
        gameId: this.gameId,
        userId: this.currentUserFull.uid,
        authorName: this.currentUserFull.displayName || 'Gamer Anónimo',
        authorPhoto: this.currentUserFull.photoUrl || ''
      },
      breakpoints: [0, 0.75, 1],
      initialBreakpoint: 0.75
    });
    await modal.present();
  }

  async editReview(review: Review): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ReviewModalComponent,
      componentProps: { reviewToEdit: review },
      breakpoints: [0, 0.75, 1],
      initialBreakpoint: 0.75
    });
    await modal.present();
    // reviews$ es reactivo (collectionData), se actualiza automáticamente
  }

  async deleteReviewById(reviewId: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Borrar reseña',
      message: '¿Seguro que quieres eliminar esta reseña?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Borrar',
          role: 'destructive',
          handler: () => this.reviewService.deleteReview(reviewId)
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