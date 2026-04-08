// src/app/UI/edit-profile/edit-profile.page.ts

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons,
  IonBackButton, IonSpinner, IonIcon, IonModal, IonButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline, personOutline, cameraOutline,
  documentTextOutline, gameControllerOutline, closeOutline
} from 'ionicons/icons';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons,
    IonBackButton, IonSpinner, IonIcon, IonModal, IonButton,
    ImageCropperComponent
  ]
})
export class EditProfilePage implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  availableGenres = [
    'Acción', 'Aventura', 'RPG', 'Shooter', 'Deportes',
    'Estrategia', 'Carreras', 'Lucha', 'Plataformas',
    'Puzzle', 'Simulación', 'Indie'
  ];

  selectedGenres: Set<string> = new Set();
  displayName = '';
  photoUrl = '';
  bio = '';

  isLoading = false;
  isSaving = false;
  currentUserUid: string | null = null;
  errorMessage = '';
  successMessage = '';

  // Cropper
  imageFile: File | undefined = undefined;
  croppedImageBase64: string | ArrayBuffer | null = '';
  showCropperModal = false;

  constructor() {
    addIcons({
      checkmarkCircleOutline, personOutline, cameraOutline,
      documentTextOutline, gameControllerOutline, closeOutline
    });
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.authService.user$.subscribe(async user => {
      if (user) {
        this.currentUserUid = user.uid;
        const profile = await firstValueFrom(this.authService.getProfileData(user.uid));
        if (profile) {
          this.displayName = profile.displayName || '';
          this.photoUrl = profile.photoUrl || '';
          this.bio = profile.bio || '';
          if (profile.favoriteGenres) {
            this.selectedGenres = new Set(profile.favoriteGenres);
          }
        }
      }
      this.isLoading = false;
    });
  }

  toggleGenre(genre: string): void {
    if (this.selectedGenres.has(genre)) {
      this.selectedGenres.delete(genre);
    } else {
      this.selectedGenres.add(genre);
    }
  }

  // --- Foto con cropper --- //
  triggerFileInput(): void {
    document.getElementById('edit-file-upload')?.click();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.match(/image\/*/)) {
      this.errorMessage = 'Solo se permiten archivos de imagen.';
      return;
    }
    this.imageFile = file;
    this.showCropperModal = true;
  }

  imageCropped(event: ImageCroppedEvent): void {
    if (event.blob) {
      const reader = new FileReader();
      reader.onload = () => {
        this.croppedImageBase64 = reader.result;
      };
      reader.readAsDataURL(event.blob);
    }
  }

  imageLoaded(): void {}
  cropperReady(): void {}
  loadImageFailed(): void {
    this.errorMessage = 'No se pudo cargar la imagen para recortar.';
    this.closeModal();
  }

  saveCroppedImage(): void {
    if (this.croppedImageBase64) {
      this.photoUrl = this.croppedImageBase64 as string;
    }
    this.closeModal();
  }

  closeModal(): void {
    this.showCropperModal = false;
    this.imageFile = undefined;
    this.croppedImageBase64 = '';
    const input = document.getElementById('edit-file-upload') as HTMLInputElement;
    if (input) input.value = '';
  }

  // --- Guardar --- //
  async saveProfile(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.displayName.trim()) {
      this.errorMessage = 'El nombre es obligatorio.';
      return;
    }

    if (!this.currentUserUid) return;

    this.isSaving = true;
    try {
      await this.authService.updateUserProfile(this.currentUserUid, {
        displayName: this.displayName.trim(),
        photoUrl: this.photoUrl,
        bio: this.bio.trim(),
        favoriteGenres: Array.from(this.selectedGenres)
      });
      this.router.navigate(['/profile']);
    } catch {
      this.errorMessage = 'Error al guardar los cambios.';
    } finally {
      this.isSaving = false;
    }
  }
}
