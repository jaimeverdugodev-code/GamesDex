// src/app/UI/game-detail/game-detail.page.ts

import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  IonHeader, IonToolbar, IonContent, IonButtons,
  IonBackButton, IonIcon, IonSkeletonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  star, calendarOutline, gameControllerOutline, layersOutline,
  heartOutline, heart, addOutline, createOutline, shareOutline
} from 'ionicons/icons';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GameService } from '../../core/services/game.service';
import { AuthService } from '../../core/services/auth.service';
import { UserGamesService } from '../../core/services/user-games.service';
import { Game } from '../../core/models/game.model';

@Component({
  selector: 'app-game-detail',
  templateUrl: './game-detail.page.html',
  styleUrls: ['./game-detail.page.scss'],
  imports: [
    CommonModule,
    RouterModule,
    IonHeader, IonToolbar, IonContent, IonButtons,
    IonBackButton, IonIcon, IonSkeletonText
  ]
})
export class GameDetailPage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private gameService = inject(GameService);
  private authService = inject(AuthService);
  private userGamesService = inject(UserGamesService);
  private destroy$ = new Subject<void>();

  game: Game | null = null;
  isLoading = true;

  // Estado del FAB de favoritos
  isSaved = false;
  togglingFav = false;
  currentUserId: string | null = null;
  private gameId = 0;

  // Rating interactivo
  userRating = 0;
  hoverRating = 0;
  ratingStars = [1, 2, 3, 4, 5];

  constructor() {
    addIcons({
      star, calendarOutline, gameControllerOutline, layersOutline,
      heartOutline, heart, addOutline, createOutline, shareOutline
    });
  }

  ngOnInit(): void {
    this.gameId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.gameId) return;

    this.gameService.getGameDetails(this.gameId).subscribe({
      next: (game) => { this.game = game; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });

    this.authService.user$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      if (user) {
        this.currentUserId = user.uid;
        this.userGamesService.loadUserGames(user.uid);
      }
    });

    this.userGamesService.isGameSaved(this.gameId).pipe(
      takeUntil(this.destroy$)
    ).subscribe(saved => {
      this.isSaved = saved;
    });
  }

  async toggleFavorite(): Promise<void> {
    if (!this.currentUserId || this.togglingFav) return;

    this.togglingFav = true;
    try {
      if (this.isSaved) {
        await this.userGamesService.removeGame(this.currentUserId, this.gameId);
      } else {
        await this.userGamesService.addGame(this.currentUserId, this.gameId);
      }
    } finally {
      this.togglingFav = false;
    }
  }

  setRating(rating: number): void {
    this.userRating = rating;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
