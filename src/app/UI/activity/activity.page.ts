// src/app/UI/activity/activity.page.ts

import { Component, inject, OnInit, OnDestroy, Injector, runInInjectionContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonMenuButton, IonIcon,
  IonSegment, IonSegmentButton, IonLabel,
  IonSkeletonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { pulseOutline, peopleOutline, flashOutline, searchOutline, sadOutline } from 'ionicons/icons';
import { Subject, of } from 'rxjs';
import { switchMap, takeUntil, catchError } from 'rxjs/operators';
import { ReviewService } from '../../core/services/review.service';
import { SocialService } from '../../core/services/social.service';
import { AuthService } from '../../core/services/auth.service';
import { GameService } from '../../core/services/game.service';
import { Review } from '../../core/models/database.models';
import { ReviewCardComponent } from '../../shared/components/review-card/review-card.component';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.page.html',
  styleUrls: ['./activity.page.scss'],
  imports: [
    CommonModule,
    RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonMenuButton, IonIcon,
    IonSegment, IonSegmentButton, IonLabel,
    IonSkeletonText,
    ReviewCardComponent
  ]
})
export class ActivityPage implements OnInit, OnDestroy {
  private reviewService = inject(ReviewService);
  private socialService = inject(SocialService);
  private authService   = inject(AuthService);
  private gameService   = inject(GameService);
  private injector      = inject(Injector);
  private destroy$ = new Subject<void>();

  activeTab: 'foryou' | 'following' = 'foryou';

  forYouReviews:    Review[] = [];
  followingReviews: Review[] = [];
  gameMeta: Record<number, { name: string; image: string | null }> = {};
  userMeta: Record<string, { role?: string }> = {};

  loadingForYou    = true;
  loadingFollowing = true;

  skeletonItems = Array(5);

  constructor() {
    addIcons({ pulseOutline, peopleOutline, flashOutline, searchOutline, sadOutline });
  }

  ngOnInit(): void {
    // Tab "Para ti": feed global, independiente del usuario autenticado
    this.reviewService.getGlobalReviews(20)
      .pipe(takeUntil(this.destroy$), catchError(() => of([])))
      .subscribe(reviews => {
        this.forYouReviews = reviews;
        this.loadingForYou = false;
        this.loadGameMeta(reviews);
        this.loadUserMeta(reviews);
      });

    // Tab "Siguiendo": cadena auth → lista de seguidos → sus reseñas
    this.authService.user$.pipe(
      takeUntil(this.destroy$),
      switchMap(user => {
        if (!user) {
          this.loadingFollowing = false;
          return of([]);
        }
        return runInInjectionContext(this.injector, () => this.socialService.getFollowing(user.uid)).pipe(
          switchMap(followed =>
            runInInjectionContext(this.injector, () =>
              this.reviewService.getFollowingReviews(followed.map(u => u.uid))
            )
          ),
          catchError(() => of([]))
        );
      })
    ).subscribe(reviews => {
      this.followingReviews = reviews;
      this.loadingFollowing = false;
      this.loadGameMeta(reviews);
      this.loadUserMeta(reviews);
    });
  }

  private loadUserMeta(reviews: Review[]): void {
    const uids = [...new Set(reviews.map(r => r.userId).filter(uid => !!uid))];
    if (uids.length === 0) return;
    runInInjectionContext(this.injector, () => this.authService.getUsersMeta(uids))
      .pipe(takeUntil(this.destroy$))
      .subscribe(meta => { this.userMeta = { ...this.userMeta, ...meta }; });
  }

  private loadGameMeta(reviews: Review[]): void {
    const ids = reviews.map(r => r.gameId).filter(id => !!id);
    if (ids.length === 0) return;
    this.gameService.getGamesMeta(ids)
      .pipe(takeUntil(this.destroy$))
      .subscribe(meta => { this.gameMeta = { ...this.gameMeta, ...meta }; });
  }

  setTab(tab: string): void {
    this.activeTab = tab as 'foryou' | 'following';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
