// src/app/UI/search/search.page.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonSearchbar, IonGrid, IonRow, IonCol,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonBadge, IonText, IonButtons, IonMenuButton,
  IonSkeletonText
} from '@ionic/angular/standalone';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { GameService } from '../../core/services/game.service';
import { Game } from '../../core/models/game.model';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonSearchbar, IonGrid, IonRow, IonCol,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
    IonBadge, IonText, IonButtons, IonMenuButton,
    IonSkeletonText
  ]
})
export class SearchPage {
  private gameService = inject(GameService);

  games: Game[] = [];
  isLoading = false;
  hasSearched = false;

  // Subject para manejar el debounce de la búsqueda (RxJS reactivo)
  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      tap(() => { this.isLoading = true; this.hasSearched = true; }),
      switchMap(query =>
        query.trim().length > 0
          ? this.gameService.searchGames(query).pipe(
              catchError(() => of({ count: 0, next: null, previous: null, results: [] }))
            )
          : of({ count: 0, next: null, previous: null, results: [] })
      )
    ).subscribe(response => {
      this.games = response.results;
      this.isLoading = false;
    });
  }

  onSearchChange(event: CustomEvent): void {
    const query = (event.detail.value ?? '') as string;
    if (query.trim().length === 0) {
      this.games = [];
      this.hasSearched = false;
      this.isLoading = false;
      return;
    }
    this.searchSubject.next(query);
  }
}
