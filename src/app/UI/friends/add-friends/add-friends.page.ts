// src/app/UI/friends/add-friends/add-friends.page.ts
import { Component, inject, Injector, runInInjectionContext, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonBackButton, IonSearchbar, IonIcon, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline, personAddOutline, checkmarkOutline, shieldCheckmark } from 'ionicons/icons';
import { SocialService } from '../../../core/services/social.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/database.models';
import { Subject, combineLatest, takeUntil, take } from 'rxjs';

@Component({
  selector: 'app-add-friends',
  templateUrl: './add-friends.page.html',
  styleUrls: ['./add-friends.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle,
    IonContent, IonButtons, IonBackButton, IonSearchbar, IonIcon, IonSpinner
  ]
})
export class AddFriendsPage implements OnInit, OnDestroy {
  private socialService = inject(SocialService);
  private authService = inject(AuthService);
  private injector = inject(Injector);
  private destroy$ = new Subject<void>();

  searchTerm = '';
  users: User[] = [];
  currentUserId: string | null = null;
  loading = false;
  followedInSession: Set<string> = new Set();

  constructor() {
    addIcons({ searchOutline, personAddOutline, checkmarkOutline, shieldCheckmark });
  }

  ngOnInit() {
    this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (user) this.currentUserId = user.uid;
    });
  }

  loadUsers() {
    if (!this.currentUserId || !this.searchTerm.trim()) {
      this.users = [];
      this.loading = false;
      return;
    }

    this.loading = true;
    runInInjectionContext(this.injector, () => combineLatest([
      this.socialService.getAllUsers(),
      this.socialService.getFollowing(this.currentUserId!)
    ])).pipe(take(1), takeUntil(this.destroy$)).subscribe(([all, following]) => {
      const followingIds = new Set(following.map(f => f.uid));
      const term = this.searchTerm.toLowerCase();
      this.users = all.filter(u =>
        u.uid !== this.currentUserId &&
        !followingIds.has(u.uid) &&
        u.displayName.toLowerCase().includes(term)
      );
      this.loading = false;
    });
  }

  async follow(userId: string) {
    if (!this.currentUserId) return;
    try {
      await this.socialService.followUser(this.currentUserId, userId);
      this.followedInSession.add(userId);
    } catch (error) {
      console.error('Error al seguir:', error);
    }
  }

  isFollowed(userId: string): boolean {
    return this.followedInSession.has(userId);
  }

  trackByUid(_: number, user: User): string { return user.uid; }

  onSearchChange() { this.loadUsers(); }
  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
}
