// src/app/shared/components/game-card/game-card.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { star } from 'ionicons/icons';
import { Game } from '../../../core/models/game.model';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [CommonModule, RouterModule, IonIcon],
  templateUrl: './game-card.component.html',
  styleUrls: ['./game-card.component.scss']
})
export class GameCardComponent {
  // Recibe un juego entero como parámetro obligatorio
  @Input({ required: true }) game!: Game;

  constructor() {
    addIcons({ star });
  }
}