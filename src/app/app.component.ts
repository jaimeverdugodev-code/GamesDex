import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IonApp, IonSplitPane, IonMenu, IonContent, IonMenuToggle, IonIcon, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline, homeSharp,
  searchOutline, searchSharp,
  personOutline, personSharp,
  pulseOutline, pulseSharp,
  peopleOutline, peopleSharp,
  logOutOutline, logOutSharp,
  closeOutline, shieldOutline
} from 'ionicons/icons';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [RouterLink, RouterLinkActive, IonApp, IonSplitPane, IonMenu, IonContent, IonMenuToggle, IonIcon, IonRouterOutlet],
})
export class AppComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  isAdmin = false;

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
      closeOutline, shieldOutline
    });
  }

  ngOnInit(): void {
    this.authService.isAdmin$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAdmin => { this.isAdmin = isAdmin; });
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
