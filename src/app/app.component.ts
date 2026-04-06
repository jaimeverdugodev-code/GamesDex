import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet, IonRouterLink } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, homeSharp, searchOutline, searchSharp, personOutline, personSharp, logOutOutline, logOutSharp } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [RouterLink, RouterLinkActive, IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterLink, IonRouterOutlet],
})
export class AppComponent {
  public appPages = [
    { title: 'Inicio (Para ti)', url: '/home', icon: 'home' },
    { title: 'Buscar Juegos', url: '/search', icon: 'search' },
    { title: 'Mi Perfil', url: '/profile', icon: 'person' }
  ];

  constructor() {
    addIcons({ homeOutline, homeSharp, searchOutline, searchSharp, personOutline, personSharp, logOutOutline, logOutSharp });
  }
}