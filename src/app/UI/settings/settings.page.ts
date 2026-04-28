import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonIcon,
  AlertController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  lockClosedOutline, trashOutline,
  chevronForwardOutline, informationCircleOutline, gameControllerOutline,
  shieldHalfOutline
} from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonBackButton, IonIcon
  ]
})
export class SettingsPage {
  private authService = inject(AuthService);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  constructor() {
    addIcons({
      lockClosedOutline, trashOutline,
      chevronForwardOutline, informationCircleOutline,
      gameControllerOutline, shieldHalfOutline
    });
  }

  async changePassword(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Cambiar Contraseña',
      message: 'Introduce tu nueva contraseña dos veces para confirmarla.',
      cssClass: 'settings-alert',
      inputs: [
        {
          name: 'newPassword',
          type: 'password',
          placeholder: 'Nueva contraseña (mín. 6 caracteres)'
        },
        {
          name: 'confirmPassword',
          type: 'password',
          placeholder: 'Confirmar nueva contraseña'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (!data.newPassword || data.newPassword.length < 6) {
              this.showToast('La contraseña debe tener al menos 6 caracteres.', 'warning');
              return false;
            }
            if (data.newPassword !== data.confirmPassword) {
              this.showToast('Las contraseñas no coinciden.', 'warning');
              return false;
            }
            try {
              await this.authService.changeUserPassword(data.newPassword);
              this.showToast('Contraseña actualizada correctamente.', 'success');
            } catch (err: any) {
              this.handleAuthError(err);
            }
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteAccount(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar cuenta?',
      message: 'Esta acción es permanente e irreversible. Todos tus juegos, reseñas y datos serán borrados.',
      cssClass: 'settings-alert settings-alert--danger',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar definitivamente',
          role: 'destructive',
          cssClass: 'alert-btn-danger',
          handler: async () => {
            try {
              await this.authService.deleteUserAccount();
              this.router.navigate(['/login'], { replaceUrl: true });
            } catch (err: any) {
              this.handleAuthError(err);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  private handleAuthError(err: any): void {
    if (err?.code === 'auth/requires-recent-login') {
      this.alertCtrl.create({
        header: 'Sesión caducada',
        message: 'Por seguridad, cierra sesión y vuelve a entrar para realizar esta acción.',
        buttons: ['Entendido']
      }).then(a => a.present());
    } else {
      this.showToast('Ha ocurrido un error. Inténtalo de nuevo.', 'danger');
    }
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'top',
      color
    });
    await toast.present();
  }
}
