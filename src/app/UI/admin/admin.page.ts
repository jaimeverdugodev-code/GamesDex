import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AlertController } from '@ionic/angular';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonMenuButton, IonSegment, IonSegmentButton,
  IonLabel, IonIcon, IonList, IonItem, IonAvatar,
  IonButton, IonSkeletonText, IonGrid, IonRow, IonCol
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { peopleOutline, documentTextOutline, trashOutline, shieldOutline, barChartOutline, starOutline, heartOutline } from 'ionicons/icons';
import { Subject, of } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
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
    this.adminService.getPlatformStats()
      .then(stats => { this.stats = stats; this.loadingStats = false; })
      .catch(() => { this.loadingStats = false; });

    this.adminService.getAllUsers()
      .pipe(takeUntil(this.destroy$), catchError(() => of([])))
      .subscribe(users => { this.users = users; this.loadingUsers = false; });

    this.adminService.getAllReviews()
      .pipe(takeUntil(this.destroy$), catchError(() => of([])))
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
  }

  setTab(tab: string): void {
    this.activeTab = tab as 'dashboard' | 'users' | 'reviews';
  }

  async confirmDeleteUser(user: User, index: number): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar usuario',
      message: `¿Eliminar a ${user.displayName}? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar', role: 'destructive',
          handler: () => {
            this.users.splice(index, 1);
            this.adminService.deleteUser(user.uid);
          }
        }
      ]
    });
    await alert.present();
  }

  async confirmDeleteReview(review: Review, index: number): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar reseña',
      message: `¿Eliminar la reseña de ${review.authorName}?`,
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
