// src/app/UI/social/following/following.page.ts
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonSpinner, AlertController
} from '@ionic/angular/standalone';
import { Subject, takeUntil, take } from 'rxjs';
import { SocialService } from '../../../core/services/social.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/database.models';

@Component({
  selector: 'app-following',
  templateUrl: './following.page.html',
  styleUrls: ['./following.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonBackButton, IonSpinner
  ]
})
export class FollowingPage implements OnInit, OnDestroy {
  private socialService = inject(SocialService);
  private authService = inject(AuthService);
  private alertCtrl = inject(AlertController);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  users: User[] = [];
  loading = true;
  profileId = '';
  currentUserId: string | null = null;

  ngOnInit() {
    this.profileId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.profileId) return;

    this.authService.user$.pipe(take(1)).subscribe(user => {
      this.currentUserId = user?.uid || null;
    });

    this.socialService.getFollowing(this.profileId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(users => {
        this.users = users;
        this.loading = false;
      });
  }

  async unfollowUser(targetId: string, name: string): Promise<void> {
    if (!this.currentUserId) return;
    const alert = await this.alertCtrl.create({
      header: 'Dejar de seguir',
      message: `¿Quieres dejar de seguir a ${name}?`,
      cssClass: 'app-alert',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          role: 'destructive',
          handler: async () => {
            this.users = this.users.filter(u => u.uid !== targetId);
            try {
              await this.socialService.unfollowUser(this.currentUserId!, targetId);
            } catch (error) {
              console.error('Error al dejar de seguir', error);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  isOwnProfile(): boolean {
    return this.profileId === this.currentUserId;
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
}
