import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';
import { ViewWillEnter, ViewWillLeave } from '@ionic/angular';

import { IonContent, IonIcon, IonSpinner, MenuController, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { gameController, eyeOutline, eyeOffOutline, checkmarkOutline, logoGoogle } from 'ionicons/icons';
import { LegalModalComponent } from '../../../shared/components/legal-modal/legal-modal.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonContent, IonIcon, IonSpinner]
})
export class RegisterPage implements ViewWillEnter, ViewWillLeave {
  private authService  = inject(AuthService);
  private router       = inject(Router);
  private menuCtrl     = inject(MenuController);
  private modalCtrl    = inject(ModalController);
  private authSub?: Subscription;

  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  
  showPassword = false;
  showConfirmPassword = false;
  agreedToTerms = false;
  
  isLoading = false;
  errorMessage = '';

  constructor() {
    addIcons({ gameController, eyeOutline, eyeOffOutline, checkmarkOutline, logoGoogle });
  }

  ionViewWillEnter(): void { this.menuCtrl.enable(false); }
  ionViewWillLeave(): void { this.menuCtrl.enable(true); }

  get passwordStrength() {
    if (this.password.length === 0) return { strength: 0, label: '', color: '#374151' };
    if (this.password.length < 6) return { strength: 1, label: 'Débil', color: '#ef4444' };
    if (this.password.length < 10) return { strength: 2, label: 'Media', color: '#f59e0b' };
    return { strength: 3, label: 'Fuerte', color: '#03dac6' };
  }

  async onSubmit() {
    this.errorMessage = '';

    // Validar campos vacíos estrictamente
    if (!this.username.trim() || !this.email.trim() || !this.password.trim() || !this.confirmPassword.trim()) {
      this.errorMessage = 'No puedes dejar ningún campo vacío.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    if (!this.agreedToTerms) {
      this.errorMessage = 'Debes aceptar los términos y condiciones.';
      return;
    }
    
    this.isLoading = true;
    
    try {
      await this.authService.registerWithEmail(this.email, this.password, this.username);
      this.router.navigate(['/complete-profile']);
    } catch (error: any) {
      // AQUÍ ESTABAN LOS ERRORES QUE SE HABÍAN BORRADO
      switch (error.code) {
        case 'auth/email-already-in-use':
          this.errorMessage = 'Este correo ya está registrado. Por favor, inicia sesión.';
          break;
        case 'auth/invalid-email':
          this.errorMessage = 'El formato del correo electrónico no es válido.';
          break;
        case 'auth/weak-password':
          this.errorMessage = 'La contraseña es demasiado débil. Usa al menos 6 caracteres.';
          break;
        default:
          this.errorMessage = 'Ocurrió un error al crear la cuenta. Inténtalo de nuevo.';
          break;
      }
      console.error('Error de Firebase:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async registerWithGoogle() {
    try {
      await this.authService.loginWithGoogle();
      
      this.authSub = this.authService.user$.subscribe(async (user) => {
        if (user) {
          const isComplete = await this.authService.isProfileComplete(user.uid);
          if (isComplete) {
            this.router.navigate(['/home']);
          } else {
            this.router.navigate(['/complete-profile']);
          }
          this.authSub?.unsubscribe();
        }
      });
    } catch (error) {
      this.errorMessage = 'Error al conectar con Google.';
      console.error(error);
    }
  }

  async openLegal(type: 'terms' | 'privacy'): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: LegalModalComponent,
      componentProps: { type },
      breakpoints: [0, 1],
      initialBreakpoint: 1
    });
    await modal.present();
  }

  togglePassword() { this.showPassword = !this.showPassword; }
  toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }
}