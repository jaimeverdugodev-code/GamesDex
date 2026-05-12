import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription, firstValueFrom, take } from 'rxjs';
import { ViewWillEnter, ViewWillLeave } from '@ionic/angular';

import {
  IonContent, IonIcon, IonSpinner, IonButton,
  AlertController, ToastController, MenuController
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { gameController, eyeOutline, eyeOffOutline, logoGoogle } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent, IonIcon, IonSpinner, IonButton
  ]
})
export class LoginPage implements ViewWillEnter, ViewWillLeave {
  private authService = inject(AuthService);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private menuCtrl = inject(MenuController);
  private authSub?: Subscription;

  email = '';
  password = '';
  isLoading = false;
  isCheckingAuth = true;
  showPassword = false;
  errorMessage = '';

  constructor() {
    addIcons({ gameController, eyeOutline, eyeOffOutline, logoGoogle });
  }

  ionViewWillEnter(): void {
    this.menuCtrl.enable(false);
    // Si Firebase restaura una sesión persistida, redirigir sin mostrar el login
    this.authSub = this.authService.user$.pipe(take(1)).subscribe(user => {
      if (user) {
        this.checkProfileAndRedirect();
      } else {
        this.isCheckingAuth = false;
      }
    });
  }

  ionViewWillLeave(): void {
    this.menuCtrl.enable(true);
    this.authSub?.unsubscribe();
  }

  async onSubmit() {
    // Validar campos vacíos estrictamente
    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'No puedes dejar campos vacíos.';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      await this.authService.loginWithEmail(this.email, this.password);
      await this.checkProfileAndRedirect(); // Nueva comprobación
    } catch (error: any) {
      this.errorMessage = 'Credenciales incorrectas. Inténtalo de nuevo.';
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  async loginWithGoogle() {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      await this.authService.loginWithGoogle();
      await this.checkProfileAndRedirect();
    } catch (error) {
      this.errorMessage = 'Error al conectar con Google.';
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  private checkProfileAndRedirect(): void {
    this.authSub = this.authService.user$.subscribe(async (user) => {
      if (user) {
        const profile = await firstValueFrom(this.authService.getProfileData(user.uid));
        if (profile?.role === 'admin') {
          this.router.navigate(['/admin']);
        } else if (profile && profile.favoriteGenres?.length >= 3) {
          this.router.navigate(['/home']);
        } else {
          this.router.navigate(['/complete-profile']);
        }
        this.authSub?.unsubscribe();
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async presentResetPasswordAlert(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Recuperar Contraseña',
      message: 'Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.',
      cssClass: 'app-alert',
      inputs: [{ name: 'email', type: 'email', placeholder: 'tu@email.com' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Enviar',
          handler: async (data) => {
            if (!data.email?.trim()) return false;
            try {
              await this.authService.resetPassword(data.email.trim());
              const toast = await this.toastCtrl.create({
                message: 'Correo de recuperación enviado. Revisa tu bandeja de entrada.',
                duration: 4000,
                position: 'top',
                color: 'success'
              });
              await toast.present();
            } catch {
              const toast = await this.toastCtrl.create({
                message: 'No se encontró ninguna cuenta con ese email.',
                duration: 3000,
                position: 'top',
                color: 'danger'
              });
              await toast.present();
            }
            return true;
          }
        }
      ]
    });
    await alert.present();
  }
}