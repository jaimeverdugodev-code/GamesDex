import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { star, createOutline, trashOutline, shieldCheckmark, heart, heartOutline, chatbubbleOutline, chevronForwardOutline } from 'ionicons/icons';
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
  @Input() isAdminAuthor = false;
  @Input() authorPhoto?: string;
  @Input() gameName?: string;
  @Input() gameImage?: string | null;
  @Input() gameId?: number;
  @Input() isLiked = false;
  @Input() currentUserId?: string | null;
  @Input() showLikeButton = true;
  @Input() clickable = true;

  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() likeToggled = new EventEmitter<void>();
  @Output() cardClicked = new EventEmitter<void>();

  readonly starsArray = [1, 2, 3, 4, 5];

  constructor() {
    addIcons({ star, createOutline, trashOutline, shieldCheckmark, heart, heartOutline, chatbubbleOutline, chevronForwardOutline });
  }

  get avatarSrc(): string {
    return this.authorPhoto || this.review?.authorPhoto || 'assets/img/default-avatar.svg';
  }

  onAvatarError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/img/default-avatar.svg';
  }

  onEdit(): void { this.edit.emit(); }
  onDelete(): void { this.delete.emit(); }

  onLikeToggle(event: Event): void {
    event.stopPropagation();
    this.likeToggled.emit();
  }

  onCardClick(): void {
    if (this.clickable) this.cardClicked.emit();
  }
}
