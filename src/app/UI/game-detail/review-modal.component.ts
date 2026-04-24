// src/app/UI/game-detail/review-modal.component.ts
import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonButton, IonIcon, IonTextarea, ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { star, starOutline, closeOutline } from 'ionicons/icons';
import { ReviewService } from '../../core/services/review.service';
import { Review } from '../../core/models/database.models';

@Component({
  selector: 'app-review-modal',
  standalone: true,
  imports: [
    CommonModule, FormsModule, 
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonButtons, IonButton, IonIcon, IonTextarea
  ],
  // Ponemos el HTML directamente aquí
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>{{ isEditing ? 'Editar Reseña' : 'Escribir Reseña' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="close()">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="rating-section">
        <h3>¿Qué nota le das?</h3>
        <div class="stars">
          <ion-icon 
            *ngFor="let star of [1,2,3,4,5]" 
            [name]="star <= rating ? 'star' : 'star-outline'"
            (click)="setRating(star)"
            [color]="star <= rating ? 'warning' : 'medium'">
          </ion-icon>
        </div>
      </div>

      <div class="text-section">
        <h3>Tu opinión</h3>
        <ion-textarea 
          [(ngModel)]="text" 
          placeholder="¿Qué te ha parecido el juego? Escribe aquí tu reseña..."
          rows="6"
          class="custom-textarea">
        </ion-textarea>
      </div>

      <ion-button expand="block" class="submit-btn" (click)="submitReview()" [disabled]="!rating || !text.trim() || isSubmitting">
        {{ isSubmitting ? (isEditing ? 'Guardando...' : 'Publicando...') : (isEditing ? 'Guardar Cambios' : 'Publicar Reseña') }}
      </ion-button>
    </ion-content>
  `,
  // Ponemos el CSS directamente aquí
  styles: [`
    ion-content { --background: #121212; color: white; }
    ion-toolbar { --background: #121212; --color: white; }
    .rating-section { text-align: center; margin-bottom: 2rem; margin-top: 1rem; }
    .rating-section h3 { color: white; margin-bottom: 1rem; font-weight: 600; font-size: 1.2rem; }
    .stars ion-icon { font-size: 3rem; cursor: pointer; transition: transform 0.2s; margin: 0 0.2rem; }
    .stars ion-icon:active { transform: scale(1.2); }
    .text-section h3 { color: white; margin-bottom: 1rem; font-weight: 600; font-size: 1.2rem; }
    .custom-textarea { --background: #1a1a1a; --color: white; --padding-start: 1rem; --padding-end: 1rem; --padding-top: 1rem; border-radius: 12px; border: 1px solid #333; }
    .submit-btn { margin-top: 2rem; --background: #bb86fc; --color: #121212; font-weight: bold; --border-radius: 8px; }
  `]
})
export class ReviewModalComponent implements OnInit {
  @Input() gameId!: number;
  @Input() userId!: string;
  @Input() authorName!: string;
  @Input() authorPhoto?: string;
  @Input() reviewToEdit?: Review;

  private modalCtrl = inject(ModalController);
  private reviewService = inject(ReviewService);

  rating = 0;
  text = '';
  isSubmitting = false;

  get isEditing(): boolean { return !!this.reviewToEdit?.id; }

  constructor() {
    addIcons({ star, starOutline, closeOutline });
  }

  ngOnInit(): void {
    if (this.reviewToEdit) {
      this.rating = this.reviewToEdit.rating;
      this.text = this.reviewToEdit.text;
    }
  }

  setRating(val: number) { this.rating = val; }

  close() { this.modalCtrl.dismiss(); }

  async submitReview() {
    if (!this.rating || !this.text.trim()) return;
    this.isSubmitting = true;
    try {
      if (this.isEditing) {
        await this.reviewService.updateReview(this.reviewToEdit!.id!, {
          rating: this.rating,
          text: this.text.trim()
        });
      } else {
        await this.reviewService.addReview({
          gameId: this.gameId,
          userId: this.userId,
          authorName: this.authorName,
          authorPhoto: this.authorPhoto || '',
          rating: this.rating,
          text: this.text.trim()
        });
      }
      this.modalCtrl.dismiss({ success: true, rating: this.rating, text: this.text.trim() });
    } catch (error) {
      console.error('Error al guardar la reseña:', error);
      this.isSubmitting = false;
    }
  }
}