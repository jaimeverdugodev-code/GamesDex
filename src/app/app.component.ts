import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet, IonRouterLink } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline, homeSharp,
  searchOutline, searchSharp,
  personOutline, personSharp,
  gameControllerOutline, gameControllerSharp,
  logOutOutline, logOutSharp
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [RouterLink, RouterLinkActive, IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterLink, IonRouterOutlet],
})
export class AppComponent {
  public appPages = [
    { title: 'Home', url: '/home', icon: 'home' },
    { title: 'Buscar Juegos', url: '/search', icon: 'search' },
    { title: 'Mis Juegos', url: '/my-games', icon: 'game-controller' },
    { title: 'Mi Perfil', url: '/profile', icon: 'person' },
  ];

  constructor() {
    addIcons({
      homeOutline, homeSharp,
      searchOutline, searchSharp,
      personOutline, personSharp,
      gameControllerOutline, gameControllerSharp,
      logOutOutline, logOutSharp
    });
  }
}