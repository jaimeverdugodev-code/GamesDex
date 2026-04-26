import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription, firstValueFrom } from 'rxjs';

import { 
  IonContent, IonIcon, IonSpinner
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
    IonContent, IonIcon, IonSpinner
  ]
})
export class LoginPage {
  private authService = inject(AuthService);
  private router = inject(Router);
  private authSub?: Subscription;

  email = '';
  password = '';
  isLoading = false;
  showPassword = false;
  errorMessage = '';

  constructor() {
    addIcons({ gameController, eyeOutline, eyeOffOutline, logoGoogle });
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
    try {
      await this.authService.loginWithGoogle();
      await this.checkProfileAndRedirect(); // Nueva comprobación
    } catch (error) {
      this.errorMessage = 'Error al conectar con Google.';
      console.error(error);
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
}