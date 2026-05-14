import { Component, inject, NgZone, OnInit, OnDestroy } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IonApp, IonSplitPane, IonMenu, IonContent, IonMenuToggle, IonIcon, IonRouterOutlet, IonBadge } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline, homeSharp,
  searchOutline, searchSharp,
  personOutline, personSharp,
  pulseOutline, pulseSharp,
  peopleOutline, peopleSharp,
  logOutOutline, logOutSharp,
  closeOutline, shieldOutline, settingsOutline
} from 'ionicons/icons';
import { Observable, of, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';
import { NotificationService } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [RouterLink, RouterLinkActive, AsyncPipe, IonApp, IonSplitPane, IonMenu, IonContent, IonMenuToggle, IonIcon, IonRouterOutlet, IonBadge],
})
export class AppComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  isAdmin = false;
  unreadCount$: Observable<number> = of(0);
  private zone = inject(NgZone);

  // Menú Figma: Home, Search, Activity Feed, Friends, Profile
  public appPages = [
    { title: 'Home', url: '/home', icon: 'home' },
    { title: 'Buscar', url: '/search', icon: 'search' },
    { title: 'Actividad', url: '/activity', icon: 'pulse' },
    { title: 'Seguir', url: '/friends', icon: 'people' },
    { title: 'Mi Perfil', url: '/profile', icon: 'person' },
  ];

  constructor() {
    addIcons({
      homeOutline, homeSharp,
      searchOutline, searchSharp,
      personOutline, personSharp,
      pulseOutline, pulseSharp,
      peopleOutline, peopleSharp,
      logOutOutline, logOutSharp,
      closeOutline, shieldOutline, settingsOutline
    });
  }

  ngOnInit(): void {
    this.authService.isAdmin$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAdmin => { this.zone.run(() => { this.isAdmin = isAdmin; }); });

    this.unreadCount$ = this.authService.user$.pipe(
      switchMap(user => user ? this.notificationService.getUnreadCount(user.uid) : of(0))
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
