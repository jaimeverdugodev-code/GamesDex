// src/app/UI/friends/friends.page.ts
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonMenuButton, IonSearchbar, IonIcon, IonSpinner 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline, personAddOutline, chevronForwardOutline, peopleOutline } from 'ionicons/icons';
import { SocialService } from '../../core/services/social.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/database.models';
import { Subject, takeUntil, map, Observable } from 'rxjs';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.page.html',
  styleUrls: ['./friends.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, IonHeader, IonToolbar, 
    IonTitle, IonContent, IonButtons, IonMenuButton, 
    IonSearchbar, IonIcon, IonSpinner
  ]
})
export class FriendsPage implements OnInit, OnDestroy {
  private socialService = inject(SocialService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  currentUserId: string | null = null;
  searchTerm = '';
  users$: Observable<User[]> | null = null;
  loading = true;

  constructor() {
    addIcons({ searchOutline, personAddOutline, chevronForwardOutline, peopleOutline });
  }

  ngOnInit() {
    this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (user) {
        this.currentUserId = user.uid;
        this.loadData();
      }
    });
  }

  loadData() {
    if (!this.currentUserId) return;
    this.loading = true;
    this.users$ = this.socialService.getFollowing(this.currentUserId).pipe(
      map(users => {
        this.loading = false;
        if (!this.searchTerm.trim()) return users;
        const term = this.searchTerm.toLowerCase();
        return users.filter(u => u.displayName.toLowerCase().includes(term));
      })
    );
  }

  goToAddFriends() { this.router.navigate(['/add-friends']); }
  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
}