// src/app/UI/review-detail/review-detail.page.ts

import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonIcon, IonButton,
  IonTextarea, IonSkeletonText, AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heart, heartOutline, sendOutline, trashOutline, chatbubblesOutline } from 'ionicons/icons';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, switchMap, filter, take, catchError } from 'rxjs/operators';

import { ReviewService } from '../../core/services/review.service';
import { AuthService } from '../../core/services/auth.service';
import { GameService } from '../../core/services/game.service';
import { NotificationService } from '../../core/services/notification.service';
import { Review, ReviewLike, ReviewComment } from '../../core/models/database.models';
import { ReviewCardComponent } from '../../shared/components/review-card/review-card.component';

@Component({
  selector: 'app-review-detail',
  standalone: true,
  templateUrl: './review-detail.page.html',
  styleUrls: ['./review-detail.page.scss'],
  imports: [
    CommonModule, FormsModule, RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonBackButton, IonIcon, IonButton,
    IonTextarea, IonSkeletonText,
    ReviewCardComponent
  ]
})
export class ReviewDetailPage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private reviewService = inject(ReviewService);
  private authService = inject(AuthService);
  private gameService = inject(GameService);
  private notificationService = inject(NotificationService);
  private alertCtrl = inject(AlertController);
  private destroy$ = new Subject<void>();

  reviewId = '';
  review: Review | null = null;
  likes: ReviewLike[] = [];
  comments: ReviewComment[] = [];

  gameName?: string;
  gameImage?: string | null;

  currentUserId: string | null = null;
  currentUserName = '';
  currentUserPhoto = '';
  isLiked = false;

  newCommentText = '';
  isSubmittingComment = false;
  isLoadingReview = true;

  constructor() {
    addIcons({ heart, heartOutline, sendOutline, trashOutline, chatbubblesOutline });
  }

  ngOnInit(): void {
    this.reviewId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.reviewId) return;

    // Cargar usuario actual
    this.authService.user$.pipe(
      takeUntil(this.destroy$),
      filter(u => !!u),
      take(1),
      switchMap(u => this.authService.getProfileData(u!.uid))
    ).subscribe(profile => {
      if (profile) {
        this.currentUserId = profile.uid;
        this.currentUserName = profile.displayName || '';
        this.currentUserPhoto = profile.photoUrl || '';
        // Comprobar si ya dio like
        this.reviewService.getLike(this.reviewId, profile.uid)
          .pipe(take(1))
          .subscribe(liked => { this.isLiked = liked; });
      }
    });

    // Cargar reseña en tiempo real
    this.reviewService.getReviewById(this.reviewId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(review => {
        this.review = review;
        this.isLoadingReview = false;
        if (review?.gameId) {
          this.gameService.getGameDetails(review.gameId).pipe(
            take(1),
            catchError(() => of(null))
          ).subscribe(game => {
            if (game) {
              this.gameName = game.name;
              this.gameImage = game.background_image || null;
            }
          });
        }
      });

    // Cargar likes en tiempo real
    this.reviewService.getReviewLikes(this.reviewId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(likes => { this.likes = likes; });

    // Cargar comentarios en tiempo real
    this.reviewService.getReviewComments(this.reviewId)
      .pipe(takeUntil(this.destroy$), catchError(() => of([])))
      .subscribe(comments => { this.comments = comments; });
  }

  async toggleLike(): Promise<void> {
    if (!this.currentUserId || !this.review) return;
    const wasLiked = this.isLiked;
    this.isLiked = !wasLiked;
    try {
      await this.reviewService.toggleLike(
        this.reviewId,
        this.currentUserId,
        this.currentUserName,
        this.currentUserPhoto,
        wasLiked
      );
      if (!wasLiked) {
        this.notificationService.createLikeNotification(
          this.reviewId, this.review.userId,
          this.currentUserId, this.currentUserName, this.currentUserPhoto
        );
      }
    } catch {
      this.isLiked = wasLiked;
    }
  }

  async submitComment(): Promise<void> {
    if (!this.newCommentText.trim() || !this.currentUserId || this.isSubmittingComment) return;
    this.isSubmittingComment = true;
    const commentText = this.newCommentText.trim();
    try {
      await this.reviewService.addComment({
        reviewId: this.reviewId,
        userId: this.currentUserId,
        authorName: this.currentUserName,
        authorPhoto: this.currentUserPhoto,
        text: commentText
      });
      if (this.review) {
        this.notificationService.createCommentNotification(
          this.reviewId, this.review.userId,
          commentText, this.currentUserId, this.currentUserName, this.currentUserPhoto
        );
      }
      this.newCommentText = '';
    } finally {
      this.isSubmittingComment = false;
    }
  }

  async deleteComment(commentId: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Borrar respuesta',
      message: '¿Seguro que quieres eliminar esta respuesta?',
      cssClass: 'app-alert app-alert--danger',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Borrar',
          role: 'destructive',
          handler: () => this.reviewService.deleteComment(commentId, this.reviewId)
        }
      ]
    });
    await alert.present();
  }

  getAvatarSrc(photo?: string): string {
    return photo || 'assets/img/default-avatar.svg';
  }

  onAvatarError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/img/default-avatar.svg';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
