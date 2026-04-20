import { Component, inject } from '@angular/core';
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
  closeOutline
} from 'ionicons/icons';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [RouterLink, RouterLinkActive, IonApp, IonSplitPane, IonMenu, IonContent, IonMenuToggle, IonIcon, IonRouterOutlet],
})
export class AppComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

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
      closeOutline
    });
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
