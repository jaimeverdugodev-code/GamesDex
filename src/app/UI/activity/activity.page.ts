// src/app/UI/activity/activity.page.ts

import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonMenuButton, IonIcon, IonSkeletonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heart, chatbubble, personAdd, star, notificationsOutline, sadOutline } from 'ionicons/icons';
import { Subject } from 'rxjs';
import { takeUntil, filter, take, switchMap } from 'rxjs/operators';

import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { AppNotification } from '../../core/models/database.models';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.page.html',
  styleUrls: ['./activity.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonMenuButton, IonIcon, IonSkeletonText
  ]
})
export class ActivityPage implements ViewWillEnter, OnDestroy {
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  notifications: AppNotification[] = [];
  loading = true;
  currentUserId: string | null = null;

  skeletonItems = Array(6);

  constructor() {
    addIcons({ heart, chatbubble, personAdd, star, notificationsOutline, sadOutline });
  }

  ionViewWillEnter(): void {
    this.authService.user$.pipe(
      filter(u => !!u),
      take(1),
      switchMap(u => {
        this.currentUserId = u!.uid;
        this.notificationService.getNotifications(u!.uid)
          .pipe(takeUntil(this.destroy$))
          .subscribe(notifs => {
            this.notifications = notifs;
            this.loading = false;
          });
        return this.notificationService.markAllAsRead(u!.uid);
      })
    ).subscribe();
  }

  onNotificationTap(notif: AppNotification): void {
    if (notif.type === 'new_follower') {
      this.router.navigate(['/profile', notif.fromUserId]);
    } else if (notif.reviewId) {
      this.router.navigate(['/review', notif.reviewId]);
    }
  }

  getIcon(type: AppNotification['type']): string {
    const icons: Record<AppNotification['type'], string> = {
      review_liked: 'heart',
      review_commented: 'chatbubble',
      new_follower: 'person-add',
      new_review: 'star'
    };
    return icons[type];
  }

  getIconColor(type: AppNotification['type']): string {
    const colors: Record<AppNotification['type'], string> = {
      review_liked: '#f87171',
      review_commented: '#93c5fd',
      new_follower: '#34d399',
      new_review: '#fbbf24'
    };
    return colors[type];
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
