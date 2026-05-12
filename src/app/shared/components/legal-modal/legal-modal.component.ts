import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-legal-modal',
  templateUrl: './legal-modal.component.html',
  styleUrls: ['./legal-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon]
})
export class LegalModalComponent {
  @Input() type: 'terms' | 'privacy' = 'terms';

  constructor(private modalCtrl: ModalController) {
    addIcons({ closeOutline });
  }

  dismiss() { this.modalCtrl.dismiss(); }

  get title(): string {
    return this.type === 'terms' ? 'Términos y Condiciones' : 'Política de Privacidad';
  }
}
