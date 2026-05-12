import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { star, createOutline, trashOutline } from 'ionicons/icons';
import { Review } from '../../../core/models/database.models';

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [CommonModule, RouterModule, IonIcon],
  templateUrl: './review-card.component.html',
  styleUrls: ['./review-card.component.scss']
})
export class ReviewCardComponent {
  @Input({ required: true }) review!: Review;
  @Input() showActions = false;
  @Input() showEdit = true;
  @Input() authorPhoto?: string;
  @Input() gameName?: string;
  @Input() gameImage?: string | null;
  @Input() gameId?: number;

  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  readonly starsArray = [1, 2, 3, 4, 5];

  constructor() {
    addIcons({ star, createOutline, trashOutline });
  }

  get avatarSrc(): string {
    return this.authorPhoto || this.review?.authorPhoto || 'assets/img/default-avatar.svg';
  }

  onAvatarError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/img/default-avatar.svg';
  }

  onEdit(): void { this.edit.emit(); }
  onDelete(): void { this.delete.emit(); }
}
