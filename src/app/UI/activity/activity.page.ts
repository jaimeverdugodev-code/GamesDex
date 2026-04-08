import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonMenuButton, IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { pulseOutline } from 'ionicons/icons';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.page.html',
  styleUrls: ['./activity.page.scss'],
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, IonIcon]
})
export class ActivityPage {
  constructor() {
    addIcons({ pulseOutline });
  }
}
