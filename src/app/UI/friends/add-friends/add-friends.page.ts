// src/app/UI/friends/add-friends/add-friends.page.ts
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, 
  IonBackButton, IonSearchbar, IonIcon, IonSpinner 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline, personAddOutline } from 'ionicons/icons';
import { SocialService } from '../../../core/services/social.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/database.models';
import { Subject, takeUntil, map, Observable, combineLatest } from 'rxjs';

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
  private destroy$ = new Subject<void>();

  searchTerm = '';
  users$: Observable<User[]> | null = null;
  currentUserId: string | null = null;
  loading = true;
  
  // Lista local de IDs seguidos en esta sesión para ocultarlos al instante
  followedInSession: Set<string> = new Set();

  constructor() {
    addIcons({ searchOutline, personAddOutline });
  }

  ngOnInit() {
    this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (user) {
        this.currentUserId = user.uid;
        this.loadUsers();
      }
    });
  }

  loadUsers() {
    if (!this.currentUserId) return;
    this.loading = true;
    
    // Comparamos TODOS con los que YA SIGUES
    this.users$ = combineLatest([
      this.socialService.getAllUsers(),
      this.socialService.getFollowing(this.currentUserId)
    ]).pipe(
      map(([all, following]) => {
        this.loading = false;
        
        // Creamos un Set de IDs que ya sigues
        const followingIds = new Set(following.map(f => f.uid));

        // Filtramos: 
        // 1. Que no sea yo.
        // 2. Que no esté ya en mi lista de seguidos de Firebase.
        // 3. Que no le haya dado a "Seguir" hace un segundo.
        let filtered = all.filter(u => 
          u.uid !== this.currentUserId && 
          !followingIds.has(u.uid) && 
          !this.followedInSession.has(u.uid)
        );
        
        if (this.searchTerm.trim()) {
          const term = this.searchTerm.toLowerCase();
          filtered = filtered.filter(u => u.displayName.toLowerCase().includes(term));
        }
        return filtered;
      })
    );
  }

  async follow(userId: string) {
    if (!this.currentUserId) return;
    try {
      await this.socialService.followUser(this.currentUserId, userId);
      // Marcamos como seguido localmente para que desaparezca de la lista
      this.followedInSession.add(userId);
    } catch (error) {
      console.error('Error al seguir:', error);
    }
  }

  isFollowed(userId: string): boolean {
    return this.followedInSession.has(userId);
  }

  onSearchChange() { this.loadUsers(); }
  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
}