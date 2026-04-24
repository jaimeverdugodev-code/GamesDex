// src/app/shared/components/home-game-card/home-game-card.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { star } from 'ionicons/icons';
import { Game } from '../../../core/models/game.model';

@Component({
  selector: 'app-home-game-card',
  standalone: true,
  imports: [CommonModule, RouterModule, IonIcon],
  templateUrl: './home-game-card.component.html',
  styleUrls: ['./home-game-card.component.scss']
})
export class HomeGameCardComponent {
  @Input({ required: true }) game!: Game;

  constructor() {
    addIcons({ star });
  }
}
