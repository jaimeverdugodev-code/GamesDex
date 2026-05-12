import { Component, inject, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonMenuButton, IonSegment, IonSegmentButton,
  IonLabel, IonIcon, IonList, IonItem, IonAvatar,
  IonButton, IonSkeletonText, IonGrid, IonRow, IonCol
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { peopleOutline, documentTextOutline, trashOutline, shieldOutline, barChartOutline, starOutline, heartOutline } from 'ionicons/icons';
import { Subject, of, combineLatest } from 'rxjs';
import { takeUntil, catchError, share } from 'rxjs/operators';
import { AdminService, PlatformStats } from '../../core/services/admin.service';
import { GameService } from '../../core/services/game.service';
import { User, Review } from '../../core/models/database.models';
import { ReviewCardComponent } from '../../shared/components/review-card/review-card.component';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonMenuButton, IonSegment, IonSegmentButton,
    IonLabel, IonIcon, IonList, IonItem, IonAvatar,
    IonButton, IonSkeletonText, IonGrid, IonRow, IonCol,
    ReviewCardComponent

  ]
})
export class AdminPage implements OnInit, OnDestroy {
  private adminService = inject(AdminService);
  private gameService  = inject(GameService);
  private alertCtrl    = inject(AlertController);
  private toastCtrl    = inject(ToastController);
  private zone         = inject(NgZone);
  private destroy$     = new Subject<void>();

  activeTab: 'dashboard' | 'users' | 'reviews' = 'dashboard';
  users:    User[]   = [];
  reviews:  Review[] = [];
  stats:    PlatformStats | null = null;
  reviewGameMeta: Record<number, { name: string; image: string | null }> = {};
  loadingUsers   = true;
  loadingReviews = true;
  loadingStats   = true;
  skeletonItems  = Array(5);

  constructor() {
    addIcons({ peopleOutline, documentTextOutline, trashOutline, shieldOutline, barChartOutline, starOutline, heartOutline });
  }

  ngOnInit(): void {
    const users$ = this.adminService.getAllUsers().pipe(catchError(() => of([])), share());
    const reviews$ = this.adminService.getAllReviews().pipe(catchError(() => of([])), share());
    const follows$ = this.adminService.getFollowsCount().pipe(catchError(() => of(0)));

    users$.pipe(takeUntil(this.destroy$))
      .subscribe(users => { this.users = users; this.loadingUsers = false; });

    reviews$.pipe(takeUntil(this.destroy$))
      .subscribe(reviews => {
        this.reviews = reviews;
        this.loadingReviews = false;
        const ids = reviews.map(r => r.gameId).filter(id => !!id);
        if (ids.length > 0) {
          this.gameService.getGamesMeta(ids)
            .pipe(takeUntil(this.destroy$))
            .subscribe(meta => { this.reviewGameMeta = { ...this.reviewGameMeta, ...meta }; });
        }
      });

    combineLatest([users$, reviews$, follows$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([users, reviews, followsCount]) => {
        this.stats = { totalUsers: users.length, totalReviews: reviews.length, totalFollows: followsCount };
        this.loadingStats = false;
      });
  }

  setTab(tab: string): void {
    this.activeTab = tab as 'dashboard' | 'users' | 'reviews';
  }

  async confirmDeleteUser(user: User, index: number): Promise<void> {
    await this.zone.run(async () => {
      const alert = await this.alertCtrl.create({
        header: 'Eliminar usuario',
        message: `¿Eliminar a ${user.displayName}? Esta acción no se puede deshacer.`,
        cssClass: 'app-alert app-alert--danger',
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Eliminar', role: 'destructive',
            handler: () => { this.executeDeleteUser(user, index); }
          }
        ]
      });
      await alert.present();
    });
  }

  private async executeDeleteUser(user: User, index: number): Promise<void> {
    try {
      await this.adminService.deleteUser(user.uid);
      this.users.splice(index, 1);
    } catch (e: any) {
      console.error('Error al eliminar usuario:', e);
      const toast = await this.toastCtrl.create({
        message: `Error: ${e?.message ?? e}`,
        duration: 4000,
        position: 'top',
        color: 'danger'
      });
      await toast.present();
    }
  }

  async confirmDeleteReview(review: Review, index: number): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar reseña',
      message: `¿Eliminar la reseña de ${review.authorName}?`,
      cssClass: 'app-alert app-alert--danger',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar', role: 'destructive',
          handler: () => {
            this.reviews.splice(index, 1);
            this.adminService.deleteReview(review.id!);
          }
        }
      ]
    });
    await alert.present();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
