// src/app/UI/home/home.page.ts

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonMenuButton, IonIcon,
  IonBadge, IonSkeletonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { GameService } from '../../core/services/game.service';
import { Game } from '../../core/models/game.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonMenuButton, IonIcon,
    IonBadge, IonSkeletonText
  ]
})
export class HomePage implements OnInit {
  private gameService = inject(GameService);

  trendingGames: Game[] = [];
  forYouGames: Game[] = [];
  loadingTrending = true;
  loadingForYou = true;

  // Slider de tendencias
  trendingIndex = 0;

  // Auxiliar para skeletons
  skeletonTrending = Array(5);
  skeletonForYou = Array(8);

  constructor() {
    addIcons({ chevronBackOutline, chevronForwardOutline });
  }

  ngOnInit(): void {
    this.gameService.getTrendingGames(1, 10).subscribe({
      next: (res) => { this.trendingGames = res.results; this.loadingTrending = false; },
      error: () => { this.loadingTrending = false; }
    });

    this.gameService.getForYouGames(1, 8).subscribe({
      next: (res) => { this.forYouGames = res.results; this.loadingForYou = false; },
      error: () => { this.loadingForYou = false; }
    });
  }

  prevTrending(): void {
    const max = Math.max(this.trendingGames.length - 5, 1);
    this.trendingIndex = (this.trendingIndex - 1 + max) % max;
  }

  nextTrending(): void {
    const max = Math.max(this.trendingGames.length - 5, 1);
    this.trendingIndex = (this.trendingIndex + 1) % max;
  }

  get sliderOffset(): string {
    return `translateX(-${this.trendingIndex * 21.5}%)`;
  }
}
